import axios from 'axios';

// Unified API instance
const api = axios.create({
  // Use VITE_API_BASE_URL if set, otherwise default to localhost:4000
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true, // Crucial for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional: Add response interceptors for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
