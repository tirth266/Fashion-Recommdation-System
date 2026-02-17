
import pickle
import os
import sys

# Define base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
embeddings_path = os.path.join(BASE_DIR, 'models', 'embeddings.pkl')
filenames_path = os.path.join(BASE_DIR, 'models', 'filenames.pkl')

print(f"Checking {embeddings_path}")
print(f"Checking {filenames_path}")

if os.path.exists(embeddings_path):
    try:
        embeddings = pickle.load(open(embeddings_path, "rb"))
        print(f"Embeddings length: {len(embeddings)}")
    except Exception as e:
        print(f"Error loading embeddings: {e}")
else:
    print("Embeddings file missing")

if os.path.exists(filenames_path):
    try:
        filenames = pickle.load(open(filenames_path, "rb"))
        print(f"Filenames length: {len(filenames)}")
    except Exception as e:
        print(f"Error loading filenames: {e}")
else:
    print("Filenames file missing")
