import express from 'express';
import {
  updateLastMood,
  getLastMood
} from '../controller/lastmoodController.js';

const router = express.Router();

router.post('/update', updateLastMood); // POST /api/lastmood/update
router.get('/:userId', getLastMood);    // GET /api/lastmood/:userId

export default router;
