"""
Migration Script: SQLite to MongoDB
Migrates existing users from SQLite database to MongoDB.

Usage:
    python migrate_sqlite_to_mongodb.py

This script will:
1. Read all users from SQLite fashion.db
2. Migrate them to MongoDB
3. Preserve passwords (hashed) for manual users
4. Migrate user preferences and measurements
5. Report success/failure for each user
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "fashion.db")

MIGRATED_FILE = os.path.join(os.path.dirname(__file__), "migrated_users.txt")
FAILED_FILE = os.path.join(os.path.dirname(__file__), "failed_migrations.txt")


def migrate_users():
    """Migrate all users from SQLite to MongoDB."""

    if not os.path.exists(SQLITE_DB_PATH):
        print(f"SQLite database not found at {SQLITE_DB_PATH}")
        print("No migration needed - starting fresh with MongoDB")
        return

    try:
        import sqlite3
    except ImportError:
        print("sqlite3 module not available")
        return

    from app.database.mongodb import (
        create_user,
        find_user_by_email,
        find_user_by_username,
        get_users_collection,
    )

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")
    sqlite_users = cursor.fetchall()

    if not sqlite_users:
        print("No users found in SQLite database")
        conn.close()
        return

    print(f"Found {len(sqlite_users)} users in SQLite database")
    print("Starting migration...\n")

    migrated = 0
    failed = 0
    skipped = 0

    migrated_list = []
    failed_list = []

    for sqlite_user in sqlite_users:
        user_data = dict(sqlite_user)
        email = user_data.get("email")
        username = user_data.get("username")

        if not email:
            print(f"  [SKIP] User without email: {user_data.get('id')}")
            skipped += 1
            continue

        existing_mongo = find_user_by_email(email)
        if existing_mongo:
            print(f"  [SKIP] User already exists in MongoDB: {email}")
            skipped += 1
            continue

        auth_type = "google" if user_data.get("google_id") else "manual"

        password = None
        if auth_type == "manual":
            password = user_data.get("password_hash", "")
            if password:
                pass

        profile_data = {
            "gender": user_data.get("gender", ""),
            "favorite_color": user_data.get("favorite_color", ""),
            "measurements": {
                "height": str(user_data.get("height_inches") or "")
                if user_data.get("height_inches")
                else "",
                "chest": str(user_data.get("chest_inches") or "")
                if user_data.get("chest_inches")
                else "",
                "waist": str(user_data.get("waist_inches") or "")
                if user_data.get("waist_inches")
                else "",
                "hips": str(user_data.get("hips_inches") or "")
                if user_data.get("hips_inches")
                else "",
            },
            "preferences": {
                "colors": [],
                "brands": [],
                "fit": "",
                "style_preference": user_data.get(
                    "style_preference", "Casual Elegance"
                ),
                "budget_range": user_data.get("budget_range", "$$"),
            },
        }

        mongo_user, error = create_user(
            username=username,
            email=email,
            password=password if auth_type == "manual" else None,
            name=user_data.get("full_name") or username,
            auth_type=auth_type,
            google_id=user_data.get("google_id"),
            profile_pic=user_data.get("profile_image"),
        )

        if mongo_user:
            from app.database.mongodb import update_user

            update_user(
                str(mongo_user["_id"]),
                {
                    "gender": profile_data["gender"],
                    "favorite_color": profile_data["favorite_color"],
                    "body_measurements": profile_data["measurements"],
                    "preferences": profile_data["preferences"],
                },
            )

            migrated += 1
            migrated_list.append(email)
            print(f"  [MIGRATED] {email} ({auth_type})")
        else:
            failed += 1
            failed_list.append((email, error))
            print(f"  [FAILED] {email}: {error}")

    conn.close()

    print(f"\n{'=' * 50}")
    print(f"Migration Complete!")
    print(f"  Migrated: {migrated}")
    print(f"  Failed: {failed}")
    print(f"  Skipped: {skipped}")
    print(f"{'=' * 50}")

    with open(MIGRATED_FILE, "w") as f:
        f.write(f"Migrated users ({datetime.now().isoformat()}):\n")
        for email in migrated_list:
            f.write(f"  - {email}\n")

    with open(FAILED_FILE, "w") as f:
        f.write(f"Failed migrations ({datetime.now().isoformat()}):\n")
        for email, error in failed_list:
            f.write(f"  - {email}: {error}\n")

    print(f"\nMigrated users saved to: {MIGRATED_FILE}")
    print(f"Failed migrations saved to: {FAILED_FILE}")


def migrate_search_history():
    """Migrate search history from SQLite to MongoDB."""

    if not os.path.exists(SQLITE_DB_PATH):
        return

    try:
        import sqlite3
    except ImportError:
        return

    from app.database.mongodb import add_search_history, find_user_by_email

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sh.*, u.email 
        FROM search_history sh 
        JOIN users u ON sh.user_id = u.id
    """)
    history_records = cursor.fetchall()

    if not history_records:
        print("No search history to migrate")
        conn.close()
        return

    print(f"\nMigrating {len(history_records)} search history records...")
    migrated = 0

    for record in history_records:
        data = dict(record)
        email = data.get("email")
        user = find_user_by_email(email)

        if user:
            add_search_history(
                user_id=str(user["_id"]),
                search_type=data.get("search_type", "unknown"),
                search_query=data.get("search_query", ""),
                results_count=data.get("results_count", 0),
            )
            migrated += 1

    conn.close()
    print(f"Migrated {migrated} search history records")


def migrate_wardrobe():
    """Migrate wardrobe items from SQLite to MongoDB."""

    if not os.path.exists(SQLITE_DB_PATH):
        return

    try:
        import sqlite3
    except ImportError:
        return

    from app.database.mongodb import add_wardrobe_item, find_user_by_email

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT wi.*, u.email 
        FROM wardrobe_items wi 
        JOIN users u ON wi.user_id = u.id
    """)
    wardrobe_items = cursor.fetchall()

    if not wardrobe_items:
        print("No wardrobe items to migrate")
        conn.close()
        return

    print(f"\nMigrating {len(wardrobe_items)} wardrobe items...")
    migrated = 0

    for item in wardrobe_items:
        data = dict(item)
        email = data.get("email")
        user = find_user_by_email(email)

        if user:
            add_wardrobe_item(
                user_id=str(user["_id"]),
                image_url=data.get("image_url", ""),
                category=data.get("category", "uncategorized"),
            )
            migrated += 1

    conn.close()
    print(f"Migrated {migrated} wardrobe items")


def migrate_products():
    """Migrate products from SQLite to MongoDB."""

    if not os.path.exists(SQLITE_DB_PATH):
        return

    try:
        import sqlite3
    except ImportError:
        return

    from app.database.mongodb import seed_products, count_collection

    existing = count_collection("products")
    if existing > 0:
        print(f"\nProducts already exist in MongoDB ({existing} items)")
        return

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()

    if not products:
        print("No products to migrate")
        conn.close()
        return

    print(f"\nMigrating {len(products)} products...")
    migrated = 0
    product_list = []

    for product in products:
        data = dict(product)
        product_doc = {
            "name": data.get("name", ""),
            "description": data.get("description", ""),
            "category": data.get("category", ""),
            "brand": data.get("brand", ""),
            "price": data.get("price", 0.0),
            "image_url": data.get("image_url", ""),
            "size_chart": data.get("size_chart"),
            "color_variants": data.get("color_variants"),
        }
        product_list.append(product_doc)
        migrated += 1

    if product_list:
        from app.database.mongodb import _get_db

        db = _get_db()
        db["products"].insert_many(product_list)

    conn.close()
    print(f"Migrated {migrated} products")


def show_stats():
    """Show current database statistics."""
    from app.database.mongodb import count_collection

    print(f"\n{'=' * 50}")
    print("MongoDB Statistics:")
    print(f"  Users: {count_collection('users')}")
    print(f"  Wardrobe Items: {count_collection('wardrobe_items')}")
    print(f"  Search History: {count_collection('search_history')}")
    print(f"  Size Estimates: {count_collection('size_estimates')}")
    print(f"  Recommendations: {count_collection('recommendations')}")
    print(f"  Products: {count_collection('products')}")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    print("=" * 50)
    print("SQLite to MongoDB Migration Script")
    print("=" * 50)

    migrate_users()
    migrate_search_history()
    migrate_wardrobe()
    migrate_products()

    show_stats()

    print("\nMigration complete! You can now safely delete:")
    print("  - backend/fashion.db")
    print("  - backend/app/database/init_db.py")
    print("  - backend/app/extensions.py")
