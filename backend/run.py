from dotenv import load_dotenv
import os
import sys
from app.main import app

load_dotenv()

if __name__ == "__main__":
    os.environ.setdefault("FLASK_ENV", "development")
    os.environ.setdefault("SECRET_KEY", "dev-secret-key-change-in-production")

    with app.app_context():
        print("MongoDB-only mode - no SQLite tables needed.")

        from app.database.mongodb import _get_db

        try:
            db = _get_db()
            db.command("ping")
            print(f"MongoDB connected: {db.name}")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")

    app.run(debug=True, host="0.0.0.0", port=5000)
