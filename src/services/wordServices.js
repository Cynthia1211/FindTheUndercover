// Load the word bank used to create new game instances.
export async function fetchWordBank() {
  try {
    const response = await fetch('/data/words.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Faild to get words:", error);
    throw error;
  }
}

// Return the unique categories available in the word bank.
export async function fetchCategories() {
  const words = await fetchWordBank();
  return [...new Set(words.map(word => word.category).filter(Boolean))];
}
