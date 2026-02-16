import sys
import os

# Add backend to path so we can import app modules
# Script location: backend/app/test_service.py
# Backend root: backend/
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
sys.path.append(backend_root)

print(f"Added to path: {backend_root}")

from app.services.image_recommender_service import recommend_image

# logical path to a test image
# Assuming project structure: backend/app/test_service.py -> ../../data/datasets/images
project_root = os.path.dirname(backend_root)
images_dir = os.path.join(project_root, 'data', 'datasets', 'images')

# Find first jpg image
test_image_path = None
if os.path.exists(images_dir):
    for f in os.listdir(images_dir):
        if f.lower().endswith('.jpg'):
            test_image_path = os.path.join(images_dir, f)
            break

if test_image_path:
    print(f"Testing recommendation with: {test_image_path}")
    try:
        result = recommend_image(test_image_path)
        print("\n--- Recommendation Result ---")
        # print only keys to keep output clean, or full json if small
        import json
        print(json.dumps(result, indent=2))
        
        if result.get('recommended_images'):
            print(f"\nSuccess! Found {len(result['recommended_images'])} recommendations.")
        else:
            print("\nWarning: No recommendations found or error occurred.")
            
    except Exception as e:
        print(f"\nError during recommendation: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"No test image found in {images_dir}")
