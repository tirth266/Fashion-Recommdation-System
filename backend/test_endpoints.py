
import requests
import sys

def check_backend():
    base_url = "http://localhost:5000"
    endpoints = [
        "/api/health",
        "/api/auth/user",
        "/api/size/chart",
        "/api/search/categories"
    ]
    
    for ep in endpoints:
        try:
            r = requests.get(base_url + ep)
            print(f"GET {ep}: {r.status_code}")
            if r.status_code == 500:
                print(f"Error at {ep}: {r.text}")
        except Exception as e:
            print(f"Failed to connect to {ep}: {e}")

if __name__ == "__main__":
    check_backend()
