import os
import pickle
import numpy as np
import tensorflow as tf
from numpy.linalg import norm 
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from sklearn.neighbors import NearestNeighbors
import cv2


# ===============================
# FIXED BASE PATH (VERY IMPORTANT) 
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Go up one level from backend/app to backend, then to models
emb_path = os.path.join(BASE_DIR, "..", "models", "embeddings.pkl")
file_path = os.path.join(BASE_DIR, "..", "models", "filenames.pkl")

print("Loading embeddings...")
feature_list = np.array(pickle.load(open(emb_path, "rb")))
filenames = pickle.load(open(file_path, "rb"))
print("Embeddings shape:", feature_list.shape)


# ===============================
# LOAD RESNET MODEL
# ===============================
print("Loading model...")
base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224,224,3))
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    GlobalMaxPooling2D()
])

print("Model loaded successfully!")


# ===============================
# LOAD TEST IMAGE
# ===============================
 
# Put any test image inside backend/app/sample.jpg
test_img_path = os.path.join(BASE_DIR, "sample.jpg")

if not os.path.exists(test_img_path):
    print("Put a test image named 'sample.jpg' inside backend/app/")
    exit()

img = image.load_img(test_img_path, target_size=(224,224))
img_array = image.img_to_array(img)
expanded_img_array = np.expand_dims(img_array, axis=0)
preprocessed_img = preprocess_input(expanded_img_array)

print("Extracting features...")
result = model.predict(preprocessed_img).flatten()
normalized_result = result / norm(result)


# ===============================
# FIND NEAREST NEIGHBORS
# ===============================
print("Finding similar images...")

# Use minimum of 6 or available samples
n_neighbors = min(6, len(feature_list))
neighbors = NearestNeighbors(n_neighbors=n_neighbors, algorithm='brute', metric='euclidean')
neighbors.fit(feature_list)

distances, indices = neighbors.kneighbors([normalized_result])

print("Top similar indices:", indices)


# ===============================
# SHOW RESULTS
# ===============================
print("Displaying similar images...")

for idx in indices[0][1:]:  # Skip the first one (the query image itself)
    img_path = filenames[idx]

    if os.path.exists(img_path):
        temp_img = cv2.imread(img_path)
        resized = cv2.resize(temp_img, (512,512))
        cv2.imshow("Similar Image", resized)
        cv2.waitKey(0)
    else:
        print("File not found:", img_path)

cv2.destroyAllWindows()
print("Done.")
