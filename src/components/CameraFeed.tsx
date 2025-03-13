import Webcam from "react-webcam";
import { Pose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { useRef, useEffect, useState } from "react";
import { ExerciseType } from "../utils/exerciseRules";

const LANDMARK_INDICES = {
  LEFT_HIP: 23,
  LEFT_KNEE: 25,
  LEFT_ANKLE: 27,
  RIGHT_HIP: 24,
  RIGHT_KNEE: 26,
  RIGHT_ANKLE: 28,
};

const exerciseOptions = [
  { value: ExerciseType.SQUAT, label: "Squats" },
  { value: ExerciseType.PUSHUP, label: "Push-ups" },
  { value: ExerciseType.DEADLIFT, label: "Deadlifts" }
];

const CameraFeed = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(ExerciseType.SQUAT);
  const [angles, setAngles] = useState({ left: 0, right: 0 });
  const [feedback, setFeedback] = useState<string>("Get ready to start");

  const calculateAngle = (a: number[], b: number[], c: number[]) => {
    const ab = [a[0] - b[0], a[1] - b[1]];
    const cb = [c[0] - b[0], c[1] - b[1]];
    const dot = ab[0] * cb[0] + ab[1] * cb[1];
    const magAB = Math.sqrt(ab[0] ** 2 + ab[1] ** 2);
    const magCB = Math.sqrt(cb[0] ** 2 + cb[1] ** 2);
    return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
  };

  const getFeedback = (angle: number): [string, string] => {
    if (selectedExercise === ExerciseType.SQUAT) {
      if (angle < 90) return ["Perfect squat depth! 🟢", "#4CAF50"];
      if (angle > 120) return ["Go lower! 🔴", "#FF5252"];
      return ["Keep going... 🟡", "#FFC107"];
    }
    if (selectedExercise === ExerciseType.PUSHUP) {
      if (angle < 90) return ["Push up! 🟡", "#FFC107"];
      if (angle > 160) return ["Lower your body! 🔴", "#FF5252"];
      return ["Good form! 🟢", "#4CAF50"];
    }
    // Deadlift
    if (angle < 150) return ["Keep your back straight! 🔴", "#FF5252"];
    if (angle > 170) return ["Bend forward more! 🟡", "#FFC107"];
    return ["Perfect form! 🟢", "#4CAF50"];
  };

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
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  
    pose.onResults((results: Results) => {
      if (results.poseLandmarks && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          canvas.width = webcamRef.current?.video?.videoWidth || 640;
          canvas.height = webcamRef.current?.video?.videoHeight || 480;
  
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw pose landmarks
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, 
            { color: "#00FF00", lineWidth: 4 });
          drawLandmarks(ctx, results.poseLandmarks, 
            { color: "#FF0000", lineWidth: 2, radius: 3 });
  
          // Calculate angles
          const leftHip = [
            results.poseLandmarks[LANDMARK_INDICES.LEFT_HIP].x,
            results.poseLandmarks[LANDMARK_INDICES.LEFT_HIP].y
          ];
          const leftKnee = [
            results.poseLandmarks[LANDMARK_INDICES.LEFT_KNEE].x,
            results.poseLandmarks[LANDMARK_INDICES.LEFT_KNEE].y
          ];
          const leftAnkle = [
            results.poseLandmarks[LANDMARK_INDICES.LEFT_ANKLE].x,
            results.poseLandmarks[LANDMARK_INDICES.LEFT_ANKLE].y
          ];
          const rightHip = [
            results.poseLandmarks[LANDMARK_INDICES.RIGHT_HIP].x,
            results.poseLandmarks[LANDMARK_INDICES.RIGHT_HIP].y
          ];
          const rightKnee = [
            results.poseLandmarks[LANDMARK_INDICES.RIGHT_KNEE].x,
            results.poseLandmarks[LANDMARK_INDICES.RIGHT_KNEE].y
          ];
          const rightAnkle = [
            results.poseLandmarks[LANDMARK_INDICES.RIGHT_ANKLE].x,
            results.poseLandmarks[LANDMARK_INDICES.RIGHT_ANKLE].y
          ];

          const leftAngle = Math.round(calculateAngle(leftHip, leftKnee, leftAnkle));
          const rightAngle = Math.round(calculateAngle(rightHip, rightKnee, rightAnkle));

          setAngles({ left: leftAngle, right: rightAngle });

          // Update feedback based on average angle
          const avgAngle = (leftAngle + rightAngle) / 2;
          const [feedbackText] = getFeedback(avgAngle);
          setFeedback(feedbackText);
        }
      }
    });
  
    poseRef.current = pose;

    return () => {
      pose.close();
    };
  }, [selectedExercise]);

  const processFrame = async () => {
    if (webcamRef.current?.video && poseRef.current) {
      try {
        await poseRef.current.send({ image: webcamRef.current.video });
        requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("Frame processing error:", error);
      }
    }
  };

  return (
    <div className="container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      padding: '20px'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value as ExerciseType)}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            borderRadius: '5px',
            backgroundColor: '#2c2c2c',
            color: 'white',
            border: '2px solid #4CAF50',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {exerciseOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {cameraError && (
          <div style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
          }}>
            Camera Error: {cameraError}. Please check permissions and try again.
          </div>
        )}

        <div style={{ position: "relative", width: "640px", height: "480px" }}>
          <Webcam
            ref={webcamRef}
            mirrored
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "user",
              width: 640,
              height: 480,
              frameRate: 30
            }}
            onUserMedia={processFrame}
            onUserMediaError={(err: string | DOMException) => 
              setCameraError(err instanceof DOMException ? err.message : err)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "10px"
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              borderRadius: "10px"
            }}
          />

          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "20px",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "10px"
            }}>
              <div>
                <strong>Left Angle:</strong> {angles.left}°
              </div>
              <div>
                <strong>Right Angle:</strong> {angles.right}°
              </div>
            </div>
            <div style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold"
            }}>
              {feedback}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
