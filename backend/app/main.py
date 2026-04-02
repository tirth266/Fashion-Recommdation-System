from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()

app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "your-secret-key-here")

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_COOKIE_SECURE"] = False
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

server_session = Session(app)

print("MongoDB-only configuration loaded")

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}
    },
)

print("Server configured with Session (Filesystem) + MongoDB Atlas (PyMongo)")

from app.database.mongodb import _get_db

try:
    db = _get_db()
    print(f"✅ MongoDB connected: {db.name}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("   The app will still start, but data operations will fail.")
    print("   Set MONGO_URI in your .env file to fix this.")

from app.routes.auth import bp as auth_bp
from app.routes.profile import bp as profile_bp
from app.routes.size_estimation import bp as size_estimation_bp
from app.routes.wardrobe import bp as wardrobe_bp
from app.routes.search import bp as search_bp
from app.routes.recommendations import bp as recommendations_bp

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(size_estimation_bp)
app.register_blueprint(wardrobe_bp)
app.register_blueprint(search_bp)
app.register_blueprint(recommendations_bp)


@app.route("/")
def home():
    return {
        "message": "Fashion Recommendation System API",
        "status": "running",
        "database": "MongoDB",
    }


@app.route("/static/dataset_images/<path:filename>")
def serve_dataset_images(filename):
    images_dir = os.path.join(app.root_path, "..", "..", "data", "datasets", "images")
    return send_from_directory(images_dir, filename)


@app.route("/api/health")
def health_check():
    mongo_ok = False
    mongo_msg = "Not connected"
    try:
        db = _get_db()
        db.command("ping")
        mongo_ok = True
        mongo_msg = f"Connected to {db.name}"
    except Exception as e:
        mongo_msg = str(e)

    return {
        "status": "healthy" if mongo_ok else "degraded",
        "message": "API is running",
        "database": "mongodb",
        "mongodb": "connected" if mongo_ok else "disconnected",
        "mongodb_detail": mongo_msg,
    }


@app.route("/api/uploads/wardrobe/<path:filename>")
def serve_wardrobe_uploads(filename):
    uploads_dir = os.path.join(app.root_path, "..", "uploads", "wardrobe")
    return send_from_directory(uploads_dir, filename)


@app.route("/api/uploads/<path:filename>")
def serve_uploads(filename):
    uploads_dir = os.path.join(app.root_path, "..", "uploads")
    return send_from_directory(uploads_dir, filename)


@app.route("/api/recommend", methods=["POST"])
def ai_recommend():
    from flask import request, jsonify
    import os

    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    try:
        if not os.path.exists("uploads"):
            os.makedirs("uploads")
        temp_path = os.path.join("uploads", file.filename)
        file.save(temp_path)

        from models.recommender_model import recommend as get_recommendations

        rec_paths = get_recommendations(temp_path)

        recommended_products = []
        for abs_path in rec_paths:
            filename = os.path.basename(abs_path)
            image_url = f"/static/dataset_images/{filename}"
            recommended_products.append(
                {"name": "Recommended Style Item", "size": "M", "image": image_url}
            )

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify(
            {
                "body_type": "Athletic",
                "recommended_size": "M",
                "recommended_products": recommended_products,
            }
        ), 200

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/size-estimation", methods=["POST"])
def size_estimation_api():
    from flask import request, jsonify
    import os

    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        return jsonify(
            {
                "body_type": "Athletic",
                "height_estimate": "172 cm",
                "shoulder_width": "44 cm",
                "recommended_size": "M",
            }
        ), 200

    except Exception as e:
        print(f"Size Estimation Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)
