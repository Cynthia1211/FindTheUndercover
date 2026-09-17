import { useState } from 'react';
import { fetchWordBank } from '../services/wordServices';
import { createGameInstance } from '../services/gameEngine';

export function useGameLogic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStatus, setGameStatus] = useState('IDLE'); 
  const [game, setGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedNpcId, setSelectedNpcId] = useState(null);
  const [voteFeedback, setVoteFeedback] = useState(null);


  const startGame = async (selectedCategory) => {
    setLoading(true);
    setError(null);
    setSelectedNpcId(null);
    setVoteFeedback(null);
    setCurrentRound(1);

    try {
      const wordsData = await fetchWordBank();
      const newGameData = createGameInstance(wordsData, selectedCategory);

      const initialNpcs = newGameData.npcs.map(npc => ({
        ...npc,
        displayedClues: [npc.allClues[0]]
      }));

      setGame({ ...newGameData, npcs: initialNpcs });
      setGameStatus('PLAYING');
    } catch (err) {
      console.error(err);
      setError('Failed to load the word bank. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectNpc = (npcId) => {
    if (gameStatus === 'PLAYING') {
      setSelectedNpcId(npcId);
      setVoteFeedback(null);
    }
  };

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
  };

  const submitVote = () => {
    if (!selectedNpcId || gameStatus !== 'PLAYING') return;

    const targetNpc = game.npcs.find(n => n.id === selectedNpcId);

    if (targetNpc.role === 'UNDERCOVER') {
      setGameStatus('WON');
      setSelectedNpcId(null);
      setVoteFeedback(null);
      return;
    }

    if (currentRound >= 5) {
      setGameStatus('LOST');
    } else {
      setVoteFeedback('That is not the undercover. Try again!');
    }

    setSelectedNpcId(null);
  };

  return {
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
  };
}
