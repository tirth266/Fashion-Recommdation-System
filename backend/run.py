from dotenv import load_dotenv
import os
import sys
from app.main import app

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    # Set environment variables for development
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('SECRET_KEY', 'dev-secret-key-change-in-production')
    os.environ.setdefault('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
    
    with app.app_context():
        # delayed import to avoid circular dep
        from app.extensions import db
        from app.database.init_db import User, Product
        db.create_all()
        print("Database tables created.")

    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)