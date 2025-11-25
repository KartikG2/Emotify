import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Import Routes
import UserRoutes from "./routes/userRoutes.js";
import HistoryRoutes from "./routes/HistoryRoutes.js"; // Uncomment when you have these files
import LastMoodRoutes from "./routes/lastmoodRoutes.js";
import spotify from "./routes/spotifyapi.route.js";
import songRoutes from "./routes/songroute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://emootify.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
mongoose.connect(process.env.MONGOURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err);
    process.exit(1);
  });

// Routes
app.get('/', (_, res) => res.send('Backend Live'));

app.use("/user", UserRoutes);
app.use("/mood", HistoryRoutes); 
app.use("/lastmood", LastMoodRoutes);
app.use("/Music", spotify); 
app.use("/songs", songRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error("❌ Server Error:", err);
  process.exit(1);
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});