// client/services/VocabularyService.js

export class VocabularyService {
    constructor() {
        this.vocabulary = null;
    }

    async loadVocabulary() {
        try {
            const response = await fetch('./assets/vocabulary.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.vocabulary = await response.json();
            console.log("Vocabulary loaded successfully:", this.vocabulary);
        } catch (error) {
            console.error("Error loading vocabulary:", error);
            this.vocabulary = null; // Ensure vocabulary is null on error
        }
    }

    /**
     * Generates a question based on difficulty and type.
     * @param {string} difficultyLevel - e.g., 'A1', 'A2', 'B1'
     * @param {string} questionType - e.g., 'meaning', 'synonym', 'antonym', 'grammar', 'forms'
     * @returns {object|null} A question object or null if no question can be generated.
     */
    generateQuestion(difficultyLevel, questionType) {
        if (!this.vocabulary) {
            console.error("Vocabulary not loaded.");
            return null;
        }

        const levelData = this.vocabulary.core_vocabulary_A1_B1[difficultyLevel];
        if (!levelData) {
            console.error(`No vocabulary data for difficulty level: ${difficultyLevel}`);
            return null;
        }

        let words = [];
        // Collect all words from the specified difficulty level
        for (const category in levelData) {
            if (Array.isArray(levelData[category])) {
                words = words.concat(levelData[category]);
            }
        }

        if (words.length === 0) {
            console.warn(`No words found for difficulty level: ${difficultyLevel}`);
            return null;
        }

        // Filter words based on question type suitability
        let suitableWords = words.filter(word => {
            if (questionType === 'synonym') return word.synonyme_de && word.synonyme_de.length > 0;
            if (questionType === 'antonym') return word.antonyme_de && word.antonyme_de.length > 0;
            if (questionType === 'grammar') return word.festpraeposition || word.artikel; // Nouns have artikel, verbs have festpraeposition
            if (questionType === 'forms') return word.steigerung || word.praeteritum; // Adjectives have steigerung, verbs have praeteritum
            return true; // 'meaning' type is always possible
        });

        if (suitableWords.length === 0) {
            console.warn(`No suitable words for question type '${questionType}' at level '${difficultyLevel}'. Falling back to 'meaning'.`);
            questionType = 'meaning'; // Fallback to meaning if no suitable words for specific type
            suitableWords = words; // Reset suitable words to all words for meaning
        }

        const selectedWord = this._getRandomElement(suitableWords);
        if (!selectedWord) return null;

        let questionText = '';
        let correctAnswer = '';
        let allAnswers = [];

        switch (questionType) {
            case 'meaning':
                questionText = `Was bedeutet "${selectedWord.wort}"?`;
                correctAnswer = selectedWord.bedeutung_en;
                allAnswers = this._generateDistractors(words, 'bedeutung_en', correctAnswer, 3);
                allAnswers.push(correctAnswer);
                break;
            case 'synonym':
                questionText = `Welches Wort ist ein Synonym für "${selectedWord.wort}"?`;
                correctAnswer = this._getRandomElement(selectedWord.synonyme_de);
                allAnswers = this._generateDistractors(words, 'synonyme_de', correctAnswer, 3, true);
                allAnswers.push(correctAnswer);
                break;
            case 'antonym':
                questionText = `Was ist das Gegenteil von "${selectedWord.wort}"?`;
                correctAnswer = this._getRandomElement(selectedWord.antonyme_de);
                allAnswers = this._generateDistractors(words, 'antonyme_de', correctAnswer, 3, true);
                allAnswers.push(correctAnswer);
                break;
            case 'grammar':
                if (selectedWord.artikel) { // Noun
                    questionText = `Welchen Artikel hat das Wort "${selectedWord.wort}"?`;
                    correctAnswer = selectedWord.artikel;
                    allAnswers = this._shuffleArray(['der', 'die', 'das', 'kein Artikel'].filter(a => a !== correctAnswer));
                    allAnswers = allAnswers.slice(0, 3); // Take 3 distractors
                    allAnswers.push(correctAnswer);
                } else if (selectedWord.festpraeposition) { // Verb with fixed preposition
                    questionText = `Welche Präposition passt zu "${selectedWord.infinitiv}"?`;
                    correctAnswer = selectedWord.festpraeposition;
                    const commonPrepositions = ['an', 'auf', 'in', 'mit', 'für', 'von', 'zu'];
                    allAnswers = this._shuffleArray(commonPrepositions.filter(p => p !== correctAnswer));
                    allAnswers = allAnswers.slice(0, 3); // Take 3 distractors
                    allAnswers.push(correctAnswer);
                } else {
                    // Fallback if no specific grammar rule found
                    questionType = 'meaning';
                    return this.generateQuestion(difficultyLevel, questionType); // Recurse with meaning
                }
                break;
            case 'forms':
                if (selectedWord.steigerung && selectedWord.steigerung.komparativ) { // Adjective
                    questionText = `Wie lautet der Komparativ von "${selectedWord.wort}"?`;
                    correctAnswer = selectedWord.steigerung.komparativ;
                    allAnswers = this._generateDistractors(words, 'steigerung.komparativ', correctAnswer, 3, false, true);
                    allAnswers.push(correctAnswer);
                } else if (selectedWord.praeteritum) { // Verb
                    questionText = `Wie lautet das Präteritum von "${selectedWord.infinitiv}"?`;
                    correctAnswer = selectedWord.praeteritum;
                    allAnswers = this._generateDistractors(words, 'praeteritum', correctAnswer, 3);
                    allAnswers.push(correctAnswer);
                } else {
                    // Fallback if no specific form found
                    questionType = 'meaning';
                    return this.generateQuestion(difficultyLevel, questionType); // Recurse with meaning
                }
                break;
            default:
                console.warn(`Unknown question type: ${questionType}. Falling back to 'meaning'.`);
                questionType = 'meaning';
                return this.generateQuestion(difficultyLevel, questionType); // Recurse with meaning
        }

        const shuffledAnswers = this._shuffleArray(allAnswers);
        const correctAnswerIndex = shuffledAnswers.indexOf(correctAnswer);

        return {
            questionText,
            answers: shuffledAnswers,
            correctAnswerIndex,
            type: questionType // Return the actual type used
        };
    }

    _getRandomElement(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Generates distractors for multiple-choice questions.
     * @param {Array} allWords - All available words in the vocabulary.
     * @param {string} propertyPath - The path to the property to extract (e.g., 'bedeutung_en', 'synonyme_de').
     * @param {string} correctAnswer - The correct answer to exclude from distractors.
     * @param {number} count - Number of distractors to generate.
     * @param {boolean} isArrayProperty - True if the property is an array (e.g., synonyme_de).
     * @param {boolean} isNestedProperty - True if the property is nested (e.g., steigerung.komparativ).
     * @returns {Array} An array of unique distractors.
     */
    _generateDistractors(allWords, propertyPath, correctAnswer, count, isArrayProperty = false, isNestedProperty = false) {
        const distractors = new Set();
        const allPossibleAnswers = [];

        allWords.forEach(word => {
            let value;
            if (isNestedProperty) {
                const parts = propertyPath.split('.');
                value = word;
                for (const part of parts) {
                    if (value && value[part] !== undefined) {
                        value = value[part];
                    } else {
                        value = undefined; // Path not found
                        break;
                    }
                }
            } else {
                value = word[propertyPath];
            }

            if (isArrayProperty && Array.isArray(value)) {
                value.forEach(item => allPossibleAnswers.push(item));
            } else if (value !== undefined && value !== null && value !== '') {
                allPossibleAnswers.push(value);
            }
        });

        const filteredPossibleAnswers = allPossibleAnswers.filter(ans => ans !== correctAnswer);

        while (distractors.size < count && filteredPossibleAnswers.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredPossibleAnswers.length);
            const distractor = filteredPossibleAnswers.splice(randomIndex, 1)[0]; // Remove to avoid duplicates
            if (distractor !== correctAnswer) {
                distractors.add(distractor);
            }
        }
        return Array.from(distractors);
    }
}
