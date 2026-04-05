import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

// Health Check
router.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

/**
 * HIGH AVAILABILITY NODE POOL (JioSaavn API)
 * We rotate through these nodes to ensure reliability if one goes offline (like saavn.dev).
 */
const SAAVN_NODES = [
  "https://jio-saavn-api.vercel.app",
  "https://jiosaavn-api-eight-liard.vercel.app",
  "https://saavn.dev",
  "https://saavn.me"
];

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.video",
  "https://pipedapi.darkness.services"
];

/**
 * Helper: Rotary Fetcher for Metadata
 */
async function fetchFromSaavn(endpoint) {
  for (const node of SAAVN_NODES) {
    try {
      const url = `${node}${endpoint}`;
      const res = await axios.get(url, { timeout: 5000 });
      if (res.data && res.data.success) return res.data.data;
    } catch (e) {
      console.warn(`Saavn Node ${node} failed: ${e.message}`);
    }
  }
  return null;
}

/**
 * Helper: Global Audio Stream (YouTube base)
 */
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
 * 1. Hybrid Search Engine (Metadata from Node Pool + Full Audio from Global Stream)
 */
router.get("/search", async (req, res) => {
  const { q } = req.query;
  const query = q || 'lofi';

  try {
    // A. Fetch Metadata using Rotary Pool
    const results = await fetchFromSaavn(`/api/search/songs?query=${encodeURIComponent(query)}`);
    
    if (results && results.results.length > 0) {
      const ids = results.results.map(r => r.id).join(',');

      // B. Deep-fetch full details
      const detailResults = await fetchFromSaavn(`/api/songs?id=${ids}`);

      if (detailResults && detailResults.length > 0) {
        // C. Fetch Full Audio for the FIRST result
        const topTrack = detailResults[0];
        const fullAudioUrl = await getFullLengthStream(`${topTrack.name} ${topTrack.artists.primary[0]?.name}`);
        
        const mappedTracks = detailResults.map((track, index) => ({
          id: track.id,
          name: track.name,
          artists: [{ name: track.artists.primary[0]?.name || "Unknown Artist" }],
          album: {
            name: track.album.name,
            images: [{ url: track.image[2]?.url || track.image[1]?.url }]
          },
          preview_url: (index === 0 && fullAudioUrl) ? fullAudioUrl : (track.downloadUrl[4]?.url || track.downloadUrl[0]?.url),
          duration_ms: (track.duration || 0) * 1000,
          has_lyrics: track.hasLyrics === 'true' || track.hasLyrics === true
        }));

        return res.status(200).json({ tracks: { items: mappedTracks } });
      }
    }
    throw new Error("No metadata results found from pool");

  } catch (error) {
    console.error("Hybrid Search Fallback Loop:", error.message);
    // Silent Fallback to iTunes
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&limit=20`;
      const itunesRes = await axios.get(itunesUrl);
      const mappedTracks = itunesRes.data.results.map(track => ({
        id: track.trackId.toString(),
        name: track.trackName,
        artists: [{ name: track.artistName }],
        album: { name: track.collectionName, images: [{ url: track.artworkUrl100.replace('100x100', '600x600') }] },
        preview_url: track.previewUrl, 
        duration_ms: track.trackTimeMillis
      }));
      return res.status(200).json({ tracks: { items: mappedTracks } });
    } catch (itError) { res.status(500).json({ error: "All engines failed" }); }
  }
});

/**
 * 2. Lyrics Provider (Rotary)
 */
router.get("/suggestions", async (req, res) => {
  const { songId } = req.query;
  if (!songId) return res.status(400).json({ message: "Missing songId" });
  try {
    const lyricsData = await fetchFromSaavn(`/api/songs/${songId}/lyrics`);
    if (lyricsData && lyricsData.lyrics) {
      const lines = lyricsData.lyrics.split('\n').map(line => ({ words: line.trim() }));
      return res.json({ success: true, lyrics: lines });
    }
    res.status(404).json({ message: "Lyrics not found" });
  } catch (error) { res.status(500).json({ message: "Lyrics fetch failed" }); }
});

export default router;
