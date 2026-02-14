
from flask import Blueprint, request, jsonify, session
from ..services.size_estimation_service import SizeEstimator
import os

bp = Blueprint('size_estimation', __name__, url_prefix='/api/size')

# Initialize Size Estimator Service
estimator = SizeEstimator()

@bp.route('/estimate-from-image', methods=['POST'])
def estimate_from_image():
    """
    POST /api/size/estimate-from-image
    Input: Multipart Form Data
      - image: File (jpg/png)
      - height_cm: Float (Optional, for accurate scaling)
      
    Output: JSON
      {
        "success": bool,
        "measurements": { ... },
        "recommended_size": "M",
        ...
      }
    """
    # 1. Authentication (Session-based)
    # user = session.get('user')
    # if not user:
    #    return jsonify({'error': 'Authentication required. Please log in.'}), 401

    # 2. Input Validation
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 3. Read Data
        user_height = request.form.get('height_cm', type=float)
        user_weight = request.form.get('weight_kg', type=float)
        user_gender = request.form.get('gender', type=str)
        
        image_bytes = file.read()
        
        # 4. Processing
        result = estimator.estimate(
            image_bytes, 
            user_height_cm=user_height, 
            user_weight_kg=user_weight, 
            user_gender=user_gender
        )
        
        # 5. Response Handling
        if result.get("error"):
            return jsonify(result), 400
            
        return jsonify(result), 200

    except Exception as e:
        print(f"Size Estimation API Error: {e}")
        return jsonify({'error': 'Internal server error processing image.'}), 500

@bp.route('/chart', methods=['GET'])
def get_size_chart():
    """
    Returns standard size charts for frontend reference.
    """
    try:
        size_charts = {
            'mens_tops': {
                'XS': {'chest': '86-91cm'},
                'S': {'chest': '91-96cm'},
                'M': {'chest': '96-101cm'},
                'L': {'chest': '101-106cm'},
                'XL': {'chest': '106-111cm'}
            },
            'womens_tops': {
                'XS': {'bust': '78-82cm'},
                'S': {'bust': '82-86cm'},
                'M': {'bust': '86-90cm'},
                'L': {'bust': '90-94cm'},
                'XL': {'bust': '94-99cm'}
            }
        }
        return jsonify({'size_charts': size_charts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
