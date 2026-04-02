"""
Quick script to check what's stored in MongoDB.
Run: python check_db.py
"""

from dotenv import load_dotenv

load_dotenv()

import os
from pymongo import MongoClient

uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/fashiondb")
print(f"Connecting to: {uri[:40]}...")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("[OK] Connected successfully!\n")

    db_name = "fashion_ai"
    if "/" in uri.split("//")[-1]:
        parts = uri.split("//")[-1].split("/")
        if len(parts) > 1:
            raw = parts[-1].split("?")[0]
            if raw:
                db_name = raw

    db = client[db_name]

    collections = db.list_collection_names()
    print(f"Database: {db_name}")
    print(f"Collections: {collections}\n")

    print("=" * 60)
    print("USERS")
    print("=" * 60)
    users = list(db.users.find())
    print(f"Total users: {len(users)}\n")

    for i, user in enumerate(users, 1):
        print(f"User #{i}")
        print(f"  _id:         {user.get('_id')}")
        print(f"  email:       {user.get('email')}")
        print(f"  username:    {user.get('username')}")
        print(f"  name:        {user.get('name')}")
        print(f"  auth_type:   {user.get('auth_type', 'N/A')}")
        print(f"  google_id:   {user.get('google_id', 'N/A')}")
        print(f"  profile_pic: {str(user.get('profile_pic', ''))[:50]}...")
        print(f"  gender:      {user.get('gender', '')}")
        print(f"  fav_color:   {user.get('favorite_color', '')}")
        print(f"  calc_size:   {user.get('calculated_size', '')}")
        print(f"  body_meas:   {user.get('body_measurements', {})}")
        print(f"  preferences: {user.get('preferences', {})}")
        print(f"  created:     {user.get('created_at')}")
        print()

    print("=" * 60)
    print("SIZE ESTIMATES")
    print("=" * 60)
    estimates = list(db.size_estimates.find())
    print(f"Total: {len(estimates)}\n")
    for e in estimates:
        print(
            f"  {e.get('user_id')}: {e.get('recommended_size')} ({e.get('body_type')})"
        )
    print()

    print("=" * 60)
    print("WARDROBE ITEMS")
    print("=" * 60)
    items = list(db.wardrobe_items.find())
    print(f"Total: {len(items)}\n")
    for item in items:
        print(
            f"  {item.get('user_id')}: {item.get('category')} - {item.get('image_url')}"
        )
    print()

    print("=" * 60)
    print("SEARCH HISTORY")
    print("=" * 60)
    history = list(db.search_history.find())
    print(f"Total: {len(history)}\n")
    for h in history:
        print(f"  {h.get('user_id')}: {h.get('search_type')} - {h.get('search_query')}")
    print()

    print("=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    recs = list(db.recommendations.find())
    print(f"Total: {len(recs)}\n")
    for r in recs:
        print(f"  {r.get('user_id')}: score={r.get('score')}")
    print()

except Exception as e:
    print(f"[ERROR] {e}")
