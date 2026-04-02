"""
Test Script for MongoDB-Only Backend
Tests all authentication and user features.

Usage:
    python test_mongodb.py
"""

import requests
import json
import sys
import os

BASE_URL = "http://localhost:5000"


def test_health():
    """Test health endpoint."""
    print("\n1. Testing Health Check...")
    try:
        resp = requests.get(f"{BASE_URL}/api/health")
        data = resp.json()
        print(f"   Status: {resp.status_code}")
        print(f"   Database: {data.get('database')}")
        print(f"   MongoDB: {data.get('mongodb')}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def test_register():
    """Test user registration."""
    print("\n2. Testing User Registration...")

    test_user = {
        "username": f"testuser_{os.urandom(4).hex()}",
        "email": f"test_{os.urandom(4).hex()}@example.com",
        "password": "testpass123",
        "full_name": "Test User",
    }

    try:
        resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"},
        )
        data = resp.json()
        print(f"   Status: {resp.status_code}")

        if resp.status_code == 201:
            print(f"   User ID: {data.get('user', {}).get('user_id')}")
            print(f"   Email: {data.get('user', {}).get('email')}")
            return data.get("user"), test_user
        else:
            print(f"   Error: {data.get('error')}")
            return None, None
    except Exception as e:
        print(f"   ERROR: {e}")
        return None, None


def test_login(email, password):
    """Test user login."""
    print("\n3. Testing User Login...")

    try:
        resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
        )
        data = resp.json()
        print(f"   Status: {resp.status_code}")

        if resp.status_code == 200:
            print(f"   Login successful!")
            return data.get("user")
        else:
            print(f"   Error: {data.get('error')}")
            return None
    except Exception as e:
        print(f"   ERROR: {e}")
        return None


def test_get_profile():
    """Test get profile."""
    print("\n4. Testing Get Profile...")

    session = requests.Session()

    resp = session.get(f"{BASE_URL}/api/health")

    try:
        resp = session.get(f"{BASE_URL}/api/auth/user")
        data = resp.json()
        print(f"   Status: {resp.status_code}")

        if resp.status_code == 200:
            print(f"   User: {data.get('user', {}).get('email')}")
            return True
        else:
            print(f"   Not authenticated (expected for new session)")
            return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def test_update_profile(user_session):
    """Test profile update."""
    print("\n5. Testing Profile Update...")

    session = requests.Session()
    cookies = session.cookies.get_dict()

    if not user_session:
        print("   Skipped - no user session")
        return False

    try:
        resp = requests.post(
            f"{BASE_URL}/api/profile/",
            json={
                "gender": "male",
                "favorite_color": "#000000",
                "measurements": {"height": "175", "chest": "96", "shoulder": "45"},
                "preferences": {
                    "colors": ["black", "white"],
                    "brands": ["Nike", "Adidas"],
                },
            },
            headers={"Content-Type": "application/json"},
        )
        data = resp.json()
        print(f"   Status: {resp.status_code}")

        if resp.status_code == 200:
            print(f"   Update successful!")
            profile = data.get("profile", {})
            print(f"   Gender: {profile.get('gender')}")
            print(f"   Height: {profile.get('measurements', {}).get('height')}")
            return True
        else:
            print(f"   Error: {data.get('error')}")
            return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def test_wardrobe():
    """Test wardrobe operations."""
    print("\n6. Testing Wardrobe Operations...")

    try:
        resp = requests.get(f"{BASE_URL}/api/wardrobe/")
        print(f"   Get Wardrobe Status: {resp.status_code}")
        return resp.status_code in [200, 401]
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def test_search():
    """Test search operations."""
    print("\n7. Testing Search Operations...")

    try:
        resp = requests.get(f"{BASE_URL}/api/search/categories")
        data = resp.json()
        print(f"   Get Categories Status: {resp.status_code}")
        print(f"   Categories: {len(data.get('categories', []))}")

        resp = requests.get(f"{BASE_URL}/api/search/brands")
        data = resp.json()
        print(f"   Get Brands Status: {resp.status_code}")
        print(f"   Brands: {len(data.get('brands', []))}")

        return True
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def test_size_estimation():
    """Test size estimation."""
    print("\n8. Testing Size Estimation...")

    try:
        resp = requests.get(f"{BASE_URL}/api/size/chart")
        data = resp.json()
        print(f"   Get Size Chart Status: {resp.status_code}")
        print(f"   Has Charts: {'size_charts' in data}")
        return resp.status_code == 200
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def test_duplicate_registration():
    """Test that duplicate registration is rejected."""
    print("\n9. Testing Duplicate Registration Prevention...")

    email = f"duplicate_{os.urandom(4).hex()}@example.com"

    user1 = {
        "username": f"user1_{os.urandom(4).hex()}",
        "email": email,
        "password": "testpass123",
    }

    try:
        resp1 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user1,
            headers={"Content-Type": "application/json"},
        )

        user2 = {
            "username": f"user2_{os.urandom(4).hex()}",
            "email": email,
            "password": "testpass123",
        }

        resp2 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user2,
            headers={"Content-Type": "application/json"},
        )

        print(f"   First Registration: {resp1.status_code}")
        print(f"   Duplicate Registration: {resp2.status_code}")

        if resp2.status_code == 409:
            print("   Duplicate correctly rejected!")
            return True
        else:
            print("   WARNING: Duplicate was not rejected")
            return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False


def main():
    print("=" * 50)
    print("MongoDB Backend Test Suite")
    print("=" * 50)

    results = []

    results.append(("Health Check", test_health()))
    results.append(("Get Profile (anonymous)", test_get_profile()))
    results.append(("Duplicate Prevention", test_duplicate_registration()))

    user, credentials = test_register()
    results.append(("User Registration", user is not None))

    if user and credentials:
        logged_in_user = test_login(credentials["email"], credentials["password"])
        results.append(("User Login", logged_in_user is not None))

        test_update_profile(logged_in_user)
        test_get_profile()

    results.append(("Wardrobe", test_wardrobe()))
    results.append(("Search", test_search()))
    results.append(("Size Estimation", test_size_estimation()))

    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"   {name}: {status}")

    print(f"\nTotal: {passed}/{total} passed")

    if passed == total:
        print("\n All tests passed!")
    else:
        print(f"\n {total - passed} tests failed!")


if __name__ == "__main__":
    main()
