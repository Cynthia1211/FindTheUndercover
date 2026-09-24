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
  if (categoryWords.length < 2) {
    throw new Error(`Category "${selectedCategory}" needs at least two words.`);
  }
  
  // Choose two different words: one for civilians and one for the undercover.
  const civilianIndex = Math.floor(Math.random() * categoryWords.length);
  const civilianObj = categoryWords[civilianIndex];
  const remainingWords = categoryWords.filter((_, index) => index !== civilianIndex);
  const undercoverObj = remainingWords[Math.floor(Math.random() * remainingWords.length)];

  // Use Sanskrit clues for Advanced and English clues for Easy.
  const cluesFor = wordData => {
    const preferredClues = selectedDifficulty === 'Advanced'
      ? wordData['clues-san']
      : wordData.clues;
    return Array.isArray(preferredClues) && preferredClues.length > 0
      ? preferredClues
      : wordData.clues || [];
  };

  // Divide civilian clues into separate packs so NPCs do not all have the same clues.
  const shuffledCivilianClues = shuffle(cluesFor(civilianObj));
  const civilianCluePacks = [
    shuffledCivilianClues.slice(0, 5),
    shuffledCivilianClues.slice(5, 10),
    shuffledCivilianClues.slice(10, 15)
  ];
  const undercoverCluePack = shuffle(cluesFor(undercoverObj)).slice(0, 5);

  // Randomly assign the undercover role to one of the four NPCs.
  const undercoverIndex = Math.floor(Math.random() * 4);
  const selectedNpcImages = shuffle(NPC_IMAGES).slice(0, 4);
  let civilianPackIndex = 0;

  const npcs = [0, 1, 2, 3].map(i => {
    const isUndercover = i === undercoverIndex;
    const wordData = isUndercover ? undercoverObj : civilianObj;
    const allClues = isUndercover
      ? undercoverCluePack
      : civilianCluePacks[civilianPackIndex++];

    return {
      id: i + 1,
      // name: `NPC ${ i + 1 }`,
      image: selectedNpcImages[i],
      role: isUndercover ? 'UNDERCOVER' : 'CIVILIAN',
      word: wordData.word,
      wordSan: wordData['word-san'],
      wordImage: wordData.img,
      wordAudio: wordData.audio,
      allClues,
      displayedClues: [allClues[0]],
    };
  });

  return {
    // category: selectedCategory,
    difficulty: selectedDifficulty,
    civilianWord: civilianObj.word,
    undercoverWord: undercoverObj.word,
    npcs
  };
}
