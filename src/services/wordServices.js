import { collection, getDocs } from 'firebase/firestore';
import { wordsDb } from '../wordBank-config';

let cachedWordBank = null;
let wordBankRequest = null;

// Load the word bank once and share it between category selection and games.
export async function fetchWordBank() {
  if (cachedWordBank) return cachedWordBank;
  if (wordBankRequest) return wordBankRequest;

  wordBankRequest = (async () => {
    try {
      const snapshot = await getDocs(collection(wordsDb, 'words'));
      cachedWordBank = snapshot.docs.map(wordDocument => ({
        id: wordDocument.id,
        ...wordDocument.data()
      }));
      return cachedWordBank;
    } catch (error) {
      console.error('Failed to get words from Firestore:', error);
      throw error;
    } finally {
      wordBankRequest = null;
    }
  })();

  return wordBankRequest;
}

// Return the unique categories available in the word bank.
export async function fetchCategories() {
  const words = await fetchWordBank();
  return [...new Set(words.map(word => word.category).filter(Boolean))];
}
