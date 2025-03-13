import mongoose from 'mongoose';
const workoutHistorySchema = new mongoose.Schema({
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
export const WorkoutHistory = mongoose.model('WorkoutHistory', workoutHistorySchema);
