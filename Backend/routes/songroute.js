import express from 'express';
import axios from 'axios';

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

const SAAVN_NODES = [
  "https://jio-saavn-api.vercel.app",
  "https://jiosaavn-api-eight-liard.vercel.app",
  "https://saavn.me"
];

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.video",
  "https://pipedapi.recloud.rocks"
];

/**
 * Common Helper for Rotary Saavn Fetching
 */
async function fetchFromSaavn(endpoint) {
  for (const node of SAAVN_NODES) {
    try {
      const url = `${node}${endpoint}`;
      const res = await axios.get(url, { timeout: 5000 });
      if (res.data && res.data.success) return res.data.data;
    } catch (e) { console.warn(`Saavn Node ${node} failed`); }
  }
  return null;
}

async function getFullLengthStream(query) {
  for (const instance of PIPED_INSTANCES) {
    try {
      const searchUrl = `${instance}/search?q=${encodeURIComponent(query)}&filter=music_videos`;
      const searchRes = await axios.get(searchUrl, { timeout: 4000 });
      const firstResult = searchRes.data.items?.find(item => item.type === 'stream');
      if (firstResult && firstResult.videoId) {
        const streamsUrl = `${instance}/streams/${firstResult.videoId}`;
        const streamsRes = await axios.get(streamsUrl, { timeout: 4000 });
        const bestAudio = streamsRes.data.audioStreams?.find(s => s.mimeType?.includes('audio/mp4')) 
                        || streamsRes.data.audioStreams?.[0];
        if (bestAudio && bestAudio.url) return bestAudio.url;
      }
    } catch (e) { console.error(`Piped instance ${instance} failed`); }
  }
  return null;
}

/**
 * Legacy Mood Route - Now using Rotary Pool
 */
router.get('/mood/:mood', async (req, res) => {
  const mood = req.params.mood;
  const query = moodMap[mood] || 'mood';

  try {
    const results = await fetchFromSaavn(`/api/search/songs?query=${encodeURIComponent(query)}`);
    if (results && results.results.length > 0) {
      const ids = results.results.map(r => r.id).join(',');
      const detailResults = await fetchFromSaavn(`/api/songs?id=${ids}`);

      if (detailResults && detailResults.length > 0) {
        // Fetch full audio for top track
        const topTrack = detailResults[0];
        const fullAudioUrl = await getFullLengthStream(`${topTrack.name} ${topTrack.artists.primary[0]?.name}`);

        const tracks = detailResults.map((track, index) => ({
          name: track.name,
          artist: track.artists.primary[0]?.name || "Unknown Artist",
          url: track.url, 
          image: track.image[2]?.url || track.image[1]?.url,
          preview: (index === 0 && fullAudioUrl) ? fullAudioUrl : (track.downloadUrl[4]?.url || track.downloadUrl[0]?.url)
        }));

        return res.json({ tracks });
      }
    }
    throw new Error("No metadata results from pool");
  } catch (err) {
    console.error('songroute pool fallback:', err.message);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
