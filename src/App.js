// src/App.js
import React from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import './App.css';

const SELECTED_CATEGORY = 'Food';

// Render the game screen and connect user actions to the game logic hook.
function App() {
  const {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
    voteFeedback,
    startGame,
    selectNpc,
    submitVote,
    nextRound
  } = useGameLogic();

  // NPC words remain hidden until the game reaches a final result.
  const isGameSettled = gameStatus === 'WON' || gameStatus === 'LOST';

  return (
    <div className="app-container">
      <h1>Find the Undercover</h1>

      {error && <p className="error-msg">{error}</p>}

      {gameStatus === 'IDLE' && (
        <section className="welcome-panel">
          <p>Can you find the undercover before the final round?</p>
          <button className="primary-button" onClick={() => startGame(SELECTED_CATEGORY)} disabled={loading}>
            {loading ? 'Loading words...' : 'Start Game'}
          </button>
        </section>
      )}

      {gameStatus !== 'IDLE' && (
        <div>
          <header className="game-header">
            <span>Category: {game.category}</span>
            <span>Round: {currentRound} / 5</span>
          </header>

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
              <button className="primary-button" onClick={() => startGame(SELECTED_CATEGORY)}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
