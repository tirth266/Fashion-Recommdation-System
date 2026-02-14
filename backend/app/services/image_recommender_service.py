
import pickle
import numpy as np
from numpy.linalg import norm
import os

# Correct path to parent directory (backend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to load actual embeddings
embeddings_path = os.path.join(BASE_DIR, "models/embeddings.pkl")
filenames_path = os.path.join(BASE_DIR, "models/filenames.pkl")

embeddings = None
filenames = None

try:
    if os.path.exists(embeddings_path):
        embeddings = pickle.load(open(embeddings_path, "rb"))
        embeddings = np.array(embeddings)
        print(f"[OK] Loaded embeddings: {embeddings.shape}")
    else:
        print(f"[WARN] Embeddings not found at {embeddings_path}")
except Exception as e:
    print(f"[WARN] Error loading embeddings: {e}")

try:
    if os.path.exists(filenames_path):
        filenames = pickle.load(open(filenames_path, "rb"))
        print(f"[OK] Loaded {len(filenames) if filenames else 0} filenames")
    else:
        print(f"[WARN] Filenames not found at {filenames_path}")
except Exception as e:
    print(f"[WARN] Error loading filenames: {e}")

# Try to import TensorFlow for actual feature extraction
try:
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
    from tensorflow.keras.layers import GlobalMaxPooling2D
    import tensorflow as tf
    
    # Load model once
    base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224,224,3))
    base_model.trainable = False
    
    model = tf.keras.Sequential([
        base_model,
        GlobalMaxPooling2D()
    ])
    
    def extract_features(img_path):
        img = image.load_img(img_path, target_size=(224,224))
        img_array = image.img_to_array(img)
        expanded = np.expand_dims(img_array, axis=0)
        preprocessed = preprocess_input(expanded)
        result = model.predict(preprocessed).flatten()
        normalized = result / norm(result)
        return normalized
    
    TENSORFLOW_AVAILABLE = True
except ImportError:
    print("[WARN] TensorFlow not available - using random feature generator for testing")
    TENSORFLOW_AVAILABLE = False
    
    def extract_features(img_path):
        # Generate random features for testing
        return np.random.randn(2048)

def recommend_image(img_path, top_k=5):
    """
    Recommend similar images based on uploaded image.
    Returns list of similar image paths from the dataset.
    """
    if embeddings is None or len(embeddings) == 0:
        return {
            "error": "Model not initialized",
            "recommended_images": []
        }
    
    if filenames is None or len(filenames) == 0:
        return {
            "error": "No image database available",
            "recommended_images": []
        }
    
    try:
        # Extract features from uploaded image
        query = extract_features(img_path)
        
        # Compute similarity scores
        similarities = np.dot(embeddings, query)
        
        # Get top-k similar indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Get recommended image paths
        results = []
        for i in top_indices:
            if i < len(filenames):
                path = str(filenames[i]).replace("../../data/datasets/images", "/static/dataset_images")
                results.append(path)
        
        return {
            "recommended_images": results,
            "tensorflow_available": TENSORFLOW_AVAILABLE,
            "embeddings_count": len(embeddings),
            "query_processed": True
        }
    except Exception as e:
        print(f"Error in recommendation: {e}")
        return {
            "error": str(e),
            "recommended_images": []
        }
