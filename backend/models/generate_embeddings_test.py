"""
Quick test - Generate embeddings from first 1000 images only
Use this to test recommendations while full dataset generates
"""

import os
import sys
import pickle
import numpy as np
from pathlib import Path
from tqdm import tqdm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.layers import GlobalAveragePooling2D
from tensorflow.keras.models import Model

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'myntradataset', 'images')
OUTPUT_DIR = os.path.dirname(__file__)
EMBEDDINGS_FILE = os.path.join(OUTPUT_DIR, 'embeddings_test.pkl')
FILENAMES_FILE = os.path.join(OUTPUT_DIR, 'filenames_test.pkl')

# Test settings
MAX_IMAGES = 1000  # Only process first 1000 for fast testing
IMAGE_SIZE = (224, 224)

def build_feature_extractor():
    """Build ResNet50 model for feature extraction"""
    print("Loading ResNet50 model...")
    base_model = ResNet50(weights='imagenet', include_top=False)
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = preprocess_input(inputs)
    x = base_model(x, training=False)
    outputs = GlobalAveragePooling2D()(x)
    model = Model(inputs, outputs)
    return model

def load_and_preprocess_image(img_path):
    """Load and preprocess image for ResNet50"""
    try:
        img = image.load_img(img_path, target_size=IMAGE_SIZE)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        return img_array
    except Exception as e:
        return None

def main():
    print("=" * 60)
    print("Fashion Recommendation - Quick Test (1000 images)")
    print("=" * 60)
    
    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset not found")
        return
    
    # Get only first 1000 images
    image_files = sorted([os.path.join(DATASET_PATH, f) for f in os.listdir(DATASET_PATH) 
                         if f.lower().endswith(('.jpg', '.jpeg', '.png'))])[:MAX_IMAGES]
    
    print(f"Found {len(image_files)} images (limited to {MAX_IMAGES} for testing)")
    
    model = build_feature_extractor()
    embeddings = []
    filenames = []
    
    print(f"\nGenerating embeddings...")
    for img_path in tqdm(image_files, desc="Processing"):
        img_array = load_and_preprocess_image(img_path)
        if img_array is not None:
            try:
                features = model.predict(img_array, verbose=0)
                embeddings.append(features.flatten())
                filenames.append(os.path.basename(img_path))
            except:
                pass
    
    embeddings = np.array(embeddings)
    
    print(f"\n[SUCCESS] Processed {len(embeddings)} images")
    print(f"Saving to temporary test files...")
    
    with open(EMBEDDINGS_FILE, 'wb') as f:
        pickle.dump(embeddings, f)
    with open(FILENAMES_FILE, 'wb') as f:
        pickle.dump(filenames, f)
    
    print(f"[SUCCESS] Test embeddings ready!")
    print(f"   Shape: {embeddings.shape}")
    print(f"\n[WARNING] IMPORTANT:")
    print(f"   These are TEST files. Replace with full embeddings when done.")
    print(f"   To use full dataset, rename:")
    print(f"   - embeddings.pkl (not test)")
    print(f"   - filenames.pkl (not test)")

if __name__ == '__main__':
    main()
