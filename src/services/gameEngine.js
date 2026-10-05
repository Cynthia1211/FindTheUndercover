import { shuffle } from '../utils/shuffle';
import npcImage1 from '../assets/img_npc1.png';
import npcImage2 from '../assets/img_npc2.png';
import npcImage3 from '../assets/img_npc3.png';
import npcImage4 from '../assets/img_npc4.png';
import npcImage5 from '../assets/img_npc5.png';
import npcImage6 from '../assets/img_npc6.png';
import npcImage7 from '../assets/img_npc7.png';
import npcImage8 from '../assets/img_npc8.png';

const NPC_IMAGES = [
  npcImage1,
  npcImage2,
  npcImage3,
  npcImage4,
  npcImage5,
  npcImage6,
  npcImage7,
  npcImage8
];

// Create the hidden game data for the game.
export function createGameInstance(wordsData, selectedCategory, selectedDifficulty) {
  if (!wordsData || wordsData.length === 0) {
    throw new Error("Empty Word Bank!");
  }

  const categoryWords = wordsData.filter(item => item.category === selectedCategory);
  const uniqueCategoryWords = [...new Map(
    categoryWords
      .filter(item => item.word)
      .map(item => [item.word, item])
  ).values()];

  if (uniqueCategoryWords.length < 3) {
    throw new Error(`Category "${selectedCategory}" needs at least three different words.`);
  }

  // Choose three different words and give one to each NPC.
  const selectedWords = shuffle(uniqueCategoryWords).slice(0, 3);

  // Use Sanskrit clues for Advanced and English clues for Easy.
  const cluesFor = wordData => {
    const preferredClues = selectedDifficulty === 'Advanced'
      ? wordData['clues-san']
      : wordData.clues;
    return Array.isArray(preferredClues) && preferredClues.length > 0
      ? preferredClues
      : wordData.clues || [];
  };

  // Randomly assign the undercover role to one of the three NPCs.
  const undercoverIndex = Math.floor(Math.random() * 3);
  const selectedNpcImages = shuffle(NPC_IMAGES).slice(0, 3);

  const npcs = [0, 1, 2].map(i => {
    const isUndercover = i === undercoverIndex;
    const wordData = selectedWords[i];
    const allClues = shuffle(cluesFor(wordData));

    return {
      id: i + 1,
      // name: `NPC ${ i + 1 }`,
      image: selectedNpcImages[i],
      role: isUndercover ? 'UNDERCOVER' : 'CIVILIAN',
      word: wordData.word,
      wordSan: wordData['word-san'],
      wordImage: wordData.img,
      wordAudio: wordData.audio,
      programPage: wordData.programPage,
      allClues,
      displayedClues: allClues.slice(0, 1),
    };
  });

  return {
    // category: selectedCategory,
    difficulty: selectedDifficulty,
    civilianWord: selectedWords.filter((_, index) => index !== undercoverIndex).map(word => word.word).join(', '),
    undercoverWord: selectedWords[undercoverIndex].word,
    npcs
  };
}
