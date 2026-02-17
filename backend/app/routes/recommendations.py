
from flask import Blueprint, request, jsonify
from models.recommender_model import recommend as get_recommendations
import os

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@bp.route('/recommend', methods=['POST'])
def recommend():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    try:
        # Save temp file
        if not os.path.exists('uploads'):
            os.makedirs('uploads')
        
        temp_path = os.path.join('uploads', file.filename)
        file.save(temp_path)
        
        # Get recommendations
        # recommend returns list of absolute paths
        rec_paths = get_recommendations(temp_path)
        
        results = []
        for abs_path in rec_paths:
            # Convert absolute path to relative URL
            filename = os.path.basename(abs_path)
            
            # Construct the URL for the image
            # Matches the static route in main.py: /static/dataset_images/<filename>
            image_url = f"/static/dataset_images/{filename}"
            
            results.append({
                'image': image_url,
                'score': 0.0  # Placeholder as model doesn't return score yet
            })
            
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify(results), 200

    except Exception as e:
        print(f"Error in recommendation: {e}")
        return jsonify({'error': str(e)}), 500
