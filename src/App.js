// src/App.js
import React, { useEffect, useState } from 'react';
import { MAX_ATTEMPTS, useGameLogic } from './hooks/useGameLogic';
import { useCategorySelection } from './hooks/useCategorySelection';
import { useDifficultySelection } from './hooks/useDifficultySelection';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useAuth } from './hooks/useAuth';
import AuthPanel from './components/auth/AuthPanel';
import './App.css';

// Render the game screen and connect user actions to the game logic hook.
function App() {
  const { user, signOutUser } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
    voteFeedback,
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
  const isGameSettled = gameStatus === 'WON' || gameStatus === 'LOST';
  const {
    leaderboardMessage,
    submittingScore,
    submitLeaderboardScore,
    clearLeaderboardMessage
  } = useLeaderboard(user, score);

  useEffect(() => {
    if (!restartPopupMessage) return undefined;

    const timeoutId = setTimeout(() => setRestartPopupMessage(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [restartPopupMessage]);

  useEffect(() => {
    if (categories.length > 0 && gameStatus === 'IDLE' && !loading) {
      startGame(SELECTED_CATEGORY, selectedDifficulty);
    }
    // Start once the word categories have loaded; game controls handle later restarts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

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

  const handlePlayAgain = () => {
    clearLeaderboardMessage();
    startGame(SELECTED_CATEGORY, selectedDifficulty);
  };

  return (
    <div className="app-container">
      
      <div className="top-bar">
        <h1>Find the Undercover</h1>

        <div className="account-bar">
          {user ? (
            <>
              <span>Signed in as {user.displayName || user.email}</span>
              <button className="text-button" onClick={signOutUser}>Sign out</button>
            </>
          ) : (
            <button className="login-button" onClick={() => setShowAuth(true)}>Sign in</button>
          )}
        </div>
      </div>

      {showAuth && <AuthPanel onClose={() => setShowAuth(false)} />}

      {error && <p className="error-msg">{error}</p>}

      {restartPopupMessage && (
        <div className="category-restart-popup" role="status">
          {restartPopupMessage}
        </div>
      )} 

      {loading && <p className="loading-msg">Loading game...</p>}

      {game && (
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
              <div className="score-actions">
                <button className="primary-button" onClick={handlePlayAgain}>Play Again</button>
                <button className="secondary-button" onClick={submitLeaderboardScore} disabled={submittingScore}>
                  {submittingScore ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>
              {leaderboardMessage && <p className="leaderboard-message" role="status">{leaderboardMessage}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
