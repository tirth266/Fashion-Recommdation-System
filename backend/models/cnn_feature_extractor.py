import tensorflow
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.applications.resnet50 import ResNet50,preprocess_input
import numpy as np
from numpy.linalg import norm
import os
from tqdm import tqdm
import pickle

model = ResNet50(weights='imagenet',include_top=False,input_shape=(224,224,3))
model.trainable = False

model = tensorflow.keras.Sequential([
    model,
    GlobalMaxPooling2D()
])

#print(model.summary())

def extract_features(img_path,model):
    img = image.load_img(img_path,target_size=(224,224))
    img_array = image.img_to_array(img)
    expanded_img_array = np.expand_dims(img_array, axis=0)
    preprocessed_img = preprocess_input(expanded_img_array)
    result = model.predict(preprocessed_img).flatten()
    normalized_result = result / norm(result)

    return normalized_result

if __name__ == "__main__":
    # Define base paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
    images_path = os.path.join(PROJECT_ROOT, 'data', 'datasets', 'images')

    filenames = []

    if os.path.exists(images_path):
        for file in os.listdir(images_path):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                filenames.append(os.path.join(images_path,file))
    else:
        print(f"Error: Image directory not found at {images_path}")
        exit(1)

    # Limit to first 1000 images for speed, remove suffix if you want all
    filenames = filenames[:44400]

    feature_list = []

    print(f"Extracting features for {len(filenames)} images...")
    for file in tqdm(filenames):
        try:
            feature_list.append(extract_features(file,model))
        except Exception as e:
            print(f"Error processing {file}: {e}")

    # Save to the current directory (backend/models)
    with open(os.path.join(BASE_DIR, 'embeddings.pkl'), 'wb') as f:
        pickle.dump(feature_list, f)
    with open(os.path.join(BASE_DIR, 'filenames.pkl'), 'wb') as f:
        pickle.dump(filenames, f)
    print(f"Features extracted for {len(feature_list)} images.")
    print(f"Saved to {os.path.join(BASE_DIR, 'embeddings.pkl')}")
    print(f"Saved to {os.path.join(BASE_DIR, 'filenames.pkl')}")