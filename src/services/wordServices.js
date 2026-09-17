
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
