// server/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const authRoutes = require('./auth');
const leaderboardRoutes = require('./leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON request bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Basic route for testing server status
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: 'Der Wortturm API is running!', timestamp: new Date() });
});

// Serve static files from the client directory (for production deployment)
// In development, you might serve client separately (e.g., with live-server)
// app.use(express.static('client'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}/api`);
});
