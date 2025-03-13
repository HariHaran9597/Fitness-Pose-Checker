import mongoose from 'mongoose';

export interface IWorkoutHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  exerciseType: string;
  duration: number;
  repetitions: number;
  feedback: {
    correctForm: number;
    incorrectForm: number;
    avgAngle: number;
  };
  skillLevel: string;
  date: Date;
}

const workoutHistorySchema = new mongoose.Schema<IWorkoutHistory>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseType: {
    type: String,
    required: true,
    enum: ['squat', 'pushup', 'deadlift']
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  repetitions: {
    type: Number,
    required: true,
    min: 0
  },
  feedback: {
    correctForm: {
      type: Number,
      default: 0
    },
    incorrectForm: {
      type: Number,
      default: 0
    },
    avgAngle: {
      type: Number,
      default: 0
    }
  },
  skillLevel: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export const WorkoutHistory = mongoose.model<IWorkoutHistory>('WorkoutHistory', workoutHistorySchema);