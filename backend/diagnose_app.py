import os
import sys
from flask import Flask
from app.extensions import db, mongo
from flask_session import Session

# Setup basic app following main.py pattern
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-key'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fashion.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/fashiondb")

# Initialize extensions
Session(app)
db.init_app(app)
mongo.init_app(app)

print("=== Diagnostic Start ===")

# 1. Check Session Directory
try:
    flask_session_path = os.path.join(os.getcwd(), 'flask_session')
    print(f"[INFO] Checking session directory: {flask_session_path}")
    if not os.path.exists(flask_session_path):
        print("[WARN] flask_session directory does not exist. Attempting to create...")
        os.makedirs(flask_session_path)
        print("[PASS] Created flask_session directory.")
    else:
        # Try writing
        test_file = os.path.join(flask_session_path, 'test_write.txt')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        print("[PASS] Session directory is writable.")
except Exception as e:
    print(f"[FAIL] Session directory error: {e}")

# 2. Check SQLite
try:
    with app.app_context():
        print("[INFO] Checking SQLite connection...")
        # Just try to reflect tables or connect
        with db.engine.connect() as connection:
            print("[PASS] SQLite connection successful.")
except Exception as e:
    print(f"[FAIL] SQLite error: {e}")

# 3. Check MongoDB
try:
    with app.app_context():
        print(f"[INFO] Checking MongoDB connection to {app.config['MONGO_URI']}...")
        # Ping command
        mongo.cx.admin.command('ping')
        print("[PASS] MongoDB connection successful.")
except Exception as e:
    print(f"[FAIL] MongoDB connection error: {e}")
    print("       Ensure MongoDB is running locally on port 27017.")

print("=== Diagnostic End ===")
