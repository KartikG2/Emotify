import MoodHistory from '../model/history.model.js';

// @desc Save detected mood
export const saveMood = async (req, res) => {
  try {
    const { userId, mood } = req.body;

    if (!userId || !mood) {
      return res.status(400).json({ message: 'User ID and mood are required' });
    }

    const newMood = new MoodHistory({
      userId,
      mood
    });

    await newMood.save();

    res.status(201).json({ message: 'Mood saved successfully', mood: newMood });
  } catch (error) {
    res.status(500).json({ message: 'Error saving mood', error: error.message });
  }
};

// @desc Get mood history for user
export const getUserMoodHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const moods = await MoodHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10); // last 10 entries

    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mood history', error: error.message });
  }
};

// @desc Get User's Dominant Mood (For History Recommendations)
export const getMoodStats = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Analyze last 50 scans
      const moods = await MoodHistory.find({ userId }).sort({ createdAt: -1 }).limit(50);
      
      if (moods.length === 0) return res.json({ dominant: 'neutral' });
  
      // Count frequencies
      const counts = {};
      moods.forEach(entry => {
          counts[entry.mood] = (counts[entry.mood] || 0) + 1;
      });
  
      // Find highest frequency
      const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  
      res.status(200).json({ dominant, historyCount: moods.length });
    } catch (error) {
      res.status(500).json({ message: 'Error analyzing stats', error: error.message });
    }
  };