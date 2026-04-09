import express from 'express';
import auth from '../middleware/auth.js';
import { parseJobDescription, generateResumeSuggestions } from '../services/aiService.js';

const router = express.Router();

router.post('/parse', auth, async (req, res) => {
  try {
    const { jd } = req.body;
    if (!jd) return res.status(400).json({ message: 'JD is required' });
    const parsed = await parseJobDescription(jd);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'AI parsing failed', error: err.message });
  }
});

router.post('/suggestions', auth, async (req, res) => {
  try {
    const { role, skills } = req.body;
    const suggestions = await generateResumeSuggestions(role, skills || []);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'AI suggestions failed', error: err.message });
  }
});

export default router;