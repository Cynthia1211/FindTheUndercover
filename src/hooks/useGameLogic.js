import { useEffect, useRef, useState } from 'react';
import { fetchWordBank } from '../services/wordServices';
import { createGameInstance } from '../services/gameEngine';

// Manage the game state and expose actions used by the UI.
export function useGameLogic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStatus, setGameStatus] = useState('IDLE'); 
  const [game, setGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedNpcId, setSelectedNpcId] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [musicError, setMusicError] = useState(null);
  const audioRef = useRef(null);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [score, setScore] = useState(0);

  // Start a new game and reveal only the first clue for each NPC.
  const startGame = async (selectedCategory, selectedDifficulty) => {
    setLoading(true);
    setError(null);
    setSelectedNpcId(null);
    setCurrentRound(1);


    try {
      const wordsData = await fetchWordBank();
      const newGameData = createGameInstance(wordsData, selectedCategory, selectedDifficulty);

      setGame(newGameData);
      setGameStatus('PLAYING');
    } catch (err) {
      console.error(err);
      setError('Failed to load the word bank. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select an NPC while the game is still in progress.
  const selectNpc = (npcId) => {
    if (gameStatus === 'PLAYING') {
      setSelectedNpcId(npcId);
    }
  };

  // Reveal one additional clue for every NPC.
  const nextRound = () => {
    if (!game || gameStatus !== 'PLAYING' || currentRound >= 5) return;

    const nextRoundNumber = currentRound + 1;
    const npcsWithNewClues = game.npcs.map(npc => ({
      ...npc,
      displayedClues: npc.allClues.slice(0, nextRoundNumber)
    }));

    setCurrentRound(nextRoundNumber);
    setGame({ ...game, npcs: npcsWithNewClues });
    setSelectedNpcId(null);

  };

  const instruction =  () => {
  setShowInstructions(true);
  }
  
  const closeInstructions = () => {
  setShowInstructions(false);
  };

  const settings = () => {
  setShowSettings(true);
  }

  const closeSettings = () => {
  setShowSettings(false);
  }

  const backButton = () => {
  setGameStatus('IDLE');
  setGame(null);
  setSelectedNpcId(null);
  setShowInstructions(false);
  setShowSettings(false);
};
  const toggleMic = async () => {
  const audio = audioRef.current;

  if (!audio) {
    setMusicError('Background music is unavailable.');
    return;
  }

  if (isListening) {
    audio.pause();
    setIsListening(false);
  } else {
    try {
      setMusicError(null);
      audio.volume = 0.5;
      await audio.play();
      setIsListening(true);
    } catch (playError) {
      console.error('Unable to play background music:', playError);
      setIsListening(false);
      setMusicError('Could not play background music. Try clicking again.');
    }
  }
};

  const toggleSfx = () => {
    setIsSfxEnabled(previous => !previous);
  };

  const playSfx = (sound) => {
    if (isSfxEnabled){
      document.getElementById(sound)?.play();
    }
  };

  return {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
    showInstructions,
    closeInstructions,
    backButton,
    settings,
    closeSettings, 
    showSettings,
    instruction,
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
  };
}
