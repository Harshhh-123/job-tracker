import express from 'express';
import Application from '../models/Application.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, userId: req.userId });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;