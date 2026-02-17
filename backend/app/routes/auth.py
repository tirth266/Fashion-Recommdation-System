from flask import Blueprint, request, jsonify, session
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime
import os
import secrets
from ..extensions import db
from ..database.init_db import User
from sqlalchemy.exc import IntegrityError

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '737685649419-2b6lgqusjcrqdusipt5o8ngn1orpdodr.apps.googleusercontent.com')

@bp.route('/google', methods=['POST'])
def google_auth():
    print("Received /api/auth/google request") # DEBUG
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        print("Error: Missing token") # DEBUG
        return jsonify({'error': 'Missing token'}), 400

    try:
        print(f"Verifying token with Client ID: {GOOGLE_CLIENT_ID[:10]}...") # DEBUG
        # Specify the CLIENT_ID of the app that accesses the backend:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        # ID token is valid. Get the user's Google Account information from the decoded token.
        user_google_id = id_info['sub']
        email = id_info['email']
        name = id_info.get('name')
        picture = id_info.get('picture')

        print(f"Token verified! User: {email}, ID: {user_google_id}") # DEBUG

        if not email:
             raise ValueError("Email not found in Google token")

        # Database integration
        # 1. Try to find by Google ID first
        user = User.query.filter_by(google_id=user_google_id).first()
        
        # 2. If not found, try by email (legacy or manual account)
        if not user:
            user = User.query.filter_by(email=email).first()
            if user:
                # Link existing account to Google ID
                user.google_id = user_google_id
                if not user.profile_image and picture:
                    user.profile_image = picture
                db.session.commit()
                print(f"Linked existing user {email} to Google ID")
        
        if not user:
            # Create new user from Google info
            from datetime import datetime
            random_password = secrets.token_urlsafe(16)
            new_user = User(
                email=email,
                username=email.split('@')[0], # Fallback username
                full_name=name,
                profile_image=picture,
                google_id=user_google_id
            )
            try:
                new_user.set_password(random_password)
                db.session.add(new_user)
                db.session.commit()
                user = new_user
                print(f"New Google user created: {email}")
                
                 # --- MongoDB Integration (New User) ---
                from ..extensions import mongo
                try:
                    mongo.db.users.insert_one({
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.full_name,
                        "picture": user.profile_image,
                        "google_id": user_google_id,
                        "created_at": datetime.utcnow(),
                        "role": "user",
                        "sql_user_id": user.id,
                        "auth_provider": "google"
                    })
                    print(f"Google User {email} synced to MongoDB")
                except Exception as e:
                    print(f"MongoDB Sync Error (Google New): {e}")
                # --------------------------------------

            except IntegrityError:
                db.session.rollback()
                # Handle race condition or username collision
                user = User.query.filter_by(email=email).first()
                if not user:
                     # Try with random suffix if username collision
                     new_user.username = f"{email.split('@')[0]}_{secrets.token_hex(4)}"
                     db.session.add(new_user)
                     db.session.commit()
                     user = new_user
                     
                     # Retry Mongo Sync? (Simplified for now)

        # Update last login
        from datetime import datetime
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # --- MongoDB Integration (Update Login Time) ---
        from ..extensions import mongo
        try:
             # Ensure user exists in Mongo if they were created before Mongo integration
            existing_mongo_user = mongo.db.users.find_one({"email": email})
            if not existing_mongo_user:
                 mongo.db.users.insert_one({
                    "username": user.username,
                    "email": email,
                    "full_name": user.full_name,
                    "picture": user.profile_image,
                    "google_id": user_google_id,
                    "created_at": user.created_at or datetime.utcnow(),
                    "role": "user",
                    "sql_user_id": user.id,
                    "auth_provider": "google"
                })

            mongo.db.users.update_one(
                {"email": email},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        except Exception as e:
             print(f"MongoDB Update Error (Google Login): {e}")
        # -----------------------------------------------

        # Create a user session
        session.permanent = True
        session['user'] = {
            'user_id': user.id,
            'email': user.email,
            'name': user.full_name or user.username,
            'picture': user.profile_image or picture,
            'profile': user.to_dict()
        }
        print(f"Session created for user ID: {user.id}") # DEBUG
        
        return jsonify({
            'message': 'Login successful',
            'user': session['user']
        }), 200

    except ValueError as e:
        # Invalid token
        import sys
        print(f"Token verification failed: {e}", file=sys.stderr) # DEBUG to stderr
        print(f"Token received (first 20 chars): {token[:20] if token else 'None'}", file=sys.stderr)
        return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    except Exception as e:
        import sys
        import traceback
        
        # Log to file
        try:
            with open("auth_error.log", "a") as f:
                f.write(f"\n[{datetime.utcnow()}] Error in /google:\n")
                f.write(f"Error: {str(e)}\n")
                f.write(traceback.format_exc())
                f.write("-" * 20 + "\n")
        except:
            pass

        print(f"Unexpected error in /google: {e}", file=sys.stderr) # DEBUG to stderr
        traceback.print_exc()
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    
    if not email or not password or not username:
        return jsonify({'error': 'Missing required fields'}), 400
        
    # Check if user exists
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({'error': 'User already exists'}), 409
        
    try:
        new_user = User(
            email=email,
            username=username,
            full_name=data.get('full_name')
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        # --- MongoDB Integration ---
        from ..extensions import mongo
        try:
            mongo.db.users.insert_one({
                "username": username,
                "email": email.lower(),
                # Store rudimentary info or extended profile info here
                "full_name": data.get('full_name'),
                "created_at": datetime.utcnow(),
                "role": "user",
                # Note: We typically don't store the password twice. 
                # The SQL DB handles authentication. Mongo can store extra profile data.
                "sql_user_id": new_user.id
            })
            print(f"User {username} synced to MongoDB")
        except Exception as e:
            print(f"MongoDB Sync Error: {e}")
        # ---------------------------
        
        # Auto-login
        session.permanent = True
        session['user'] = {
            'user_id': new_user.id,
            'email': new_user.email,
            'name': new_user.full_name or new_user.username,
            'picture': None, # Default or Gravatar could be added
            'profile': new_user.to_dict()
        }
        
        return jsonify({
            'message': 'Registration successful',
            'user': session['user']
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        session.permanent = True
        session['user'] = {
            'user_id': user.id,
            'email': user.email,
            'name': user.full_name or user.username,
            'picture': user.profile_image,
            'profile': user.to_dict()
        }
        return jsonify({
            'message': 'Login successful',
            'user': session['user']
        }), 200
    
    return jsonify({'error': 'Invalid email or password'}), 401

@bp.route('/user', methods=['GET'])
def get_current_user():
    try:
        user = session.get('user')
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        return jsonify({'user': user}), 200
    except Exception as e:
        import sys
        print(f"Error in /user: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200
