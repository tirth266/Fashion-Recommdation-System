from flask import Blueprint, request, jsonify, session
from ..database.mongodb import (
    get_wardrobe_items,
    add_wardrobe_item,
    delete_wardrobe_item,
)
import os
from werkzeug.utils import secure_filename

bp = Blueprint("wardrobe", __name__, url_prefix="/api/wardrobe")

UPLOAD_FOLDER = "uploads/wardrobe"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_session_user():
    """Get current session user."""
    return session.get("user")


@bp.route("/", methods=["GET"])
def get_wardrobe():
    """Get all wardrobe items for the current user."""
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    items = get_wardrobe_items(user_id)
    return jsonify({"items": items, "total": len(items)}), 200


@bp.route("/", methods=["POST"])
def add_item():
    """Upload a new wardrobe item."""
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)
    unique_filename = f"{user_id}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)

    category = request.form.get("category", "uncategorized")
    image_url = f"/api/uploads/wardrobe/{unique_filename}"

    item = add_wardrobe_item(user_id, image_url, category)

    return jsonify({"item": item, "message": "Item added successfully"}), 201


@bp.route("/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    """Delete a wardrobe item."""
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    deleted = delete_wardrobe_item(user_id, item_id)

    if not deleted:
        return jsonify({"error": "Item not found"}), 404

    try:
        filepath = os.path.join("uploads", "wardrobe", item_id + ".jpg")
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Error deleting file: {e}")

    return jsonify({"message": "Item deleted successfully"}), 200


@bp.route("/categories", methods=["GET"])
def get_wardrobe_categories():
    """Get unique categories from user's wardrobe."""
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    items = get_wardrobe_items(user_id)
    categories = list(set(item.get("category", "uncategorized") for item in items))

    return jsonify({"categories": categories}), 200
