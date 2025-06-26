// client/services/ApiService.js

// For MVP, replace with your actual Supabase project URL and Anon Key
// In a production environment, these should be loaded securely (e.g., from environment variables on the server)
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export class ApiService {
    constructor() {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
            console.warn("Supabase URL or Anon Key not configured. API services will not function.");
            this.supabase = null;
        } else {
            // Supabase client library is assumed to be loaded via CDN in index.html if needed for client-side auth
            // For this MVP, we'll simulate client-side interaction and focus on server-side Supabase logic.
            // If direct client-side Supabase interaction is desired, uncomment and import:
            // import { createClient } from '@supabase/supabase-js';
            // this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.supabase = { // Mock Supabase client for client-side simulation
                from: (tableName) => ({
                    select: () => Promise.resolve({ data: [], error: null }),
                    insert: (data) => Promise.resolve({ data: data, error: null }),
                    order: () => Promise.resolve({ data: [], error: null }),
                })
            };
            console.log("Supabase API Service initialized (mocked for client-side). Server-side will use real client.");
        }
        this.API_BASE_URL = 'http://localhost:3000/api'; // Backend API base URL
    }

    /**
     * Submits a player's score to the backend leaderboard.
     * @param {object} scoreData - { username: string, score: number, floor: number }
     * @returns {Promise<object>} The response from the API.
     */
    async submitScore(scoreData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/leaderboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit score');
            }
            return await response.json();
        } catch (error) {
            console.error("Error submitting score:", error);
            throw error;
        }
    }

    /**
     * Fetches the daily leaderboard from the backend.
     * @returns {Promise<Array<object>>} An array of leaderboard entries.
     */
    async getLeaderboard() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/leaderboard`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch leaderboard');
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            throw error;
        }
    }

    // Placeholder for authentication methods if needed client-side
    async signUp(email, password) {
        console.log("Sign up functionality not implemented client-side for MVP.");
        return { user: { email }, session: {} }; // Mock response
    }

    async signIn(email, password) {
        console.log("Sign in functionality not implemented client-side for MVP.");
        return { user: { email }, session: {} }; // Mock response
    }

    async signOut() {
        console.log("Sign out functionality not implemented client-side for MVP.");
        return { error: null }; // Mock response
    }
}
