// src/App.js
import React from 'react';
import { MAX_ATTEMPTS, useGameLogic } from './hooks/useGameLogic';
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
    showInstructions, 
    closeInstructions,
    showSettings,
    closeSettings,
    toggleMic,
    toggleAudio,
    isListening,
    isAudio,
    settings,
    voteFeedback,
    instruction,
    timeLeft,
    attemptsLeft,
    startGame,
    selectNpc,
    submitVote,
    nextRound
  } = useGameLogic();

  // NPC words remain hidden until the game reaches a final result.
  const isGameSettled = gameStatus === 'WON' || gameStatus === 'LOST';

  return (
    <div className="app-container">
      <audio id= "Undercoversong" loop>
      <source src= "/Undercoversong.mp3" type="audio/mpeg"/>
      </audio>

      <audio id="WrongAnswer">
        <source src="/WrongAnswer.mp3" type="audio/wav"/>
      </audio>
      <audio id="CorrectAnswer">
        <source src="/CorrectAnswer.wav" type="audio/wav"/>
      </audio>
      <audio id="ClockTicking">
        <source src="/Clock Ticking.mp3" type="audio/mp3"/>
      </audio>

      <audio id="FailedGame">
        <source src="/FailedGame.mp3" type="audio/mp3"></source>
      </audio>
      
      <h1>F
      <span className="magnify-container">
      <span className='base-letter'>i</span>
      <span className="glass-emoji">🔍</span>
        <span className="zoomed-letter">i</span>
      </span>
      nd the Undercover
      </h1>


            {gameStatus !== 'IDLE' && (
         <div>

          <header className="game-header">
            <span>Category: {game.category}</span>
            <span>Round: {currentRound} / 5</span>
            <span>Attempts: {attemptsLeft} / {MAX_ATTEMPTS}</span>
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
              <button className="primary-button" onClick={() => startGame(SELECTED_CATEGORY)}>Play Again</button>
            </div>
          )}
                 </div>
      )} 
        
            <nav className="nav-instructions">
            <button className='back-button' onClick={()=> window.location.href='https://zatam2.vercel.app/'}> 🏠︎ </button>
            <button className="third-button" onClick={instruction} > ℹ️</button>
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
              <span style= {{ fontSize: '1.5em', color:'black' }} >Music</span>

              <button className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleMic}> {isListening ? '🎵' : '🎵❌'}
            </button>
            </h6>
            <h6 className="sfx-settings">
               <span style= {{ fontSize: '1.5em', color: 'black'}} > Sound Effect</span>
            
            <button className={`sfx-btn ${isAudio ? 'listening' : ''}`}
              onClick={toggleAudio}> {isAudio ? '🔈' : '🔇'}
            </button>
            </h6>
  
          
            <div className='settingButton'>
            <button onClick={closeSettings}>Close</button>
         </div>
      </div>



        )}  
      </div>
  );
}
      

export default App;

