"""
Generate embeddings from Myntra dataset using ResNet50 CNN feature extractor
Saves embeddings.pkl and filenames.pkl for recommendation system
"""

import os
import sys
import pickle
import numpy as np
from pathlib import Path
from tqdm import tqdm

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# TensorFlow imports
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.layers import GlobalAveragePooling2D
from tensorflow.keras.models import Model

# Configuration
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'myntradataset', 'images')
OUTPUT_DIR = os.path.dirname(__file__)
EMBEDDINGS_FILE = os.path.join(OUTPUT_DIR, 'embeddings.pkl')
FILENAMES_FILE = os.path.join(OUTPUT_DIR, 'filenames.pkl')

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

def build_feature_extractor():
    """Build ResNet50 model for feature extraction"""
    print("Loading ResNet50 model...")
    
    # Load pretrained ResNet50
    base_model = ResNet50(weights='imagenet', include_top=False)
    
    # Add global average pooling
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
        print(f"Error loading image {img_path}: {e}")
        return None


def get_valid_images(dataset_path):
    """Get list of valid image files from dataset"""
    valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    image_files = []
    
    print(f"Scanning dataset folder: {dataset_path}")
    
    if not os.path.exists(dataset_path):
        print(f"[ERROR] Error: Dataset path not found: {dataset_path}")
        return []
    
    for filename in os.listdir(dataset_path):
        file_path = os.path.join(dataset_path, filename)
        
        # Skip directories
        if os.path.isdir(file_path):
            continue
        
        # Check if valid image extension
        if os.path.splitext(filename)[1].lower() in valid_extensions:
            image_files.append(file_path)
    
    print(f"Found {len(image_files)} valid images")
    return sorted(image_files)


def generate_embeddings(model, image_paths):
    """Generate embeddings for all images"""
    embeddings = []
    filenames = []
    failed_images = []
    
    print(f"\nGenerating embeddings for {len(image_paths)} images...")
    
    for img_path in tqdm(image_paths, desc="Extracting features"):
        img_array = load_and_preprocess_image(img_path)
        
        if img_array is None:
            failed_images.append(img_path)
            continue
        
        try:
            # Extract features
            features = model.predict(img_array, verbose=0)
            embeddings.append(features.flatten())
            filenames.append(os.path.basename(img_path))
        except Exception as e:
            print(f"Error extracting features for {img_path}: {e}")
            failed_images.append(img_path)
    
    # Report statistics
    print(f"\n[SUCCESS] Successfully processed: {len(embeddings)} images")
    if failed_images:
        print(f"[WARNING] Failed to process: {len(failed_images)} images")
    
    return np.array(embeddings), filenames, failed_images


def save_embeddings(embeddings, filenames):
    """Save embeddings and filenames to pickle files"""
    print(f"\nSaving embeddings to {EMBEDDINGS_FILE}")
    with open(EMBEDDINGS_FILE, 'wb') as f:
        pickle.dump(embeddings, f)
    
    print(f"Saving filenames to {FILENAMES_FILE}")
    with open(FILENAMES_FILE, 'wb') as f:
        pickle.dump(filenames, f)
    
    print(f"\n[SUCCESS] Embeddings saved successfully!")
    print(f"   - Embeddings shape: {embeddings.shape}")
    print(f"   - Number of images: {len(filenames)}")


def main():
    """Main execution"""
    print("=" * 60)
    print("Fashion Recommendation - Embedding Generation")
    print("=" * 60)
    
    # Check dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Error: Dataset not found at {DATASET_PATH}")
        print(f"Please ensure myntradataset/images/ folder exists")
        return
    
    # Get image paths
    image_paths = get_valid_images(DATASET_PATH)
    if not image_paths:
        print("[ERROR] No valid images found in dataset")
        return
    
    # Build model
    model = build_feature_extractor()
    
    # Generate embeddings
    embeddings, filenames, failed = generate_embeddings(model, image_paths)
    
    if len(embeddings) == 0:
        print("[ERROR] No embeddings were generated")
        return
    
    # Save embeddings
    save_embeddings(embeddings, filenames)
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Embedding generation complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
