from flask import Blueprint, request, jsonify, session
from models.recommender_model import recommend as get_recommendations
from app.database.mongodb import (
    save_recommendation,
    get_recommendations as get_saved_recommendations,
)
import os

bp = Blueprint("recommendations", __name__, url_prefix="/api/recommendations")


def get_session_user():
    """Get current session user."""
    return session.get("user")


def get_user_id():
    """Get user ID from session."""
    user = get_session_user()
    return user.get("user_id") if user else None


@bp.route("/recommend", methods=["POST"])
def recommend():
    print("Received recommendation request")
    if "image" not in request.files:
        print("Error: No image in request.files")
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    print(f"Processing file: {file.filename}")
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    user_gender = request.form.get("gender")
    user_id = get_user_id()
    print(f"User Gender: {user_gender}, User ID: {user_id}")

    try:
        if not os.path.exists("uploads"):
            os.makedirs("uploads")

        temp_path = os.path.join("uploads", file.filename)
        file.save(temp_path)

        print(f"Calling recommend with gender: {user_gender}")
        rec_results = get_recommendations(temp_path, user_gender)

        results = []
        for abs_path, similarity in rec_results:
            filename = os.path.basename(abs_path)
            image_url = f"/static/dataset_images/{filename}"

            product_data = {"name": filename, "image": image_url}

            results.append(
                {"url": image_url, "similarity": round(float(similarity), 4)}
            )

            # Save to MongoDB if user is logged in
            if user_id:
                try:
                    save_recommendation(
                        user_id=user_id,
                        product_id=filename,
                        product_data=product_data,
                        score=float(similarity),
                        reason=f"Similar style for {user_gender}",
                    )
                except Exception as db_err:
                    print(f"Error saving recommendation to DB: {db_err}")

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify({"recommended_images": results}), 200

    except Exception as e:
        print(f"Error in recommendation: {e}")
        return jsonify({"error": str(e)}), 500


@bp.route("/history", methods=["GET"])
def get_recommendation_history():
    """Get user's recommendation history."""
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        history = get_saved_recommendations(user_id, limit=50)
        return jsonify({"recommendations": history, "total": len(history)}), 200
    except Exception as e:
        print(f"Error getting recommendation history: {e}")
        return jsonify({"error": str(e)}), 500
