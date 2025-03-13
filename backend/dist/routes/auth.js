import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = new User({ email, password, name });
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                skillLevel: user.skillLevel
            },
            token
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating user' });
    }
});
router.get('/profile', auth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        skillLevel: req.user.skillLevel
    });
});
export default router;
