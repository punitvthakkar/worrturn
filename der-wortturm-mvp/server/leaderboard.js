// server/leaderboard.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized for leaderboard.");
} else {
    console.warn("Supabase URL or Service Role Key not found. Leaderboard routes will be mocked.");
}

// Supabase Table Name
const LEADERBOARD_TABLE = 'leaderboard';

/**
 * @route POST /api/leaderboard
 * @description Submits a new score to the leaderboard.
 * @body {string} username - The player's username.
 * @body {number} score - The player's score.
 * @body {number} floor - The highest floor reached.
 */
router.post('/', async (req, res) => {
    const { username, score, floor } = req.body;

    if (!username || typeof score !== 'number' || typeof floor !== 'number') {
        return res.status(400).json({ message: 'Username, score, and floor are required and must be valid.' });
    }

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from(LEADERBOARD_TABLE)
                .insert([{ username, score, floor, created_at: new Date().toISOString() }]);

            if (error) {
                console.error("Supabase insert error:", error);
                return res.status(500).json({ message: error.message });
            }
            res.status(201).json({ message: 'Score submitted successfully.', data });
        } catch (error) {
            console.error("Server error submitting score:", error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    } else {
        // Mock response if Supabase is not configured
        console.log(`Mocking score submission for ${username}: ${score}`);
        res.status(201).json({ message: 'Score submitted successfully (mocked).', data: { username, score, floor } });
    }
});

/**
 * @route GET /api/leaderboard
 * @description Fetches the daily leaderboard (top 10 for MVP).
 */
router.get('/', async (req, res) => {
    if (supabase) {
        try {
            // For a daily leaderboard, you'd typically filter by date.
            // For MVP, we'll just get the top 10 scores overall, ordered by score descending.
            const { data, error } = await supabase
                .from(LEADERBOARD_TABLE)
                .select('username, score, floor')
                .order('score', { ascending: false })
                .limit(10);

            if (error) {
                console.error("Supabase fetch error:", error);
                return res.status(500).json({ message: error.message });
            }
            res.status(200).json(data);
        } catch (error) {
            console.error("Server error fetching leaderboard:", error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    } else {
        // Mock response if Supabase is not configured
        console.log("Mocking leaderboard fetch.");
        const mockLeaderboard = [
            { username: 'MockPlayer1', score: 150000, floor: 12 },
            { username: 'MockPlayer2', score: 120000, floor: 11 },
            { username: 'MockPlayer3', score: 90000, floor: 10 },
            { username: 'MockPlayer4', score: 75000, floor: 9 },
            { username: 'MockPlayer5', score: 50000, floor: 8 },
        ];
        res.status(200).json(mockLeaderboard);
    }
});

module.exports = router;
