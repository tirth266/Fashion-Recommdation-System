from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database.init_db import Product, db
import base64
from io import BytesIO
from PIL import Image
import random

bp = Blueprint('search', __name__, url_prefix='/api/search')

@bp.route('/text', methods=['POST'])
@jwt_required()
def text_search():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('query'):
            return jsonify({'error': 'Search query is required'}), 400
        
        query = data['query'].lower()
        
        # Search products by name, description, category, or brand
        products = Product.query.filter(
            db.or_(
                Product.name.ilike(f'%{query}%'),
                Product.description.ilike(f'%{query}%'),
                Product.category.ilike(f'%{query}%'),
                Product.brand.ilike(f'%{query}%')
            )
        ).all()
        
        # Create search results with similarity scores
        results = []
        for product in products:
            # Calculate mock similarity score
            name_match = query in product.name.lower()
            desc_match = query in product.description.lower() if product.description else False
            category_match = query in product.category.lower()
            brand_match = query in product.brand.lower()
            
            # Calculate score based on matches
            score = 0.0
            if name_match:
                score += 0.4
            if desc_match:
                score += 0.2
            if category_match:
                score += 0.25
            if brand_match:
                score += 0.15
            
            results.append({
                'product': product.to_dict(),
                'similarity_score': round(score, 2),
                'match_reason': get_match_reason(query, product)
            })
        
        # Sort by similarity score
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='text_search',
            search_query=query,
            results_count=len(results)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'query': query,
            'results': results,
            'total_results': len(results)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/image', methods=['POST'])
@jwt_required()
def image_search():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('image_data'):
            return jsonify({'error': 'Image data is required'}), 400
        
        # Decode base64 image data
        try:
            image_data = base64.b64decode(data['image_data'])
            image = Image.open(BytesIO(image_data))
        except Exception as e:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Mock image analysis - in real system, this would use computer vision
        # For demo, we'll search for products that match common clothing categories
        mock_categories = ['Outerwear', 'Bottoms', 'Tops', 'Dresses', 'Footwear']
        detected_category = random.choice(mock_categories)
        
        # Find similar products
        similar_products = Product.query.filter_by(category=detected_category).all()
        
        # Create similarity results
        results = []
        for product in similar_products:
            similarity_score = random.uniform(0.7, 0.95)
            results.append({
                'product': product.to_dict(),
                'similarity_score': round(similarity_score, 2),
                'detected_category': detected_category,
                'match_reason': f'Similar {detected_category} style'
            })
        
        # Sort by similarity score
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='image_search',
            search_query=f'image_{detected_category}',
            results_count=len(results)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'detected_category': detected_category,
            'results': results,
            'total_results': len(results),
            'message': 'Image analyzed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/price-comparison', methods=['POST'])
@jwt_required()
def price_comparison():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('product_id'):
            return jsonify({'error': 'Product ID is required'}), 400
        
        product_id = data['product_id']
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Mock price comparison data (in real system, this would call external APIs)
        retailers = [
            {'name': 'Fashion Hub Premium', 'price': round(product.price * 0.95, 2), 'stock': 'In Stock', 'rating': 4.8},
            {'name': 'Style Marketplace', 'price': round(product.price * 1.05, 2), 'stock': 'In Stock', 'rating': 4.6},
            {'name': 'Trendy Outlet', 'price': round(product.price * 0.90, 2), 'stock': 'Low Stock', 'rating': 4.4},
            {'name': 'Fashion Central', 'price': round(product.price * 1.10, 2), 'stock': 'Out of Stock', 'rating': 4.7},
            {'name': 'Elite Fashion', 'price': round(product.price * 0.85, 2), 'stock': 'In Stock', 'rating': 4.9},
        ]
        
        # Find best deal
        in_stock_retailers = [r for r in retailers if r['stock'] == 'In Stock']
        best_deal = min(in_stock_retailers, key=lambda x: x['price']) if in_stock_retailers else None
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='price_comparison',
            search_query=f'product_{product_id}',
            results_count=len(retailers)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'product': product.to_dict(),
            'comparisons': retailers,
            'best_deal': best_deal,
            'total_comparisons': len(retailers)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/filter', methods=['POST'])
@jwt_required()
def filtered_search():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        query = Product.query
        
        # Apply filters
        if data.get('category'):
            query = query.filter(Product.category == data['category'])
        if data.get('brand'):
            query = query.filter(Product.brand == data['brand'])
        if data.get('min_price'):
            query = query.filter(Product.price >= data['min_price'])
        if data.get('max_price'):
            query = query.filter(Product.price <= data['max_price'])
        if data.get('search_term'):
            term = data['search_term']
            query = query.filter(
                db.or_(
                    Product.name.ilike(f'%{term}%'),
                    Product.description.ilike(f'%{term}%')
                )
            )
        
        # Execute query
        products = query.all()
        
        # Format results
        results = [product.to_dict() for product in products]
        
        # Store in search history
        from ..database.init_db import SearchHistory
        search_query = f"filter_{data.get('category', 'all')}_{data.get('brand', 'all')}"
        search_history = SearchHistory(
            user_id=current_user_id,
            search_type='filtered_search',
            search_query=search_query,
            results_count=len(results)
        )
        db.session.add(search_history)
        db.session.commit()
        
        return jsonify({
            'results': results,
            'total_results': len(results),
            'filters_applied': data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        # Get all unique categories
        categories = db.session.query(Product.category).distinct().all()
        category_list = [cat[0] for cat in categories]
        
        return jsonify({
            'categories': category_list,
            'total': len(category_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/brands', methods=['GET'])
def get_brands():
    try:
        # Get all unique brands
        brands = db.session.query(Product.brand).distinct().all()
        brand_list = [brand[0] for brand in brands]
        
        return jsonify({
            'brands': brand_list,
            'total': len(brand_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_match_reason(query, product):
    """Generate a reason for why the product matches the search query"""
    query_lower = query.lower()
    
    if query_lower in product.name.lower():
        return f"Product name contains '{query}'"
    elif product.description and query_lower in product.description.lower():
        return f"Product description contains '{query}'"
    elif query_lower in product.category.lower():
        return f"Product category is '{product.category}'"
    elif query_lower in product.brand.lower():
        return f"Product brand is '{product.brand}'"
    else:
        return "Relevant search result"