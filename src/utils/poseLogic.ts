import { Results } from '@mediapipe/pose';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface AngleData {
  angle: number;
  isCorrect: boolean;
  feedback: string;
}

export const LANDMARK_INDICES = {
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

export const calculateAngle = (a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number => {
  if (!a || !b || !c) return 0;

  const radians = Math.atan2(
    c.y - b.y,
    c.x - b.x
  ) - Math.atan2(
    a.y - b.y,
    a.x - b.x
  );

  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
};

export const analyzePushupForm = (results: Results): AngleData => {
  if (!results.poseLandmarks) {
    return { angle: 0, isCorrect: false, feedback: 'No pose detected' };
  }

  const landmarks = results.poseLandmarks;
  const elbowAngle = calculateAngle(
    landmarks[LANDMARK_INDICES.LEFT_SHOULDER],
    landmarks[LANDMARK_INDICES.LEFT_ELBOW],
    landmarks[LANDMARK_INDICES.LEFT_WRIST]
  );

  if (elbowAngle < 90) {
    return {
      angle: elbowAngle,
      isCorrect: true,
      feedback: 'Good form! Keep your core tight'
    };
  } else if (elbowAngle > 160) {
    return {
      angle: elbowAngle,
      isCorrect: false,
      feedback: 'Lower your body more'
    };
  }

  return {
    angle: elbowAngle,
    isCorrect: true,
    feedback: 'Maintain this form'
  };
};

export const analyzeSquatForm = (results: Results): AngleData => {
  if (!results.poseLandmarks) {
    return { angle: 0, isCorrect: false, feedback: 'No pose detected' };
  }

  const landmarks = results.poseLandmarks;
  const kneeAngle = calculateAngle(
    landmarks[LANDMARK_INDICES.LEFT_HIP],
    landmarks[LANDMARK_INDICES.LEFT_KNEE],
    landmarks[LANDMARK_INDICES.LEFT_ANKLE]
  );

  if (kneeAngle < 90) {
    return {
      angle: kneeAngle,
      isCorrect: true,
      feedback: 'Perfect squat depth!'
    };
  } else if (kneeAngle > 160) {
    return {
      angle: kneeAngle,
      isCorrect: false,
      feedback: 'Squat deeper'
    };
  }

  return {
    angle: kneeAngle,
    isCorrect: true,
    feedback: 'Keep going down slowly'
  };
};

export const analyzeDeadliftForm = (results: Results): AngleData => {
  if (!results.poseLandmarks) {
    return { angle: 0, isCorrect: false, feedback: 'No pose detected' };
  }

  const landmarks = results.poseLandmarks;
  const hipAngle = calculateAngle(
    landmarks[LANDMARK_INDICES.LEFT_SHOULDER],
    landmarks[LANDMARK_INDICES.LEFT_HIP],
    landmarks[LANDMARK_INDICES.LEFT_KNEE]
  );

  if (hipAngle > 160 && hipAngle < 180) {
    return {
      angle: hipAngle,
      isCorrect: true,
      feedback: 'Perfect hip hinge!'
    };
  } else if (hipAngle < 140) {
    return {
      angle: hipAngle,
      isCorrect: false,
      feedback: 'Keep your back straight'
    };
  }

  return {
    angle: hipAngle,
    isCorrect: true,
    feedback: 'Maintain neutral spine'
  };
};