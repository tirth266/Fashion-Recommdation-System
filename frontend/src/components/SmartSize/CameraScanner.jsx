// src/components/SmartSize/CameraScanner.jsx
import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_LANDMARKS } from '@mediapipe/pose';

const CameraScanner = ({ onPoseDetected, onError }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [poseReady, setPoseReady] = useState(false);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!canvasRef.current || !webcamRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame
      ctx.drawImage(
        results.image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (results.poseLandmarks) {
        // Draw landmarks and connectors
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2,
        });
        drawLandmarks(ctx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        });

        // Send landmarks to parent component
        onPoseDetected(results.poseLandmarks);
      }
      
      ctx.restore();
    });

    window.pose = pose;
    setPoseReady(true);

    return () => {
      window.pose = null;
    };
  }, [onPoseDetected]);

  // Handle webcam load
  const handleWebcamLoad = useCallback(() => {
    setLoading(false);
    startDetection();
  }, []);

  // Start pose detection
  const startDetection = useCallback(async () => {
    if (!window.pose || !webcamRef.current) return;

    try {
      const video = webcamRef.current.video;
      if (video) {
        await window.pose.send({ image: video });
      }
    } catch (error) {
      console.error('Pose detection error:', error);
      onError?.(error);
    }
  }, [onError]);

  // Continuous detection loop
  useEffect(() => {
    let animationFrameId;

    const detect = async () => {
      if (poseReady && webcamRef.current?.video) {
        await startDetection();
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [poseReady, startDetection]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {loading && (
        <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Starting camera...</p>
          </div>
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden shadow-xl" style={{ display: loading ? 'none' : 'block' }}>
        <Webcam
          ref={webcamRef}
          onUserMedia={handleWebcamLoad}
          onUserMediaError={onError}
          audio={false}
          videoConstraints={{
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
          className="w-full h-auto"
        />
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      {!loading && (
        <div className="mt-4 text-center">
          <p className="text-purple-300 text-sm">
            Position your body fully in the frame for accurate measurements
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraScanner;
