from flask import Blueprint, request, jsonify, session
from ..database.mongodb import find_user_by_object_id, update_user
import os
from werkzeug.utils import secure_filename

bp = Blueprint("profile", __name__, url_prefix="/api/profile")


def get_session_user():
    """Returns the current session user dict, or None."""
    return session.get("user")


def _build_profile_response(user):
    """Build profile response from MongoDB user document."""
    return {
        "name": user.get("name", ""),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "avatar": user.get("profile_pic", ""),
        "gender": user.get("gender", ""),
        "favorite_color": user.get("favorite_color", ""),
        "calculated_size": user.get("calculated_size", ""),
        "measurements": user.get(
            "body_measurements",
            {
                "height": "",
                "chest": "",
                "shoulder": "",
                "wrist": "",
                "waist": "",
                "hips": "",
                "weight": "",
            },
        ),
        "preferences": user.get(
            "preferences",
            {
                "colors": [],
                "brands": [],
                "fit": "",
                "style_preference": "Casual Elegance",
                "budget_range": "$$",
            },
        ),
        "completed_onboarding": bool(
            user.get("body_measurements", {}).get("height")
            or user.get("preferences", {}).get("fit")
        ),
    }


# ═══════════════════════════════════════════════════════════════════
# GET /api/profile/  — Fetch logged-in user's full profile
# ═══════════════════════════════════════════════════════════════════
@bp.route("/", methods=["GET"])
def get_profile():
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    mongo_user = find_user_by_object_id(user_id)
    if not mongo_user:
        return jsonify({"error": "User not found"}), 404

    profile = _build_profile_response(mongo_user)
    return jsonify({"profile": profile, "user": user}), 200


# ═══════════════════════════════════════════════════════════════════
# POST /api/profile/  — Update profile (measurements, preferences)
# ═══════════════════════════════════════════════════════════════════
@bp.route("/", methods=["POST"])
def update_profile():
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    update_data = {}

    if "name" in data:
        update_data["name"] = data["name"]

    if "gender" in data:
        update_data["gender"] = data["gender"]

    if "favorite_color" in data:
        update_data["favorite_color"] = data["favorite_color"]

    if "calculated_size" in data:
        update_data["calculated_size"] = data["calculated_size"]

    if "measurements" in data:
        update_data["body_measurements"] = data["measurements"]

    if "preferences" in data:
        update_data["preferences"] = data["preferences"]

    if update_data:
        updated_user = update_user(user_id, update_data)
        if updated_user:
            user["profile"] = updated_user
            user["name"] = updated_user.get("name", user.get("name", ""))
            session["user"] = user
            session.modified = True

    refreshed_user = find_user_by_object_id(user_id)
    profile = _build_profile_response(refreshed_user) if refreshed_user else {}

    return jsonify(
        {"message": "Profile updated successfully", "profile": profile, "user": user}
    ), 200


# ═══════════════════════════════════════════════════════════════════
# POST /api/profile/update  — Explicit update endpoint
# ═══════════════════════════════════════════════════════════════════
@bp.route("/update", methods=["POST"])
def update_profile_explicit():
    """
    POST /api/profile/update
    Accepts: { body_measurements: {...}, preferences: {...}, name: "..." }
    """
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    update_data = {}

    if "body_measurements" in data:
        update_data["body_measurements"] = data["body_measurements"]

    if "preferences" in data:
        update_data["preferences"] = data["preferences"]

    if "name" in data:
        update_data["name"] = data["name"]

    if "gender" in data:
        update_data["gender"] = data["gender"]

    if "favorite_color" in data:
        update_data["favorite_color"] = data["favorite_color"]

    if "calculated_size" in data:
        update_data["calculated_size"] = data["calculated_size"]

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    updated_user = update_user(user_id, update_data)

    if updated_user:
        user["profile"] = updated_user
        user["name"] = updated_user.get("name", user.get("name", ""))
        session["user"] = user
        session.modified = True
        return jsonify(
            {"message": "Profile updated successfully", "user": updated_user}
        ), 200

    return jsonify({"error": "Failed to update profile"}), 500


# ═══════════════════════════════════════════════════════════════════
# POST /api/profile/upload-avatar  — Avatar upload
# ═══════════════════════════════════════════════════════════════════
@bp.route("/upload-avatar", methods=["POST"])
def upload_avatar():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file:
            upload_folder = os.path.join(os.getcwd(), "app", "static", "uploads")
            os.makedirs(upload_folder, exist_ok=True)

            user = get_session_user()
            if not user:
                return jsonify({"error": "Not authenticated"}), 401

            user_id = user.get("user_id", "unknown")
            filename = secure_filename(file.filename)
            unique_filename = f"{user_id}_{filename}"
            file_path = os.path.join(upload_folder, unique_filename)

            file.save(file_path)

            avatar_url = f"http://localhost:5000/static/uploads/{unique_filename}"

            update_user(user_id, {"profile_pic": avatar_url})

            user["picture"] = avatar_url
            user["profile_pic"] = avatar_url
            session["user"] = user
            session.modified = True

            return jsonify(
                {"message": "Avatar uploaded successfully", "avatar_url": avatar_url}
            ), 200

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# GET /api/profile/size-history  — Get user's size estimation history
# ═══════════════════════════════════════════════════════════════════
@bp.route("/size-history", methods=["GET"])
def get_size_history():
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    from ..database.mongodb import get_size_estimates

    estimates = get_size_estimates(user_id, limit=20)

    return jsonify({"estimates": estimates, "total": len(estimates)}), 200


# ═══════════════════════════════════════════════════════════════════
# GET /api/profile/recommendations  — Get user's recommendations
# ═══════════════════════════════════════════════════════════════════
@bp.route("/recommendations", methods=["GET"])
def get_user_recommendations():
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    from ..database.mongodb import get_recommendations

    recommendations = get_recommendations(user_id, limit=20)

    return jsonify(
        {"recommendations": recommendations, "total": len(recommendations)}
    ), 200


# ═══════════════════════════════════════════════════════════════════
# GET /api/profile/search-history  — Get user's search history
# ═══════════════════════════════════════════════════════════════════
@bp.route("/search-history", methods=["GET"])
def get_user_search_history():
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    from ..database.mongodb import get_search_history

    history = get_search_history(user_id, limit=50)

    return jsonify({"history": history, "total": len(history)}), 200
