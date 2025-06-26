// server/auth.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized for auth.");
} else {
    console.warn("Supabase URL or Service Role Key not found. Auth routes will be mocked.");
}

// MVP Authentication Routes (Mocked or Basic Supabase Integration)

/**
 * @route POST /api/auth/signup
 * @description Handles user registration. For MVP, this is a placeholder.
 */
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (supabase) {
        try {
            // In a real application, you'd handle user creation and error checking more robustly.
            // For MVP, we're just demonstrating the connection.
            const { user, session, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error("Supabase signup error:", error);
                return res.status(400).json({ message: error.message });
            }
            res.status(201).json({ message: 'User registered successfully (check email for confirmation if enabled).', user: user ? user.id : null });
        } catch (error) {
            console.error("Server error during signup:", error);
            res.status(500).json({ message: 'Internal server error during signup.' });
        }
    } else {
        // Mock response for MVP if Supabase is not configured
        console.log(`Mocking signup for ${email}`);
        res.status(201).json({ message: 'User registered successfully (mocked).', user: { id: 'mock-user-id' } });
    }
});

/**
 * @route POST /api/auth/signin
 * @description Handles user login. For MVP, this is a placeholder.
 */
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (supabase) {
        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Supabase signin error:", error);
                return res.status(401).json({ message: error.message });
            }
            res.status(200).json({ message: 'User logged in successfully.', user: user.id, token: session.access_token });
        } catch (error) {
            console.error("Server error during signin:", error);
            res.status(500).json({ message: 'Internal server error during signin.' });
        }
    } else {
        // Mock response for MVP if Supabase is not configured
        console.log(`Mocking signin for ${email}`);
        res.status(200).json({ message: 'User logged in successfully (mocked).', user: 'mock-user-id', token: 'mock-token' });
    }
});

module.exports = router;
