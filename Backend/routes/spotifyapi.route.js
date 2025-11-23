// routes/musicRoutes.js

import express from "express";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const router = express.Router();

router.get("/suggestions", async (req, res) => {
  const options = {
    method: "GET",
    hostname: "spotify23.p.rapidapi.com",
    path: `/track_lyrics/?id=${req.query.songId}`, // You can make this dynamic via query later
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "spotify23.p.rapidapi.com",
    },
  };

  const req1 = https.request(options, (res1) => {
    const chunks = [];

    res1.on("data", (chunk) => {
      chunks.push(chunk);
    });

    res1.on("end", () => {
      const body = Buffer.concat(chunks);
      try {
        const data = JSON.parse(body.toString());
        // Send response to frontend
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
