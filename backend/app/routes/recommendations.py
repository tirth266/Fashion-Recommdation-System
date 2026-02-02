from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database.init_db import User, Product, Recommendation, db
import random
from datetime import datetime

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@bp.route('/personalized', methods=['GET'])
@jwt_required()
def get_personalized_recommendations():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user preferences
        from ..database.init_db import UserPreference
        user_preferences = UserPreference.query.filter_by(user_id=current_user_id).all()
        
        # Get all products (in a real system, this would be filtered by preferences)
        products = Product.query.all()
        
        # Create mock recommendations (in real system, use ML model)
        recommendations = []
        for product in products[:12]:  # Limit to 12 recommendations
            score = random.uniform(0.7, 0.95)  # Mock confidence score
            reason = get_recommendation_reason(user, product, user_preferences)
            
            # Create recommendation record
            rec = Recommendation(
                user_id=current_user_id,
                product_id=product.id,
                score=score,
                reason=reason
            )
            db.session.add(rec)
            
            recommendations.append({
                'product': product.to_dict(),
                'score': round(score, 2),
                'reason': reason
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='personalized_recommendations',
            results_count=len(recommendations)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'recommendations': recommendations,
            'total': len(recommendations)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/by-category/<category>', methods=['GET'])
@jwt_required()
def get_recommendations_by_category(category):
    try:
        current_user_id = get_jwt_identity()
        
        # Get products by category
        products = Product.query.filter_by(category=category).all()
        
        # Create mock recommendations
        recommendations = []
        for product in products[:8]:
            score = random.uniform(0.75, 0.90)
            recommendations.append({
                'product': product.to_dict(),
                'score': round(score, 2),
                'reason': f'Popular in {category} category'
            })
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='category_recommendations',
            search_query=category,
            results_count=len(recommendations)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'category': category,
            'recommendations': recommendations,
            'total': len(recommendations)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/trending', methods=['GET'])
@jwt_required()
def get_trending_recommendations():
    try:
        current_user_id = get_jwt_identity()
        
        # Get all products (mock trending by random selection)
        products = Product.query.all()
        random.shuffle(products)
        
        # Create trending recommendations
        recommendations = []
        for product in products[:10]:
            score = random.uniform(0.8, 0.98)  # Higher scores for trending
            recommendations.append({
                'product': product.to_dict(),
                'score': round(score, 2),
                'reason': 'Currently trending',
                'trending': True
            })
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='trending_recommendations',
            results_count=len(recommendations)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'recommendations': recommendations,
            'total': len(recommendations)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/similar/<int:product_id>', methods=['GET'])
@jwt_required()
def get_similar_products(product_id):
    try:
        current_user_id = get_jwt_identity()
        base_product = Product.query.get(product_id)
        
        if not base_product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Get similar products (same category, different products)
        similar_products = Product.query.filter(
            Product.category == base_product.category,
            Product.id != product_id
        ).limit(6).all()
        
        # Create similarity recommendations
        recommendations = []
        for product in similar_products:
            score = random.uniform(0.7, 0.85)
            recommendations.append({
                'product': product.to_dict(),
                'score': round(score, 2),
                'reason': f'Similar to {base_product.name}'
            })
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='similar_products',
            search_query=f'similar_to_{product_id}',
            results_count=len(recommendations)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'base_product': base_product.to_dict(),
            'similar_products': recommendations,
            'total': len(recommendations)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def get_recommendation_reason(user, product, preferences):
    """Generate a reason for the recommendation based on user preferences"""
    reasons = [
        f"Matches your preference for {product.category}",
        f"Recommended based on your style: {user.style_preference}",
        f"Popular choice in your budget range ({user.budget_range})",
        f"Perfect for {product.category} lovers",
        f"Highly rated {product.brand} product",
        f"Great value in the {product.category} category"
    ]
    
    # Filter reasons based on user preferences
    filtered_reasons = []
    for reason in reasons:
        if any(pref.preference_value.lower() in reason.lower() for pref in preferences):
            filtered_reasons.append(reason)
    
    if filtered_reasons:
        return random.choice(filtered_reasons)
    else:
        return random.choice(reasons)

# Mock data initialization route (for development)
@bp.route('/init-mock-data', methods=['POST'])
def init_mock_data():
    try:
        # Check if data already exists
        if Product.query.first():
            return jsonify({'message': 'Mock data already exists'}), 200
        
        # Create mock products
        mock_products = [
            {
                'name': 'Premium Denim Jacket',
                'description': 'Stylish denim jacket for casual wear',
                'category': 'Outerwear',
                'brand': 'Urban Classics',
                'price': 79.99
            },
            {
                'name': 'Slim Fit Jeans',
                'description': 'Comfortable slim fit denim jeans',
                'category': 'Bottoms',
                'brand': 'Style Denim',
                'price': 54.99
            },
            {
                'name': 'Classic White Shirt',
                'description': 'Essential white dress shirt',
                'category': 'Tops',
                'brand': 'Elegant Wear',
                'price': 34.99
            },
            {
                'name': 'Genuine Leather Jacket',
                'description': 'Premium leather jacket for style',
                'category': 'Outerwear',
                'brand': 'Premium Leather',
                'price': 129.99
            },
            {
                'name': 'Summer Floral Dress',
                'description': 'Beautiful floral summer dress',
                'category': 'Dresses',
                'brand': 'Bloom Fashion',
                'price': 49.99
            },
            {
                'name': 'Running Sneakers',
                'description': 'Comfortable athletic sneakers',
                'category': 'Footwear',
                'brand': 'Active Gear',
                'price': 99.99
            }
        ]
        
        for product_data in mock_products:
            product = Product(**product_data)
            db.session.add(product)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Mock data initialized successfully',
            'products_added': len(mock_products)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500