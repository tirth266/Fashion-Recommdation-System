from app.main import app
from app.extensions import mongo
import sys

print("Checking MongoDB connection...")
try:
    with app.app_context():
        # Try to insert and find a test document
        mongo.db.test_collection.insert_one({"test": "ok"})
        doc = mongo.db.test_collection.find_one({"test": "ok"})
        if doc:
            print("Successfully connected to MongoDB!")
            print(f"Found doc: {doc}")
            mongo.db.test_collection.delete_one({"test": "ok"})
        else:
            print("Connected but could not find inserted doc.")
except Exception as e:
    print(f"FAILED to connect: {e}")
    sys.exit(1)
