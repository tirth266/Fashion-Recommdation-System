from flask import Blueprint, request, jsonify, session
from google.oauth2 import id_token
from google.auth.transport import requests
import os

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
        user_id = id_info['sub']
        email = id_info['email']
        name = id_info.get('name')
        picture = id_info.get('picture')

        print(f"Token verified! User: {email}") # DEBUG

        # Create a user session
        session.permanent = True
        session['user'] = {
            'user_id': user_id,
            'email': email,
            'name': name,
            'picture': picture
        }
        print(f"Session created: {session['user']}") # DEBUG
        
        return jsonify({
            'message': 'Login successful',
            'user': session['user']
        }), 200

    except ValueError as e:
        # Invalid token
        print(f"Token verification failed: {e}") # DEBUG
        return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    except Exception as e:
        print(f"Unexpected error in /google: {e}") # DEBUG
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/user', methods=['GET'])
def get_current_user():
    user = session.get('user')
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify({'user': user}), 200

@bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200
