from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_session import Session
import os
from datetime import timedelta

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SECURE'] = False # Important for localhost (HTTP)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' # Important for localhost

# Initialize extensions
# db = SQLAlchemy(app) # Database disabled for session-based auth
# jwt = JWTManager(app) # JWT disabled for session-based auth
server_session = Session(app)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

print("Server configured with Session (Filesystem)")

# Import routes after app initialization to avoid circular imports

from app.routes import auth, profile
from app.routes import image_recommadtions as recommendations

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(profile.bp)
app.register_blueprint(recommendations.bp)

# app.register_blueprint(search.bp)
# app.register_blueprint(size_estimation.bp)

@app.route('/')
def home():
    return {"message": "Fashion Recommendation System API", "status": "running"}


@app.route('/static/dataset_images/<path:filename>')
def serve_dataset_images(filename):
    # Go up two levels from app (backend/app -> backend -> root) then into data/datasets/images
    images_dir = os.path.join(app.root_path, '..', '..', 'data', 'datasets', 'images')
    return send_from_directory(images_dir, filename)

@app.route('/api/health')
def health_check():
    return {"status": "healthy", "message": "API is running"}


if __name__ == '__main__':
    # with app.app_context():
    #     db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
