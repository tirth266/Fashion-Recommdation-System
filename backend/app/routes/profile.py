from flask import Blueprint, request, jsonify, session

bp = Blueprint('profile', __name__, url_prefix='/api/profile')

def get_session_user():
    return session.get('user')

@bp.route('/', methods=['GET'])
def get_profile():
    user = get_session_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Return the profile part of the user session
    # If it doesn't exist yet, return default empty
    profile = user.get('profile', {
        'completed_onboarding': False,
        'measurements': {},
        'preferences': {}
    })
    
    return jsonify({'profile': profile}), 200

@bp.route('/', methods=['POST'])
def update_profile():
    user = get_session_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
        
    data = request.get_json()
    
    # Initialize profile if not exists
    if 'profile' not in user:
        user['profile'] = {
            'completed_onboarding': False,
            'measurements': {},
            'preferences': {}
        }
    
    profile = user['profile']
    
    # Update fields
    if 'measurements' in data:
        profile['measurements'] = {**profile.get('measurements', {}), **data['measurements']}
        
    if 'preferences' in data:
        profile['preferences'] = {**profile.get('preferences', {}), **data['preferences']}
        
    if 'name' in data:
        user['name'] = data['name']  # Update root user name too
        profile['name'] = data['name']

    # Mark as completed if flag is sent
    if data.get('completed_onboarding') is True:
        profile['completed_onboarding'] = True
        
    # APP-SPECIFIC: Save back to session
    # Important: Flask session requires reassignment to detect changes in mutable objects
    session['user'] = user
    session.modified = True
    
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile,
        'user': user # Return full user to update frontend context
    }), 200

@bp.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file:
            import os
            from werkzeug.utils import secure_filename
            
            # Create uploads directory if it doesn't exist (safety check)
            upload_folder = os.path.join(os.getcwd(), 'app', 'static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            
            # Secure filename and add user ID to prevent collisions
            user = get_session_user()
            if not user:
                 return jsonify({'error': 'Not authenticated'}), 401
                 
            filename = secure_filename(file.filename)
            unique_filename = f"{user.get('user_id', 'unknown')}_{filename}"
            file_path = os.path.join(upload_folder, unique_filename)
            
            file.save(file_path)
            
            # Generate URL (assuming backend is serving static files)
            avatar_url = f"http://localhost:5000/static/uploads/{unique_filename}"
            
            # Update user session
            if 'profile' not in user:
                user['profile'] = {}
            
            user['profile']['avatar'] = avatar_url
            user['picture'] = avatar_url # Update root picture too
            session['user'] = user
            session.modified = True
            
            return jsonify({
                'message': 'Avatar uploaded successfully',
                'avatar_url': avatar_url
            }), 200
            
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500