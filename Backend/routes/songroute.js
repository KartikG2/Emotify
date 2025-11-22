import express from 'express';
import axios from 'axios';
import { getSpotifyToken } from '../utils/spotifyAuth.js';

const router = express.Router();

const moodMap = {
  Happy: 'party',
  Sad: 'sad',
  Angry: 'rock',
  Surprised: 'chill',
  Neutral: 'focus',
  Excited: 'dance',
  Fearful: 'calm'
};

router.get('/mood/:mood', async (req, res) => {
  const mood = req.params.mood;
  const query = moodMap[mood] || 'mood';

  try {
    const token = await getSpotifyToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const tracks = response.data.tracks.items.map((track) => ({
      name: track.name,
      artist: track.artists[0].name,
      url: track.external_urls.spotify,
      image: track.album.images[0]?.url,
      preview: track.preview_url
    }));

    res.json({ tracks });
  } catch (err) {
    console.error('Spotify API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch songs from Spotify' });
  }
});

export default router;
