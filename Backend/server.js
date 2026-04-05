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
const allowedOrigins = [
  'https://emootify.netlify.app', 
  'http://localhost:5173',
  'https://emotify-r0ms.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Health Check (Returns 200 OK)
app.get('/health', (_, res) => res.status(200).json({ status: 'success', message: 'Server is healthy' }));

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
