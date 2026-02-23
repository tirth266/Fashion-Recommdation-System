
import os
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
# Try importing from models package (app context) or fallback to local import
try:
    from models.cnn_feature_extractor import extract_features, model
except ImportError:
    try:
        from cnn_feature_extractor import extract_features, model
    except ImportError:
         import sys
         sys.path.append(os.path.dirname(os.path.abspath(__file__)))
         from cnn_feature_extractor import extract_features, model

# Load saved data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EMBEDDINGS_PATH = os.path.join(BASE_DIR, "embeddings.pkl")
FILENAMES_PATH = os.path.join(BASE_DIR, "filenames.pkl")

# Check if files exist
if not os.path.exists(EMBEDDINGS_PATH) or not os.path.exists(FILENAMES_PATH):
    print("❌ Error: Model files not found in models directory")
    embeddings = []
    filenames = []
else:
    try:
        embeddings = pickle.load(open(EMBEDDINGS_PATH, "rb"))
        filenames = pickle.load(open(FILENAMES_PATH, "rb"))
        embeddings = np.array(embeddings)
        print("✅ Recommender Loaded")
        print("Embeddings:", embeddings.shape)
        print("Filenames:", len(filenames))
    except Exception as e:
        print(f"❌ Error loading pickle files: {e}")
        embeddings = []
        filenames = []


def recommend(image_path, top_k=5):
    """
    Generate recommendations for a given image path.
    Returns a list of image filenames (absolute paths).
    """
    if len(embeddings) == 0:
        print("❌ Embeddings not loaded, cannot recommend.")
        return []

    try:
        # Extract query features
        # Note: extract_features in cnn_feature_extractor takes (img_path, model)
        query_embedding = extract_features(image_path, model)

        # Compute similarity
        similarities = cosine_similarity(
            [query_embedding], embeddings
        )[0]

        # Get top matches
        indices = np.argsort(similarities)[-top_k:][::-1]

        results = [filenames[i] for i in indices]

        print("✅ Recommendations generated")
        return results

    except Exception as e:
        print("❌ Recommendation Error:", e)
        return []
