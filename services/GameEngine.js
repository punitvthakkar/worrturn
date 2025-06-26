// client/services/GameEngine.js

export class GameEngine {
    constructor(vocabularyService, ui, apiService) {
        this.vocabularyService = vocabularyService;
        this.ui = ui;
        this.apiService = apiService;

        this.floors = [
            { floor: 1, points: 100, difficulty: 'A1', uiDifficulty: 'Einfach' },
            { floor: 2, points: 200, difficulty: 'A1', uiDifficulty: 'Einfach' },
            { floor: 3, points: 300, difficulty: 'A1', uiDifficulty: 'Einfach' },
            { floor: 4, points: 500, difficulty: 'A1', uiDifficulty: 'Einfach' },
            { floor: 5, points: 1000, difficulty: 'A1', uiDifficulty: 'Einfach' },
            { floor: 6, points: 2000, difficulty: 'A2', uiDifficulty: 'Mittel' },
            { floor: 7, points: 4000, difficulty: 'A2', uiDifficulty: 'Mittel' },
            { floor: 8, points: 8000, difficulty: 'A2', uiDifficulty: 'Mittel' },
            { floor: 9, points: 16000, difficulty: 'A2', uiDifficulty: 'Mittel' },
            { floor: 10, points: 32000, difficulty: 'A2', uiDifficulty: 'Mittel' },
            { floor: 11, points: 64000, difficulty: 'B1', uiDifficulty: 'Schwer' },
            { floor: 12, points: 125000, difficulty: 'B1', uiDifficulty: 'Schwer' },
            { floor: 13, points: 250000, difficulty: 'B1', uiDifficulty: 'Schwer' },
            { floor: 14, points: 500000, difficulty: 'B1', uiDifficulty: 'Schwer' },
            { floor: 15, points: 1000000, difficulty: 'B1', uiDifficulty: 'Schwer' }
        ];

        this.gameState = this.loadGameData();
        this.currentQuestion = null;
    }

    initGame() {
        if (!this.gameState.gameActive) {
            this.resetGame();
        }
        this.ui.renderTower(this.floors, this.gameState.currentFloor);
        this.ui.updateScore(this.gameState.score);
        this.ui.updatePersonalBest(this.gameState.personalBestScore, this.gameState.personalBestFloor);
        this.ui.updateLifelines(this.gameState.lifelinesUsed);
        this.loadQuestion();
    }

    async loadQuestion() {
        const currentFloorData = this.floors[this.gameState.currentFloor - 1];
        const difficultyLevel = currentFloorData.difficulty;
        const questionTypes = ["meaning", "synonym", "antonym", "grammar", "forms"]; // Define possible question types
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        this.currentQuestion = this.vocabularyService.generateQuestion(difficultyLevel, randomType);

        if (!this.currentQuestion) {
            console.error("Failed to generate a question.");
            // Fallback or error handling
            this.ui.updateQuestion("Error: Could not load question.");
            this.ui.clearAnswers();
            return;
        }

        this.ui.updateProgress(
            this.gameState.currentFloor,
            currentFloorData.uiDifficulty,
            this.currentQuestion.type
        );
        this.ui.updateQuestion(this.currentQuestion.questionText);
        this.ui.renderAnswers(this.currentQuestion.answers, this.currentQuestion.correctAnswerIndex);
        this.ui.enableAnswerButtons();
    }

    async handleAnswer(isCorrect, selectedBtn) {
        this.ui.disableAnswerButtons();
        if (isCorrect) {
            this.ui.animateCorrectAnswer(selectedBtn);
            this.gameState.score += this.floors[this.gameState.currentFloor - 1].points;
            this.ui.updateScore(this.gameState.score);

            if (this.gameState.currentFloor < this.floors.length) {
                this.gameState.currentFloor++;
                this.ui.renderTower(this.floors, this.gameState.currentFloor);
                this.saveGameData();
                setTimeout(() => this.loadQuestion(), 1500);
            } else {
                // Game won
                this.gameState.gameActive = false;
                this.ui.showGameResult('win', this.gameState.score);
                await this.submitScore();
                this.saveGameData();
            }
        } else {
            this.ui.animateWrongAnswer(selectedBtn, this.currentQuestion.correctAnswerIndex);
            this.gameState.gameActive = false;
            this.saveGameData();
            setTimeout(async () => {
                this.ui.showGameResult('lose', this.gameState.score);
                await this.submitScore();
            }, 2000);
        }
    }

    async useLifeline(type) {
        if (this.gameState.lifelinesUsed[type] || !this.gameState.gameActive) {
            return;
        }

        this.gameState.lifelinesUsed[type] = true;
        this.ui.updateLifelines(this.gameState.lifelinesUsed);
        this.saveGameData();

        switch (type) {
            case 'fifty':
                this.ui.applyFiftyFifty(this.currentQuestion.answers, this.currentQuestion.correctAnswerIndex);
                break;
            case 'audience':
                this.ui.showAudiencePoll(this.currentQuestion.answers, this.currentQuestion.correctAnswerIndex);
                break;
            case 'friend':
                this.ui.showFriendHint(this.currentQuestion.answers[this.currentQuestion.correctAnswerIndex]);
                break;
            case 'skip':
                this.loadQuestion();
                break;
        }
    }

    walkAway() {
        if (this.gameState.gameActive && this.gameState.score > 0) {
            this.gameState.gameActive = false;
            this.ui.showGameResult('walkAway', this.gameState.score);
            this.submitScore();
            this.saveGameData();
        } else if (!this.gameState.gameActive) {
            this.ui.showMessage("Game is already over. Start a new game.");
        }
    }

    resetGame() {
        this.gameState = {
            currentFloor: 1,
            score: 0,
            lifelinesUsed: {
                fifty: false,
                audience: false,
                friend: false,
                skip: false
            },
            gameActive: true,
            personalBestScore: this.gameState.personalBestScore || 0,
            personalBestFloor: this.gameState.personalBestFloor || 0
        };
        this.ui.resetUI();
        this.ui.renderTower(this.floors, this.gameState.currentFloor);
        this.ui.updateScore(this.gameState.score);
        this.ui.updatePersonalBest(this.gameState.personalBestScore, this.gameState.personalBestFloor);
        this.ui.updateLifelines(this.gameState.lifelinesUsed);
        this.loadQuestion();
        this.saveGameData();
    }

    saveGameData() {
        if (this.gameState.score > this.gameState.personalBestScore) {
            this.gameState.personalBestScore = this.gameState.score;
            this.gameState.personalBestFloor = this.gameState.currentFloor - (this.gameState.gameActive ? 0 : 1); // If game ended, it's the previous floor
        }
        localStorage.setItem('derWortturmGameState', JSON.stringify(this.gameState));
    }

    loadGameData() {
        const savedState = localStorage.getItem('derWortturmGameState');
        return savedState ? JSON.parse(savedState) : {
            currentFloor: 1,
            score: 0,
            lifelinesUsed: {
                fifty: false,
                audience: false,
                friend: false,
                skip: false
            },
            gameActive: true,
            personalBestScore: 0,
            personalBestFloor: 0
        };
    }

    async fetchLeaderboard() {
        try {
            const leaderboardData = await this.apiService.getLeaderboard();
            this.ui.updateLeaderboard(leaderboardData);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            this.ui.showMessage("Could not load leaderboard.");
        }
    }

    async submitScore() {
        try {
            // For MVP, we can use a simple prompt for username or a default
            const username = localStorage.getItem('derWortturmUsername') || prompt("Enter your username for the leaderboard:");
            if (username) {
                localStorage.setItem('derWortturmUsername', username);
                const scoreData = { username, score: this.gameState.score, floor: this.gameState.currentFloor - (this.gameState.gameActive ? 0 : 1) };
                await this.apiService.submitScore(scoreData);
                this.fetchLeaderboard(); // Refresh leaderboard after submitting
            }
        } catch (error) {
            console.error("Error submitting score:", error);
            this.ui.showMessage("Could not submit score.");
        }
    }

    getCurrentDifficulty() {
        return this.floors[this.gameState.currentFloor - 1].uiDifficulty;
    }

    getCurrentQuestionType() {
        return this.currentQuestion ? this.currentQuestion.type : '';
    }
}
