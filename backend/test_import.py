
import os
import sys

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from models.recommender_model import recommend
    print("Imported recommend successfully")
except Exception as e:
    print(f"Failed to import recommend: {e}")
