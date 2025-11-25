# 🎵 Emotify
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6e5081d2-27fa-4539-9285-043de243dcad" />

> **Your face is the playlist.** > An AI-powered web application that detects your facial expressions to gauge your mood and auto-magically plays the perfect track to match your vibe.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://reactjs.org/)

---

## 🚀 About The Project

Ever feel like listening to music but don't know what to play? **Emotify** bridges the gap between biological emotion and digital entertainment.

Using advanced computer vision models directly in the browser, we scan your facial landmarks to detect if you are Happy, Sad, Angry, or Neutral. Based on this analysis, the system interacts with the Spotify API (and local libraries) to curate a listening experience that resonates with how you feel *right now*.

### ✨ Key Features

* **😐 AI Face Scanning:** Real-time emotion detection using `face-api.js` models.
* **🎧 Smart Music Player:** Seamless integration with Spotify API + Local MP3 fallback.
* **🎙️ Voice Assistant:** Hands-free control to navigate the app.
* **🔐 Secure Auth:** Full user registration/login system with OTP verification.
* **📊 Mood History:** Dashboard analytics to track your emotional trends over time.
* **🎨 Modern UI:** Built with React and Tailwind CSS for a sleek, responsive design.

---

## 🛠️ Tech Stack

**Frontend:**
* **React (Vite):** Fast, modern UI library.
* **Tailwind CSS:** For rapid, beautiful styling.
* **Face-API.js:** TensorFlow.js powered face detection.
* **Context API:** For state management (Auth & Music).

**Backend:**
* **Node.js & Express:** Robust REST API.
* **MongoDB (Mongoose):** To store users, mood history, and OTPs.
* **Spotify Web API:** For fetching tracks and metadata.

---

## ⚙️ Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites
* Node.js (v16+)
* MongoDB (Local or Atlas URL)
* Spotify Developer Account (Client ID & Secret)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/Emotify.git]
cd Emotify

```
### 2. Backend Setup
```bash
cd Backend
npm install
```
#### Create a .env file in the Backend/ directory:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
EMAIL_USER=your_email_for_otp
EMAIL_PASS=your_email_password
```
#### Start the server:
```bash
node server.js
```
### 3. Frontend Setup
```bash
cd frontend
npm install
```
#### Start the React app:
```bash
npm run dev
```

Project Link: https://emootify.netlify.app/

Made with ❤️ and 🎵 by the Emotify Team.
