"""
Unified MongoDB Database Module
Complete replacement for SQLite - handles all data storage.
"""

from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError, ConnectionFailure
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import os
import ssl
import certifi
import secrets
import traceback

_client = None
_db = None


def _make_ssl_context():
    """Create SSL context using certifi CA bundle."""
    try:
        import OpenSSL

        print("[MongoDB] PyOpenSSL available - using modern TLS")
    except ImportError:
        print("[MongoDB] PyOpenSSL not available - using stdlib ssl")

    ctx = ssl.create_default_context(cafile=certifi.where())
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    return ctx


def _get_db():
    """Lazy-initialize MongoDB connection."""
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
            _client.admin.command("ping")

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
            _ensure_indexes(_db)
            print(f"[MongoDB] Connected successfully to database: {db_name}")
        except Exception as e:
            _client = None
            _db = None
            print(f"[MongoDB] Connection failed: {e}")
            raise
    return _db


def _ensure_indexes(db):
    """Create indexes for optimal performance."""
    users = db["users"]
    users.create_index("email", unique=True, sparse=True)
    users.create_index("username", unique=True, sparse=True)
    users.create_index("google_id", unique=True, sparse=True)

    db["wardrobe_items"].create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )
    db["search_history"].create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )
    db["recommendations"].create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )
    db["size_estimates"].create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)]
    )
    db["products"].create_index("category")
    db["products"].create_index("brand")
    db["products"].create_index([("name", ASCENDING), ("brand", ASCENDING)])


def reset_connection():
    """Force reset MongoDB connection."""
    global _client, _db
    if _client:
        try:
            _client.close()
        except Exception:
            pass
    _client = None
    _db = None
    print("[MongoDB] Connection reset")


# ============================================================================
# USER OPERATIONS
# ============================================================================


def _serialize_user(user_doc):
    """Convert MongoDB user document to JSON-safe dict."""
    if not user_doc:
        return None

    serialized = dict(user_doc)

    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])

    for key in ("created_at", "updated_at", "last_login"):
        if key in serialized and serialized[key]:
            if isinstance(serialized[key], datetime):
                serialized[key] = serialized[key].isoformat()

    return serialized


def _build_user_doc(
    username,
    email,
    password_hash,
    name=None,
    auth_type="manual",
    google_id=None,
    profile_pic=None,
):
    """Build a new user document."""
    return {
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "name": name or username,
        "auth_type": auth_type,
        "google_id": google_id,
        "profile_pic": profile_pic or "",
        "gender": "",
        "favorite_color": "",
        "body_measurements": {
            "height": "",
            "chest": "",
            "shoulder": "",
            "wrist": "",
            "waist": "",
            "hips": "",
            "weight": "",
        },
        "calculated_size": "",
        "preferences": {
            "colors": [],
            "brands": [],
            "fit": "",
            "style_preference": "Casual Elegance",
            "budget_range": "$$",
        },
        "wardrobe": [],
        "recommendations": [],
        "size_estimates": [],
        "search_history": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc),
    }


def create_user(
    username,
    email,
    password,
    name=None,
    auth_type="manual",
    google_id=None,
    profile_pic=None,
):
    """
    Create a new user with email/password or Google auth.
    Returns: (user_dict, error_message)
    """
    db = _get_db()
    users = db["users"]

    existing_email = users.find_one({"email": email})
    if existing_email:
        return None, "Email is already registered"

    existing_username = users.find_one({"username": username})
    if existing_username:
        return None, "Username is already taken"

    existing_google = users.find_one({"google_id": google_id}) if google_id else None
    if existing_google:
        return None, "This Google account is already registered"

    password_hash = generate_password_hash(password) if password else None
    doc = _build_user_doc(
        username, email, password_hash, name, auth_type, google_id, profile_pic
    )

    try:
        result = users.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _serialize_user(doc), None
    except DuplicateKeyError:
        return None, "User already exists"
    except Exception as e:
        print(f"[MongoDB] Create user error: {e}")
        return None, str(e)


def find_user_by_email(email):
    """Find user by email - works for both manual and Google users."""
    db = _get_db()
    user = db["users"].find_one({"email": email})
    return _serialize_user(user) if user else None


def find_user_by_username(username):
    """Find user by username."""
    db = _get_db()
    user = db["users"].find_one({"username": username})
    return _serialize_user(user) if user else None


def find_user_by_google_id(google_id):
    """Find user by Google ID."""
    db = _get_db()
    user = db["users"].find_one({"google_id": google_id})
    return _serialize_user(user) if user else None


def verify_user_password(email, password):
    """Verify password for manual user. Returns user dict if valid, None otherwise."""
    user = find_user_by_email(email)
    if not user:
        return None

    if user.get("auth_type") != "manual":
        return None

    if not user.get("password_hash"):
        return None

    if check_password_hash(user["password_hash"], password):
        return user
    return None


def update_user(user_id, update_data):
    """
    Update user fields. Supports partial updates.
    update_data can include: name, profile_pic, gender, favorite_color,
    body_measurements, preferences, calculated_size
    """
    db = _get_db()
    users = db["users"]

    set_fields = {}

    if "name" in update_data:
        set_fields["name"] = update_data["name"]
    if "profile_pic" in update_data:
        set_fields["profile_pic"] = update_data["profile_pic"]
    if "gender" in update_data:
        set_fields["gender"] = update_data["gender"]
    if "favorite_color" in update_data:
        set_fields["favorite_color"] = update_data["favorite_color"]
    if "calculated_size" in update_data:
        set_fields["calculated_size"] = update_data["calculated_size"]

    if "body_measurements" in update_data:
        for key, value in update_data["body_measurements"].items():
            set_fields[f"body_measurements.{key}"] = value

    if "preferences" in update_data:
        for key, value in update_data["preferences"].items():
            set_fields[f"preferences.{key}"] = value

    if not set_fields:
        return find_user_by_object_id(user_id)

    set_fields["updated_at"] = datetime.now(timezone.utc)

    try:
        result = users.update_one({"_id": ObjectId(user_id)}, {"$set": set_fields})
        if result.matched_count > 0:
            return find_user_by_object_id(user_id)
        return None
    except Exception as e:
        print(f"[MongoDB] Update user error: {e}")
        return None


def update_user_last_login(user_id):
    """Update last login timestamp."""
    db = _get_db()
    db["users"].update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"last_login": datetime.now(timezone.utc)}}
    )


def find_user_by_object_id(user_id):
    """Find user by MongoDB ObjectId."""
    db = _get_db()
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        return _serialize_user(user) if user else None
    except Exception:
        return None


def link_google_account(user_id, google_id, profile_pic=None):
    """Link Google account to existing manual user."""
    db = _get_db()
    users = db["users"]

    existing_google = users.find_one({"google_id": google_id})
    if existing_google:
        return None, "This Google account is already linked"

    set_fields = {
        "google_id": google_id,
        "auth_type": "google",
        "updated_at": datetime.now(timezone.utc),
    }

    if profile_pic:
        set_fields["profile_pic"] = profile_pic

    result = users.update_one({"_id": ObjectId(user_id)}, {"$set": set_fields})

    if result.matched_count > 0:
        return find_user_by_object_id(user_id), None
    return None, "User not found"


# ============================================================================
# WARDROBE OPERATIONS
# ============================================================================


def get_wardrobe_items(user_id):
    """Get all wardrobe items for a user, sorted by creation date."""
    db = _get_db()
    items = list(
        db["wardrobe_items"]
        .find({"user_id": str(user_id)})
        .sort("created_at", DESCENDING)
    )

    for item in items:
        item["_id"] = str(item["_id"])
        if "created_at" in item and isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()

    return items


def add_wardrobe_item(user_id, image_url, category="uncategorized"):
    """Add item to user's wardrobe."""
    db = _get_db()
    doc = {
        "user_id": str(user_id),
        "image_url": image_url,
        "category": category,
        "created_at": datetime.now(timezone.utc),
    }
    result = db["wardrobe_items"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


def delete_wardrobe_item(user_id, item_id):
    """Delete wardrobe item."""
    db = _get_db()
    result = db["wardrobe_items"].delete_one(
        {"_id": ObjectId(item_id), "user_id": str(user_id)}
    )
    return result.deleted_count > 0


# ============================================================================
# SEARCH HISTORY OPERATIONS
# ============================================================================


def add_search_history(user_id, search_type, search_query, results_count=0):
    """Add search to user's history."""
    db = _get_db()
    doc = {
        "user_id": str(user_id),
        "search_type": search_type,
        "search_query": search_query,
        "results_count": results_count,
        "created_at": datetime.now(timezone.utc),
    }
    result = db["search_history"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


def get_search_history(user_id, limit=50):
    """Get user's recent search history."""
    db = _get_db()
    items = list(
        db["search_history"]
        .find({"user_id": str(user_id)})
        .sort("created_at", DESCENDING)
        .limit(limit)
    )

    for item in items:
        item["_id"] = str(item["_id"])
        if "created_at" in item and isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()

    return items


# ============================================================================
# SIZE ESTIMATION OPERATIONS
# ============================================================================


def save_size_estimate(
    user_id, measurements, recommended_size, confidence=0.0, body_type=None
):
    """Save size estimation result for user."""
    db = _get_db()
    doc = {
        "user_id": str(user_id),
        "measurements": measurements,
        "recommended_size": recommended_size,
        "confidence": confidence,
        "body_type": body_type or "",
        "created_at": datetime.now(timezone.utc),
    }
    result = db["size_estimates"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["created_at"] = doc["created_at"].isoformat()

    if user_id:
        update_user(
            user_id,
            {"body_measurements": measurements, "calculated_size": recommended_size},
        )

    return doc


def get_size_estimates(user_id, limit=10):
    """Get user's recent size estimates."""
    db = _get_db()
    items = list(
        db["size_estimates"]
        .find({"user_id": str(user_id)})
        .sort("created_at", DESCENDING)
        .limit(limit)
    )

    for item in items:
        item["_id"] = str(item["_id"])
        if "created_at" in item and isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()

    return items


def get_latest_size_estimate(user_id):
    """Get user's most recent size estimate."""
    estimates = get_size_estimates(user_id, limit=1)
    return estimates[0] if estimates else None


# ============================================================================
# RECOMMENDATIONS OPERATIONS
# ============================================================================


def save_recommendation(user_id, product_id, product_data, score, reason=None):
    """Save a recommendation for user."""
    db = _get_db()
    doc = {
        "user_id": str(user_id),
        "product_id": product_id,
        "product_data": product_data,
        "score": score,
        "reason": reason or "",
        "viewed": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = db["recommendations"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


def get_recommendations(user_id, limit=20, unseen_only=False):
    """Get recommendations for user."""
    db = _get_db()
    query = {"user_id": str(user_id)}
    if unseen_only:
        query["viewed"] = False

    items = list(
        db["recommendations"].find(query).sort("created_at", DESCENDING).limit(limit)
    )

    for item in items:
        item["_id"] = str(item["_id"])
        if "created_at" in item and isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()

    return items


def mark_recommendation_viewed(user_id, recommendation_id):
    """Mark recommendation as viewed."""
    db = _get_db()
    result = db["recommendations"].update_one(
        {"_id": ObjectId(recommendation_id), "user_id": str(user_id)},
        {"$set": {"viewed": True}},
    )
    return result.modified_count > 0


# ============================================================================
# PRODUCT OPERATIONS (for search)
# ============================================================================


def get_products(filters=None, limit=100):
    """Get products with optional filters."""
    db = _get_db()
    query = {}

    if filters:
        if filters.get("category"):
            query["category"] = filters["category"]
        if filters.get("brand"):
            query["brand"] = filters["brand"]
        if filters.get("min_price"):
            query.setdefault("price", {})["$gte"] = filters["min_price"]
        if filters.get("max_price"):
            query.setdefault("price", {})["$lte"] = filters["max_price"]
        if filters.get("search_term"):
            query["$or"] = [
                {"name": {"$regex": filters["search_term"], "$options": "i"}},
                {"description": {"$regex": filters["search_term"], "$options": "i"}},
                {"brand": {"$regex": filters["search_term"], "$options": "i"}},
            ]

    products = list(db["products"].find(query).limit(limit))

    for product in products:
        product["_id"] = str(product["_id"])
        if "created_at" in product and isinstance(product["created_at"], datetime):
            product["created_at"] = product["created_at"].isoformat()

    return products


def get_product_by_id(product_id):
    """Get single product by ID."""
    db = _get_db()
    try:
        product = db["products"].find_one({"_id": ObjectId(product_id)})
        if product:
            product["_id"] = str(product["_id"])
        return product
    except Exception:
        return None


def get_unique_categories():
    """Get all unique product categories."""
    db = _get_db()
    categories = db["products"].distinct("category")
    return categories


def get_unique_brands():
    """Get all unique product brands."""
    db = _get_db()
    brands = db["products"].distinct("brand")
    return brands


def seed_products(products_data):
    """Seed products collection with initial data."""
    db = _get_db()
    existing = db["products"].count_documents({})
    if existing > 0:
        print(f"[MongoDB] Products already seeded ({existing} items)")
        return

    for product in products_data:
        product["created_at"] = datetime.now(timezone.utc)

    db["products"].insert_many(products_data)
    print(f"[MongoDB] Seeded {len(products_data)} products")


# ============================================================================
# UTILITY
# ============================================================================


def get_all_users():
    """Get all users (for debugging/migration)."""
    db = _get_db()
    users = list(db["users"].find())
    return [_serialize_user(u) for u in users]


def count_collection(collection_name):
    """Count documents in a collection."""
    db = _get_db()
    return db[collection_name].count_documents({})
