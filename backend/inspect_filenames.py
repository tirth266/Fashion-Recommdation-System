import pickle
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
filenames_path = os.path.join(base_dir, "models", "filenames.pkl")

try:
    print(f"Loading {filenames_path}...")
    with open(filenames_path, "rb") as f:
        filenames = pickle.load(f)
    
    print(f"Total filenames: {len(filenames)}")
    print("First 5 filenames:")
    for i, name in enumerate(filenames[:5]):
        print(f"{i}: {name}")
        
except Exception as e:
    print(f"Error: {e}")
