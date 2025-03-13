import { ExerciseType } from './exerciseRules';

interface Repetition {
  timestamp: number;
  angles: {
    left: number[];
    right: number[];
  };
  score: number;
}

export interface WorkoutSet {
  exercise: ExerciseType;
  reps: Repetition[];
  averageScore: number;
  startTime: number;
  endTime: number;
}

// Thresholds for rep detection
const REP_THRESHOLDS = {
  [ExerciseType.SQUAT]: {
    start: 160, // Standing position
    complete: 90, // Deep squat position
    tolerance: 10
  },
  [ExerciseType.PUSHUP]: {
    start: 160, // Extended arms
    complete: 90, // Chest near ground
    tolerance: 15
  },
  [ExerciseType.DEADLIFT]: {
    start: 60, // Starting position
    complete: 160, // Standing straight
    tolerance: 10
  }
};

export class RepCounter {
  private exercise: ExerciseType;
  private isInRep: boolean;
  private currentRep: {
    angles: {
      left: number[];
      right: number[];
    };
    startTime: number;
  } | null;
  private reps: Repetition[];
  private lastAngle: number;

  constructor(exercise: ExerciseType) {
    this.exercise = exercise;
    this.isInRep = false;
    this.currentRep = null;
    this.reps = [];
    this.lastAngle = 0;
  }

  private calculateFormScore(angles: number[]): number {
    const threshold = REP_THRESHOLDS[this.exercise];
    
    // Check consistency
    const angleVariation = Math.max(...angles) - Math.min(...angles);
    const consistencyScore = Math.max(0, 100 - (angleVariation * 2));
    
    // Check range of motion
    let rangeScore = 0;
    if (this.exercise === ExerciseType.SQUAT) {
      const lowestAngle = Math.min(...angles);
      rangeScore = lowestAngle <= threshold.complete ? 100 : 
        Math.max(0, 100 - ((lowestAngle - threshold.complete) * 2));
    } else if (this.exercise === ExerciseType.PUSHUP) {
      const lowestAngle = Math.min(...angles);
      rangeScore = lowestAngle <= threshold.complete ? 100 : 
        Math.max(0, 100 - ((lowestAngle - threshold.complete) * 2));
    } else {
      const highestAngle = Math.max(...angles);
      rangeScore = highestAngle >= threshold.complete ? 100 : 
        Math.max(0, 100 - ((threshold.complete - highestAngle) * 2));
    }

    return Math.round((consistencyScore + rangeScore) / 2);
  }

  processAngle(leftAngle: number, rightAngle: number): {
    isNewRep: boolean;
    repCount: number;
    formScore: number | null;
  } {
    const avgAngle = (leftAngle + rightAngle) / 2;
    const threshold = REP_THRESHOLDS[this.exercise];
    let isNewRep = false;
    let formScore = null;

    // Starting a new rep
    if (!this.isInRep && 
        Math.abs(avgAngle - threshold.start) <= threshold.tolerance) {
      this.isInRep = true;
      this.currentRep = {
        angles: {
          left: [leftAngle],
          right: [rightAngle]
        },
        startTime: Date.now()
      };
    }
    // During a rep
    else if (this.isInRep && this.currentRep) {
      this.currentRep.angles.left.push(leftAngle);
      this.currentRep.angles.right.push(rightAngle);

      // Rep completion check
      if (this.exercise === ExerciseType.SQUAT || this.exercise === ExerciseType.PUSHUP) {
        if (avgAngle <= threshold.complete) {
          const leftScore = this.calculateFormScore(this.currentRep.angles.left);
          const rightScore = this.calculateFormScore(this.currentRep.angles.right);
          formScore = Math.round((leftScore + rightScore) / 2);

          this.reps.push({
            timestamp: Date.now(),
            angles: this.currentRep.angles,
            score: formScore
          });

          this.isInRep = false;
          this.currentRep = null;
          isNewRep = true;
        }
      } else if (this.exercise === ExerciseType.DEADLIFT) {
        if (avgAngle >= threshold.complete) {
          const leftScore = this.calculateFormScore(this.currentRep.angles.left);
          const rightScore = this.calculateFormScore(this.currentRep.angles.right);
          formScore = Math.round((leftScore + rightScore) / 2);

          this.reps.push({
            timestamp: Date.now(),
            angles: this.currentRep.angles,
            score: formScore
          });

          this.isInRep = false;
          this.currentRep = null;
          isNewRep = true;
        }
      }
    }

    this.lastAngle = avgAngle;
    
    return {
      isNewRep,
      repCount: this.reps.length,
      formScore
    };
  }

  getAverageScore(): number {
    if (this.reps.length === 0) return 0;
    const sum = this.reps.reduce((acc, rep) => acc + rep.score, 0);
    return Math.round(sum / this.reps.length);
  }

  getCurrentSet(): WorkoutSet {
    return {
      exercise: this.exercise,
      reps: [...this.reps],
      averageScore: this.getAverageScore(),
      startTime: this.reps[0]?.timestamp || Date.now(),
      endTime: this.reps[this.reps.length - 1]?.timestamp || Date.now()
    };
  }

  reset(): void {
    this.isInRep = false;
    this.currentRep = null;
    this.reps = [];
    this.lastAngle = 0;
  }
}