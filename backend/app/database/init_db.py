from ..extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    profile_image = db.Column(db.String(200), nullable=True)
    google_id = db.Column(db.String(100), unique=True, nullable=True) # For Google OAuth
    last_login = db.Column(db.DateTime, default=datetime.utcnow) # Track last login
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Profile preferences
    style_preference = db.Column(db.String(50), default='Casual Elegance')
    budget_range = db.Column(db.String(10), default='$$')
    
    # Body measurements
    chest_inches = db.Column(db.Float, nullable=True)
    waist_inches = db.Column(db.Float, nullable=True)
    hips_inches = db.Column(db.Float, nullable=True)
    height_inches = db.Column(db.Float, nullable=True)
    calculated_size = db.Column(db.String(10), nullable=True)
    
    # Relationships
    preferences = db.relationship('UserPreference', backref='user', lazy=True, cascade='all, delete-orphan')
    search_history = db.relationship('SearchHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'location': self.location,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat(),
            'style_preference': self.style_preference,
            'budget_range': self.budget_range,
            'chest_inches': self.chest_inches,
            'waist_inches': self.waist_inches,
            'hips_inches': self.hips_inches,
            'height_inches': self.height_inches,
            'calculated_size': self.calculated_size
        }

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    preference_type = db.Column(db.String(50), nullable=False)  # colors, categories, brands, occasions
    preference_value = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'preference_type': self.preference_type,
            'preference_value': self.preference_value,
            'created_at': self.created_at.isoformat()
        }

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    search_type = db.Column(db.String(50), nullable=False)  # image_search, text_search, etc.
    search_query = db.Column(db.Text, nullable=True)
    results_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'search_type': self.search_type,
            'search_query': self.search_query,
            'results_count': self.results_count,
            'created_at': self.created_at.isoformat()
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    size_chart = db.Column(db.Text, nullable=True)  # JSON string
    color_variants = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'brand': self.brand,
            'price': self.price,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat()
        }

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)  # Recommendation confidence score
    reason = db.Column(db.String(200), nullable=True)  # Why this recommendation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User')
    product = db.relationship('Product')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product': self.product.to_dict() if self.product else None,
            'score': self.score,
            'reason': self.reason,
            'created_at': self.created_at.isoformat()
        }

class WardrobeItem(db.Model):
    __tablename__ = 'wardrobe_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    category = db.Column(db.String(50), nullable=True) # e.g. 'top', 'bottom', 'shoes'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_url': self.image_url,
            'category': self.category,
            'created_at': self.created_at.isoformat()
        }

