import express from 'express';
import { WorkoutHistory } from '../models/WorkoutHistory.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();
// Get all workout history for a user
router.get('/', auth, async (req, res) => {
    try {
        const workouts = await WorkoutHistory.find({ userId: req.user._id })
            .sort({ timestamp: -1 });
        res.json(workouts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching workout history' });
    }
});
// Create new workout record
router.post('/', auth, async (req, res) => {
    try {
        const workoutData = {
            userId: req.user._id,
            exerciseType: req.body.exerciseType,
            duration: req.body.duration,
            repetitions: req.body.repetitions,
            accuracy: req.body.accuracy,
            feedback: req.body.feedback
        };
        const workout = new WorkoutHistory(workoutData);
        await workout.save();
        res.status(201).json(workout);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating workout record' });
    }
});
// Get workout statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await WorkoutHistory.aggregate([
            { $match: { userId: req.user._id } },
            { $group: {
                    _id: '$exerciseType',
                    totalWorkouts: { $sum: 1 },
                    avgAccuracy: { $avg: '$accuracy' },
                    totalDuration: { $sum: '$duration' },
                    totalRepetitions: { $sum: '$repetitions' }
                } }
        ]);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching workout statistics' });
    }
});
export default router;
