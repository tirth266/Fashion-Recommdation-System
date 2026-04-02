"""
MongoDB Database Helper
Provides direct PyMongo access to the 'users' collection.
Uses google_id as the document _id to prevent duplicates.
"""

from datetime import datetime, timezone
from pymongo import MongoClient
from pymongo.errors import (
    DuplicateKeyError,
    ConnectionFailure,
    ServerSelectionTimeoutError,
)
import os
import ssl
import certifi
import traceback

# ── Module-level connection (lazy-initialized) ──────────────────────
_client = None
_db = None


def _make_ssl_context():
    """Create an SSL context using certifi CA bundle.
    Works around old OpenSSL versions bundled with Python 3.10."""
    try:
        import OpenSSL  # noqa: F401 — check pyopenssl is available

        # PyOpenSSL is installed: pymongo will use it automatically
        # when tls=True and we pass tlsCAFile
        print("[MongoDB] PyOpenSSL available — using modern TLS")
    except ImportError:
        print("[MongoDB] PyOpenSSL not available — using stdlib ssl")

    ctx = ssl.create_default_context(cafile=certifi.where())
    # Be lenient on TLS version — try TLS 1.2+
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    return ctx


def _get_db():
    """Lazy-initialize the MongoDB connection. Resets on failure."""
    global _client, _db
    if _db is None:
        uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/fashiondb")
        print(f"[MongoDB] Connecting to: {uri[:40]}...")
        try:
            _client = MongoClient(
                uri,
                serverSelectionTimeoutMS=10000,
                tlsCAFile=certifi.where(),
                tls=True,
                tlsAllowInvalidCertificates=False,
                connectTimeoutMS=10000,
                socketTimeoutMS=20000,
                retryWrites=True,
                retryReads=True,
            )

            # Force a connection test
            _client.admin.command("ping")

            # Extract DB name from URI
            db_name = "fashiondb"
            if "//" in uri:
                after_host = uri.split("//")[-1]
                if "/" in after_host:
                    parts = after_host.split("/")
                    if len(parts) > 1:
                        raw = parts[-1].split("?")[0]
                        if raw:
                            db_name = raw

            _db = _client[db_name]
            print(f"[MongoDB] ✅ Connected successfully to database: {db_name}")
        except Exception as e:
            # Reset so next request tries again
            _client = None
            _db = None
            print(f"[MongoDB] Connection failed: {e}")
            raise
    return _db


def reset_connection():
    """Force reset the MongoDB connection (e.g., after SSL errors)."""
    global _client, _db
    if _client:
        try:
            _client.close()
        except Exception:
            pass
    _client = None
    _db = None
    print("[MongoDB] Connection reset")


def get_users_collection():
    """Returns the 'users' MongoDB collection."""
    try:
        return _get_db()["users"]
    except Exception:
        # Reset and let the caller handle the error
        reset_connection()
        raise


# ── User Schema Template ────────────────────────────────────────────


def _build_user_doc(google_id, name, email, profile_pic):
    """
    Builds a new user document matching the required schema.
    Uses google_id as the _id field to guarantee uniqueness.
    """
    return {
        "_id": google_id,  # google_id IS the primary key
        "name": name or "",
        "email": email or "",
        "profile_pic": profile_pic or "",
        "body_measurements": {"height": "", "chest": "", "shoulder": "", "wrist": ""},
        "preferences": {"colors": [], "brands": [], "fit": ""},
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }


# ── CRUD Operations ─────────────────────────────────────────────────


def find_or_create_user(google_id, name, email, profile_pic):
    """
    On login:
      IF user exists  → return existing user document
      ELSE            → create new user in MongoDB and return it

    Returns: (user_dict, is_new_user)
    Raises on connection failure so caller can handle gracefully.
    """
    users = get_users_collection()

    # Try to find existing user by google_id (_id)
    existing = users.find_one({"_id": google_id})

    if existing:
        # Update last login timestamp
        users.update_one(
            {"_id": google_id}, {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        existing["last_login"] = datetime.now(timezone.utc)
        return existing, False

    # Also check by email (user might have registered with email first, then Google)
    existing_by_email = users.find_one({"email": email})
    if existing_by_email:
        # Update the existing doc to link google_id
        users.update_one(
            {"_id": existing_by_email["_id"]},
            {
                "$set": {
                    "last_login": datetime.now(timezone.utc),
                    "name": name or existing_by_email.get("name", ""),
                    "profile_pic": profile_pic
                    or existing_by_email.get("profile_pic", ""),
                }
            },
        )
        existing_by_email["last_login"] = datetime.now(timezone.utc)
        return existing_by_email, False

    # Create new user
    doc = _build_user_doc(google_id, name, email, profile_pic)

    try:
        users.insert_one(doc)
        print(f"[MongoDB] New user created: {email}")
        return doc, True
    except DuplicateKeyError:
        # Race condition: another request created the user already
        return users.find_one({"_id": google_id}), False


def get_user_by_google_id(google_id):
    """Fetch user by google_id (the _id field)."""
    users = get_users_collection()
    user = users.find_one({"_id": google_id})
    if user:
        # Convert datetime objects to ISO strings for JSON serialization
        return _serialize_user(user)
    return None


def update_user_profile(google_id, update_data):
    """
    Safe partial update — only updates provided fields.
    Supports body_measurements and preferences updates.

    Args:
        google_id: The user's google_id (_id)
        update_data: dict with optional keys:
            - body_measurements: {height, chest, shoulder, wrist}
            - preferences: {colors, brands, fit}
            - name: str

    Returns: (updated_user_dict, success_bool)
    """
    users = get_users_collection()
    set_fields = {}

    # Build $set payload — only include provided fields
    if "body_measurements" in update_data:
        measurements = update_data["body_measurements"]
        for key in ("height", "chest", "shoulder", "wrist"):
            if key in measurements:
                set_fields[f"body_measurements.{key}"] = measurements[key]

    if "preferences" in update_data:
        prefs = update_data["preferences"]
        if "colors" in prefs:
            set_fields["preferences.colors"] = prefs["colors"]
        if "brands" in prefs:
            set_fields["preferences.brands"] = prefs["brands"]
        if "fit" in prefs:
            set_fields["preferences.fit"] = prefs["fit"]

    if "name" in update_data:
        set_fields["name"] = update_data["name"]

    if "profile_pic" in update_data:
        set_fields["profile_pic"] = update_data["profile_pic"]

    if not set_fields:
        # Nothing to update
        user = users.find_one({"_id": google_id})
        return _serialize_user(user) if user else None, False

    # Always update the timestamp
    set_fields["updated_at"] = datetime.now(timezone.utc)

    result = users.update_one({"_id": google_id}, {"$set": set_fields})

    if result.matched_count == 0:
        return None, False

    updated_user = users.find_one({"_id": google_id})
    return _serialize_user(updated_user), True


# ── Serialization ───────────────────────────────────────────────────


def _serialize_user(user_doc):
    """Convert a MongoDB user document to a JSON-safe dict."""
    if not user_doc:
        return None

    serialized = dict(user_doc)

    # Convert _id (google_id) back to a string field
    serialized["google_id"] = str(serialized.pop("_id", ""))

    # Convert datetime objects to ISO strings
    for key in ("created_at", "updated_at", "last_login"):
        if key in serialized and serialized[key]:
            serialized[key] = serialized[key].isoformat()

    return serialized
