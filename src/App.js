// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { useCategorySelection } from './hooks/useCategorySelection';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Render the game screen and connect user actions to the game logic hook.
function App() {
  const { user } = useAuth();
  const publicBasePath = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : `${window.location.pathname}/`;
  const [playingWordId, setPlayingWordId] = useState(null);
  const wordAudioRef = useRef(null);

  const {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
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
    score,
    startGame,
    selectNpc,
    nextRound
  } = useGameLogic();

  const {
    categories,
    selectedCategory: SELECTED_CATEGORY,
    handleCategoryChange: updateCategory
  } = useCategorySelection();

  const selectedDifficulty = 'Easy';

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

  useEffect(() => () => wordAudioRef.current?.pause(), []);

  useEffect(() => {
    if (!isGameSettled && wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
      setPlayingWordId(null);
    }
  }, [isGameSettled]);

  const playWordAudio = (audioUrl, npcId) => {
    if (!audioUrl) return;

    if (playingWordId === npcId && wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
      setPlayingWordId(null);
      return;
    }

    wordAudioRef.current?.pause();
    const player = new Audio(audioUrl);
    wordAudioRef.current = player;
    setPlayingWordId(npcId);

    const clearPlayer = () => {
      if (wordAudioRef.current === player) {
        wordAudioRef.current = null;
        setPlayingWordId(null);
      }
    };

    player.addEventListener('ended', clearPlayer, { once: true });
    player.addEventListener('error', clearPlayer, { once: true });
    player.play().catch(error => {
      console.error('Unable to play word audio:', error);
      clearPlayer();
    });
  };

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

  const maxWordLength = game
    ? Math.max(...game.npcs.map(npc => (npc.wordSan || '').length))
    : 0;
  const wordCardHeight = 168 + Math.max(0, Math.ceil(maxWordLength / 24) - 1) * 22;

  const handlePlayAgain = () => {
    clearLeaderboardMessage();
    startGame(SELECTED_CATEGORY, selectedDifficulty);
  };

  const handleNewWords = () => {
    startGame(SELECTED_CATEGORY, selectedDifficulty);
  };

  const openProgramPage = programPage => {
    if (!programPage) return;
    window.open(programPage, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="app-container"
      style={{ '--app-background-image': `url(${publicBasePath}sheridan_background.webp)` }}
    >
      <audio ref={audioRef} id="Undercoversong" loop>
        <source src={`${process.env.PUBLIC_URL}/Undercoversong.mp3`} type="audio/mpeg" />
      </audio>

      <audio id="CorrectAnswer">
        <source src={`${process.env.PUBLIC_URL}/CorrectAnswer.wav`} type="audio/wav" />
      </audio>

      <audio id="FailedGame">
        <source src={`${process.env.PUBLIC_URL}/FailedGame.mp3`} type="audio/mpeg" />
      </audio>
      <audio id="WrongAnswer">
        <source src={`${process.env.PUBLIC_URL}/WrongAnswer.mp3`} type="audio/mpeg" />
      </audio>
  
      <div className="top-bar">
      <h1>Welcome to Sheridan</h1>
      </div>

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
            {/* <span>Round: {currentRound} / 5</span> */}
            {/* <span>Score: {score}</span> */}
          </header>

          <div className="npc-grid">
            {game.npcs.map(npc => (
              <div
                key={npc.id}
                className={`npc-card ${selectedNpcId === npc.id ? 'active' : ''}`}
                onClick={() => {
                  selectNpc(npc.id);
                  openProgramPage(npc.programPage);
                }}
              >
                <div
                  className="word-card revealed"
                  style={{ height: `${wordCardHeight}px` }}
                >
                  {npc.wordImage ? (
                    <img className="word-card-image" src={npc.wordImage} alt={`Illustration for ${npc.wordSan}`} />
                  ) : (
                    <div className="word-card-image-placeholder" aria-label={`No image available for ${npc.wordSan}`}>
                      🖼️
                    </div>
                  )}
                  <div className="word-card-footer">
                    <span className="word-card-word">{npc.wordSan}</span>
                    {/* Word audio is intentionally disabled for now. */}
                  </div>
                </div>
                <img className="npc-image" src={npc.image} alt={`NPC ${npc.id}`} />
                <ul>
                  {npc.displayedClues.map((clue, i) => (
                    <li key={i}>{clue}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {gameStatus === 'PLAYING' && (
            <>
              <p className="program-link-hint">Click the NPC card to learn more about the program</p>
              <div className="game-actions">
                <button className="primary-button" onClick={handleNewWords}>
                  Explore more
                </button>
                <button className="secondary-button" onClick={nextRound} disabled={currentRound >= 6}>
                  {currentRound >= 6 ? 'No more to show' : 'Tell me more'}
                </button>
              </div>
            </>
          )}

          {(gameStatus === 'WON' || gameStatus === 'LOST') && (
            <div className={`result-banner ${gameStatus}`}>
              <h2>{gameStatus === 'WON' ? '🎉 You found the undercover!' : '💥 The undercover got away!'}</h2>
              <p>Civilian words: {game.civilianWord} | Undercover word: {game.undercoverWord}</p>
              <div className="score-actions">
                <button className="primary-button" onClick={handlePlayAgain}>Play Again</button>
                {/* <button className="secondary-button" onClick={submitLeaderboardScore} disabled={submittingScore}>
                  {submittingScore ? 'Submitting...' : 'Submit Score'}
                </button> */}
              </div>
              {leaderboardMessage && <p className="leaderboard-message" role="status">{leaderboardMessage}</p>}
            </div>
          )}
        </div>
      )}

      <nav className="nav-instructions">
        <button className='back-button' onClick={()=> window.location.href='https://www.sheridancollege.ca/'} aria-label="Sheridan College home">
          <img className="home-logo" src={`${process.env.PUBLIC_URL}/sheridanLogo_1.jpeg`} alt="" />
        </button>
        <img className="sheridan-logo" src={`${process.env.PUBLIC_URL}/sheridanLogo.png`} alt="Sheridan College" />
        {/* <button className="third-button" onClick={instruction} aria-label="Instructions" title="Instructions">ℹ️</button>
        <button className='fourth-button' onClick={settings}>⚙️</button> */}
      </nav>  
 
      {/* {showInstructions && (
        <div className="popup">
          <h2>INSTRUCTIONS</h2>

          <p>Four NPCs receive secret words</p>
          <p>Three share the same word, while one gets a different one. </p>
          <p>Search for the Clues. And find the Odd one Out</p>

          <button className="instruction-button" onClick={closeInstructions}>Close</button>
        </div>
      )} */}


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


          <button onClick={closeSettings}>Close</button>
        </div>


      )}
    </div>
  );
}


export default App;
