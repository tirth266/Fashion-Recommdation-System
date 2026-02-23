
from flask import Blueprint, request, jsonify
from models.recommender_model import recommend as get_recommendations
import os

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@bp.route('/recommend', methods=['POST'])
def recommend():
    print("Received recommendation request") # DEBUG
    if 'image' not in request.files:
        print("Error: No image in request.files")
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    print(f"Processing file: {file.filename}")
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
                'url': image_url,
                'similarity': 0.85 # Placeholder, model update needed for real score
            })
            
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({'recommended_images': results}), 200

    except Exception as e:
        print(f"Error in recommendation: {e}")
        return jsonify({'error': str(e)}), 500
