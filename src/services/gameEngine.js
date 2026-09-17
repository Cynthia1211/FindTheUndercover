import { shuffle } from '../utils/shuffle';

export function createGameInstance(wordsData, selectedCategory) {
  if (!wordsData || wordsData.length === 0) {
    throw new Error("Empty Word Bank!");
  }

  const categoryWords = wordsData.filter(item => item.category === selectedCategory);
  if (categoryWords.length < 2) {
    throw new Error(`Category "${selectedCategory}" needs at least two words.`);
  }
  
  const civilianIndex = Math.floor(Math.random() * categoryWords.length);
  const civilianObj = categoryWords[civilianIndex];
  const remainingWords = categoryWords.filter((_, index) => index !== civilianIndex);
  const undercoverObj = remainingWords[Math.floor(Math.random() * remainingWords.length)];

  const shuffledCivilianClues = shuffle(civilianObj.clues);
  const civilianCluePacks = [
    shuffledCivilianClues.slice(0, 5),
    shuffledCivilianClues.slice(5, 10),
    shuffledCivilianClues.slice(10, 15)
  ];
  const undercoverCluePack = shuffle(undercoverObj.clues).slice(0, 5);

  const undercoverIndex = Math.floor(Math.random() * 4);
  let civilianPackIndex = 0;

  const npcs = [0, 1, 2, 3].map(i => {
    const isUndercover = i === undercoverIndex;
    return {
      id: i + 1,
      name: `NPC ${ i + 1 }`,
      role: isUndercover ? 'UNDERCOVER' : 'CIVILIAN',
      word: isUndercover ? undercoverObj.word : civilianObj.word,
      allClues: isUndercover ? undercoverCluePack : civilianCluePacks[civilianPackIndex++],
      displayedClues: [],
    };
  });

  return {
    category: selectedCategory,
    civilianWord: civilianObj.word,
    undercoverWord: undercoverObj.word,
    npcs
  };
}
