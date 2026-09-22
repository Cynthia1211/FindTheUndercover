import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/wordServices';

const POPUP_DURATION = 3000;

// Manage category loading, selection, and restart notifications.
export function useCategorySelection(gameStatus, startGame) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [restartPopupCategory, setRestartPopupCategory] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchCategories()
      .then(scannedCategories => {
        if (!isMounted) return;

        setCategories(scannedCategories);
        setSelectedCategory(currentCategory =>
          scannedCategories.includes(currentCategory)
            ? currentCategory
            : scannedCategories[0] || ''
        );
      })
      .catch(() => {
        // The game hook displays the word-bank loading error when a game starts.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!restartPopupCategory) return undefined;

    const timeoutId = setTimeout(() => {
      setRestartPopupCategory(null);
    }, POPUP_DURATION);

    return () => clearTimeout(timeoutId);
  }, [restartPopupCategory]);

  const handleCategoryChange = event => {
    const nextCategory = event.target.value;
    setSelectedCategory(nextCategory);

    if (gameStatus !== 'IDLE' && nextCategory !== selectedCategory) {
      setRestartPopupCategory(nextCategory);
      startGame(nextCategory);
    }
  };

  return {
    categories,
    selectedCategory,
    restartPopupCategory,
    handleCategoryChange
  };
}
