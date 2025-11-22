import mongoose from 'mongoose';

const moodHistorySchema = new mongoose.Schema({
  userId: {
    type: String, // or mongoose.Schema.Types.ObjectId if using ObjectId
    ref: 'User',
    required: true,
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'excited', 'fearful'],
    required: true,
  },
  detectedAt: {
    type: Date,
    default: Date.now,
  },
});

const MoodHistory = mongoose.model('MoodHistory', moodHistorySchema);
export default MoodHistory;
