import MoodHistory from "../model/history.model.js"

// @desc Update or Insert last detected mood
export const updateLastMood = async (req, res) => {
  try {
    const { userId, mood } = req.body;

    if (!userId || !mood) {
      return res.status(400).json({ message: 'User ID and mood are required' });
    }

    const updatedMood = await MoodHistory.findOneAndUpdate(
      { userId },
      { mood, detectedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Last mood updated', data: updatedMood });
  } catch (error) {
    res.status(500).json({ message: 'Error updating last mood', error: error.message });
  }
};

// @desc Get last detected mood
export const getLastMood = async (req, res) => {
  try {
    const { userId } = req.params;

    const lastMood = await MoodHistory.findOne({ userId });

    if (!lastMood) {
      return res.status(404).json({ message: 'No mood found' });
    }

    res.status(200).json(lastMood);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching last mood', error: error.message });
  }
};
