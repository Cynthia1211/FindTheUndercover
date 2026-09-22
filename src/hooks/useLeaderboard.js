import { useState } from 'react';
import { postScore } from '../services/leaderboardService';

export function useLeaderboard(user, score) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitLeaderboardScore = async () => {
    if (!user) {
      setMessage('Please sign in before submitting your score.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const updated = await postScore(user, score);
      setMessage(
        updated ? 'Score submitted to the leaderboard!' : 'Your leaderboard score is already higher.'
      );
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
      setMessage('Could not submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearLeaderboardMessage = () => setMessage('');

  return {
    leaderboardMessage: message,
    submittingScore: submitting,
    submitLeaderboardScore,
    clearLeaderboardMessage
  };
}
