from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///fashion.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Import routes after app initialization to avoid circular imports
from app.routes import auth, profile, recommendations, search, size_estimation

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(profile.bp)
app.register_blueprint(recommendations.bp)
app.register_blueprint(search.bp)
app.register_blueprint(size_estimation.bp)

@app.route('/')
def home():
    return {"message": "Fashion Recommendation System API", "status": "running"}

@app.route('/api/health')
def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
