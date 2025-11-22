import express from 'express';
import {
  saveMood,
  getUserMoodHistory
} from '../controller/HistoryMoodController.js';


const router = express.Router();

router.post('/save',saveMood); // POST /api/mood/save
router.get('/history/:userId', getUserMoodHistory); // GET /api/mood/history/:userId

export default router;
