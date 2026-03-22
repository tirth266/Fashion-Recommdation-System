// src/pages/SmartSizePage.jsx - Main Smart Size Recommendation Page
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraScanner from '../components/SmartSize/CameraScanner';
import MeasurementResult from '../components/SmartSize/MeasurementResult';
import SizeRecommendation from '../components/SmartSize/SizeRecommendation';
import RecommendedProducts from '../components/SmartSize/RecommendedProducts';

// MediaPipe Pose landmark indices
const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Size chart based on chest circumference (cm)
const SIZE_CHART = [
  { size: 'XS', min: 0, max: 88 },
  { size: 'S', min: 88, max: 96 },
  { size: 'M', min: 96, max: 104 },
  { size: 'L', min: 104, max: 112 },
  { size: 'XL', min: 112, max: 120 },
  { size: 'XXL', min: 120, max: 999 },
];

const SmartSizePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('intro'); // intro, scanning, analyzing, results
  const [measurements, setMeasurements] = useState(null);
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');

  // Calculate measurements from pose landmarks
  const calculateMeasurements = useCallback((landmarks) => {
    if (!landmarks || landmarks.length < 33) return null;

    const getLandmark = (index) => landmarks[index];
    
    // Calculate distances between landmarks (in pixel space, then estimate cm)
    const distance = (a, b) => {
      return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    };

    // Get key points
    const leftShoulder = getLandmark(LANDMARKS.LEFT_SHOULDER);
    const rightShoulder = getLandmark(LANDMARKS.RIGHT_SHOULDER);
    const leftHip = getLandmark(LANDMARKS.LEFT_HIP);
    const rightHip = getLandmark(LANDMARKS.RIGHT_HIP);
    const leftAnkle = getLandmark(LANDMARKS.LEFT_ANKLE);
    const rightAnkle = getLandmark(LANDMARKS.RIGHT_ANKLE);

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return null;
    }

    // Estimate measurements (these are approximations)
    // Note: In a real application, you'd need calibration or known reference
    const shoulderWidthPx = distance(leftShoulder, rightShoulder);
    const hipWidthPx = distance(leftHip, rightHip);
    const bodyHeightPx = distance(getLandmark(LANDMARKS.NOSE), 
                                   (leftAnkle.y < rightAnkle.y ? leftAnkle : rightAnkle));

    // Convert to approximate cm (using average human proportions)
    // This is a simplified estimation - real implementation would need more sophisticated calibration
    const avgShoulderCm = 45; // Average shoulder width in cm
    const scaleFactor = avgShoulderCm / shoulderWidthPx;

    const estimatedMeasurements = {
      height: bodyHeightPx * scaleFactor,
      shoulderWidth: shoulderWidthPx * scaleFactor,
      chestWidth: (shoulderWidthPx * 1.5) * scaleFactor,
      waist: (hipWidthPx * 0.9) * scaleFactor,
      hip: hipWidthPx * scaleFactor,
    };

    return estimatedMeasurements;
  }, []);

  // Determine size from measurements
  const determineSize = useCallback((measurements) => {
    if (!measurements || !measurements.chestWidth) return null;

    const chestCm = measurements.chestWidth;
    const sizeMatch = SIZE_CHART.find(s => chestCm >= s.min && chestCm < s.max);
    
    return sizeMatch ? sizeMatch.size : 'M';
  }, []);

  // Handle pose detection
  const handlePoseDetected = useCallback((landmarks) => {
    const calculatedMeasurements = calculateMeasurements(landmarks);
    
    if (calculatedMeasurements) {
      setMeasurements(calculatedMeasurements);
      
      // Auto-detect size when we have good measurements
      const size = determineSize(calculatedMeasurements);
      if (size) {
        setRecommendedSize(size);
        setConfidence(0.85); // Default confidence for demo
      }
    }
  }, [calculateMeasurements, determineSize]);

  // Start scanning
  const handleStartScanning = () => {
    setStep('scanning');
    setError('');
  };

  // Retake measurements
  const handleRetake = () => {
    setStep('scanning');
    setMeasurements(null);
    setRecommendedSize(null);
    setError('');
  };

  // Handle camera error
  const handleError = (err) => {
    console.error('Camera/Pose error:', err);
    setError('Unable to detect pose. Please ensure good lighting and full body visibility.');
    setStep('intro');
  };

  // Mock products for demonstration
  const mockProducts = [
    { id: 1, name: 'Classic Cotton T-Shirt', brand: 'ComfortWear', price: 29.99, image_url: '/api/placeholder/400/400', size_availability: ['S', 'M', 'L', 'XL'] },
    { id: 2, name: 'Slim Fit Jeans', brand: 'DenimCo', price: 59.99, image_url: '/api/placeholder/400/400', size_availability: ['M', 'L', 'XL'] },
    { id: 3, name: 'Casual Button-Down Shirt', brand: 'StyleHub', price: 45.00, image_url: '/api/placeholder/400/400', size_availability: ['S', 'M', 'L'] },
    { id: 4, name: 'Athletic Hoodie', brand: 'ActiveFit', price: 55.00, image_url: '/api/placeholder/400/400', size_availability: ['M', 'L', 'XL', 'XXL'] },
  ];

  const filteredProducts = recommendedSize 
    ? mockProducts.filter(p => p.size_availability?.includes(recommendedSize))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          AI Body Measurement
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Get accurate clothing size recommendations using your camera
        </p>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Our AI-powered system uses advanced pose detection to analyze your body measurements 
          and recommend the perfect clothing size for a comfortable fit.
        </p>
      </div>

      {/* Step Progress Indicator */}
      {step !== 'intro' && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {['Camera', 'Detect', 'Measure', 'Recommend'].map((label, index) => {
              const stepNumber = index + 1;
              const isActive = (step === 'scanning' && index === 0) ||
                              (step === 'analyzing' && index <= 1) ||
                              (step === 'results' && index <= 3);
              
              return (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white scale-110' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {isActive ? '✓' : stepNumber}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 md:w-16 h-1 mx-4 ${
                      isActive ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Intro Step */}
        {step === 'intro' && (
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 max-w-3xl mx-auto">
              <div className="mb-8">
                <svg className="w-24 h-24 mx-auto text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Find Your Perfect Size?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Follow these simple steps:
                </p>
                <ul className="text-left space-y-3 mb-8 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-semibold mr-3">1</span>
                    <span>Stand in a well-lit area with your full body visible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-semibold mr-3">2</span>
                    <span>Position yourself so the camera can see your entire body</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-semibold mr-3">3</span>
                    <span>Stay still while our AI analyzes your body measurements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-semibold mr-3">4</span>
                    <span>Get instant size recommendations and product suggestions</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartScanning}
                className="inline-flex items-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Get Recommendation
              </button>

              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scanning Step */}
        {step === 'scanning' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Position Your Body in the Camera Frame
            </h2>
            <CameraScanner
              onPoseDetected={handlePoseDetected}
              onError={handleError}
            />
            
            {measurements && recommendedSize && (
              <div className="mt-8">
                <button
                  onClick={() => setStep('results')}
                  className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-all"
                >
                  View Results
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && measurements && recommendedSize && (
          <div className="space-y-12">
            {/* Measurements */}
            <MeasurementResult
              measurements={measurements}
              onRetake={handleRetake}
            />

            {/* Size Recommendation */}
            <SizeRecommendation
              size={recommendedSize}
              measurements={measurements}
              confidence={confidence}
            />

            {/* Recommended Products */}
            <RecommendedProducts
              products={filteredProducts}
              size={recommendedSize}
            />

            {/* Action Buttons */}
            <div className="text-center mt-8">
              <button
                onClick={() => setStep('intro')}
                className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors mr-4"
              >
                Start Over
              </button>
              <button
                onClick={() => navigate('/recommendations')}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Browse All Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSizePage;
