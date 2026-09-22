import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/wordServices';

// Manage category loading and selection.
export function useCategorySelection() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

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

  const handleCategoryChange = event => {
    setSelectedCategory(event.target.value);
  };

  return {
    categories,
    selectedCategory,
    handleCategoryChange
  };
}
