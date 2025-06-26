// client/services/i18n.js

export const i18n = {
    translations: {},
    currentLanguage: 'de', // Default language

    async loadTranslations() {
        // For MVP, translations are hardcoded. In a real app, this would fetch from a JSON file.
        this.translations = {
            en: {
                currentScoreTitle: "Current Score",
                personalBestTitle: "Personal Best",
                walkAwayButton: "Walk Away",
                newGameButton: "New Game",
                dailyLeaderboardTitle: "Today's Leaderboard",
                badgesTitle: "Badges",
                floorReached: "Floor {floor} reached",
                difficultyEasy: "Easy",
                difficultyMedium: "Medium",
                difficultyHard: "Hard",
                questionTypeMeaning: "Meaning",
                questionTypeSynonym: "Synonym",
                questionTypeAntonym: "Antonym",
                questionTypeGrammar: "Grammar",
                questionTypeForms: "Forms",
                gameWonMessage: "Congratulations! You conquered Der Wortturm with a score of {score}! 🏆",
                gameLostMessage: "Too bad! Your final score is {score}. Keep practicing!",
                gameWalkAwayMessage: "You walked away with {score} points! Well played!",
                noScoresYet: "No scores yet. Be the first!",
                enterUsername: "Enter your username for the leaderboard:",
                couldNotLoadLeaderboard: "Could not load leaderboard.",
                couldNotSubmitScore: "Could not submit score.",
                gameAlreadyOver: "Game is already over. Start a new game.",
                twoWrongAnswersRemoved: "Two wrong answers removed!",
                audiencePoll: "Audience Poll:\n",
                friendHint: "Your friend says: \"I'm pretty sure the answer is {answer}.\"",
                firstStepsBadge: "First Steps",
                quickThinkerBadge: "Quick Thinker",
                wordCollectorBadge: "Word Collector",
                badgesProgress: "{current} of {total} badges"
            },
            de: {
                currentScoreTitle: "Aktueller Score",
                personalBestTitle: "Persönliche Bestleistung",
                walkAwayButton: "Aussteigen",
                newGameButton: "Neues Spiel",
                dailyLeaderboardTitle: "Heutige Bestenliste",
                badgesTitle: "Abzeichen",
                floorReached: "Etage {floor} erreicht",
                difficultyEasy: "Einfach",
                difficultyMedium: "Mittel",
                difficultyHard: "Schwer",
                questionTypeMeaning: "Bedeutung",
                questionTypeSynonym: "Synonym",
                questionTypeAntonym: "Gegenteil",
                questionTypeGrammar: "Grammatik",
                questionTypeForms: "Formen",
                gameWonMessage: "Gratulation! Sie haben den Wortturm erobert! 🏆",
                gameLostMessage: "Leider falsch! Ihr Endpunktzahl: {score}. Weiter üben!",
                gameWalkAwayMessage: "Sie gehen mit {score} Punkten! Gut gemacht!",
                noScoresYet: "Noch keine Ergebnisse. Sei der Erste!",
                enterUsername: "Geben Sie Ihren Benutzernamen für die Bestenliste ein:",
                couldNotLoadLeaderboard: "Bestenliste konnte nicht geladen werden.",
                couldNotSubmitScore: "Ergebnis konnte nicht übermittelt werden.",
                gameAlreadyOver: "Spiel ist bereits beendet. Starten Sie ein neues Spiel.",
                twoWrongAnswersRemoved: "Zwei falsche Antworten entfernt!",
                audiencePoll: "Publikumstipp:\n",
                friendHint: "Freund: \"Ich bin mir ziemlich sicher, dass es {answer} ist.\"",
                firstStepsBadge: "Erste Schritte",
                quickThinkerBadge: "Blitzdenker",
                wordCollectorBadge: "Wortsammler",
                badgesProgress: "{current} von {total} Abzeichen"
            }
        };
        this.applyTranslations();
    },

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.applyTranslations();
        } else {
            console.warn(`Language '${lang}' not available.`);
        }
    },

    getTranslation(key, replacements = {}) {
        let translation = this.translations[this.currentLanguage][key] || key;
        for (const placeholder in replacements) {
            translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return translation;
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
    },

    // Helper to switch language based on difficulty (as per core philosophy)
    // This will be called by GameEngine or UI based on game state
    setLanguageByDifficulty(difficulty) {
        // Rule-based UI language switching
        if (difficulty === 'Einfach') {
            this.setLanguage('de'); // German for easy levels
        } else {
            this.setLanguage('en'); // English for medium/hard levels
        }
    }
};