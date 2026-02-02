from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database.init_db import User, UserPreference, db
import json

bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user fields
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'location' in data:
            user.location = data['location']
        if 'style_preference' in data:
            user.style_preference = data['style_preference']
        if 'budget_range' in data:
            user.budget_range = data['budget_range']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    try:
        current_user_id = get_jwt_identity()
        preferences = UserPreference.query.filter_by(user_id=current_user_id).all()
        
        # Group preferences by type
        grouped_preferences = {}
        for pref in preferences:
            if pref.preference_type not in grouped_preferences:
                grouped_preferences[pref.preference_type] = []
            grouped_preferences[pref.preference_type].append(pref.preference_value)
        
        return jsonify({
            'preferences': grouped_preferences
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/preferences', methods=['POST'])
@jwt_required()
def update_preferences():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Delete existing preferences for this user
        UserPreference.query.filter_by(user_id=current_user_id).delete()
        
        # Add new preferences
        for pref_type, values in data.items():
            if isinstance(values, list):
                for value in values:
                    preference = UserPreference(
                        user_id=current_user_id,
                        preference_type=pref_type,
                        preference_value=value
                    )
                    db.session.add(preference)
            else:
                preference = UserPreference(
                    user_id=current_user_id,
                    preference_type=pref_type,
                    preference_value=values
                )
                db.session.add(preference)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/measurements', methods=['GET'])
@jwt_required()
def get_measurements():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        measurements = {
            'chest_inches': user.chest_inches,
            'waist_inches': user.waist_inches,
            'hips_inches': user.hips_inches,
            'height_inches': user.height_inches,
            'calculated_size': user.calculated_size
        }
        
        return jsonify({'measurements': measurements}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/measurements', methods=['PUT'])
@jwt_required()
def update_measurements():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update measurements
        if 'chest_inches' in data:
            user.chest_inches = float(data['chest_inches'])
        if 'waist_inches' in data:
            user.waist_inches = float(data['waist_inches'])
        if 'hips_inches' in data:
            user.hips_inches = float(data['hips_inches'])
        if 'height_inches' in data:
            user.height_inches = float(data['height_inches'])
        
        # Calculate size based on measurements
        if user.chest_inches and user.waist_inches:
            chest = user.chest_inches
            waist = user.waist_inches
            
            if chest < 34 or waist < 26:
                user.calculated_size = 'XS'
            elif chest < 36 or waist < 28:
                user.calculated_size = 'S'
            elif chest < 38 or waist < 30:
                user.calculated_size = 'M'
            elif chest < 40 or waist < 32:
                user.calculated_size = 'L'
            else:
                user.calculated_size = 'XL'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Measurements updated successfully',
            'measurements': {
                'chest_inches': user.chest_inches,
                'waist_inches': user.waist_inches,
                'hips_inches': user.hips_inches,
                'height_inches': user.height_inches,
                'calculated_size': user.calculated_size
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/search-history', methods=['GET'])
@jwt_required()
def get_search_history():
    try:
        from ..database.init_db import SearchHistory
        current_user_id = get_jwt_identity()
        history = SearchHistory.query.filter_by(user_id=current_user_id)\
            .order_by(SearchHistory.created_at.desc())\
            .limit(20).all()
        
        return jsonify({
            'history': [item.to_dict() for item in history]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500