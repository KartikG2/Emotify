// routes/musicRoutes.js

import express from "express";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const router = express.Router();

// Health Check (Returns 200 OK)
router.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// 1. Spotify Search Proxy (Fixes CORS)
router.get("/search", async (req, res) => {
  const { q } = req.query;
  const url = `https://v1.nocodeapi.com/kartikg1/spotify/QuJcgYtQlsFOiwcQ/search?q=${q || 'lofi'}&type=track`;

  const request = https.request(url, (response) => {
    let data = '';
    response.on('data', (chunk) => data += chunk);
    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        res.status(200).json(parsedData);
      } catch (e) {
        res.status(500).json({ error: "Failed to parse Spotify data" });
      }
    });
  });

  request.on('error', (err) => {
    console.error("Backend Proxy Error:", err);
    res.status(500).json({ error: "Failed to fetch from Spotify API" });
  });

  request.end();
});

// 2. Lyrics Cache/Proxy
router.get("/suggestions", async (req, res) => {
  const options = {
    method: "GET",
    hostname: "spotify23.p.rapidapi.com",
    path: `/track_lyrics/?id=${req.query.songId}`, 
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "spotify23.p.rapidapi.com",
    },
  };

  const req1 = https.request(options, (res1) => {
    const chunks = [];
    res1.on("data", (chunk) => chunks.push(chunk));
    res1.on("end", () => {
      const body = Buffer.concat(chunks);
      try {
        const data = JSON.parse(body.toString());
        res.json({ success: true, lyrics: data.lyrics?.lines || [] });
      } catch (error) {
        res.status(500).json({ success: false, message: "Failed to parse lyrics" });
      }
    });
  });

  req1.on("error", (err) => {
    console.error("RapidAPI Request Error:", err);
    res.status(500).json({ success: false, message: "Request to RapidAPI failed" });
  });

  req1.end();
});

export default router;
