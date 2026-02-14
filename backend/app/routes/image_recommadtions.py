from flask import Blueprint, request, jsonify
from app.services.image_recommender_service import recommend_image
import os
import uuid
from werkzeug.utils import secure_filename

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@bp.route('/recommend', methods=['POST'])
def recommend():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        # Use a unique filename to avoid collisions
        unique_filename = str(uuid.uuid4()) + "_" + filename
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        
        try:
            # Get recommendations
            results = recommend_image(filepath)
            
            # Clean up uploaded file (optional, or keep for history)
            # os.remove(filepath) 
            
            if "error" in results:
                return jsonify(results), 500
            
            return jsonify(results)
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
