import { useEffect, useState } from 'react';
import { fetchWordBank } from '../services/wordServices';
import { createGameInstance } from '../services/gameEngine';

export const MAX_ATTEMPTS = 3;

// Manage the game state and expose actions used by the UI.
export function useGameLogic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStatus, setGameStatus] = useState('IDLE'); 
  const [game, setGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedNpcId, setSelectedNpcId] = useState(null);
  const [voteFeedback, setVoteFeedback] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [score, setScore] = useState(0);

  // Start the final-round countdown and automatically lose when it expires.
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || currentRound < 5 || timeLeft === null) {
      return undefined;
    }

    if (timeLeft <= 0) {
      setGameStatus('LOST');
      setSelectedNpcId(null);
      setVoteFeedback(null);
      return undefined;
    } 

    const timerId = setTimeout(() => {
      setTimeLeft(previousTime => previousTime - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [currentRound, gameStatus, timeLeft]);

  // Start a new game and reveal only the first clue for each NPC.
  const startGame = async (selectedCategory, selectedDifficulty) => {
    setLoading(true);
    setError(null);
    setSelectedNpcId(null);
    setVoteFeedback(null);
    setCurrentRound(1);
    setTimeLeft(null);
    setAttemptsLeft(MAX_ATTEMPTS);


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
      setVoteFeedback(null);
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
    setVoteFeedback(null);
    setTimeLeft(nextRoundNumber === 5 ? 60 : null);
  };

  // Check the selected NPC and either end the game or provide feedback.
  const submitVote = () => {
    if (!selectedNpcId || gameStatus !== 'PLAYING') return;

    const targetNpc = game.npcs.find(n => n.id === selectedNpcId);

    if (targetNpc.role === 'UNDERCOVER') {
      setGameStatus('WON');
      setScore(previousScore => previousScore + 100);
      setSelectedNpcId(null);
      setVoteFeedback(null);
      return;
    }

    const remainingAttempts = attemptsLeft - 1;
    setAttemptsLeft(remainingAttempts);

    if (remainingAttempts <= 0 || currentRound >= 5) {
      setGameStatus('LOST');
    } else {
      setVoteFeedback('That is not the undercover. Try again!');
    }

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


  return {
    loading,
    error,
    gameStatus,
    game,
    currentRound,
    selectedNpcId,
    showInstructions,
    voteFeedback,
    closeInstructions,
    settings,
    closeSettings, 
    showSettings,
    instruction,
    timeLeft,
    attemptsLeft,
    score,
    startGame,
    selectNpc,
    submitVote,
    nextRound
  };
}
