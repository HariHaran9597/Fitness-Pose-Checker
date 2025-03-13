import express from 'express';
import { auth } from '../middleware/auth.js';
import { WorkoutHistory } from '../models/WorkoutHistory.js';
const router = express.Router();
router.post('/', auth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const workout = new WorkoutHistory({
            userId: req.user._id,
            exerciseType: req.body.exerciseType,
            duration: req.body.duration,
            repetitions: req.body.repetitions,
            feedback: req.body.feedback,
            skillLevel: req.body.skillLevel
        });
        await workout.save();
        res.status(201).json(workout);
    }
    catch (error) {
        res.status(400).json({ error: 'Error recording workout' });
    }
});
router.get('/history', auth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const workouts = await WorkoutHistory.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(50);
        res.json(workouts);
    }
    catch (error) {
        res.status(400).json({ error: 'Error fetching workout history' });
    }
});
export default router;
