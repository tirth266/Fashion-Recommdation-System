from flask import Blueprint, request, jsonify, session
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime, timezone
import os
import secrets

from ..database.mongodb import (
    create_user,
    find_user_by_email,
    find_user_by_username,
    find_user_by_google_id,
    verify_user_password,
    update_user,
    update_user_last_login,
    link_google_account,
)

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

GOOGLE_CLIENT_ID = os.environ.get(
    "GOOGLE_CLIENT_ID",
    "745025914415-o7l3snr79321qpqvoh1uqa5u4fks068o.apps.googleusercontent.com",
)


def _build_session_user(mongo_user):
    """Build session user object from MongoDB user document."""
    return {
        "user_id": str(mongo_user["_id"]),
        "google_id": mongo_user.get("google_id", ""),
        "email": mongo_user.get("email", ""),
        "name": mongo_user.get("name", ""),
        "username": mongo_user.get("username", ""),
        "picture": mongo_user.get("profile_pic", ""),
        "auth_type": mongo_user.get("auth_type", "manual"),
        "profile": mongo_user,
    }


def _update_session(user_id):
    """Update last login and refresh session."""
    update_user_last_login(user_id)
    user = find_user_by_google_id(user_id) or find_user_by_email(user_id)
    if not user:
        user = find_user_by_google_id(user_id)
    if user:
        session["user"] = _build_session_user(user)
        session.modified = True


# ═══════════════════════════════════════════════════════════════════
# POST /api/auth/google  — Google OAuth Login/Register
# ═══════════════════════════════════════════════════════════════════
@bp.route("/google", methods=["POST"])
def google_auth():
    print("Received /api/auth/google request")
    try:
        data = request.get_json()
        print(f"Payload keys: {data.keys() if data else 'None'}")
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        return jsonify({"error": "Invalid JSON"}), 400

    token = data.get("token")

    if not token:
        print("Error: Missing token")
        return jsonify({"error": "Missing token"}), 400

    try:
        print(f"Verifying token with Client ID: {GOOGLE_CLIENT_ID[:10]}...")
        id_info = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds=10
        )

        user_google_id = id_info["sub"]
        email = id_info["email"]
        name = id_info.get("name")
        picture = id_info.get("picture")

        print(f"Token verified! User: {email}, Google ID: {user_google_id}")

        if not email:
            raise ValueError("Email not found in Google token")

        existing_user = find_user_by_google_id(user_google_id)

        if existing_user:
            update_user_last_login(str(existing_user["_id"]))
            session["user"] = _build_session_user(existing_user)
            print(f"Session created for existing user ID: {existing_user['_id']}")
            return jsonify(
                {"message": "Login successful", "user": session["user"]}
            ), 200

        existing_by_email = find_user_by_email(email)
        if existing_by_email:
            updated_user, error = link_google_account(
                str(existing_by_email["_id"]), user_google_id, picture
            )
            if updated_user:
                session["user"] = _build_session_user(updated_user)
                return jsonify(
                    {"message": "Google account linked", "user": session["user"]}
                ), 200
            return jsonify({"error": error or "Failed to link Google account"}), 409

        username = email.split("@")[0]
        counter = 1
        while find_user_by_username(username):
            username = f"{email.split('@')[0]}_{counter}"
            counter += 1

        new_user, error = create_user(
            username=username,
            email=email,
            password=None,
            name=name,
            auth_type="google",
            google_id=user_google_id,
            profile_pic=picture,
        )

        if not new_user:
            print(f"Failed to create user: {error}")
            return jsonify({"error": error or "Failed to create user"}), 409

        session["user"] = _build_session_user(new_user)
        print(f"Session created for new user ID: {new_user['_id']}")
        return jsonify({"message": "Login successful", "user": session["user"]}), 200

    except ValueError as e:
        print(f"Token verification failed: {e}")
        return jsonify({"error": "Invalid token", "details": str(e)}), 401
    except Exception as e:
        import sys, traceback

        print(f"Unexpected error in /google: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# POST /api/auth/register  — Email/Password Registration
# ═══════════════════════════════════════════════════════════════════
@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")

    if not email or not password or not username:
        return jsonify({"error": "Missing required fields"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing_email = find_user_by_email(email)
    if existing_email:
        return jsonify({"error": "Email is already registered"}), 409

    existing_username = find_user_by_username(username)
    if existing_username:
        return jsonify(
            {"error": "Username is already taken, please choose another"}
        ), 409

    full_name = data.get("full_name")
    gender = data.get("gender")
    favorite_color = data.get("favorite_color")
    profile_data = data.get("profile_data", {})

    new_user, error = create_user(
        username=username,
        email=email,
        password=password,
        name=full_name or username,
        auth_type="manual",
    )

    if not new_user:
        return jsonify({"error": error or "Registration failed"}), 500

    if profile_data:
        update_data = {
            "gender": gender or profile_data.get("gender", ""),
            "favorite_color": favorite_color or profile_data.get("favoriteColor", ""),
            "body_measurements": profile_data.get("measurements", {}),
            "preferences": {
                "colors": profile_data.get("favoriteColor", "").split(",")
                if profile_data.get("favoriteColor")
                else [],
                "brands": profile_data.get("brands", []),
                "fit": "",
            },
        }
        update_user(str(new_user["_id"]), update_data)
        new_user = find_user_by_email(email)

    session["user"] = _build_session_user(new_user)
    return jsonify({"message": "Registration successful", "user": session["user"]}), 201


# ═══════════════════════════════════════════════════════════════════
# POST /api/auth/login  — Email/Password Login
# ═══════════════════════════════════════════════════════════════════
@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = verify_user_password(email, password)

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    update_user_last_login(str(user["_id"]))
    session["user"] = _build_session_user(user)
    return jsonify({"message": "Login successful", "user": session["user"]}), 200


# ═══════════════════════════════════════════════════════════════════
# GET /api/auth/user  — Get Current Session User
# ═══════════════════════════════════════════════════════════════════
@bp.route("/user", methods=["GET"])
def get_current_user():
    try:
        user = session.get("user")
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        return jsonify({"user": user}), 200
    except Exception as e:
        print(f"Error in /user: {e}")
        return jsonify({"error": "Not authenticated"}), 401


# ═══════════════════════════════════════════════════════════════════
# POST /api/auth/logout
# ═══════════════════════════════════════════════════════════════════
@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200
