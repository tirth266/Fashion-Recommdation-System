
import os
import requests
import sys

# Define model paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Reliable sources for OpenPose COCO Model (18 keypoints)
# Option 1: CMU (Original, often slow)
# Option 2: OpenCV Extra (Prototxt only usually)
# Option 3: Third party mirrors

FILES = {
    "pose_deploy_linevec.prototxt": "https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/openpose_pose_coco.prototxt",
    "pose_iter_440000.caffemodel": "http://posefs1.perception.cs.cmu.edu/OpenPose/models/pose/coco/pose_iter_440000.caffemodel"
}

def download_file(url, path):
    print(f"Downloading {os.path.basename(path)}...")
    print(f"Source: {url}")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Successfully saved to {path}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
        print(f"Created directory: {MODELS_DIR}")

    print("--- OpenPose Model Downloader ---")
    print("NOTE: The .caffemodel file is large (~200MB).")
    
    success = True
    for name, url in FILES.items():
        path = os.path.join(MODELS_DIR, name)
        if os.path.exists(path):
            print(f"[SKIP] {name} already exists.")
        else:
            if not download_file(url, path):
                success = False
    
    if success:
        print("\nAll models ready! You can now use the Size Estimation feature.")
    else:
        print("\nSome downloads failed. Please try downloading manually and placing files in:")
        print(f"{MODELS_DIR}")

if __name__ == "__main__":
    main()
