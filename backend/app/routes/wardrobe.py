from flask import Blueprint, request, jsonify, session
from ..extensions import db
from ..database.init_db import WardrobeItem
from werkzeug.utils import secure_filename
import os
import time

bp = Blueprint('wardrobe', __name__, url_prefix='/api/wardrobe')

def get_session_user():
    return session.get('user')

@bp.route('/', methods=['GET'])
def get_wardrobe():
    user = get_session_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    items = WardrobeItem.query.filter_by(user_id=user['user_id']).order_by(WardrobeItem.created_at.desc()).all()
    
    return jsonify({
        'items': [item.to_dict() for item in items]
    }), 200

@bp.route('/', methods=['POST'])
def add_item():
    user = get_session_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
        
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        # Create uploads directory
        # Using a distinct folder for wardrobe items
        # Ensure we are linking to the backend/app directory correctly
        # Using current app root path would be better but os.getcwd() works given how it's run
        upload_folder = os.path.join(os.getcwd(), 'app', 'static', 'wardrobe_uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        filename = secure_filename(file.filename)
        # Unique filename: user_id_timestamp_filename
        unique_filename = f"{user['user_id']}_{int(time.time())}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        
        file.save(file_path)
        
        # URL for frontend
        # ideally this domain should be from config, but hardcoding for dev as per existing patterns
        image_url = f"http://localhost:5000/static/wardrobe_uploads/{unique_filename}"
        
        new_item = WardrobeItem(
            user_id=user['user_id'],
            image_url=image_url,
            category=request.form.get('category', 'Uncategorized')
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Item added to wardrobe',
            'item': new_item.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Wardrobe upload error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    user = get_session_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
        
    item = WardrobeItem.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
        
    if item.user_id != user['user_id']:
        return jsonify({'error': 'Unauthorized'}), 403
        
    try:
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted'}), 200
    except Exception as e:
         return jsonify({'error': str(e)}), 500
