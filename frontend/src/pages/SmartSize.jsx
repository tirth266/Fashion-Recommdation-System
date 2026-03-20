// src/pages/SmartSize.jsx — Body Measurement Wizard with MediaPipe Pose
import { useState, useRef, useEffect, useCallback } from 'react';

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
  { size: '28', min: 0, max: 73 },
  { size: '30', min: 73, max: 78 },
  { size: '32', min: 78, max: 83 },
  { size: '34', min: 83, max: 88 },
  { size: '36', min: 88, max: 93 },
  { size: '38', min: 93, max: 98 },
  { size: '40', min: 98, max: 999 },
];

const SHIRT_SIZES = [
  { size: 'S (14.5–15")', min: 0, max: 102 },
  { size: 'M (15.25–15.75")', min: 102, max: 108 },
  { size: 'L (16–16.5")', min: 108, max: 114 },
  { size: 'XL (17–17.5")', min: 114, max: 120 },
  { size: 'XXL (17.75–18")', min: 120, max: 128 },
  { size: '3XL (18.5–18.75")', min: 128, max: 999 },
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
// where a = width/2, b = (depth * 1.3)/2
function ellipseCircumference(width, depth) {
  const a = width / 2;
  const b = (depth * 1.3) / 2; // 🔥 depth correction
  return Math.PI * Math.sqrt(2 * (a * a + b * b));
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
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step, i) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2
                ${isDone ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30' :
                  isActive ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20 animate-process-pulse' :
                  'bg-white/5 border-white/10 text-white/30'}`}>
                {isDone ? '✓' : step.icon}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium transition-colors duration-300 ${isActive ? 'text-purple-400' : isDone ? 'text-purple-300' : 'text-white/20'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Track */}
      <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
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
  const [frontImage, setFrontImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
    if (step === 2 || step === 3) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, startCamera, stopCamera]);

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
          throw new Error('Could not detect pose in front photo. Please try again with better lighting and full body visible.');
        }

        const heightCm = parseFloat(height);
        const weightKg = parseFloat(weight);
        const bmi = weightKg / ((heightCm / 100) ** 2);

        // Calculate measurements from front image
        const fl = frontLandmarks; // normalized 0-1 coords
        // Use ACTUAL image dimensions from the captured photo, not hardcoded values
        const imgWidth = frontResult.width;
        const imgHeight = frontResult.height;

        console.log('=== Measurement Debug ===');
        console.log('Actual image dimensions:', imgWidth, '×', imgHeight);

        // Step 1: Convert normalized landmarks → pixel coordinates
        const lShoulder = { x: Math.round(fl[POSE.LEFT_SHOULDER].x * imgWidth), y: Math.round(fl[POSE.LEFT_SHOULDER].y * imgHeight) };
        const rShoulder = { x: Math.round(fl[POSE.RIGHT_SHOULDER].x * imgWidth), y: Math.round(fl[POSE.RIGHT_SHOULDER].y * imgHeight) };
        const lHip = { x: Math.round(fl[POSE.LEFT_HIP].x * imgWidth), y: Math.round(fl[POSE.LEFT_HIP].y * imgHeight) };
        const rHip = { x: Math.round(fl[POSE.RIGHT_HIP].x * imgWidth), y: Math.round(fl[POSE.RIGHT_HIP].y * imgHeight) };
        const lAnkle = { x: Math.round(fl[POSE.LEFT_ANKLE].x * imgWidth), y: Math.round(fl[POSE.LEFT_ANKLE].y * imgHeight) };
        const rAnkle = { x: Math.round(fl[POSE.RIGHT_ANKLE].x * imgWidth), y: Math.round(fl[POSE.RIGHT_ANKLE].y * imgHeight) };

        // Debug: show raw normalized → pixel conversion
        console.log('Raw L_SHOULDER normalized:', fl[POSE.LEFT_SHOULDER].x.toFixed(4), fl[POSE.LEFT_SHOULDER].y.toFixed(4));
        console.log('Raw R_SHOULDER normalized:', fl[POSE.RIGHT_SHOULDER].x.toFixed(4), fl[POSE.RIGHT_SHOULDER].y.toFixed(4));
        console.log('L_SHOULDER px:', lShoulder.x, lShoulder.y);
        console.log('R_SHOULDER px:', rShoulder.x, rShoulder.y);

        // Step 2: Compute pixel distances
        const shoulderPx = dist(lShoulder, rShoulder);
        const hipPx = dist(lHip, rHip);
        const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
        const ankleY = (lAnkle.y + rAnkle.y) / 2;
        const heightPx = Math.abs(ankleY - shoulderMidY) * 1.3; // shoulder→ankle × 1.3 ≈ full height

        console.log('Shoulder px distance:', shoulderPx.toFixed(1));
        console.log('Hip px distance:', hipPx.toFixed(1));
        console.log('Height px (shoulder_mid→ankle×1.3):', heightPx.toFixed(1));

        // Step 3: Scale factor — convert pixel distances to cm
        const scaleFactor = heightCm / heightPx;
        console.log('Scale factor (cm/px):', scaleFactor.toFixed(4));

        // Step 4: Width in cm (front-view only, NOT circumference yet)
        let shoulderWidth = shoulderPx * scaleFactor;
        let hipWidth = hipPx * scaleFactor;
        const inseamPx = dist(lHip, lAnkle);
        let inseam = inseamPx * scaleFactor;

        console.log('Shoulder width cm:', shoulderWidth.toFixed(1));
        console.log('Hip width cm:', hipWidth.toFixed(1));

        // Step 5: Convert front-view width → full body circumference
        // Shoulder width ≠ chest width (chest is bigger than shoulder span)
        // So we use chest expansion factor ×2.8 and waist ×2.6
        // chest_cm = shoulder_px × scale × 2.8
        // waist_cm = hip_px × scale × 2.6
        let chestCirc = shoulderWidth * 2.8;
        let waistCirc = hipWidth * 2.6;
        let hipCirc = hipWidth * 2.8;

        console.log('Chest circumference (width×2.8):', chestCirc.toFixed(1), 'cm');
        console.log('Waist circumference (width×2.6):', waistCirc.toFixed(1), 'cm');
        console.log('Hip circumference (width×2.8):', hipCirc.toFixed(1), 'cm');

        // Side image: use correct formula (frontWidth + sideDepth) × 2
        // This gives true circumference from two perpendicular views
        if (sideLandmarks) {
          const sl = sideLandmarks;
          const sideW = sideResult.width;
          const sideH = sideResult.height;
          const sLShoulder = { x: Math.round(sl[POSE.LEFT_SHOULDER].x * sideW), y: Math.round(sl[POSE.LEFT_SHOULDER].y * sideH) };
          const sRShoulder = { x: Math.round(sl[POSE.RIGHT_SHOULDER].x * sideW), y: Math.round(sl[POSE.RIGHT_SHOULDER].y * sideH) };
          const sLHip = { x: Math.round(sl[POSE.LEFT_HIP].x * sideW), y: Math.round(sl[POSE.LEFT_HIP].y * sideH) };
          const sRHip = { x: Math.round(sl[POSE.RIGHT_HIP].x * sideW), y: Math.round(sl[POSE.RIGHT_HIP].y * sideH) };

          const sideChestDepth = dist(sLShoulder, sRShoulder) * scaleFactor;
          const sideHipDepth = dist(sLHip, sRHip) * scaleFactor;

          console.log('Side chest depth cm:', sideChestDepth.toFixed(1));
          console.log('Side hip depth cm:', sideHipDepth.toFixed(1));

          // Ellipse circumference: π × √(2 × (a² + b²))
          if (sideChestDepth > 5) {
            chestCirc = ellipseCircumference(shoulderWidth, sideChestDepth);
            console.log('Chest circ (ellipse):', chestCirc.toFixed(1), 'cm');
          }

          if (sideHipDepth > 5) {
            waistCirc = ellipseCircumference(hipWidth, sideHipDepth);
            console.log('Waist circ (ellipse):', waistCirc.toFixed(1), 'cm');
          }

          if (sideHipDepth > 5) {
            hipCirc = ellipseCircumference(hipWidth, sideHipDepth);
            console.log('Hip circ (ellipse):', hipCirc.toFixed(1), 'cm');
          }
        }

        // BMI correction
        let bmiCorrectionChest = 1.0;
        let bmiCorrectionWaist = 1.0;
        if (bmi > 25) {
          const t = Math.min((bmi - 25) / 15, 1);
          bmiCorrectionChest = lerp(1.05, 1.15, t);
          bmiCorrectionWaist = lerp(1.05, 1.18, t);
        } else if (bmi < 18.5) {
          const t = Math.min((18.5 - bmi) / 5, 1);
          bmiCorrectionChest = lerp(0.95, 0.90, t);
          bmiCorrectionWaist = lerp(0.95, 0.88, t);
        }

        chestCirc *= bmiCorrectionChest;
        waistCirc *= bmiCorrectionWaist;
        hipCirc *= bmiCorrectionWaist;

        setMeasurements({
          shoulderWidth: shoulderWidth.toFixed(1),
          chestCircumference: chestCirc.toFixed(1),
          waistCircumference: waistCirc.toFixed(1),
          hipCircumference: hipCirc.toFixed(1),
          inseam: inseam.toFixed(1),
          bmi: bmi.toFixed(1),
          tshirtSize: getSize(TSHIRT_SIZES, chestCirc),
          pantsSize: getSize(PANTS_SIZES, waistCirc),
          formalShirtSize: getSize(SHIRT_SIZES, chestCirc),
        });

        setTimeout(() => {
          setProcessing(false);
          setStep(5);
        }, 1500);
      } catch (err) {
        console.error('Processing error:', err);
        // Fallback: estimate from BMI + height alone
        const heightCm = parseFloat(height);
        const weightKg = parseFloat(weight);
        const bmi = weightKg / ((heightCm / 100) ** 2);

        let chestEst = 80 + (bmi - 18) * 2.0;
        let waistEst = 64 + (bmi - 18) * 2.2;
        let hipEst = 85 + (bmi - 18) * 1.8;
        let shoulderEst = chestEst / 2.4;
        let inseamEst = heightCm * 0.45;

        chestEst = Math.max(75, Math.min(140, chestEst));
        waistEst = Math.max(60, Math.min(120, waistEst));
        hipEst = Math.max(80, Math.min(130, hipEst));
        shoulderEst = Math.max(35, Math.min(55, shoulderEst));

        setMeasurements({
          shoulderWidth: shoulderEst.toFixed(1),
          chestCircumference: chestEst.toFixed(1),
          waistCircumference: waistEst.toFixed(1),
          hipCircumference: hipEst.toFixed(1),
          inseam: inseamEst.toFixed(1),
          bmi: bmi.toFixed(1),
          tshirtSize: getSize(TSHIRT_SIZES, chestEst),
          pantsSize: getSize(PANTS_SIZES, waistEst),
          formalShirtSize: getSize(SHIRT_SIZES, chestEst),
          fallback: true,
        });

        setTimeout(() => {
          setProcessing(false);
          setStep(5);
        }, 2000);
      }
    };

    processImages();
  }, [step, frontImage, sideImage, height, weight]);

  // ─── Reset ─────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setHeight('');
    setWeight('');
    setFrontImage(null);
    setSideImage(null);
    setMeasurements(null);
    setCountdown(null);
    setCameraError(null);
    setProcessing(false);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-gradient-bg" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-gradient-bg" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-gradient-bg" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            <span className="gradient-text">Body Measurement</span> Studio
          </h1>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto">
            Powered by AI pose detection — get your measurements and perfect clothing size in under 60 seconds
          </p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={step} />

        {/* Steps Container */}
        <div className="min-h-[500px]">

          {/* ─── STEP 1: Input ─────────────────────────────── */}
          {step === 1 && (
            <div className="animate-step-in">
              <div className="max-w-md mx-auto">
                <div className="glass-dark rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-900/10">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-purple-500/30">
                      📏
                    </div>
                    <h2 className="text-2xl font-bold">Enter Your Details</h2>
                    <p className="text-white/40 text-sm mt-1">We need your height & weight for accurate scaling</p>
                  </div>

                  <div className="space-y-5">
                    {/* Height */}
                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Height</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="e.g. 175"
                          min="100"
                          max="250"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:bg-white/8 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-lg font-medium"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-medium">cm</span>
                      </div>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Weight</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g. 70"
                          min="30"
                          max="250"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:bg-white/8 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-lg font-medium"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 font-medium">kg</span>
                      </div>
                    </div>
                  </div>

                  {/* BMI Preview */}
                  {height && weight && (
                    <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/5 animate-count-up">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-sm">Your BMI</span>
                        <span className="text-lg font-bold text-purple-400">
                          {(parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    disabled={!height || !weight || parseFloat(height) < 100 || parseFloat(weight) < 30}
                    className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      height && weight && parseFloat(height) >= 100 && parseFloat(weight) >= 30
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    Continue to Camera →
                  </button>
                </div>

                {/* Tips */}
                <div className="mt-6 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h3 className="text-sm font-bold text-white/60 mb-3">📌 Tips for best results</h3>
                  <ul className="text-xs text-white/30 space-y-1.5">
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

          {/* ─── STEP 2: Front Photo ─────────────────────────── */}
          {step === 2 && (
            <div className="animate-step-in">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold">Front View Photo</h2>
                  <p className="text-white/40 text-sm mt-1">Face the camera, align yourself with the silhouette below</p>
                </div>

                <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-white/10 shadow-2xl shadow-purple-900/20" style={{ aspectRatio: '3/4' }}>
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
                <p className="text-center text-white/30 text-xs mt-2">Tap to capture (3s countdown)</p>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Side Photo ──────────────────────────── */}
          {step === 3 && (
            <div className="animate-step-in">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold">Side View Photo</h2>
                  <p className="text-white/40 text-sm mt-1">Turn sideways (90°), stand straight, arms by your side</p>
                </div>

                <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-white/10 shadow-2xl shadow-pink-900/20" style={{ aspectRatio: '3/4' }}>
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
                <p className="text-center text-white/30 text-xs mt-2">Tap to capture (3s countdown)</p>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Processing ──────────────────────────── */}
          {step === 4 && processing && (
            <div className="animate-step-in">
              <div className="max-w-md mx-auto text-center py-16">
                {/* Spinner */}
                <div className="relative w-28 h-28 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-process-spin" />
                  <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-purple-400 border-l-pink-400 animate-process-spin" style={{ animationDirection: 'reverse', animationDuration: '1.8s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-process-pulse">🧍</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Analyzing Your Photos</h2>
                <p className="text-white/40 text-sm mb-6">Detecting body landmarks & calculating measurements</p>

                {/* Animated dots */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 dot-bounce-1" />
                  <div className="w-3 h-3 rounded-full bg-pink-500 dot-bounce-2" />
                  <div className="w-3 h-3 rounded-full bg-purple-400 dot-bounce-3" />
                </div>

                {/* Captured previews */}
                <div className="flex justify-center gap-4 mt-10">
                  {frontImage && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/10 opacity-60">
                      <img src={frontImage} alt="Front" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    </div>
                  )}
                  {sideImage && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/10 opacity-60">
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
                  <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm text-center animate-result-reveal">
                    ⚠️ Pose detection wasn't available — results are estimated from BMI & height. For best accuracy, try again with good lighting and full body visible.
                  </div>
                )}

                {/* BMI Badge */}
                <div className="text-center mb-8 animate-result-reveal">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                    <span className="text-white/40 text-sm">BMI</span>
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
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 shadow-2xl animate-result-reveal result-delay-1">
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
                            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">{item.label}</span>
                            <span className="text-sm font-bold font-mono text-white">{item.value} <span className="text-white/30 font-normal">cm</span></span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 shadow-2xl animate-result-reveal result-delay-2">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-sm">👕</span>
                      Recommended Sizes
                    </h3>

                    <div className="space-y-4">
                      {/* T-Shirt */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider">T-Shirt / Top</p>
                            <p className="text-white/50 text-xs mt-0.5">Based on chest: {measurements.chestCircumference} cm</p>
                          </div>
                          <div className="text-3xl font-black text-purple-400">{measurements.tshirtSize}</div>
                        </div>
                      </div>

                      {/* Pants */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-pink-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider">Pants / Trousers</p>
                            <p className="text-white/50 text-xs mt-0.5">Based on waist: {measurements.waistCircumference} cm</p>
                          </div>
                          <div className="text-3xl font-black text-pink-400">{measurements.pantsSize}</div>
                        </div>
                      </div>

                      {/* Formal Shirt */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider">Formal Shirt</p>
                            <p className="text-white/50 text-xs mt-0.5">Based on chest: {measurements.chestCircumference} cm</p>
                          </div>
                          <div className="text-3xl font-black text-blue-400">{measurements.formalShirtSize}</div>
                        </div>
                      </div>
                    </div>

                    {/* Size chart reference */}
                    <div className="mt-5 pt-4 border-t border-white/5">
                      <p className="text-[10px] text-white/20 uppercase tracking-wider mb-3">Size Chart Reference (Chest — T-shirts)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {TSHIRT_SIZES.map((s) => (
                          <span
                            key={s.size}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-medium ${
                              measurements.tshirtSize === s.size
                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                : 'bg-white/[0.02] border-white/5 text-white/20'
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
                <div className="mt-6 flex justify-center gap-4 animate-result-reveal result-delay-3">
                  {frontImage && (
                    <div className="relative group">
                      <div className="w-28 h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={frontImage} alt="Front view" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/50 whitespace-nowrap">Front</span>
                    </div>
                  )}
                  {sideImage && (
                    <div className="relative group">
                      <div className="w-28 h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={sideImage} alt="Side view" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/50 whitespace-nowrap">Side</span>
                    </div>
                  )}
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* 📊 COMPREHENSIVE SIZE CHART REFERENCE TABLES           */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="mt-12 animate-result-reveal result-delay-4">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      <span className="gradient-text">Size Chart</span> Reference
                    </h2>
                    <p className="text-white/40 text-sm mt-2">Standard body measurement guides for men & women</p>
                  </div>

                  {/* ─── MEN'S SIZE CHARTS ──────────────────────────── */}
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 border border-white/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">👔</span>
                      <span>Men's Size Chart</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium uppercase tracking-wider">Body Measurements</span>
                    </h3>

                    {/* T-Shirt / Casual Top */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">👕</span>
                        T-Shirt / Casual Top
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                              <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Chest (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Chest (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Shoulder (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Length (cm)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[
                              { sz: 'XS', chest: '80 – 88', chestIn: '31 – 34', shoulder: '42', length: '66' },
                              { sz: 'S', chest: '88 – 96', chestIn: '34 – 38', shoulder: '44', length: '69' },
                              { sz: 'M', chest: '96 – 104', chestIn: '38 – 41', shoulder: '46', length: '72' },
                              { sz: 'L', chest: '104 – 112', chestIn: '41 – 44', shoulder: '48', length: '74' },
                              { sz: 'XL', chest: '112 – 120', chestIn: '44 – 47', shoulder: '50', length: '76' },
                              { sz: 'XXL', chest: '120 – 128', chestIn: '47 – 50', shoulder: '52', length: '78' },
                            ].map((row, i) => (
                              <tr key={row.sz} className={`transition-colors hover:bg-white/[0.03] ${
                                measurements.tshirtSize === row.sz ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                              }`}>
                                <td className="px-4 py-2.5 font-bold text-white/80">{row.sz}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.chest}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.chestIn}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.shoulder}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.length}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Formal Shirt */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs">👔</span>
                        Formal / Dress Shirt
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                              <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Collar (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Chest (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Waist (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Shoulder (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Sleeve (cm)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[
                              { sz: 'S', collar: '37 – 38', chest: '102', waist: '98', shoulder: '44', sleeve: '87' },
                              { sz: 'M', collar: '39 – 40', chest: '108', waist: '104', shoulder: '46', sleeve: '88' },
                              { sz: 'L', collar: '41 – 42', chest: '114', waist: '110', shoulder: '48', sleeve: '89' },
                              { sz: 'XL', collar: '43 – 44', chest: '120', waist: '116', shoulder: '50', sleeve: '90' },
                              { sz: 'XXL', collar: '45 – 46', chest: '126', waist: '122', shoulder: '52', sleeve: '91' },
                              { sz: '3XL', collar: '47 – 48', chest: '132', waist: '128', shoulder: '54', sleeve: '92' },
                            ].map((row) => (
                              <tr key={row.sz} className={`transition-colors hover:bg-white/[0.03] ${
                                measurements.formalShirtSize && measurements.formalShirtSize.startsWith(row.sz) ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                              }`}>
                                <td className="px-4 py-2.5 font-bold text-white/80">{row.sz}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.collar}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.chest}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.waist}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.shoulder}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.sleeve}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Men's Pants / Trousers */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center text-xs">👖</span>
                        Pants / Trousers / Chinos
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-orange-500/10 to-pink-500/10">
                              <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Waist (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Waist (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Hip (cm)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Length (in)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[
                              { sz: '28', waist: '71', waistIn: '28', hip: '89', length: '30' },
                              { sz: '30', waist: '76', waistIn: '30', hip: '94', length: '31' },
                              { sz: '32', waist: '81', waistIn: '32', hip: '99', length: '32' },
                              { sz: '34', waist: '86', waistIn: '34', hip: '104', length: '32' },
                              { sz: '36', waist: '91', waistIn: '36', hip: '109', length: '33' },
                              { sz: '38', waist: '96', waistIn: '38', hip: '114', length: '33' },
                              { sz: '40', waist: '101', waistIn: '40', hip: '119', length: '33' },
                            ].map((row) => (
                              <tr key={row.sz} className={`transition-colors hover:bg-white/[0.03] ${
                                measurements.pantsSize === row.sz ? 'bg-orange-500/10 border-l-2 border-l-orange-500' : ''
                              }`}>
                                <td className="px-4 py-2.5 font-bold text-white/80">{row.sz}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.waist}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.waistIn}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.hip}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.length}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* ─── WOMEN'S SIZE CHARTS ────────────────────────── */}
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 border border-white/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-lg shadow-lg shadow-pink-500/20">👗</span>
                      <span>Women's Size Chart</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 font-medium uppercase tracking-wider">Body Measurements</span>
                    </h3>

                    {/* Women's Top / Dress */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center text-xs">👚</span>
                        Top / Blouse / Dress
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-pink-500/10 to-rose-500/10">
                              <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Bust (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Waist (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Hip (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Shoulder (in)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[
                              { sz: 'XS', bust: '30', waist: '26', hip: '34', shoulder: '13.5' },
                              { sz: 'S', bust: '32', waist: '28', hip: '36', shoulder: '14' },
                              { sz: 'M', bust: '34', waist: '30', hip: '38', shoulder: '14.5' },
                              { sz: 'L', bust: '36', waist: '32', hip: '40', shoulder: '15' },
                              { sz: 'XL', bust: '38', waist: '34', hip: '42', shoulder: '15.5' },
                              { sz: 'XXL', bust: '40', waist: '36', hip: '44', shoulder: '16' },
                              { sz: '3XL', bust: '42', waist: '38', hip: '46', shoulder: '16.5' },
                            ].map((row) => (
                              <tr key={row.sz} className="transition-colors hover:bg-white/[0.03]">
                                <td className="px-4 py-2.5 font-bold text-white/80">{row.sz}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.bust}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.waist}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.hip}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.shoulder}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Women's Pants / Bottom */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-xs">👖</span>
                        Pants / Jeans / Skirt
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-rose-500/10 to-pink-500/10">
                              <th className="px-4 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Waist (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Hip (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Knee Length (in)</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Full Length (in)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[
                              { sz: 'XS (26)', waist: '26', hip: '34', knee: '35.5', full: '53' },
                              { sz: 'S (28)', waist: '28', hip: '36', knee: '35.5', full: '53' },
                              { sz: 'M (30)', waist: '30', hip: '38', knee: '36', full: '54' },
                              { sz: 'L (32)', waist: '32', hip: '40', knee: '36', full: '54' },
                              { sz: 'XL (34)', waist: '34', hip: '42', knee: '36.5', full: '55' },
                              { sz: 'XXL (36)', waist: '36', hip: '44', knee: '36.5', full: '55' },
                              { sz: '3XL (38)', waist: '38', hip: '46', knee: '37', full: '55.5' },
                            ].map((row) => (
                              <tr key={row.sz} className="transition-colors hover:bg-white/[0.03]">
                                <td className="px-4 py-2.5 font-bold text-white/80">{row.sz}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.waist}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.hip}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.knee}</td>
                                <td className="px-4 py-2.5 text-center text-white/50">{row.full}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* How to Measure Guide */}
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-lg shadow-lg shadow-green-500/20">📐</span>
                      <span>How to Measure</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { part: 'Chest / Bust', desc: 'Measure around the fullest part of the chest, keeping the tape horizontal under the arms and across the shoulder blades.' },
                        { part: 'Waist', desc: 'Measure around the natural waistline (narrowest part of the torso), keeping the tape snug but not tight.' },
                        { part: 'Hip', desc: 'Stand with feet together and measure around the fullest part of the hips, approximately 20 cm below the waist.' },
                        { part: 'Shoulder', desc: 'Measure from the edge of one shoulder to the other across the back, following the natural shoulder line.' },
                      ].map((item) => (
                        <div key={item.part} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-green-500/20 transition-colors">
                          <p className="text-sm font-bold text-green-400 mb-1">{item.part}</p>
                          <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Measure again */}
                <div className="text-center mt-10 animate-result-reveal result-delay-4">
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    🔄 Measure Again
                  </button>
                  <p className="text-white/20 text-xs mt-3">Results are estimates — try multiple times for best accuracy</p>
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
