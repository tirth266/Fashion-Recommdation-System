// src/pages/SmartSize.jsx — Body Measurement Wizard with MediaPipe Pose
import { useState, useRef, useEffect, useCallback } from 'react';

// Suppress MediaPipe clipboard error
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('clipboard')) {
    e.preventDefault();
    return true;
  }
});

// ─── Constants ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Your Info', icon: '📋' },
  { id: 2, label: 'Front Photo', icon: '📸' },
  { id: 3, label: 'Side Photo', icon: '🔄' },
  { id: 4, label: 'Processing', icon: '⚙️' },
  { id: 5, label: 'Results', icon: '✅' },
];

const TSHIRT_SIZES = [
  { size: 'XS', min: 0, max: 88 },
  { size: 'S', min: 88, max: 96 },
  { size: 'M', min: 96, max: 104 },
  { size: 'L', min: 104, max: 112 },
  { size: 'XL', min: 112, max: 120 },
  { size: 'XXL', min: 120, max: 999 },
];

const PANTS_SIZES = [
  { size: '28', min: 0, max: 74 },
  { size: '30', min: 74, max: 79 },
  { size: '32', min: 79, max: 84 },
  { size: '34', min: 84, max: 89 },
  { size: '36', min: 89, max: 94 },
  { size: '38', min: 94, max: 999 },
];

const SHIRT_SIZES = [
  { size: 'S (14–14.5")', min: 0, max: 100 },
  { size: 'M (15–15.5")', min: 100, max: 108 },
  { size: 'L (16–16.5")', min: 108, max: 116 },
  { size: 'XL (17–17.5")', min: 116, max: 999 },
];

const WOMEN_TOP_SIZES = [
  { size: 'XS', bust: { min: 76, max: 81 }, waist: { min: 60, max: 65 }, hip: { min: 84, max: 89 } },
  { size: 'S', bust: { min: 82, max: 87 }, waist: { min: 66, max: 71 }, hip: { min: 90, max: 95 } },
  { size: 'M', bust: { min: 88, max: 93 }, waist: { min: 72, max: 77 }, hip: { min: 96, max: 101 } },
  { size: 'L', bust: { min: 94, max: 100 }, waist: { min: 78, max: 84 }, hip: { min: 102, max: 108 } },
  { size: 'XL', bust: { min: 101, max: 107 }, waist: { min: 85, max: 91 }, hip: { min: 109, max: 115 } },
];

// MediaPipe Pose landmark indices
const POSE = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// ─── Helpers ────────────────────────────────────────────────────────
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getSize(chart, value) {
  const match = chart.find((s) => value >= s.min && value < s.max);
  return match ? match.size : 'N/A';
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Ellipse circumference: π × √(2 × (a² + b²))
function ellipseCircumference(width, depth) {
  const a = width / 2;
  const b = depth / 2;
  return Math.PI * Math.sqrt(2 * (a * a + b * b));
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ─── Robust Size Estimation Engine ─────────────────────────────────────
// Key improvements:
// 1. Clamp scale factor to prevent extreme values
// 2. Use ellipse formula for circumference (front width + side depth)
// 3. BMI-based adaptive correction (continuous, not hardcoded)
// 4. Sanity bounds for all measurements
// 5. Clear error messages for poor detection
function calculateMeasurements(frontLandmarks, sideLandmarks, frontResult, sideResult, heightCm, weightKg, gender) {
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const fl = frontLandmarks;
  
  // Validate minimum visibility scores
  const requiredLandmarks = [POSE.NOSE, POSE.LEFT_SHOULDER, POSE.RIGHT_SHOULDER, POSE.LEFT_HIP, POSE.RIGHT_HIP, POSE.LEFT_ANKLE, POSE.RIGHT_ANKLE];
  for (let p of requiredLandmarks) {
    if (!fl[p] || fl[p].visibility < 0.5) {
      throw new Error('full_body_required');
    }
  }

  // Extract pixel coordinates
  const imgW = frontResult.width;
  const imgH = frontResult.height;
  
  const getCoord = (landmark) => ({
    x: Math.round(landmark.x * imgW),
    y: Math.round(landmark.y * imgH)
  });

  const lShoulder = getCoord(fl[POSE.LEFT_SHOULDER]);
  const rShoulder = getCoord(fl[POSE.RIGHT_SHOULDER]);
  const lHip = getCoord(fl[POSE.LEFT_HIP]);
  const rHip = getCoord(fl[POSE.RIGHT_HIP]);
  const lAnkle = getCoord(fl[POSE.LEFT_ANKLE]);
  const rAnkle = getCoord(fl[POSE.RIGHT_ANKLE]);

  // Calculate pixel distances
  const shoulderPx = dist(lShoulder, rShoulder);
  const hipPx = dist(lHip, rHip);
  
  // Calculate actual body height in image from shoulder to ankle
  // Using more accurate measurement: distance between shoulder midpoint and ankle midpoint
  const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
  const ankleMidY = (lAnkle.y + rAnkle.y) / 2;
  const heightPx = Math.abs(ankleMidY - shoulderMidY);

  // Sanity check: reject unrealistic height pixels
  // Valid human height in image: 150px to 2500px
  if (heightPx < 150 || heightPx > 2500) {
    throw new Error('invalid_pose_scale');
  }

  // STABILITY: Clamp scale factor to safe range
  // This prevents extreme values from bad detections
  // For typical phone camera at 2-3m distance: scale ≈ 0.4 to 1.2 cm/px
  const rawScale = heightCm / heightPx;
  const scaleFactor = clamp(rawScale, 0.35, 1.5);

  // Front-view widths in cm
  const shoulderWidth = shoulderPx * scaleFactor;
  const hipWidth = hipPx * scaleFactor;
  
  // Inseam calculation - from hip to ankle
  const inseamPx = Math.abs(lAnkle.y - lHip.y);
  let inseam = inseamPx * scaleFactor;

  // ─── GEOMETRY: Ellipse-based circumference estimation ───────────────
  // Using both front width and (optionally) side depth
  
  let chestCirc, waistCirc, hipCirc;
  
  if (sideLandmarks && sideResult) {
    // Use ellipse formula with side depth
    const sideW = sideResult.width;
    const sideH = sideResult.height;
    const sl = sideLandmarks;
    
    const sLShoulder = { x: Math.round(sl[POSE.LEFT_SHOULDER].x * sideW), y: Math.round(sl[POSE.LEFT_SHOULDER].y * sideH) };
    const sRShoulder = { x: Math.round(sl[POSE.RIGHT_SHOULDER].x * sideW), y: Math.round(sl[POSE.RIGHT_SHOULDER].y * sideH) };
    const sLHip = { x: Math.round(sl[POSE.LEFT_HIP].x * sideW), y: Math.round(sl[POSE.LEFT_HIP].y * sideH) };
    const sRHip = { x: Math.round(sl[POSE.RIGHT_HIP].x * sideW), y: Math.round(sl[POSE.RIGHT_HIP].y * sideH) };
    
    const sideChestDepth = Math.max(dist(sLShoulder, sRShoulder) * scaleFactor, 15);
    const sideHipDepth = Math.max(dist(sLHip, sRHip) * scaleFactor, 15);
    
    // Ellipse: more accurate than simple multipliers
    chestCirc = ellipseCircumference(shoulderWidth, sideChestDepth);
    waistCirc = ellipseCircumference(hipWidth * 0.9, sideHipDepth * 0.85);
    hipCirc = ellipseCircumference(hipWidth, sideHipDepth);
  } else {
    // Fallback without side image - use proven multipliers
    // Based on CDC/ANSUR anthropometric data
    // Chest circumference ≈ shoulder width × 2.8-3.0
    // Waist circumference ≈ hip width × 2.5-2.8
    // Hip circumference ≈ hip width × 2.8-3.0
    chestCirc = shoulderWidth * 2.9;
    waistCirc = hipWidth * 2.6;
    hipCirc = hipWidth * 2.9;
  }

  // ─── ADAPTIVE CORRECTION: BMI-based adjustment ───────────────────────
  // Use BMI as continuous factor (NOT hardcoded if-else)
  // BMI affects chest and waist proportionally
  
  // BMI factor: 22 is baseline. 
  // Below 22: reduce measurements slightly (slimmer)
  // Above 22: increase measurements (broader)
  const bmiFactor = (bmi - 22) * 0.025; // 0.025 per BMI point
  
  chestCirc = chestCirc * (1 + bmiFactor);
  waistCirc = waistCirc * (1 + bmiFactor * 1.2); // Waist affected more by BMI
  hipCirc = hipCirc * (1 + bmiFactor * 0.8);
  inseam = inseam * (1 + (bmi - 22) * 0.008); // Inseam slightly affected

  // Gender-specific adjustments
  if (gender === 'female') {
    // Women typically have smaller shoulders relative to hips
    chestCirc = chestCirc * 0.9;
    // Women have higher waist-to-hip ratio
    waistCirc = waistCirc * 1.05;
  }

  // ─── SANITY BOUNDS: Clamp to realistic ranges ───────────────────────
  // Prevents unrealistic values from bad detections
  const bounds = {
    chestCirc: { min: 70, max: 140 },
    waistCirc: { min: 55, max: 130 },
    hipCirc: { min: 70, max: 150 },
    inseam: { min: 50, max: 110 },
    shoulderWidth: { min: 25, max: 60 }
  };

  chestCirc = clamp(chestCirc, bounds.chestCirc.min, bounds.chestCirc.max);
  waistCirc = clamp(waistCirc, bounds.waistCirc.min, bounds.waistCirc.max);
  hipCirc = clamp(hipCirc, bounds.hipCirc.min, bounds.hipCirc.max);
  inseam = clamp(inseam, bounds.inseam.min, bounds.inseam.max);
  const finalShoulderWidth = clamp(shoulderWidth, bounds.shoulderWidth.min, bounds.shoulderWidth.max);

  return {
    bmi,
    shoulderWidth: finalShoulderWidth,
    chestCircumference: chestCirc,
    waistCircumference: waistCirc,
    hipCircumference: hipCirc,
    inseam: inseam,
    scaleFactor: scaleFactor,
    hasSideImage: !!sideLandmarks
  };
}

// ─── Silhouette SVG Paths ───────────────────────────────────────────
function FrontSilhouette() {
  return (
    <svg viewBox="0 0 200 500" className="absolute inset-0 w-full h-full animate-silhouette-pulse pointer-events-none" style={{ zIndex: 5 }}>
      {/* Head */}
      <ellipse cx="100" cy="52" rx="28" ry="34" fill="rgba(255,255,255,0.18)" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5"/>
      {/* Neck */}
      <rect x="90" y="84" width="20" height="18" rx="6" fill="rgba(255,255,255,0.12)"/>
      {/* Torso */}
      <path d="M60 102 Q58 110 55 160 Q53 200 58 240 L80 240 Q85 210 85 180 L115 180 Q115 210 120 240 L142 240 Q147 200 145 160 Q142 110 140 102 Q130 96 100 96 Q70 96 60 102Z" fill="rgba(255,255,255,0.15)" stroke="rgba(168,85,247,0.35)" strokeWidth="1.2"/>
      {/* Left arm */}
      <path d="M55 108 Q35 130 28 180 Q25 200 30 220 L40 218 Q42 200 42 180 Q45 140 58 118" fill="rgba(255,255,255,0.10)" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
      {/* Right arm */}
      <path d="M145 108 Q165 130 172 180 Q175 200 170 220 L160 218 Q158 200 158 180 Q155 140 142 118" fill="rgba(255,255,255,0.10)" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
      {/* Left leg */}
      <path d="M72 240 Q68 300 66 360 Q64 400 62 440 L88 440 Q86 400 86 360 Q86 300 88 240Z" fill="rgba(255,255,255,0.12)" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
      {/* Right leg */}
      <path d="M112 240 Q114 300 114 360 Q114 400 112 440 L138 440 Q136 400 134 360 Q132 300 128 240Z" fill="rgba(255,255,255,0.12)" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
      {/* Guide text */}
      <text x="100" y="480" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="sans-serif">Align your body</text>
    </svg>
  );
}

function SideSilhouette() {
  return (
    <svg viewBox="0 0 200 500" className="absolute inset-0 w-full h-full animate-silhouette-pulse pointer-events-none" style={{ zIndex: 5 }}>
      {/* Head */}
      <ellipse cx="105" cy="52" rx="22" ry="34" fill="rgba(255,255,255,0.18)" stroke="rgba(236,72,153,0.4)" strokeWidth="1.5"/>
      {/* Neck */}
      <rect x="97" y="84" width="16" height="18" rx="5" fill="rgba(255,255,255,0.12)"/>
      {/* Torso — side profile with depth */}
      <path d="M88 102 Q80 120 78 160 Q76 200 80 240 L130 240 Q135 200 133 160 Q130 120 122 102 Q115 96 105 96 Q95 96 88 102Z" fill="rgba(255,255,255,0.15)" stroke="rgba(236,72,153,0.35)" strokeWidth="1.2"/>
      {/* Left arm (visible) */}
      <path d="M86 110 Q75 140 72 180 Q70 210 75 235 L82 233 Q80 210 82 180 Q84 140 90 118" fill="rgba(255,255,255,0.10)" stroke="rgba(236,72,153,0.3)" strokeWidth="1"/>
      {/* Left leg */}
      <path d="M85 240 Q82 300 80 360 Q78 400 76 440 L118 440 Q116 400 116 360 Q116 300 118 240Z" fill="rgba(255,255,255,0.12)" stroke="rgba(236,72,153,0.3)" strokeWidth="1"/>
      {/* Guide text */}
      <text x="100" y="480" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="sans-serif">Stand sideways</text>
    </svg>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────
function ProgressBar({ currentStep }) {
  const visibleSteps = STEPS.filter((_, i) => i === 2 || i === 3);
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-3">
        {visibleSteps.map((step, i) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2
                ${isDone ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30' :
                  isActive ? 'bg-purple-500/20 border-purple-500 text-purple-600 shadow-lg shadow-purple-500/20 animate-process-pulse' :
                  'bg-gray-100 border-gray-200 text-gray-400'}`}>
                {isDone ? '✓' : step.icon}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium transition-colors duration-300 ${isActive ? 'text-purple-600' : isDone ? 'text-purple-500' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Track */}
      <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 animate-progress-fill transition-all duration-700 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export default function SmartSize() {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [inputMode, setInputMode] = useState(null);
  const [showModeSelect, setShowModeSelect] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frontFileRef = useRef(null);
  const sideFileRef = useRef(null);

  // ─── Camera management ─────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please allow camera permission and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Start/stop camera when entering/leaving capture steps
  useEffect(() => {
    if ((step === 2 || step === 3) && inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, inputMode, startCamera, stopCamera]);

  // ─── Capture photo with countdown ──────────────────────────────
  const capturePhoto = useCallback(() => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        // Capture the frame
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          if (step === 2) {
            setFrontImage(dataUrl);
            setTimeout(() => setStep(3), 600);
          } else if (step === 3) {
            setSideImage(dataUrl);
            setTimeout(() => setStep(4), 600);
          }
        }
      }
    }, 1000);
  }, [step]);

  // ─── File upload → data URL ───────────────────────────────────
  const handleFileToDataUrl = useCallback((file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // ─── MediaPipe Processing (Step 4) ─────────────────────────────
  useEffect(() => {
    if (step !== 4) return;
    setProcessing(true);

    const processImages = async () => {
      try {
        // Load MediaPipe Pose via CDN
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: false,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Process front image — returns { landmarks, width, height }
        const frontResult = await detectPose(pose, frontImage);
        // Process side image
        const sideResult = await detectPose(pose, sideImage);
        const frontLandmarks = frontResult ? frontResult.landmarks : null;
        const sideLandmarks = sideResult ? sideResult.landmarks : null;

        if (!frontLandmarks) {
          throw new Error(' pose_not_detected');
        }

        // Image quality validation
        const validationErrors = [];
        const imgWidth = frontResult.width;
        const imgHeight = frontResult.height;
        const pixelCount = imgWidth * imgHeight;
        
        // Check resolution (need at least 200x300 for reliable detection)
        if (imgWidth < 200 || imgHeight < 300) {
          validationErrors.push('resolution_too_low');
        }
        
        // Check if body is too small in frame (shoulder span should be > 15% of image width)
        const land_lShoulder = frontResult.landmarks[POSE.LEFT_SHOULDER];
        const land_rShoulder = frontResult.landmarks[POSE.RIGHT_SHOULDER];
        const shoulderSpanPx = Math.abs(land_rShoulder.x - land_lShoulder.x) * imgWidth;
        const shoulderRatio = shoulderSpanPx / imgWidth;
        
        if (shoulderRatio < 0.15) {
          validationErrors.push('body_too_small');
        }
        
        // Check for proper lighting (brightness check)
        const brightness = await checkImageBrightness(frontImage);
        if (brightness < 50) {
          validationErrors.push('too_dark');
        } else if (brightness > 230) {
          validationErrors.push('too_bright');
        }

        if (validationErrors.length > 0) {
          const errorMessages = {
            'resolution_too_low': 'Image resolution is too low. Please use a higher quality photo (at least 200x300 pixels).',
            'body_too_small': 'Your body appears too small in the photo. Please stand closer to the camera.',
            'too_dark': 'Photo is too dark. Please use better lighting.',
            'too_bright': 'Photo is too bright/overexposed. Please reduce lighting.',
          };
          throw new Error(validationErrors.map(e => errorMessages[e]).join('\n'));
        }

        const requiredFront = [
          POSE.NOSE, POSE.LEFT_SHOULDER, POSE.RIGHT_SHOULDER, 
          POSE.LEFT_HIP, POSE.RIGHT_HIP, POSE.LEFT_ANKLE, POSE.RIGHT_ANKLE
        ];
        for (let p of requiredFront) {
          if (!frontLandmarks[p] || frontLandmarks[p].visibility < 0.65) {
            throw new Error('Please ensure your full body (head to toe) gets clearly captured in the front photo.');
          }
        }

        if (sideLandmarks) {
          const sideIsVisible = (p) => sideLandmarks[p] && sideLandmarks[p].visibility > 0.60;
          const hasShoulder = sideIsVisible(POSE.LEFT_SHOULDER) || sideIsVisible(POSE.RIGHT_SHOULDER);
          const hasHip = sideIsVisible(POSE.LEFT_HIP) || sideIsVisible(POSE.RIGHT_HIP);
          const hasAnkle = sideIsVisible(POSE.LEFT_ANKLE) || sideIsVisible(POSE.RIGHT_ANKLE);
          
          if (!hasShoulder || !hasHip || !hasAnkle) {
            throw new Error('Please ensure your full body gets clearly captured in the side photo.');
          }
        }

        const heightCm = parseFloat(height);
        const weightKg = parseFloat(weight);

        // Use robust measurement calculation
        let measurements;
        try {
          measurements = calculateMeasurements(
            frontLandmarks,
            sideLandmarks,
            frontResult,
            sideResult,
            heightCm,
            weightKg,
            gender
          );
        } catch (calcError) {
          if (calcError.message === 'full_body_required') {
            throw new Error('full_body_required');
          } else if (calcError.message === 'invalid_pose_scale') {
            throw new Error('invalid_pose_scale');
          }
          throw calcError;
        }

        const finalMeasurements = {
          shoulderWidth: measurements.shoulderWidth.toFixed(1),
          chestCircumference: measurements.chestCircumference.toFixed(1),
          waistCircumference: measurements.waistCircumference.toFixed(1),
          hipCircumference: measurements.hipCircumference.toFixed(1),
          inseam: measurements.inseam.toFixed(1),
          bmi: measurements.bmi.toFixed(1),
          tshirtSize: getSize(TSHIRT_SIZES, measurements.chestCircumference),
          pantsSize: getSize(PANTS_SIZES, measurements.waistCircumference),
          formalShirtSize: getSize(SHIRT_SIZES, measurements.chestCircumference),
        };

        setMeasurements(finalMeasurements);

        // Save to database
        try {
          const response = await fetch('/api/size/manual-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              height: height,
              chest: finalMeasurements.chestCircumference,
              shoulder: finalMeasurements.shoulderWidth,
              waist: finalMeasurements.waistCircumference,
              hips: finalMeasurements.hipCircumference,
              weight: weight,
              gender: gender
            })
          });
          if (response.ok) {
            console.log('Size estimate saved to database');
          }
        } catch (e) {
          console.log('Could not save to database:', e);
        }

        setTimeout(() => {
          setProcessing(false);
          setStep(5);
        }, 1500);
      } catch (err) {
        console.error('Processing error:', err);
        let errorMsg = err.message || 'Failed to detect full body pose. Please try again.';
        
        // Map technical errors to user-friendly messages
        if (errorMsg.includes('pose_not_detected') || errorMsg.includes('full_body_required')) {
          errorMsg = 'Could not detect your body in the photo. Please ensure:\n• Full body is visible (head to feet)\n• Good lighting\n• Standing straight facing the camera';
        } else if (errorMsg.includes('invalid_pose_scale')) {
          errorMsg = 'Pose detection scale seems wrong. Please ensure:\n• Full body is visible in the photo\n• You are standing at appropriate distance from camera';
        }
        
        alert(errorMsg);
        setProcessing(false);
        // Go back to photo step (step 2) instead of step 1 so user can retry
        // Keep inputMode so user stays in their selected mode (camera or upload)
        setStep(2);
        setFrontImage(null);
        setSideImage(null);
        
        // If camera mode, restart camera for easy retry
        if (inputMode === 'camera') {
          startCamera();
        }
      }
    };

    processImages();
  }, [step, frontImage, sideImage, height, weight]);

  // ─── Reset ─────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setHeight('');
    setWeight('');
    setGender('');
    setFrontImage(null);
    setSideImage(null);
    setMeasurements(null);
    setCountdown(null);
    setCameraError(null);
    setProcessing(false);
    setInputMode(null);
    setShowModeSelect(false);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 text-gray-800 overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-gradient-bg" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl animate-gradient-bg" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            <span className="gradient-text">Body Measurement</span> Studio
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Powered by AI pose detection — get your measurements and perfect clothing size in under 60 seconds
          </p>
        </div>

        {/* Progress - Hidden as requested */}
        {/* <ProgressBar currentStep={step} /> */}

        {/* Steps Container */}
        <div className="min-h-[500px]">

          {/* ─── STEP 1: Input ─────────────────────────────── */}
          {step === 1 && !showModeSelect && (
            <div className="animate-step-in">
              <div className="max-w-md mx-auto">
                <div className="glass-light rounded-3xl p-8 sm:p-10 shadow-xl">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-purple-500/30">
                      📏
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Enter Your Details</h2>
                    <p className="text-gray-500 text-sm mt-1">We need your height & weight for accurate scaling</p>
                  </div>

                  <div className="space-y-5">
                    {/* Height */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Height</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="e.g. 175"
                          min="100"
                          max="250"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-lg font-medium"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">cm</span>
                      </div>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Weight</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g. 70"
                          min="30"
                          max="250"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-lg font-medium"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
                      </div>
                    </div>
                    
                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Gender</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setGender('male')}
                          className={`py-3 rounded-2xl border-2 font-bold transition-all ${
                            gender === 'male'
                              ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md shadow-purple-500/10'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-purple-200'
                          }`}
                        >
                          👨 Male
                        </button>
                        <button
                          onClick={() => setGender('female')}
                          className={`py-3 rounded-2xl border-2 font-bold transition-all ${
                            gender === 'female'
                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md shadow-pink-500/10'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-pink-200'
                          }`}
                        >
                          👩 Female
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BMI Preview */}
                  {height && weight && (
                    <div className="mt-5 p-4 rounded-2xl bg-purple-50 border border-purple-100 animate-count-up">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Your BMI</span>
                        <span className="text-lg font-bold text-purple-400">
                          {(parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowModeSelect(true)}
                    disabled={!height || !weight || parseFloat(height) < 100 || parseFloat(weight) < 30 || !gender}
                    className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      height && weight && parseFloat(height) >= 100 && parseFloat(weight) >= 30 && gender
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue →
                  </button>
                </div>

                {/* Tips */}
                <div className="mt-6 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-600 mb-3">📌 Tips for best results</h3>
                  <ul className="text-xs text-gray-500 space-y-1.5">
                    <li>• Stand 2–3 meters from the camera</li>
                    <li>• Wear fitted clothing (not baggy)</li>
                    <li>• Ensure full body is visible (head to feet)</li>
                    <li>• Use good lighting — avoid backlight</li>
                    <li>• Arms slightly away from body, stand straight</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ─── MODE SELECT ───────────────────────────────── */}
          {showModeSelect && (
            <div className="animate-step-in">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">How would you like to provide photos?</h2>
                  <p className="text-gray-500 text-sm mt-1">Choose camera capture or upload existing photos</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => { setInputMode('camera'); setShowModeSelect(false); setStep(2); }}
                    className="glass-light rounded-3xl p-8 text-center hover:border-purple-400 border-2 border-transparent transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group cursor-pointer">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">📸</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Camera Capture</h3>
                    <p className="text-gray-500 text-xs">Use your webcam to take front & side photos with guided silhouettes</p>
                  </button>
                  <button onClick={() => { setInputMode('upload'); setShowModeSelect(false); setStep(2); }}
                    className="glass-light rounded-3xl p-8 text-center hover:border-pink-400 border-2 border-transparent transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group cursor-pointer">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">📤</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Upload Photos</h3>
                    <p className="text-gray-500 text-xs">Upload existing full-body photos from your device</p>
                  </button>
                </div>
                <button onClick={() => setShowModeSelect(false)} className="block mx-auto mt-6 text-gray-400 text-sm hover:text-gray-600 transition-colors">← Back</button>
              </div>
            </div>
          )}

          {/* ─── STEP 2 (upload): Upload Photos ────────────────── */}
          {step === 2 && inputMode === 'upload' && (
            <div className="animate-step-in">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-gray-800">Upload Your Photos</h2>
                  <p className="text-gray-500 text-sm mt-1">Front photo required · side photo optional for better accuracy</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2 text-center">Front View <span className="text-red-400 text-xs">*required</span></p>
                    <div onClick={() => frontFileRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${frontImage ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'}`}
                      style={{ aspectRatio: '3/5', minHeight: '350px' }}>
                      {frontImage ? (
                        <img src={frontImage} alt="Front" className="w-full h-full object-contain" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <span className="text-4xl mb-2">📸</span>
                          <span className="text-sm font-medium">Click to upload</span>
                          <span className="text-xs mt-1">Full body photo (head to toe)</span>
                        </div>
                      )}
                    </div>
                    <input ref={frontFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files[0]) handleFileToDataUrl(e.target.files[0], setFrontImage); }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2 text-center">Side View <span className="text-gray-400 text-xs">(optional)</span></p>
                    <div onClick={() => sideFileRef.current?.click()}
                      className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${sideImage ? 'border-pink-400 bg-pink-50' : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/30'}`}
                      style={{ aspectRatio: '3/5', minHeight: '350px' }}>
                      {sideImage ? (
                        <img src={sideImage} alt="Side" className="w-full h-full object-contain" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <span className="text-4xl mb-2">🔄</span>
                          <span className="text-sm font-medium">Click to upload</span>
                          <span className="text-xs mt-1">Full body side photo</span>
                        </div>
                      )}
                    </div>
                    <input ref={sideFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files[0]) handleFileToDataUrl(e.target.files[0], setSideImage); }} />
                  </div>
                </div>
                <button onClick={() => setStep(4)} disabled={!frontImage}
                  className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${frontImage ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Process Measurements →
                </button>
                <p className="text-center text-gray-400 text-xs mt-3">📌 Ensure full body is visible for accurate results</p>
              </div>
            </div>
          )}

          {/* ─── STEP 2 (camera): Front Photo ──────────────────── */}
          {step === 2 && inputMode === 'camera' && (
            <div className="animate-step-in">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-gray-800">Front View Photo</h2>
                  <p className="text-gray-500 text-sm mt-1">Align yourself with the silhouette below</p>
                </div>

                <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-gray-200 shadow-xl" style={{ aspectRatio: '9/16', minHeight: '500px' }}>
                  {/* Live webcam feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Front silhouette overlay */}
                  <FrontSilhouette />

                  {/* Guide arrows and highlights */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Head indicator */}
                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-purple-400 flex items-center justify-center animate-pulse">
                        <span className="text-purple-400 text-xs">👤</span>
                      </div>
                      <div className="w-0.5 h-6 bg-gradient-to-b from-purple-400 to-transparent"></div>
                    </div>
                    {/* Shoulder indicator */}
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-500/80 rounded-full text-white text-xs font-medium">Shoulders here</div>
                    </div>
                    {/* Hip indicator */}
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <div className="px-3 py-1 bg-pink-500/80 rounded-full text-white text-xs font-medium">Hips here</div>
                    </div>
                    {/* Feet indicator */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-gradient-to-t from-pink-400 to-transparent"></div>
                      <div className="px-3 py-1 bg-pink-500/80 rounded-full text-white text-xs font-medium">Feet here</div>
                    </div>
                  </div>

                  {/* Countdown overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
                      <div key={countdown} className="animate-countdown">
                        <span className="text-8xl font-black text-white drop-shadow-2xl">{countdown}</span>
                      </div>
                    </div>
                  )}

                  {/* Captured image preview flash */}
                  {frontImage && (
                    <div className="absolute inset-0 z-30 bg-white/20 flex items-center justify-center animate-count-up">
                      <div className="text-4xl">✅</div>
                    </div>
                  )}

                  {/* Camera error */}
                  {cameraError && (
                    <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-red-400 text-sm">{cameraError}</p>
                        <button onClick={startCamera} className="mt-4 px-5 py-2 bg-purple-600 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Capture button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={capturePhoto}
                    disabled={countdown !== null || cameraError}
                    className={`group relative w-20 h-20 rounded-full transition-all duration-300 ${
                      countdown !== null ? 'opacity-50 cursor-not-allowed' :
                      'hover:scale-110 active:scale-95'
                    }`}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-process-pulse" />
                    <div className="absolute inset-2 rounded-full bg-white/90 group-hover:bg-white transition-colors" />
                    <div className="absolute inset-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                <p className="text-center text-gray-400 text-xs mt-2">Tap to capture (3s countdown)</p>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Side Photo ────────────────────────── */}
          {step === 3 && inputMode === 'camera' && (
            <div className="animate-step-in">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-gray-800">Side View Photo</h2>
                  <p className="text-gray-500 text-sm mt-1">Turn 90° and stand straight</p>
                </div>

                <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-gray-200 shadow-xl" style={{ aspectRatio: '9/16', minHeight: '500px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Side silhouette overlay */}
                  <SideSilhouette />

                  {/* Guide arrows and highlights */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Turn indicator */}
                    <div className="absolute top-[30%] right-[5%] flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border-2 border-pink-400 flex items-center justify-center animate-bounce">
                        <span className="text-pink-400">↻</span>
                      </div>
                      <div className="text-pink-400 text-xs font-medium mt-1">Turn 90°</div>
                    </div>
                    {/* Body outline indicator */}
                    <div className="absolute top-[25%] left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <div className="px-3 py-1 bg-pink-500/80 rounded-full text-white text-xs font-medium">Body profile here</div>
                    </div>
                    {/* Feet indicator */}
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-gradient-to-t from-pink-400 to-transparent"></div>
                      <div className="px-3 py-1 bg-pink-500/80 rounded-full text-white text-xs font-medium">Feet together</div>
                    </div>
                  </div>

                  {/* Countdown */}
                  {countdown !== null && (
                    <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
                      <div key={countdown} className="animate-countdown">
                        <span className="text-8xl font-black text-white drop-shadow-2xl">{countdown}</span>
                      </div>
                    </div>
                  )}

                  {sideImage && (
                    <div className="absolute inset-0 z-30 bg-white/20 flex items-center justify-center animate-count-up">
                      <div className="text-4xl">✅</div>
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-red-400 text-sm">{cameraError}</p>
                        <button onClick={startCamera} className="mt-4 px-5 py-2 bg-purple-600 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={capturePhoto}
                    disabled={countdown !== null || cameraError}
                    className={`group relative w-20 h-20 rounded-full transition-all duration-300 ${
                      countdown !== null ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                    }`}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-process-pulse" />
                    <div className="absolute inset-2 rounded-full bg-white/90 group-hover:bg-white transition-colors" />
                    <div className="absolute inset-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                <p className="text-center text-gray-400 text-xs mt-2">Tap to capture (3s countdown)</p>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Processing ──────────────────────────── */}
          {step === 4 && processing && (
            <div className="animate-step-in">
              <div className="max-w-md mx-auto text-center py-16">
                {/* Spinner */}
                <div className="relative w-28 h-28 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-process-spin" />
                  <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-purple-400 border-l-pink-400 animate-process-spin" style={{ animationDirection: 'reverse', animationDuration: '1.8s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-process-pulse">🧍</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-gray-800">Analyzing Your Photos</h2>
                <p className="text-gray-500 text-sm mb-6">Detecting body landmarks & calculating measurements</p>

                {/* Animated dots */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 dot-bounce-1" />
                  <div className="w-3 h-3 rounded-full bg-pink-500 dot-bounce-2" />
                  <div className="w-3 h-3 rounded-full bg-purple-400 dot-bounce-3" />
                </div>

                {/* Captured previews */}
                <div className="flex justify-center gap-4 mt-10">
                  {frontImage && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-gray-200 opacity-60">
                      <img src={frontImage} alt="Front" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    </div>
                  )}
                  {sideImage && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-gray-200 opacity-60">
                      <img src={sideImage} alt="Side" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 5: Results ──────────────────────────────── */}
          {step === 5 && measurements && (
            <div className="animate-step-in">
              <div className="max-w-3xl mx-auto">
                {/* Fallback notice */}
                {measurements.fallback && (
                  <div className="mb-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm text-center animate-result-reveal">
                    ⚠️ Pose detection wasn't available — results are estimated from BMI & height. For best accuracy, try again with good lighting and full body visible.
                  </div>
                )}

                {/* BMI Badge */}
                <div className="text-center mb-8 animate-result-reveal">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-purple-50 border border-purple-100">
                    <span className="text-gray-500 text-sm">BMI</span>
                    <span className="text-2xl font-black text-purple-400">{measurements.bmi}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                      {parseFloat(measurements.bmi) < 18.5 ? 'Underweight' :
                       parseFloat(measurements.bmi) < 25 ? 'Normal' :
                       parseFloat(measurements.bmi) < 30 ? 'Overweight' : 'Obese'}
                    </span>
                  </div>
                </div>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Measurements Table */}
                  <div className="glass-light rounded-3xl p-6 sm:p-8 shadow-lg animate-result-reveal result-delay-1">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">📏</span>
                      Your Measurements
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Shoulder Width', value: measurements.shoulderWidth, color: 'from-purple-500 to-blue-500', max: 55 },
                        { label: 'Chest Circumference', value: measurements.chestCircumference, color: 'from-pink-500 to-purple-500', max: 130 },
                        { label: 'Waist Circumference', value: measurements.waistCircumference, color: 'from-orange-500 to-pink-500', max: 110 },
                        { label: 'Hip Circumference', value: measurements.hipCircumference, color: 'from-blue-500 to-purple-500', max: 130 },
                        { label: 'Inseam Length', value: measurements.inseam, color: 'from-green-500 to-teal-500', max: 95 },
                      ].map((item, i) => (
                        <div key={item.label} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{item.label}</span>
                            <span className="text-sm font-bold font-mono text-gray-800">{item.value} <span className="text-gray-400 font-normal">cm</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${item.color} animate-bar-fill`}
                              style={{ width: `${Math.min(100, (parseFloat(item.value) / item.max) * 100)}%`, animationDelay: `${i * 0.15}s` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size Recommendations */}
                  <div className="glass-light rounded-3xl p-6 sm:p-8 shadow-lg animate-result-reveal result-delay-2">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-sm">👕</span>
                      Recommended Sizes
                    </h3>

                    <div className="space-y-4">
                      {/* T-Shirt */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">T-Shirt / Top</p>
                            <p className="text-gray-500 text-xs mt-0.5">Based on chest: {measurements.chestCircumference} cm</p>
                          </div>
                          <div className="text-3xl font-black text-purple-400">{measurements.tshirtSize}</div>
                        </div>
                      </div>

                      {/* Pants */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-pink-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Pants / Trousers</p>
                            <p className="text-gray-500 text-xs mt-0.5">Based on waist: {measurements.waistCircumference} cm</p>
                          </div>
                          <div className="text-3xl font-black text-pink-400">{measurements.pantsSize}</div>
                        </div>
                      </div>

                      {/* Formal Shirt (Men Only) */}
                      {gender === 'male' && (
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider">Formal Shirt</p>
                              <p className="text-gray-500 text-xs mt-0.5">Based on chest: {measurements.chestCircumference} cm</p>
                            </div>
                            <div className="text-3xl font-black text-blue-400">{measurements.formalShirtSize}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Size chart reference */}
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Size Chart Reference (Chest — T-shirts)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {TSHIRT_SIZES.map((s) => (
                          <span
                            key={s.size}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-medium ${
                              measurements.tshirtSize === s.size
                                ? 'bg-purple-100 border-purple-300 text-purple-600'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                          >
                            {s.size} {s.max < 999 ? `(<${s.max})` : `(>${s.min})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Captured photos preview */}
                <div className="mt-6 flex justify-center gap-4 animate-result-reveal result-delay-4">
                  {frontImage && (
                    <div className="relative group">
                      <div className="w-28 h-36 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                        <img src={frontImage} alt="Front view" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 whitespace-nowrap">Front</span>
                    </div>
                  )}
                  {sideImage && (
                    <div className="relative group">
                      <div className="w-28 h-36 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                        <img src={sideImage} alt="Side view" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 whitespace-nowrap">Side</span>
                    </div>
                  )}
                </div>

                {/* Measure again */}
                <div className="text-center mt-10 animate-result-reveal result-delay-5">
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    🔄 Measure Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Utility: Load external script ──────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Don't load twice
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Utility: Run MediaPipe Pose on a dataURL image ─────────────────
// Returns { landmarks, width, height } with ACTUAL image dimensions
function detectPose(pose, dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const actualWidth = img.naturalWidth || img.width;
      const actualHeight = img.naturalHeight || img.height;
      console.log('[detectPose] Image loaded:', actualWidth, '×', actualHeight);

      let resolved = false;
      pose.onResults((results) => {
        if (resolved) return;
        resolved = true;
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          resolve({
            landmarks: results.poseLandmarks,
            width: actualWidth,
            height: actualHeight,
          });
        } else {
          resolve(null);
        }
      });
      pose.send({ image: img }).catch(() => resolve(null));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

// ─── Utility: Check image brightness ───────────────────────────────
function checkImageBrightness(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Sample at lower res for performance
      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Convert RGB to luminance
        totalBrightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      }
      const avgBrightness = totalBrightness / (data.length / 4);
      resolve(avgBrightness);
    };
    img.onerror = () => resolve(128); // Default medium brightness
    img.src = dataUrl;
  });
}
