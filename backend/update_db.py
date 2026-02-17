import sys
import os
sys.path.append(os.getcwd())
from app.main import app
from app.extensions import db
from app.database.init_db import WardrobeItem

with app.app_context():
    db.create_all()
    print("Database tables updated successfully.")
