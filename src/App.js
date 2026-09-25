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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
    voteFeedback,
    showInstructions,
    closeInstructions,
    backButton,
    instruction,
    settings,
    showSettings,
    closeSettings,
    toggleMic,
    isListening,
    audioRef,
    musicError,
    toggleSfx,
    isSfxEnabled,
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
      <audio ref={audioRef} id="Undercoversong" loop>
        <source src={`${process.env.PUBLIC_URL}/Undercoversong.mp3`} type="audio/mpeg" />
      </audio>

      <div className="account-bar">
        {user ? (
          <button
            className="account-avatar"
            onClick={() => setShowSignOutConfirm(true)}
            aria-label="Account options"
            title={`Signed in as ${user.displayName || user.email}`}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="" />
            ) : (
              <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
            )}
          </button>
        ) : (
          <button className="login-button" onClick={() => setShowAuth(true)}>Sign in</button>
        )}
      </div>

      <div className="top-bar">
        <h1>Find the Undercover</h1>
      </div>

      {showAuth && <AuthPanel onClose={() => setShowAuth(false)} />}

      {showSignOutConfirm && (
        <div className="confirm-overlay">
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="signout-title">
            <h2 id="signout-title">Log out?</h2>
            <p>Are you sure you want to log out of your current account?</p>
            <div className="confirm-actions">
              <button className="secondary-button" onClick={() => setShowSignOutConfirm(false)}>
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={async () => {
                  await signOutUser();
                  setShowSignOutConfirm(false);
                }}
              >
                Confirm Logout
              </button>
            </div>
          </section>
        </div>
      )}

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

      <nav className="nav-instructions">
        <button className='back-button' onClick={backButton}> 🏠︎ </button>
        <button className="third-button" onClick={instruction} aria-label="Instructions" title="Instructions">ℹ️</button>
        <button className='fourth-button' onClick={settings}>⚙️</button>
      </nav>

      {showInstructions && (
        <div className="popup">
          <h2>INSTRUCTIONS</h2>

          <p>Four NPCs receive secret words</p>
          <p>Three share the same word, while one gets a different one. </p>
          <p>Search for the Clues. And find the Odd one Out</p>

          <div className='instruction-button'>
            <button onClick={closeInstructions}>Close</button>
          </div>
        </div>
      )}


      {showSettings && (
        <div className="popup">
          <h2>SETTINGS</h2>
          <h6 className='music-settings'>
            <span style={{ fontSize: '1.5em', color: 'black' }} >Music</span>

            <button className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleMic}> {isListening ? '🎵' : '🎵❌'}
            </button>
          </h6>
          {musicError && <p className="error-msg" role="alert">{musicError}</p>}
          <h6 className="sfx-settings">
            <span style={{ fontSize: '1.5em', color: 'black' }} > Sound Effect</span>

            <button className={`sfx-btn ${isSfxEnabled ? 'listening' : ''}`}
              onClick={toggleSfx}
              aria-label={isSfxEnabled ? 'Disable sound effects' : 'Enable sound effects'}>
              {isSfxEnabled ? '🔈' : '🔇'}
            </button>
          </h6>


          <div className='settingButton'>
            <button onClick={closeSettings}>Close</button>

            {/* <div className="backbtn">
          <button className='back-button' onClick={backButton}> &lt; Main Menu </button> */}
          </div>
        </div>


      )}
    </div>
  );
}


export default App;

ssssss