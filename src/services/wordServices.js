import { collection, getDocs } from 'firebase/firestore';
import { wordsDb } from '../wordBank-config';

// Load the word bank used to create new game instances.
export async function fetchWordBank() {
  try {
    const snapshot = await getDocs(collection(wordsDb, 'words'));
    return snapshot.docs.map(wordDocument => ({
      id: wordDocument.id,
      ...wordDocument.data()
    }));
  } catch (error) {
    console.error('Failed to get words from Firestore:', error);
    throw error;
  }
}

// Return the unique categories available in the word bank.
export async function fetchCategories() {
  const words = await fetchWordBank();
  return [...new Set(words.map(word => word.category).filter(Boolean))];
}
