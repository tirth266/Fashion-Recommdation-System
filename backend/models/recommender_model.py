# -*- coding: utf-8 -*-

import os
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

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
    print("[ERROR] Error: Model files not found in models directory")
    embeddings = []
    filenames = []
else:
    try:
        embeddings = pickle.load(open(EMBEDDINGS_PATH, "rb"))
        filenames = pickle.load(open(FILENAMES_PATH, "rb"))
        embeddings = np.array(embeddings)
        print("[SUCCESS] Recommender Loaded")
        print("Embeddings:", embeddings.shape)
        print("Filenames:", len(filenames))
    except Exception as e:
        print(f"[ERROR] Error loading pickle files: {e}")
        embeddings = []
        filenames = []

# Load metadata
STYLES_CSV = os.path.join(BASE_DIR, "../../data/datasets/styles.csv")
gender_dict = {}
if os.path.exists(STYLES_CSV):
    try:
        with open(STYLES_CSV, "r", encoding="utf-8") as f:
            next(f)  # skip header
            for line in f:
                parts = line.strip().split(",")
                if len(parts) >= 2:
                    try:
                        item_id = int(parts[0])
                        gender = parts[1]
                        gender_dict[item_id] = gender
                    except ValueError:
                        continue  # skip bad lines
        print(f"✅ Metadata loaded: {len(gender_dict)} items")
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
else:
    print("❌ styles.csv not found")


def get_id_from_path(path):
    filename = os.path.basename(path)
    id_str = filename.split(".")[0]
    return int(id_str)


def recommend(image_path, user_gender=None, top_k=5):
    """
    Generate recommendations for a given image path.
    Returns a list of tuples (image_path, similarity_score).
    If user_gender is provided, filters results to match the gender.
    """
    if len(embeddings) == 0:
        print("[ERROR] Embeddings not loaded, cannot recommend.")
        return []

    try:
        # Extract query features
        # Note: extract_features in cnn_feature_extractor takes (img_path, model)
        query_embedding = extract_features(image_path, model)

        # Compute similarity
        similarities = cosine_similarity([query_embedding], embeddings)[0]

        # Get all indices sorted by similarity descending
        all_indices = np.argsort(similarities)[::-1]

        # Filter by gender
        filtered_results = []
        for idx in all_indices:
            if user_gender is None or user_gender == "Unisex":
                # Return all items for "Unisex" or no filter
                filtered_results.append((filenames[idx], similarities[idx]))
            else:
                item_id = get_id_from_path(filenames[idx])
                item_gender = gender_dict.get(item_id)
                # Include matching gender OR items marked as Unisex
                if item_gender == user_gender or item_gender == "Unisex":
                    filtered_results.append((filenames[idx], similarities[idx]))

            if len(filtered_results) == top_k:
                break

        print(f"✅ Recommendations generated: {len(filtered_results)} items")
        return filtered_results

    except Exception as e:
        print("[ERROR] Recommendation Error:", e)
        return []
