from flask import Blueprint, request, jsonify, session
from ..extensions import db
from app.database.init_db import WardrobeItem
import os
from werkzeug.utils import secure_filename

bp = Blueprint('wardrobe', __name__, url_prefix='/api/wardrobe')

UPLOAD_FOLDER = 'uploads/wardrobe'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/', methods=['GET'])
def get_wardrobe():
    """Get all wardrobe items for the current user"""
    user_data = session.get('user')
    user_id = user_data['user_id'] if user_data else None
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    items = WardrobeItem.query.filter_by(user_id=user_id).order_by(WardrobeItem.created_at.desc()).all()
    return jsonify({"items": [item.to_dict() for item in items]}), 200

@bp.route('/', methods=['POST'])
def add_wardrobe_item():
    """Upload a new wardrobe item"""
    user_data = session.get('user')
    user_id = user_data['user_id'] if user_data else None
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400
    
    # Create upload directory if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Save file
    filename = secure_filename(file.filename)
    # Add user_id prefix to avoid conflicts
    unique_filename = f"{user_id}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    # Create database entry
    category = request.form.get('category', 'uncategorized')
    image_url = f"/uploads/wardrobe/{unique_filename}"
    
    new_item = WardrobeItem(
        user_id=user_id,
        image_url=image_url,
        category=category
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({"item": new_item.to_dict(), "message": "Item added successfully"}), 201

@bp.route('/<int:item_id>', methods=['DELETE'])
def delete_wardrobe_item(item_id):
    """Delete a wardrobe item"""
    user_data = session.get('user')
    user_id = user_data['user_id'] if user_data else None
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    # Delete file if it exists
    try:
        filepath = os.path.join('uploads', 'wardrobe', item.image_url.split('/')[-1])
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({"message": "Item deleted successfully"}), 200
