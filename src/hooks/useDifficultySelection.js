import { useState } from 'react';

export const DIFFICULTIES = ['Easy', 'Advanced'];

// Manage the difficulty option used by the game.
export function useDifficultySelection() {
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[0]);

  const handleDifficultyChange = event => {
    setSelectedDifficulty(event.target.value);
  };

  return {
    selectedDifficulty,
    difficulties: DIFFICULTIES,
    handleDifficultyChange
  };
}
