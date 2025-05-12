/**
 * @file App.jsx
 * @description
 * This is the main component of the Hangman game, built using React and styled with CSS.
 * It handles all core functionality including:
 * - Word fetching from the backend API
 * - Keyboard interaction and guess validation
 * - Game state updates (win/loss)
 * - Language selection (English or Spanish)
 * - Displaying lives using programming languages
 * - UI effects such as confetti on win
 *
 * -----------------------------
 * COMPONENT STRUCTURE OVERVIEW
 * -----------------------------
 * 1. State Variables:
 *    - currentWord: the target word to guess
 *    - guessedLetters: array of letters the player has guessed
 *    - winGame: boolean flag for win condition
 *    - wrongAttemps: number of incorrect guesses
 *    - language: selected language ('en' or 'es')
 *    - gameOver: derived value (true if win or max wrong attempts)
 *
 * 2. useEffect Hooks:
 *    - When the language is selected, fetch a new word.
 *    - On each guess, check if all letters are found to trigger win state.
 *    - On win, launch confetti for visual feedback.
 *
 * 3. Word Display:
 *    - The word is split into characters and displayed as individual letter boxes.
 *    - Only letters guessed correctly are shown.
 *
 * 4. Keyboard:
 *    - Rendered dynamically from a hardcoded alphabet string.
 *    - Buttons change color (green/red) based on correctness.
 *    - Buttons are disabled when the game ends.
 *
 * 5. Lives Display:
 *    - Lives are visualized using programming languages (imported from languages.js).
 *    - Each incorrect guess dims one language tag and overlays a skull emoji.
 *
 * 6. Input Handling:
 *    - checkGuessedLetter() handles key presses and updates guessedLetters and wrongAttempts.
 *
 * 7. Game Reset:
 *    - resetGame() clears the board and fetches a new word.
 *
 * 8. Word Fetching:
 *    - getNewWord() sends a request to the backend with the selected language.
 *    - Parses the response differently for English and Spanish APIs.
 *
 * 9. UI Rendering:
 *    - If no language is selected, prompts the user to choose.
 *    - Once selected, renders the entire game interface.
 */

import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './styles/App.css';
import { languages } from './languages';
import confetti from 'canvas-confetti';

function App() {
  // -------------------------
  // State Variables
  // -------------------------

  const [currentWord, setCurrentWord] = useState(" ");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [winGame, setWinGame] = useState(false);
  const [wrongAttemps, setWrongAttemps] = useState(0);
  const [language, setLanguage] = useState(null);
  const gameOver = winGame || wrongAttemps > 7;

  // -------------------------
  // Effects
  // -------------------------

  useEffect(() => {
    if (language !== null) {
      getNewWord();
    }
  }, [language]);

  useEffect(() => {
    const hasWon = currentWord
      .split("")
      .every(letter => guessedLetters.includes(letter));
    if (hasWon) setWinGame(true);
  }, [guessedLetters]);

  useEffect(() => {
    if (winGame) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
      });
    }
  }, [winGame]);

  // -------------------------
  // Word Display Logic
  // -------------------------

  const displayedWord =
    currentWord !== " "
      ? currentWord.split("").map((letter, index) => {
          const isGuessed = guessedLetters.includes(letter);
          return (
            <span key={index} className="letter">
              {isGuessed ? letter.toUpperCase() : ""}
            </span>
          );
        })
      : null;

  // -------------------------
  // Keyboard Button Setup
  // -------------------------

  const alphabet = "qwertyuiopasdfghjklzxcvbnm";
  const keyboard = alphabet.split("").map(letterButton => {
    const isGuessed = guessedLetters.includes(letterButton.toLowerCase());
    const isCorrect = currentWord.includes(letterButton.toLowerCase());
    let className = "buttonColor";
    if (isGuessed) {
      className += isCorrect ? " green" : " red";
    }
    return (
      <button
        disabled={gameOver}
        onClick={checkGuessedLetter}
        key={letterButton}
        className={className}
      >
        {letterButton.toUpperCase()}
      </button>
    );
  });
  console.log(currentWord)

  // -------------------------
  // Lives Display (Programming Languages)
  // -------------------------

  const programmingLanguages = languages.map((language, index) => {
    const className = wrongAttemps <= index ? "" : "wrong-answer";
    return (
      <span
        key={language.name}
        style={{
          backgroundColor: language.backgroundColor,
          color: language.color,
          padding: '4.5px 4.5px',
          fontWeight: '700',
          borderRadius: "3px",
          margin: "1.5px 1.5px"
        }}
        className={className}
      >
        {language.name}
      </span>
    );
  });

  // -------------------------
  // User Input Handler
  // -------------------------

  function checkGuessedLetter(event) {
    const buttonValue = event.target.textContent.toLowerCase();
    if (!guessedLetters.includes(buttonValue)) {
      setGuessedLetters(prev => [...prev, buttonValue]);
      if (!currentWord.includes(buttonValue)) {
        setWrongAttemps(prev => prev + 1);
      }
    }
  }

  // -------------------------
  // Game Reset
  // -------------------------

  async function resetGame() {
    getNewWord();
    setGuessedLetters([]);
    setWinGame(false);
    setWrongAttemps(0);
  }

  // -------------------------
  // Fetch a New Word from the API
  // -------------------------

  async function getNewWord() {
    const res = await fetch(`http://localhost:3001/api/word?lang=${language}`);
    const data = await res.json();

    let word = "";
    if (language === "en") {
      word = data.word[0].toLowerCase();
    } else if (language === "es") {
      const spanishWords = data.results;
      word =
        spanishWords[Math.floor(Math.random() * spanishWords.length)].Palabra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    setCurrentWord(word);
  }

  // -------------------------
  // UI Rendering
  // -------------------------

  return (
    <main>
      {language === null ? (
        // Language selection view
        <>
          <h2 className="title">
            Select the language of the words you will be guessing
          </h2>
          <section className="language-picker">
            <button onClick={() => setLanguage("es")}>
              <img src="https://flagcdn.com/es.svg" width="24" alt="Spain" />
            </button>
            <button onClick={() => setLanguage("en")}>
              <img src="https://flagcdn.com/gb.svg" width="24" alt="UK" />
            </button>
          </section>
        </>
      ) : (
        // Main game view
        <>
          <header>
            <h1 className="title">App component</h1>
            <p className="instructions">
              Guess the word in under 8 attempts to keep the programming world safe from Assembly!
            </p>
          </header>

          {winGame && (
            <section className="game-status win">
              <h2>You win!</h2>
              <p>Well done! 🎉</p>
            </section>
          )}

          {wrongAttemps > 7 && (
            <section className="game-status lose">
              <h2>Game over!</h2>
              <p>You lose! Better start learning Assembly 😭</p>
            </section>
          )}

          <section className="programming-languages">
            {programmingLanguages}
          </section>

          <section className="word">{displayedWord}</section>

          <section className="keyboard">{keyboard}</section>

          {gameOver && (
            <button onClick={resetGame} className="new-game">
              New Game
            </button>
          )}
        </>
      )}
    </main>
  );
}

export default App;
