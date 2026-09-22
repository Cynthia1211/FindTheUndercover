// src/App.js
import React, { useEffect, useState } from 'react';
import { MAX_ATTEMPTS, useGameLogic } from './hooks/useGameLogic';
import { useCategorySelection } from './hooks/useCategorySelection';
import { useDifficultySelection } from './hooks/useDifficultySelection';
import './App.css';

// Render the game screen and connect user actions to the game logic hook.
function App() {
  const {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
    showInstructions, 
    closeInstructions,
    showSettings,
    closeSettings,
    settings,
    voteFeedback,
    instruction,
    timeLeft,
    attemptsLeft,
    score,
    startGame,
    selectNpc,
    submitVote,
    nextRound
  } = useGameLogic();

  const {
    categories,
    selectedCategory: SELECTED_CATEGORY,
    handleCategoryChange: updateCategory
  } = useCategorySelection();

  const {
    selectedDifficulty,
    difficulties,
    handleDifficultyChange: updateDifficulty
  } = useDifficultySelection();

  const [restartPopupMessage, setRestartPopupMessage] = useState(null);

  useEffect(() => {
    if (!restartPopupMessage) return undefined;

    const timeoutId = setTimeout(() => setRestartPopupMessage(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [restartPopupMessage]);

  const handleCategoryChange = event => {
    const nextCategory = event.target.value;
    updateCategory(event);

    if (gameStatus !== 'IDLE' && nextCategory !== SELECTED_CATEGORY) {
      setRestartPopupMessage(
        `Game restarts with category ${nextCategory} and difficulty ${selectedDifficulty}`
      );
      startGame(nextCategory, selectedDifficulty);
    }
  };

  const handleDifficultyChange = event => {
    const nextDifficulty = event.target.value;
    updateDifficulty(event);

    if (gameStatus !== 'IDLE' && nextDifficulty !== selectedDifficulty) {
      setRestartPopupMessage(
        `Game restarts with category ${SELECTED_CATEGORY} and difficulty ${nextDifficulty}`
      );
      startGame(SELECTED_CATEGORY, nextDifficulty);
    }
  };

  const categorySelector = (
    <label className="category-selector">
      <span>Category:</span>
      <select
        value={SELECTED_CATEGORY}
        onChange={handleCategoryChange}
        disabled={categories.length === 0}
      >
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  );

  const difficultySelector = (
    <label className="category-selector difficulty-selector">
      <span>Difficulty:</span>
      <select value={selectedDifficulty} onChange={handleDifficultyChange}>
        {difficulties.map(difficulty => (
          <option key={difficulty} value={difficulty}>
            {difficulty}
          </option>
        ))}
      </select>
    </label>
  );

  // NPC words remain hidden until the game reaches a final result.
  const isGameSettled = gameStatus === 'WON' || gameStatus === 'LOST';

  return (
    <div className="app-container">
      
      <h1>Find the Undercover</h1>

      {error && <p className="error-msg">{error}</p>}

      {restartPopupMessage && (
        <div className="category-restart-popup" role="status">
          {restartPopupMessage}
        </div>
      )}

      {gameStatus === 'IDLE' && (
        <section className="welcome-panel">
          <p>Can you find the undercover before the final round?</p>

          <button className="primary-button" onClick={() => startGame(SELECTED_CATEGORY, selectedDifficulty)} disabled={loading}>
            {loading ? 'Loading words...' : 'Start Game'}
          </button>

          <div className="div-button">
            <button className="third-button" onClick={instruction} > Instructions </button>
          {showInstructions && (
            <div className="popup">
            <h2>INSTRUCTIONS</h2>
            <p>Four NPCs receive secret words</p>
            <p>Three share the same word, while one gets a different one. </p>
            <p>Search for the Clues. And find the Odd one Out</p>
            
            <button onClick={closeInstructions}>Close</button>
          
          </div>
          )}
          
          </div>
          <div className="second-div-button">
          <button className='fourth-button' onClick={settings}>Settings</button>
          {showSettings && (
            <div className="popup">
            <h2>SETTINGS</h2>
            <p>Music</p>
            
            
            <button onClick={closeSettings}>Close</button>
          
          </div>
          )}
          
          </div>
        </section>
      )}

      {gameStatus !== 'IDLE' && (
        <div>
          <header className="game-header">
            {categorySelector}
            {difficultySelector}
            <span>Round: {currentRound} / 5</span>
            <span>Attempts: {attemptsLeft} / {MAX_ATTEMPTS}</span>
            <span>Score: {score}</span>
          </header>

          {gameStatus === 'PLAYING' && currentRound === 5 && timeLeft !== null && (
            <p className="countdown" role="timer">
              All clues revealed! Find the undercover in {timeLeft}s
            </p>
          )}

          <div className="npc-grid">
            {game.npcs.map(npc => (
              <div 
                key={npc.id}
                className={`npc-card ${selectedNpcId === npc.id ? 'active' : ''}`}
                onClick={() => selectNpc(npc.id)}
              >
                <div className="word-label">{isGameSettled ? npc.word : '???'}</div>
                <img className="npc-image" src={npc.image} alt={`${npc.name} avatar`} />
                {/* <h2>{npc.name}</h2> */}
                <ul>
                  {npc.displayedClues.map((clue, i) => (
                    <li key={i}><strong>Clue {i + 1}:</strong> {clue}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {voteFeedback && <p className="vote-feedback">{voteFeedback}</p>}

          {gameStatus === 'PLAYING' && (
            <div className="game-actions">
              <button className="primary-button" onClick={submitVote} disabled={!selectedNpcId}>
                Vote for Undercover
              </button>
              <button className="secondary-button" onClick={nextRound} disabled={currentRound >= 5}>
                {currentRound >= 5 ? 'Final Round' : 'More Clues'}
              </button>
            </div>
          )}

          {(gameStatus === 'WON' || gameStatus === 'LOST') && (
            <div className={`result-banner ${gameStatus}`}>
              <h2>{gameStatus === 'WON' ? '🎉 You found the undercover!' : '💥 The undercover got away!'}</h2>
              <p>Civilian word: {game.civilianWord} | Undercover word: {game.undercoverWord}</p>
              <button className="primary-button" onClick={() => startGame(SELECTED_CATEGORY, selectedDifficulty)}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
