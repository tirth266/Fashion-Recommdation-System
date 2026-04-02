from flask import Blueprint, request, jsonify, session
from ..services.size_estimation_service import SizeEstimator
from ..database.mongodb import save_size_estimate, update_user
import os

bp = Blueprint("size_estimation", __name__, url_prefix="/api/size")

estimator = SizeEstimator()


def get_session_user():
    """Get current session user."""
    return session.get("user")


def get_user_id():
    """Get user ID from session."""
    user = get_session_user()
    return user.get("user_id") if user else None


@bp.route("/estimate-from-image", methods=["POST"])
def estimate_from_image():
    """
    POST /api/size/estimate-from-image
    Input: Multipart Form Data
      - image: File (jpg/png)
      - height_cm: Float (Optional)
      - weight_kg: Float (Optional)
      - gender: String (Optional)

    Output: JSON with measurements and recommended size
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        user_height = request.form.get("height_cm", type=float)
        user_weight = request.form.get("weight_kg", type=float)
        user_gender = request.form.get("gender", type=str)

        image_bytes = file.read()

        result = estimator.estimate(
            image_bytes,
            user_height_cm=user_height,
            user_weight_kg=user_weight,
            user_gender=user_gender,
        )

        if result.get("error"):
            return jsonify(result), 400

        user_id = get_user_id()

        if user_id and not result.get("error"):
            measurements = {
                "height": str(result.get("height_estimate", "").replace(" cm", "")),
                "chest": str(result.get("chest_measurement", "").replace(" cm", "")),
                "shoulder": str(result.get("shoulder_width", "").replace(" cm", "")),
                "waist": str(result.get("waist_measurement", "").replace(" cm", "")),
                "hips": str(result.get("hip_measurement", "").replace(" cm", "")),
                "weight": str(user_weight or ""),
            }

            saved_estimate = save_size_estimate(
                user_id=user_id,
                measurements=measurements,
                recommended_size=result.get("recommended_size", ""),
                confidence=result.get("confidence", 0.0),
                body_type=result.get("body_type", ""),
            )

            update_user(
                user_id,
                {
                    "body_measurements": measurements,
                    "calculated_size": result.get("recommended_size", ""),
                },
            )

            result["saved_estimate_id"] = saved_estimate.get("_id", "")

        return jsonify(result), 200

    except Exception as e:
        print(f"Size Estimation API Error: {e}")
        return jsonify({"error": "Internal server error processing image."}), 500


@bp.route("/manual-entry", methods=["POST"])
def manual_size_entry():
    """
    POST /api/size/manual-entry
    Manually enter body measurements and get size recommendation.
    """
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_id = user.get("user_id")

    measurements = {
        "height": str(data.get("height", "")),
        "chest": str(data.get("chest", "")),
        "shoulder": str(data.get("shoulder", "")),
        "wrist": str(data.get("wrist", "")),
        "waist": str(data.get("waist", "")),
        "hips": str(data.get("hips", "")),
        "weight": str(data.get("weight", "")),
    }

    gender = data.get("gender", "male")

    if gender.lower() == "female":
        if measurements["chest"]:
            chest_cm = float(measurements["chest"])
            if chest_cm < 82:
                size = "XS"
            elif chest_cm < 86:
                size = "S"
            elif chest_cm < 90:
                size = "M"
            elif chest_cm < 94:
                size = "L"
            else:
                size = "XL"
        else:
            size = "M"
    else:
        if measurements["chest"]:
            chest_cm = float(measurements["chest"])
            if chest_cm < 91:
                size = "S"
            elif chest_cm < 96:
                size = "M"
            elif chest_cm < 101:
                size = "L"
            elif chest_cm < 106:
                size = "XL"
            else:
                size = "XXL"
        else:
            size = "M"

    saved_estimate = save_size_estimate(
        user_id=user_id,
        measurements=measurements,
        recommended_size=size,
        confidence=1.0,
        body_type="User Entered",
    )

    update_user(
        user_id,
        {"body_measurements": measurements, "calculated_size": size, "gender": gender},
    )

    return jsonify(
        {
            "success": True,
            "measurements": measurements,
            "recommended_size": size,
            "confidence": 1.0,
            "body_type": "User Entered",
            "saved_estimate_id": saved_estimate.get("_id", ""),
        }
    ), 200


@bp.route("/chart", methods=["GET"])
def get_size_chart():
    """Returns standard size charts."""
    try:
        size_charts = {
            "mens_tops": {
                "XS": {"chest": "86-91cm", "shoulder": "43-44cm"},
                "S": {"chest": "91-96cm", "shoulder": "44-45cm"},
                "M": {"chest": "96-101cm", "shoulder": "45-46cm"},
                "L": {"chest": "101-106cm", "shoulder": "46-47cm"},
                "XL": {"chest": "106-111cm", "shoulder": "47-48cm"},
                "XXL": {"chest": "111-116cm", "shoulder": "48-49cm"},
            },
            "womens_tops": {
                "XS": {"bust": "78-82cm", "waist": "60-64cm"},
                "S": {"bust": "82-86cm", "waist": "64-68cm"},
                "M": {"bust": "86-90cm", "waist": "68-72cm"},
                "L": {"bust": "90-94cm", "waist": "72-76cm"},
                "XL": {"bust": "94-99cm", "waist": "76-81cm"},
            },
            "mens_bottoms": {
                "XS": {"waist": "71-74cm", "inseam": "76cm"},
                "S": {"waist": "74-79cm", "inseam": "78cm"},
                "M": {"waist": "79-84cm", "inseam": "80cm"},
                "L": {"waist": "84-89cm", "inseam": "82cm"},
                "XL": {"waist": "89-94cm", "inseam": "84cm"},
            },
            "womens_bottoms": {
                "XS": {"waist": "60-64cm", "hip": "86-90cm", "inseam": "76cm"},
                "S": {"waist": "64-68cm", "hip": "90-94cm", "inseam": "78cm"},
                "M": {"waist": "68-72cm", "hip": "94-98cm", "inseam": "80cm"},
                "L": {"waist": "72-76cm", "hip": "98-102cm", "inseam": "82cm"},
                "XL": {"waist": "76-81cm", "hip": "102-107cm", "inseam": "84cm"},
            },
        }
        return jsonify({"size_charts": size_charts}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/history", methods=["GET"])
def get_size_history():
    """Get user's size estimation history."""
    user = get_session_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    user_id = user.get("user_id")
    if not user_id:
        return jsonify({"error": "Invalid session"}), 401

    from ..database.mongodb import get_size_estimates

    estimates = get_size_estimates(user_id, limit=20)

    return jsonify({"estimates": estimates, "total": len(estimates)}), 200
