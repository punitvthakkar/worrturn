import { GameEngine } from './services/GameEngine.js';
import { UI } from './services/UI.js';
import { VocabularyService } from './services/VocabularyService.js';
import { i18n } from './services/i18n.js';
import { ApiService } from './services/ApiService.js';

// Initialize services
const vocabularyService = new VocabularyService();
const apiService = new ApiService();
const ui = new UI();
const gameEngine = new GameEngine(vocabularyService, ui, apiService);

// Game Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Load vocabulary and UI translations
    await vocabularyService.loadVocabulary();
    await i18n.loadTranslations();
    i18n.setLanguage('de'); // Default language

    ui.init(); // Initialize UI elements and event listeners
    gameEngine.initGame(); // Start the game logic

    // Initial UI update
    ui.updateScore(gameEngine.gameState.score);
    ui.updatePersonalBest(gameEngine.gameState.personalBestScore, gameEngine.gameState.personalBestFloor);
    ui.updateLifelines(gameEngine.gameState.lifelinesUsed);
    ui.renderTower(gameEngine.floors, gameEngine.gameState.currentFloor);
    gameEngine.loadQuestion(); // Load the first question
    ui.updateProgress(gameEngine.gameState.currentFloor, gameEngine.getCurrentDifficulty(), gameEngine.getCurrentQuestionType());

    // Fetch and display leaderboard
    await gameEngine.fetchLeaderboard();
});

// Event Listeners (delegated to UI for better separation)
// UI will emit custom events that app.js listens to

// Handle answer selection
document.addEventListener('answerSelected', async (event) => {
    const { isCorrect, selectedBtn } = event.detail;
    await gameEngine.handleAnswer(isCorrect, selectedBtn);
});

// Handle lifeline usage
document.addEventListener('lifelineUsed', async (event) => {
    const { type } = event.detail;
    await gameEngine.useLifeline(type);
});

// Handle control buttons
document.addEventListener('walkAway', () => {
    gameEngine.walkAway();
});

document.addEventListener('newGame', () => {
    gameEngine.resetGame();
});

// Handle window resize for starfield
window.addEventListener('resize', () => {
    ui.createStarfield();
});
