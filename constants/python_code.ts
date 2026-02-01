
export const ANPR_PYTHON_CODE = [
  {
    name: "preprocessing.py",
    description: "Initial image cleaning: grayscale conversion, noise reduction, and contrast stretching using CLAHE.",
    content: `import cv2
import numpy as np

def preprocess_image(image_path):
    # Load image
    img = cv2.imread(image_path)
    
    # 1. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Reduce noise with Gaussian Blur
    # Kernel size (5,5) is standard for plate-sized noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 3. Histogram Equalization (CLAHE)
    # Improves contrast for plate characters against backgrounds
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    contrast_enhanced = clahe.apply(blurred)
    
    return contrast_enhanced`
  },
  {
    name: "plate_detection.py",
    description: "Locating the license plate using Canny edges and rectangular contour filtering based on aspect ratio.",
    content: `import cv2
import numpy as np

def detect_plate_region(processed_img):
    # 1. Canny Edge Detection
    edges = cv2.Canny(processed_img, 100, 200)
    
    # 2. Morphological closing to fill gaps in edges
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    
    # 3. Detect Contours
    contours, _ = cv2.findContours(closed, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter by Aspect Ratio (Typical plates are ~3:1 to 5:1)
    best_plate = None
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        aspect_ratio = float(w) / h
        area = cv2.contourArea(c)
        
        if 2.0 < aspect_ratio < 6.0 and area > 500:
            best_plate = (x, y, w, h)
            break
            
    return best_plate`
  },
  {
    name: "character_segmentation.py",
    description: "Isolating individual characters from the plate region and resizing them to a standard 28x28 grid.",
    content: `import cv2
import numpy as np

def segment_characters(plate_crop):
    # 1. Adaptive Thresholding
    gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, 
                                 cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                 cv2.THRESH_BINARY_INV, 11, 2)
    
    # 2. Clean noise
    kernel = np.ones((2,2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    
    # 3. Extract contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    char_blobs = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        # Filter typical character sizes
        if h > 15 and w > 5 and h > w:
            char_roi = thresh[y:y+h, x:x+w]
            # 4. Resize to 28x28
            char_res = cv2.resize(char_roi, (28, 28))
            char_blobs.append((x, char_res))
            
    # Sort left-to-right
    char_blobs.sort(key=lambda x: x[0])
    return [c[1] for c in char_blobs]`
  },
  {
    name: "character_recognition.py",
    description: "Training and inference using a k-NN classifier on flattened pixel intensities.",
    content: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier

def train_knn_model(features, labels):
    # features: list of flattened 28x28 pixel arrays (784 dimensions)
    # labels: corresponding character labels (0-9, A-Z)
    knn = KNeighborsClassifier(n_neighbors=3, weights='distance')
    knn.fit(features, labels)
    return knn

def recognize_plate(char_blobs, model):
    plate_text = ""
    for blob in char_blobs:
        # Flattened pixel intensities as features
        feature_vector = blob.flatten().reshape(1, -1)
        prediction = model.predict(feature_vector)
        plate_text += str(prediction[0])
    return plate_text`
  },
  {
    name: "main.py",
    description: "The orchestration layer connecting the modular pipeline components.",
    content: `import cv2
from preprocessing import preprocess_image
from plate_detection import detect_plate_region
from character_segmentation import segment_characters
from character_recognition import train_knn_model, recognize_plate

def run_anpr(img_path):
    # Step 1: Preprocess
    clean_img = preprocess_image(img_path)
    
    # Step 2: Detect
    plate_box = detect_plate_region(clean_img)
    if not plate_box:
        return "No plate detected"
        
    # Step 3: Segment
    x, y, w, h = plate_box
    original = cv2.imread(img_path)
    plate_crop = original[y:y+h, x:x+w]
    chars = segment_characters(plate_crop)
    
    # Step 4: Recognize
    # Note: assume model is pre-trained or loaded here
    model = load_model() 
    text = recognize_plate(chars, model)
    
    return text`
  }
];
