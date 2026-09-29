# Find The Undercover

## Run the Project

From the project root, run:

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## How the Game Works

- The word bank is read from the `words` collection in Firestore. The available categories are generated from each word document's `category` field.
- When a game starts, the app fetches the word bank, filters it to the selected category, and randomly chooses two different words: one for the civilians and one for the undercover. A category needs at least two word entries.
- Four NPCs are created: three civilians share one word, and one undercover gets the other. The undercover role and NPC images are assigned randomly.
- Each word document should include `category`, `word`, and `clues`. `word-san`, `clues-san`, `img`, and `audio` are also used when available. Advanced difficulty uses `clues-san`, falling back to `clues`; Easy uses `clues`. Civilian clues are shuffled and divided into three packs, so aim to provide at least 15 clues per word for a full set. The undercover receives up to five clues.
- The game reveals one clue per NPC at a time, for up to five rounds. Players have three incorrect votes. In the fifth round, a 60-second countdown starts; finding the undercover wins the game, while running out of attempts or time ends it in a loss.
- A win awards 100 points on Easy or 200 on Advanced. A signed-in player can submit their score to the leaderboard; only a higher score for that player on the same day replaces the existing entry.
- The word bank uses its own Firebase configuration in `src/wordBank-config.js`. Authentication and leaderboard data use the separate configuration in `src/firebase-config.js`.

## Update the Word Bank

- To edit or add words, make the changes on the Firebase page.
- To update the word bank in bulk, import a JSON file into Firebase. See [firebase_mass_import](https://github.com/Cynthia1211/firebase_mass_import.git) for instructions.

## Embed to zatam page

After updating the project, follow these steps to embed it to zatam page:

1. Run `npm run build` from the project root.
2. Copy all contents of the `build` folder into zatam's `Games/Find-The-Undercover` folder, replacing the old files.

**Note: Keep the existing `cover.png` in the zatam destination folder. Do not delete the cover image.**
