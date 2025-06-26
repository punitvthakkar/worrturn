// client/services/UI.js

export class UI {
    constructor() {
        this.elements = {
            currentScore: document.getElementById('currentScore'),
            personalBest: document.getElementById('personalBest'),
            personalBestFloor: document.getElementById('personalBestFloor'),
            tower: document.getElementById('tower'),
            currentFloorDisplay: document.getElementById('currentFloorDisplay'),
            difficultyDisplay: document.getElementById('difficultyDisplay'),
            questionTypeDisplay: document.getElementById('questionTypeDisplay'),
            lifeline50: document.getElementById('lifeline50'),
            lifelineAudience: document.getElementById('lifelineAudience'),
            lifelineFriend: document.getElementById('lifelineFriend'),
            lifelineSkip: document.getElementById('lifelineSkip'),
            questionText: document.getElementById('questionText'),
            answersGrid: document.getElementById('answersGrid'),
            walkAwayBtn: document.getElementById('walkAwayBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            leaderboard: document.getElementById('leaderboard'),
            badgesDisplay: document.getElementById('badgesDisplay'),
            badgesProgress: document.getElementById('badgesProgress'),
            starfield: document.getElementById('starfield')
        };
        this.gsap = window.gsap; // Access GSAP from global scope
    }

    init() {
        this.addEventListeners();
        this.createStarfield();
        this.updateBadgesDisplay(); // Initial display of badges
    }

    addEventListeners() {
        this.elements.answersGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-btn') && !e.target.disabled) {
                const isCorrect = e.target.getAttribute('data-correct') === 'true';
                this._dispatchEvent('answerSelected', { isCorrect, selectedBtn: e.target });
            }
        });

        this.elements.lifeline50.addEventListener('click', () => this._dispatchEvent('lifelineUsed', { type: 'fifty' }));
        this.elements.lifelineAudience.addEventListener('click', () => this._dispatchEvent('lifelineUsed', { type: 'audience' }));
        this.elements.lifelineFriend.addEventListener('click', () => this._dispatchEvent('lifelineUsed', { type: 'friend' }));
        this.elements.lifelineSkip.addEventListener('click', () => this._dispatchEvent('lifelineUsed', { type: 'skip' }));

        this.elements.walkAwayBtn.addEventListener('click', () => this._dispatchEvent('walkAway'));
        this.elements.newGameBtn.addEventListener('click', () => this._dispatchEvent('newGame'));

        // Keyboard support for answers A, B, C, D
        document.addEventListener('keydown', (e) => {
            if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
                const btn = document.querySelector(`[data-answer="${e.key.toUpperCase()}"]`);
                if (btn && !btn.disabled) {
                    btn.click();
                }
            }
        });
    }

    _dispatchEvent(eventName, detail = {}) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    createStarfield() {
        const svg = this.elements.starfield;
        const width = window.innerWidth;
        const height = window.innerHeight;

        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.innerHTML = ''; // Clear existing stars

        // Create 100 stars
        for (let i = 0; i < 100; i++) {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            star.setAttribute('cx', Math.random() * width);
            star.setAttribute('cy', Math.random() * height);
            star.setAttribute('r', Math.random() * 2 + 1);
            star.setAttribute('fill', '#00ff41');
            star.setAttribute('opacity', Math.random() * 0.8 + 0.2);

            // Add twinkling animation
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0.2;1;0.2');
            animate.setAttribute('dur', Math.random() * 3 + 2 + 's');
            animate.setAttribute('repeatCount', 'indefinite');

            star.appendChild(animate);
            svg.appendChild(star);
        }
    }

    renderTower(floors, currentFloor) {
        this.elements.tower.innerHTML = '';
        for (let i = floors.length - 1; i >= 0; i--) {
            const floorDiv = document.createElement('div');
            floorDiv.className = 'floor';
            floorDiv.id = `floor-${floors[i].floor}`;
            floorDiv.innerHTML = `${floors[i].floor}. ${floors[i].points.toLocaleString()}`;

            if (floors[i].floor === currentFloor) {
                floorDiv.classList.add('active');
            } else if (floors[i].floor < currentFloor) {
                floorDiv.classList.add('completed');
            }

            this.elements.tower.appendChild(floorDiv);
        }
    }

    updateScore(score) {
        this.elements.currentScore.textContent = score.toLocaleString();
    }

    updatePersonalBest(score, floor) {
        this.elements.personalBest.textContent = score.toLocaleString();
        this.elements.personalBestFloor.textContent = floor > 0 ? `Etage ${floor} erreicht` : '';
    }

    updateProgress(currentFloor, difficulty, questionType) {
        this.elements.currentFloorDisplay.textContent = `Etage ${currentFloor}`;
        this.elements.difficultyDisplay.textContent = difficulty;
        this.elements.questionTypeDisplay.textContent = questionType;
    }

    updateQuestion(questionText) {
        this.elements.questionText.textContent = questionText;
    }

    renderAnswers(answers, correctAnswerIndex) {
        this.elements.answersGrid.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.setAttribute('data-answer', letters[index]);
            btn.setAttribute('data-correct', index === correctAnswerIndex);
            btn.textContent = `${letters[index]}: ${answer}`;
            this.elements.answersGrid.appendChild(btn);
        });
    }

    enableAnswerButtons() {
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
            btn.style.opacity = '1'; // Reset opacity for 50:50
        });
    }

    disableAnswerButtons() {
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    animateCorrectAnswer(selectedBtn) {
        selectedBtn.classList.add('correct');
        this.gsap.to(selectedBtn, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });
    }

    animateWrongAnswer(selectedBtn, correctAnswerIndex) {
        selectedBtn.classList.add('wrong');
        const allBtns = document.querySelectorAll('.answer-btn');
        allBtns[correctAnswerIndex].classList.add('correct');
        this.gsap.to(this.elements.tower, { x: -10, duration: 0.1, yoyo: true, repeat: 5 });
    }

    updateLifelines(lifelinesUsed) {
        for (const type in lifelinesUsed) {
            const btnId = type === 'fifty' ? 'lifeline50' :
                          type === 'audience' ? 'lifelineAudience' :
                          type === 'friend' ? 'lifelineFriend' : 'lifelineSkip';
            const btn = this.elements[btnId];
            if (btn) {
                if (lifelinesUsed[type]) {
                    btn.classList.add('used');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('used');
                    btn.disabled = false;
                }
            }
        }
    }

    applyFiftyFifty(answers, correctAnswerIndex) {
        const wrongBtns = Array.from(document.querySelectorAll('.answer-btn'))
            .filter((btn, index) => index !== correctAnswerIndex);
        const toRemove = this._shuffleArray(wrongBtns).slice(0, 2);
        toRemove.forEach(btn => {
            btn.style.opacity = '0.3';
            btn.disabled = true;
        });
        this.showMessage("Two wrong answers removed!");
    }

    showAudiencePoll(answers, correctAnswerIndex) {
        // Simulate audience poll results
        const results = {};
        const total = 100;
        let remaining = total;

        // Give correct answer a higher percentage
        const correctPercentage = Math.floor(Math.random() * (70 - 50 + 1)) + 50; // 50-70%
        results[correctAnswerIndex] = correctPercentage;
        remaining -= correctPercentage;

        // Distribute remaining percentage among other answers
        const otherIndices = answers.map((_, i) => i).filter(i => i !== correctAnswerIndex);
        let distributed = 0;
        for (let i = 0; i < otherIndices.length; i++) {
            const index = otherIndices[i];
            let share;
            if (i === otherIndices.length - 1) {
                share = remaining - distributed;
            } else {
                share = Math.floor(Math.random() * (remaining - distributed + 1));
            }
            results[index] = share;
            distributed += share;
        }

        let pollMessage = "Audience Poll:\n";
        answers.forEach((answer, index) => {
            pollMessage += `${String.fromCharCode(65 + index)}: ${results[index] || 0}%\n`;
        });
        this.showMessage(pollMessage);
    }

    showFriendHint(correctAnswer) {
        this.showMessage(`Your friend says: "I'm pretty sure the answer is ${correctAnswer}."`);
    }

    showMessage(message) {
        alert(message); // Simple alert for MVP
    }

    showGameResult(type, score) {
        let message = '';
        if (type === 'win') {
            message = `Congratulations! You conquered Der Wortturm with a score of ${score.toLocaleString()}! 🏆`;
        } else if (type === 'lose') {
            message = `Too bad! Your final score is ${score.toLocaleString()}. Keep practicing!`;
        } else if (type === 'walkAway') {
            message = `You walked away with ${score.toLocaleString()} points! Well played!`;
        }
        this.showMessage(message);
    }

    resetUI() {
        this.updateScore(0);
        this.updatePersonalBest(0, 0);
        this.updateLifelines({
            fifty: false,
            audience: false,
            friend: false,
            skip: false
        });
        this.elements.questionText.textContent = '';
        this.elements.answersGrid.innerHTML = '';
        this.updateProgress(1, 'Einfach', '');
    }

    updateLeaderboard(leaderboardData) {
        const leaderboardDiv = this.elements.leaderboard;
        leaderboardDiv.innerHTML = '';

        if (!leaderboardData || leaderboardData.length === 0) {
            leaderboardDiv.innerHTML = '<div style="text-align: center; color: #666;">No scores yet. Be the first!</div>';
            return;
        }

        leaderboardData.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            let rankIcon = '';
            if (index === 0) rankIcon = '🥇';
            else if (index === 1) rankIcon = '🥈';
            else if (index === 2) rankIcon = '🥉';
            else rankIcon = `${index + 1}.`;

            item.innerHTML = `
                <span>${rankIcon} ${entry.username}</span>
                <span>${entry.score.toLocaleString()}</span>
            `;
            leaderboardDiv.appendChild(item);
        });
    }

    updateBadgesDisplay() {
        // For MVP, hardcode some badge icons and a simple progress message
        // In a full implementation, this would be dynamic based on user achievements
        this.elements.badgesDisplay.innerHTML = '<div>🏆 🎯 📚</div>';
        this.elements.badgesProgress.innerHTML = '<div style="color: #ffd700; font-size: 0.9rem;">Erste Schritte<br>Blitzdenker<br>Wortsammler</div><div style="color: #666; margin-top: 10px; font-size: 0.8rem;">3 von 25 Abzeichen</div>';
    }
}
