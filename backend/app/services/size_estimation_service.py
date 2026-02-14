
import cv2
import numpy as np
import os
import base64

class SizeEstimator:
    """
    Advanced Hybrid Size Estimation Service.
    Combines OpenCV DNN Pose Estimation with Anthropometric Data (Height, Weight, Gender).
    
    methods: 
    1. Image-based: Uses OpenPose keypoints + Contour analysis (Frontal Widths).
    2. Anthropometric: Uses statistical averages (CDC/ANSUR data) based on Height/Weight/Gender.
    3. Hybrid: Blends both methods based on pose confidence.

    Limitations: 
    - Estimates Frontal Widths, not Circumferences (Girth).
    - Accuracy depends heavily on image quality and user inputs.
    """
    
    # Keypoint Mapping (COCO)
    KP = {
        'Nose': 0, 'Neck': 1,
        'RSho': 2, 'RElb': 3, 'RWri': 4,
        'LSho': 5, 'LElb': 6, 'LWri': 7,
        'RHip': 8, 'RKnee': 9, 'RAnk': 10,
        'LHip': 11, 'LKnee': 12, 'LAnk': 13,
        'REye': 14, 'LEye': 15, 'REar': 16, 'LEar': 17
    }

    def __init__(self, model_path=None, proto_path=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.model_path = model_path or os.path.join(base_dir, 'models', 'pose_iter_440000.caffemodel')
        self.proto_path = proto_path or os.path.join(base_dir, 'models', 'pose_deploy_linevec.prototxt')
        self.net = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.proto_path):
            try:
                self.net = cv2.dnn.readNetFromCaffe(self.proto_path, self.model_path)
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
                print("SizeEstimator: OpenPose Model loaded successfully.")
            except Exception as e:
                print(f"SizeEstimator Error: {e}")
        else:
            print(f"SizeEstimator Warning: Model files missing at {self.model_path}")

    def estimate(self, image_bytes, user_height_cm=170.0, user_weight_kg=None, user_gender='male'):
        """
        Main estimation entry point.
        """
        # 1. Decode Image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: return {"error": "Invalid image data"}
        
        # Ensure Inputs
        height_cm = float(user_height_cm) if user_height_cm else 170.0
        weight_kg = float(user_weight_kg) if user_weight_kg else 70.0 # Default fallback
        gender = user_gender.lower() if user_gender else 'male'

        # 2. Image Analysis (Pose + Contour)
        points, raw_confidence = self._detect_keypoints(img)
        mask, contour = self._get_body_contour(img)
        
        # Calculate Reliability/Confidence
        # Factors: Avg Keypoint Conf, Presence of Shoulders/Hips, Contour Area
        detected_cnt = len([p for p in points if p is not None])
        raw_confidence = raw_confidence * 0.5 + (detected_cnt / 18.0) * 0.5 # Blend conf

        has_shoulders = points[self.KP['RSho']] and points[self.KP['LSho']]
        has_hips = points[self.KP['RHip']] and points[self.KP['LHip']]
        
        if not has_shoulders: raw_confidence *= 0.6
        if not has_hips: raw_confidence *= 0.7
        
        # 3. Calculate Image Metrics (Frontal Widths in CM)
        metrics_px = self._calculate_pixel_metrics(points, mask, contour)
        scale = height_cm / max(metrics_px['height_px'], 1.0)
        
        img_measurements = {
            "shoulder_width_cm": metrics_px['shoulder_px'] * scale,
            "chest_width_cm": metrics_px['chest_px'] * scale,
            "waist_width_cm": metrics_px['waist_px'] * scale,
            "hip_width_cm": metrics_px['hip_px'] * scale, 
        }

        # 4. Anthropometric Estimation (Stats Fallback)
        anthro_measurements = self._predict_from_anthropometry(height_cm, weight_kg, gender)

        # 5. Hybrid Blending Logic
        final_measurements = {}
        method_used = "image"
        
        # Thresholds
        CONF_LOW = 0.4
        CONF_HIGH = 0.75

        if raw_confidence < CONF_LOW:
            # Low Confidence -> Use Anthro completely
            final_measurements = anthro_measurements.copy()
            method_used = "anthropometric"
            final_measurements['notes'] = "Low image confidence. Used statistical averages."
        elif raw_confidence < CONF_HIGH:
            # Medium Confidence -> Blend (Weighted Average)
            alpha = 0.6 # Weight for image
            beta = 0.4  # Weight for anthro
            for key in img_measurements:
                val_img = img_measurements.get(key, 0)
                val_anth = anthro_measurements.get(key, 0)
                if val_img > 0:
                    final_measurements[key] = (val_img * alpha) + (val_anth * beta)
                else:
                    final_measurements[key] = val_anth
            method_used = "hybrid"
            final_measurements['notes'] = "Blended image analysis with statistical data."
        else:
            # High Confidence -> Use Image
            final_measurements = img_measurements.copy()
            final_measurements['notes'] = "High confidence image analysis."

        # Add Height (User provided)
        final_measurements['height_cm'] = height_cm

        # 6. Map to Size
        size_data = self._map_size(final_measurements, gender)

        # 7. Annotate Image
        annotated_b64 = self._annotate_image(img.copy(), points, final_measurements, metrics_px, size_data, method_used)

        return {
            "success": True,
            "method_used": method_used,
            "confidence": round(raw_confidence, 2),
            "measurements": {k: round(v, 1) for k, v in final_measurements.items() if isinstance(v, (int, float))},
            "recommended_size": size_data['size'],
            "size_details": size_data['details'],
            "notes": final_measurements.get('notes', ''),
            "annotated_image": annotated_b64,
            "error": None
        }

    def _predict_from_anthropometry(self, height_cm, weight_kg, gender):
        """
        Estimates body widths based on CDC/ANSUR anthropometric data.
        Formulas approximate biacromial diameter (shoulders) and other widths derived from BMI.
        """
        h_m = height_cm / 100.0
        bmi = weight_kg / (h_m ** 2) if weight_kg > 0 else 22.0
        
        m = {}
        
        # Reference: CDC, ANSUR II, Linear Regression approximations
        if gender == 'female':
             # Shoulders (Biacromial): Approx 36cm base + scaling with height
             m['shoulder_width_cm'] = 36.0 + (height_cm - 162) * 0.12
             
             # Chest: Correlates with BMI. Width ~ Sqrt(BMI) factor
             # Base chest width ~30cm for BMI 20. 
             m['chest_width_cm'] = m['shoulder_width_cm'] * (0.85 + (bmi - 18) * 0.015) 
             
             # Waist: Typically 0.7-0.75 of Hip for women
             # Hip: Wider in females. ~1.1 * Shoulder
             m['hip_width_cm'] = m['shoulder_width_cm'] * (1.05 + (bmi - 20) * 0.01)
             m['waist_width_cm'] = m['hip_width_cm'] * 0.72 # Hourglass approx
             
        elif gender == 'child':
             # Simple scaling for children
             ratio = height_cm / 170.0
             m['shoulder_width_cm'] = 40.0 * ratio
             m['chest_width_cm'] = 35.0 * ratio
             m['waist_width_cm'] = 30.0 * ratio
             m['hip_width_cm'] = 34.0 * ratio
             
        else: # Male (Default)
             # Shoulders: Broader. ~41cm at 175cm height
             m['shoulder_width_cm'] = 41.0 + (height_cm - 175) * 0.15
             
             # Chest: ~0.9-1.0 of Shoulder width depending on BMI
             m['chest_width_cm'] = m['shoulder_width_cm'] * (0.90 + (bmi - 22) * 0.01)
             
             # Waist: Tapers in fit males, wider in high BMI
             m['waist_width_cm'] = m['chest_width_cm'] * (0.78 + (bmi - 22) * 0.01)
             
             # Hip: Narrower than shoulders for men
             m['hip_width_cm'] = m['shoulder_width_cm'] * 0.94
             
        return m

    def _map_size(self, m, gender):
        """
        Maps frontal widths to clothing sizes (US/Intl).
        Uses simple logic: Chest Width * 2 * 1.1 (approx circumference).
        """
        w_chest = m['chest_width_cm']
        
        # Heuristic: Chest Circumference ~= Frontal Width * 2 * 1.1 (to account for depth)
        est_circ = w_chest * 2.2 
        
        # Standard Sizing (Men's US Chest in Inches)
        if gender == 'female':
             # Women's US Sizes (Approx)
             if est_circ < 80: return {'size': 'XS (0-2)', 'details': 'Extra Small'}
             if est_circ < 88: return {'size': 'S (4-6)', 'details': 'Small'}
             if est_circ < 96: return {'size': 'M (8-10)', 'details': 'Medium'}
             if est_circ < 104: return {'size': 'L (12-14)', 'details': 'Large'}
             return {'size': 'XL (16+)', 'details': 'Extra Large'}
        else:
             # Men's Sizing (Chest Circumference cm)
             if est_circ < 86: return {'size': 'XS', 'details': 'Extra Small (34)'}
             if est_circ < 94: return {'size': 'S', 'details': 'Small (36-38)'}
             if est_circ < 102: return {'size': 'M', 'details': 'Medium (38-40)'}
             if est_circ < 112: return {'size': 'L', 'details': 'Large (42-44)'}
             if est_circ < 122: return {'size': 'XL', 'details': 'Extra Large (46)'}
             return {'size': 'XXL', 'details': 'Double Extra Large (48+)'}

    def _detect_keypoints(self, img):
        if not self.net: return [None]*18, 0.0
        
        h, w = img.shape[:2]
        in_w = 368
        in_h = int((in_w / w) * h)
        
        blob = cv2.dnn.blobFromImage(img, 1.0/255, (in_w, in_h), (0,0,0), swapRB=False, crop=False)
        self.net.setInput(blob)
        output = self.net.forward()
        
        H_out, W_out = output.shape[2], output.shape[3]
        points = []
        confidences = []
        
        for i in range(18):
            prob_map = output[0, i, :, :]
            _, prob, _, point = cv2.minMaxLoc(prob_map)
            x = int((w * point[0]) / W_out)
            y = int((h * point[1]) / H_out)
            
            if prob > 0.1:
                points.append((x, y))
                confidences.append(prob)
            else:
                points.append(None)
                
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        return points, avg_conf

    def _get_body_contour(self, img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5,5))
        mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
        
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours: return mask, None
        return mask, max(contours, key=cv2.contourArea)

    def _calculate_pixel_metrics(self, points, mask, contour):
        def get_width(y):
            if y < 0 or y >= mask.shape[0]: return 0
            row = mask[y, :] # Entire row
            whites = np.where(row > 0)[0]
            return (whites[-1] - whites[0]) if len(whites) > 0 else 0

        # Height (Nose to Ankles)
        nose = points[self.KP['Nose']]
        neck = points[self.KP['Neck']]
        r_ank = points[self.KP['RAnk']]
        l_ank = points[self.KP['LAnk']]
        
        top_y = nose[1] if nose else (neck[1] - 50 if neck else 0)
        btm_y = max(r_ank[1] if r_ank else 0, l_ank[1] if l_ank else 0)
        
        # Fallback height if ankles missing (use bounding box bottom)
        if btm_y == 0 and contour is not None:
             _, _, _, h_cnt = cv2.boundingRect(contour)
             btm_y = top_y + h_cnt # Rough guess
        
        height_px = btm_y - top_y

        # Shoulders
        r_sho = points[self.KP['RSho']]
        l_sho = points[self.KP['LSho']]
        sho_px = 0
        sho_y = 0

        if r_sho and l_sho:
            sho_y = int((r_sho[1] + l_sho[1]) / 2)
            kp_width = abs(r_sho[0] - l_sho[0])
            cnt_width = get_width(sho_y)
            sho_px = max(kp_width, cnt_width)
        elif contour is not None:
             x, y, w, h = cv2.boundingRect(contour)
             sho_px = w * 0.8 # Rough guess
             sho_y = y + int(h * 0.15) if y else 0

        # Hips
        r_hip = points[self.KP['RHip']]
        l_hip = points[self.KP['LHip']]
        hip_px = 0
        hip_y = 0

        if r_hip and l_hip:
            hip_y = int((r_hip[1] + l_hip[1]) / 2)
            kp_hip_width = abs(r_hip[0] - l_hip[0])
            cnt_hip_width = get_width(hip_y)
            hip_px = max(kp_hip_width, cnt_hip_width)
        elif contour is not None:
             x, y, w, h = cv2.boundingRect(contour)
             hip_y = y + int(h * 0.5) if y else 0
             hip_px = get_width(hip_y)

        # Chest (25% down from neck to hip)
        chest_px = 0
        chest_y = 0
        
        if neck:
            neck_y = neck[1]
            if hip_y > 0:
                 chest_y = int(neck_y + (hip_y - neck_y) * 0.25)
            else:
                 chest_y = int(neck_y + height_px * 0.2) # Guess if no hips
            chest_px = get_width(chest_y)
        elif contour is not None:
             x, y, w, h = cv2.boundingRect(contour)
             chest_y = y + int(h * 0.25) if y else 0
             chest_px = get_width(chest_y)

        # Waist (Search for narrowest point between Chest and Hips)
        waist_px = 0
        waist_y_found = 0
        
        if chest_y > 0 and hip_y > 0:
            min_w = float('inf')
            waist_y_found = chest_y + 10
            for y in range(chest_y + 10, hip_y - 10, 5):
                try:
                    w = get_width(y)
                    if w > 0 and w < min_w:
                        min_w = w
                        waist_y_found = y
                except: continue
            waist_px = min_w if min_w != float('inf') else chest_px * 0.85
        else:
             waist_px = chest_px * 0.85 # Fallback
             waist_y_found = chest_y + 50 if chest_y else 0

        # Wrist (Average of left/right contour width)
        wrist_px = 0
        r_wri = points[self.KP['RWri']]
        l_wri = points[self.KP['LWri']]
        widths = []
        if r_wri: widths.append(get_width(r_wri[1]))
        if l_wri: widths.append(get_width(l_wri[1]))
        if widths: wrist_px = sum(widths) / len(widths)

        return {
            'height_px': height_px,
            'shoulder_px': sho_px,
            'chest_px': chest_px,
            'waist_px': waist_px,
            'hip_px': hip_px,
            'wrist_px': wrist_px,
            'y_chest': chest_y,
            'y_waist': waist_y_found,
            'y_hip': hip_y
        }

    def _annotate_image(self, img, points, measurements, metrics_px, size_data, method):
        # Draw Style - Blue Theme (BGR)
        COLOR_LINE = (255, 0, 0) # Blue
        COLOR_TEXT = (50, 50, 50) # Dark Gray
        BG_TEXT = (255, 255, 255) # White
        
        def draw_dashed_line(img, p1, p2, color, thickness=2, gap=15):
            dist = np.linalg.norm(np.array(p1)-np.array(p2))
            if dist == 0: return
            pts = []
            for i in np.arange(0, dist, gap):
                r = i/dist
                x = int((p1[0]*(1-r) + p2[0]*r))
                y = int((p1[1]*(1-r) + p2[1]*r))
                pts.append((x,y))
            for i in range(0, len(pts)-1, 2):
                cv2.line(img, pts[i], pts[i+1], color, thickness)

        def draw_measure(y, label, value, is_estimated=False):
            # Safe check
            if y <= 0 or y >= img.shape[0]: return

            # Line style
            color = (0, 165, 255) if is_estimated else COLOR_LINE # Orange if estimated
            
            # Draw horizontal dashed line
            draw_dashed_line(img, (30, y), (img.shape[1]-30, y), color, 2)
            
            # Label
            text = f"{label}: {value:.1f}cm"
            if is_estimated: text += "*"
            
            font_scale = 0.6
            thickness = 2
            (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
            
            # Text Background
            cv2.rectangle(img, (30, y - th - 15), (30 + tw + 20, y + 5), BG_TEXT, -1)
            cv2.rectangle(img, (30, y - th - 15), (30 + tw + 20, y + 5), color, 1)
            
            # Text
            cv2.putText(img, text, (40, y - 5), cv2.FONT_HERSHEY_SIMPLEX, font_scale, COLOR_TEXT, thickness)


        h, w = img.shape[:2]
        is_anthro = (method == 'anthropometric')

        # 1. Height
        cv2.putText(img, f"Height: {measurements['height_cm']}cm", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR_TEXT, 2)

        # 2. Method Label
        method_color = (0, 0, 255) if is_anthro else (0, 255, 0)
        cv2.putText(img, f"Method: {method.title()}", (30, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, method_color, 2)

        # 3. Shoulders
        y_sho = metrics_px.get('y_chest', 0) - 50 # Fallback
        if metrics_px.get('shoulder_px', 0) > 0:
             # Try to find Y from keypoints
             neck = points[self.KP['Neck']]
             if neck: y_sho = neck[1]
        elif is_anthro:
             y_sho = int(h * 0.18)
        
        draw_measure(y_sho, "Shoulder", measurements['shoulder_width_cm'], is_anthro)

        # 4. Chest
        y_chest = metrics_px.get('y_chest', 0)
        if y_chest == 0: y_chest = int(h * 0.3)
        draw_measure(y_chest, "Chest", measurements['chest_width_cm'], is_anthro)
        
        # 5. Waist
        y_waist = metrics_px.get('y_waist', 0)
        if y_waist == 0: y_waist = int(h * 0.45)
        draw_measure(y_waist, "Waist", measurements['waist_width_cm'], is_anthro)
             
        # 6. Hips
        y_hip = metrics_px.get('y_hip', 0)
        if y_hip == 0: y_hip = int(h * 0.55)
        draw_measure(y_hip, "Hips", measurements['hip_width_cm'], is_anthro)
        
        # Draw Skeleton (Subtle) - Only if not pure anthro fallback
        if not is_anthro:
            skeleton = [[1,2], [1,5], [2,3], [3,4], [5,6], [6,7], [1,8], [8,9], [9,10], [1,11], [11,12], [12,13]]
            for p1, p2 in skeleton:
                try:
                    if points[p1] and points[p2]:
                        cv2.line(img, points[p1], points[p2], (200, 200, 200), 2) # Light gray skeleton
                        cv2.circle(img, points[p1], 3, (0, 0, 255), -1) # Red joints
                except IndexError: continue

        # Overlay Size
        cv2.putText(img, f"Size: {size_data['size']}", (30, h - 30), cv2.FONT_HERSHEY_DUPLEX, 1.2, (255, 0, 0), 2)

        _, buf = cv2.imencode('.jpg', img)
        return "data:image/jpeg;base64," + base64.b64encode(buf).decode('utf-8')
