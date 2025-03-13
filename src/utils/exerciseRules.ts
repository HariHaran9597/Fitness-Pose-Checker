import { Results } from "@mediapipe/pose";

export enum ExerciseType {
  SQUAT = "squat",
  PUSHUP = "pushup",
  DEADLIFT = "deadlift"
}

export interface AngleData {
  angle: number;
  feedback: string;
  color: string;
}

export interface ExerciseAnalysis {
  leftSide: AngleData;
  rightSide: AngleData;
  generalFeedback?: string;
}

const LANDMARK_INDICES = {
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

export const calculateAngle = (a: number[], b: number[], c: number[]): number => {
  const ab = [a[0] - b[0], a[1] - b[1]];
  const cb = [c[0] - b[0], c[1] - b[1]];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const magAB = Math.sqrt(ab[0] ** 2 + ab[1] ** 2);
  const magCB = Math.sqrt(cb[0] ** 2 + cb[1] ** 2);
  return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
};

const getSquatFeedback = (angle: number): AngleData => {
  if (angle < 90) {
    return {
      angle,
      feedback: "Perfect depth! 🟢",
      color: "#4CAF50"
    };
  } else if (angle > 120) {
    return {
      angle,
      feedback: "Go lower! 🔴",
      color: "#FF5252"
    };
  } else {
    return {
      angle,
      feedback: "Halfway there... 🟡",
      color: "#FFC107"
    };
  }
};

const getPushupFeedback = (angle: number): AngleData => {
  if (angle < 90) {
    return {
      angle,
      feedback: "Push up! 🟡",
      color: "#FFC107"
    };
  } else if (angle > 160) {
    return {
      angle,
      feedback: "Go lower! 🔴",
      color: "#FF5252"
    };
  } else {
    return {
      angle,
      feedback: "Good form! 🟢",
      color: "#4CAF50"
    };
  }
};

const getDeadliftFeedback = (angle: number): AngleData => {
  if (angle < 150) {
    return {
      angle,
      feedback: "Keep back straight! 🔴",
      color: "#FF5252"
    };
  } else if (angle > 170) {
    return {
      angle,
      feedback: "Bend forward more! 🟡",
      color: "#FFC107"
    };
  } else {
    return {
      angle,
      feedback: "Perfect form! 🟢",
      color: "#4CAF50"
    };
  }
};

export const analyzeExercise = (
  exercise: ExerciseType,
  landmarks: Results['poseLandmarks']
): ExerciseAnalysis => {
  switch (exercise) {
    case ExerciseType.SQUAT: {
      const leftHip = [landmarks[LANDMARK_INDICES.LEFT_HIP].x, landmarks[LANDMARK_INDICES.LEFT_HIP].y];
      const leftKnee = [landmarks[LANDMARK_INDICES.LEFT_KNEE].x, landmarks[LANDMARK_INDICES.LEFT_KNEE].y];
      const leftAnkle = [landmarks[LANDMARK_INDICES.LEFT_ANKLE].x, landmarks[LANDMARK_INDICES.LEFT_ANKLE].y];
      
      const rightHip = [landmarks[LANDMARK_INDICES.RIGHT_HIP].x, landmarks[LANDMARK_INDICES.RIGHT_HIP].y];
      const rightKnee = [landmarks[LANDMARK_INDICES.RIGHT_KNEE].x, landmarks[LANDMARK_INDICES.RIGHT_KNEE].y];
      const rightAnkle = [landmarks[LANDMARK_INDICES.RIGHT_ANKLE].x, landmarks[LANDMARK_INDICES.RIGHT_ANKLE].y];

      return {
        leftSide: getSquatFeedback(Math.round(calculateAngle(leftHip, leftKnee, leftAnkle))),
        rightSide: getSquatFeedback(Math.round(calculateAngle(rightHip, rightKnee, rightAnkle)))
      };
    }

    case ExerciseType.PUSHUP: {
      const leftShoulder = [landmarks[LANDMARK_INDICES.LEFT_SHOULDER].x, landmarks[LANDMARK_INDICES.LEFT_SHOULDER].y];
      const leftElbow = [landmarks[LANDMARK_INDICES.LEFT_ELBOW].x, landmarks[LANDMARK_INDICES.LEFT_ELBOW].y];
      const leftWrist = [landmarks[LANDMARK_INDICES.LEFT_WRIST].x, landmarks[LANDMARK_INDICES.LEFT_WRIST].y];
      
      const rightShoulder = [landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].x, landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].y];
      const rightElbow = [landmarks[LANDMARK_INDICES.RIGHT_ELBOW].x, landmarks[LANDMARK_INDICES.RIGHT_ELBOW].y];
      const rightWrist = [landmarks[LANDMARK_INDICES.RIGHT_WRIST].x, landmarks[LANDMARK_INDICES.RIGHT_WRIST].y];

      return {
        leftSide: getPushupFeedback(Math.round(calculateAngle(leftShoulder, leftElbow, leftWrist))),
        rightSide: getPushupFeedback(Math.round(calculateAngle(rightShoulder, rightElbow, rightWrist))),
        generalFeedback: "Keep your core tight!"
      };
    }

    case ExerciseType.DEADLIFT: {
      const leftShoulder = [landmarks[LANDMARK_INDICES.LEFT_SHOULDER].x, landmarks[LANDMARK_INDICES.LEFT_SHOULDER].y];
      const leftHip = [landmarks[LANDMARK_INDICES.LEFT_HIP].x, landmarks[LANDMARK_INDICES.LEFT_HIP].y];
      const leftKnee = [landmarks[LANDMARK_INDICES.LEFT_KNEE].x, landmarks[LANDMARK_INDICES.LEFT_KNEE].y];
      
      const rightShoulder = [landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].x, landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].y];
      const rightHip = [landmarks[LANDMARK_INDICES.RIGHT_HIP].x, landmarks[LANDMARK_INDICES.RIGHT_HIP].y];
      const rightKnee = [landmarks[LANDMARK_INDICES.RIGHT_KNEE].x, landmarks[LANDMARK_INDICES.RIGHT_KNEE].y];

      return {
        leftSide: getDeadliftFeedback(Math.round(calculateAngle(leftShoulder, leftHip, leftKnee))),
        rightSide: getDeadliftFeedback(Math.round(calculateAngle(rightShoulder, rightHip, rightKnee))),
        generalFeedback: "Lift with your legs, not your back!"
      };
    }
  }
};