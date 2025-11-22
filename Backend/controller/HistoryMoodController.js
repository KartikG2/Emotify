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
      .sort({ detectedAt: -1 })
      .limit(10); // last 10 entries

    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mood history', error: error.message });
  }
};
