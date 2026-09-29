# Find The Undercover

## Run the Project

From the project root, run:

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Update the Word Bank

- To edit or add words, make the changes on the Firebase page.
- To update the word bank in bulk, import a JSON file into Firebase. See [firebase_mass_import](https://github.com/Cynthia1211/firebase_mass_import.git) for instructions.

## Embed to zatam page

After updating the project, follow these steps to embed it to zatam page:

1. Run `npm run build` from the project root.
2. Copy all contents of the `build` folder into zatam's `Games/Find-The-Undercover` folder, replacing the old files.

**Note: Keep the existing `cover.png` in the zatam destination folder. Do not delete the cover image.**
