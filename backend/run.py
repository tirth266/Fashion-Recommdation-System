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
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)