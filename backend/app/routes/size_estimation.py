from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database.init_db import User, db

bp = Blueprint('size_estimation', __name__, url_prefix='/api/size')

@bp.route('/calculate', methods=['POST'])
@jwt_required()
def calculate_size():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required measurements
        required_fields = ['chest_inches', 'waist_inches']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'error': f'{field} is required'}), 400
        
        chest = float(data['chest_inches'])
        waist = float(data['waist_inches'])
        hips = float(data.get('hips_inches', 0))
        height = float(data.get('height_inches', 0))
        
        # Calculate size using standard sizing charts
        size_info = calculate_clothing_size(chest, waist, hips, height)
        
        # Update user measurements if requested
        if data.get('save_to_profile', False):
            user.chest_inches = chest
            user.waist_inches = waist
            user.hips_inches = hips if hips > 0 else None
            user.height_inches = height if height > 0 else None
            user.calculated_size = size_info['size']
            db.session.commit()
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='size_calculation',
            search_query=f'size_{size_info["size"]}',
            results_count=1
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'size_info': size_info,
            'measurements': {
                'chest_inches': chest,
                'waist_inches': waist,
                'hips_inches': hips if hips > 0 else None,
                'height_inches': height if height > 0 else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/recommendations', methods=['POST'])
@jwt_required()
def get_size_recommendations():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('category'):
            return jsonify({'error': 'Category is required'}), 400
        
        category = data['category']
        user_size = data.get('size')
        
        # Get size recommendations based on category
        recommendations = get_category_size_recommendations(category, user_size)
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='size_recommendations',
            search_query=f'{category}_{user_size}',
            results_count=len(recommendations)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'category': category,
            'user_size': user_size,
            'recommendations': recommendations,
            'total_recommendations': len(recommendations)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/chart', methods=['GET'])
def get_size_chart():
    try:
        # Return standard size charts
        size_charts = {
            'mens_tops': {
                'XS': {'chest': '32-34"', 'waist': '26-28"'},
                'S': {'chest': '34-36"', 'waist': '28-30"'},
                'M': {'chest': '36-38"', 'waist': '30-32"'},
                'L': {'chest': '38-40"', 'waist': '32-34"'},
                'XL': {'chest': '40-42"', 'waist': '34-36"'},
                'XXL': {'chest': '42-44"', 'waist': '36-38"'}
            },
            'womens_tops': {
                'XS': {'bust': '32-33"', 'waist': '24-25"'},
                'S': {'bust': '34-35"', 'waist': '26-27"'},
                'M': {'bust': '36-37"', 'waist': '28-29"'},
                'L': {'bust': '38-39"', 'waist': '30-31"'},
                'XL': {'bust': '40-41"', 'waist': '32-33"'}
            },
            'mens_bottoms': {
                'XS': {'waist': '26-28"', 'inseam': '30"'},
                'S': {'waist': '28-30"', 'inseam': '32"'},
                'M': {'waist': '30-32"', 'inseam': '34"'},
                'L': {'waist': '32-34"', 'inseam': '36"'},
                'XL': {'waist': '34-36"', 'inseam': '38"'}
            }
        }
        
        return jsonify({
            'size_charts': size_charts
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/fit-advice', methods=['POST'])
@jwt_required()
def get_fit_advice():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('product_category') or not data.get('user_measurements'):
            return jsonify({'error': 'Product category and user measurements are required'}), 400
        
        category = data['product_category']
        measurements = data['user_measurements']
        
        # Generate fit advice based on measurements and category
        advice = generate_fit_advice(category, measurements)
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='fit_advice',
            search_query=f'{category}_advice',
            results_count=1
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'category': category,
            'measurements': measurements,
            'fit_advice': advice
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def calculate_clothing_size(chest, waist, hips=0, height=0):
    """Calculate clothing size based on measurements"""
    
    # Standard men's sizing logic
    if chest < 34 or waist < 26:
        size = 'XS'
        size_range = 'Extra Small'
        description = 'Perfect for petite frames and slender builds'
    elif chest < 36 or waist < 28:
        size = 'S'
        size_range = 'Small'
        description = 'Ideal for slim to average builds'
    elif chest < 38 or waist < 30:
        size = 'M'
        size_range = 'Medium'
        description = 'Great fit for average body proportions'
    elif chest < 40 or waist < 32:
        size = 'L'
        size_range = 'Large'
        description = 'Designed for broader shoulders and chest'
    elif chest < 42 or waist < 34:
        size = 'XL'
        size_range = 'Extra Large'
        description = 'Spacious fit for larger body frames'
    else:
        size = 'XXL'
        size_range = 'Double Extra Large'
        description = 'Maximum comfort for larger builds'
    
    # Determine body type based on height
    body_type = 'Average'
    if height > 72:
        body_type = 'Tall'
    elif height < 66 and height > 0:
        body_type = 'Petite'
    
    # Calculate fit confidence (mock calculation)
    fit_confidence = 90  # Base confidence
    if hips > 0:
        fit_confidence += 5  # Additional confidence with hip measurement
    if height > 0:
        fit_confidence += 5  # Additional confidence with height
    
    return {
        'size': size,
        'size_range': size_range,
        'description': description,
        'body_type': body_type,
        'fit_confidence': min(fit_confidence, 100),
        'measurements_used': {
            'chest': chest,
            'waist': waist,
            'hips': hips if hips > 0 else None,
            'height': height if height > 0 else None
        }
    }

def get_category_size_recommendations(category, user_size):
    """Get size recommendations for specific clothing categories"""
    
    recommendations = {
        'Outerwear': [
            {'size': user_size, 'confidence': 95, 'reason': 'Standard sizing for jackets'},
            {'size': adjust_size(user_size, -1), 'confidence': 85, 'reason': 'For slim fit outerwear'},
            {'size': adjust_size(user_size, 1), 'confidence': 80, 'reason': 'For oversized/relaxed fit'}
        ],
        'Bottoms': [
            {'size': user_size, 'confidence': 90, 'reason': 'Standard waist measurement'},
            {'size': adjust_size(user_size, -1), 'confidence': 75, 'reason': 'For slim/skinny fit'},
            {'size': adjust_size(user_size, 1), 'confidence': 70, 'reason': 'For loose/comfort fit'}
        ],
        'Tops': [
            {'size': user_size, 'confidence': 88, 'reason': 'Standard chest measurement'},
            {'size': adjust_size(user_size, -1), 'confidence': 80, 'reason': 'For fitted/contemporary cut'},
            {'size': adjust_size(user_size, 1), 'confidence': 75, 'reason': 'For classic/relaxed fit'}
        ],
        'Dresses': [
            {'size': user_size, 'confidence': 92, 'reason': 'Standard sizing for dresses'},
            {'size': adjust_size(user_size, -1), 'confidence': 82, 'reason': 'For fitted/form-fitting dresses'},
            {'size': adjust_size(user_size, 1), 'confidence': 78, 'reason': 'For loose/flowing styles'}
        ]
    }
    
    return recommendations.get(category, [
        {'size': user_size, 'confidence': 85, 'reason': 'General recommendation'}
    ])

def adjust_size(size, adjustment):
    """Adjust size up or down"""
    sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    if size in sizes:
        current_index = sizes.index(size)
        new_index = max(0, min(len(sizes) - 1, current_index + adjustment))
        return sizes[new_index]
    return size

def generate_fit_advice(category, measurements):
    """Generate personalized fit advice"""
    
    chest = measurements.get('chest_inches', 0)
    waist = measurements.get('waist_inches', 0)
    hips = measurements.get('hips_inches', 0)
    
    advice = {
        'overall_fit': 'Good',
        'recommendations': [],
        'considerations': []
    }
    
    # Category-specific advice
    if category.lower() in ['jacket', 'coat', 'outerwear']:
        if chest > 0:
            advice['recommendations'].append('Choose based on chest measurement for best shoulder fit')
        advice['considerations'].append('Allow extra room for layering')
    
    elif category.lower() in ['pants', 'jeans', 'trousers']:
        if waist > 0:
            advice['recommendations'].append('Waist measurement is most important for bottoms')
        advice['considerations'].append('Consider inseam length for proper fit')
    
    elif category.lower() in ['shirt', 'blouse', 'top']:
        if chest > 0:
            advice['recommendations'].append('Chest measurement determines torso fit')
        advice['considerations'].append('Sleeve length should reach wrist comfortably')
    
    # General advice
    advice['recommendations'].extend([
        'Try on before purchasing when possible',
        'Check brand-specific size charts',
        'Consider fabric stretch and garment construction'
    ])
    
    return advice