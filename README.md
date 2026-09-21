# Find the Undercover

Find the Undercover is a React game where players inspect clues from NPCs and try to identify the undercover character. The project uses a React frontend and an Express backend. The backend also provides text-to-speech through Microsoft Azure Speech.

## Project structure

```text
find-the-undercover/
├── client/       # React frontend
│   ├── public/
│   └── src/
└── server/       # Express API and Azure Speech integration
    ├── server.js
    └── .env
```

## Requirements

- Node.js and npm
- An Azure Speech resource if text-to-speech is enabled

Node.js 18 or newer is recommended.

## Installation

Install dependencies separately for the frontend and backend:

```bash
cd client
npm install

cd ../server
npm install
```

## Environment variables

Create the server environment file from the example:

```bash
cp server/.env.example server/.env
```

Then update `server/.env` with your Azure Speech credentials:

```env
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-speech-region
AZURE_SPEECH_LANGUAGE=hi-IN
AZURE_SPEECH_VOICE=hi-IN-SwaraNeural
PORT=5001
```

`server/.env` contains local secrets and must not be committed to Git. The language and voice can be changed there without modifying the frontend.

## Run the application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

For a regular start without automatic restarts:

```bash
cd server
npm start
```

Start the frontend in a second terminal:

```bash
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000). The React development server proxies `/api` requests to the backend at `http://localhost:5001`.

## API

### `POST /api/tts`

Converts text to speech using the Azure settings from `server/.env`.

Request body:

```json
{
  "text": "Text to synthesize"
}
```

Response:

```json
{
  "audioContent": "base64-encoded-mp3"
}
```

## Testing and production build

Run the frontend tests:

```bash
cd client
npm test -- --watchAll=false --runInBand
```

Create a production frontend build:

```bash
cd client
npm run build
```

The generated files are placed in `client/build/` and are ignored by Git.

## Troubleshooting

- If the frontend cannot call `/api/tts`, make sure the server is running on port `5001`.
- If speech synthesis fails, verify `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `AZURE_SPEECH_LANGUAGE`, and `AZURE_SPEECH_VOICE` in `server/.env`.
- Restart the backend after changing `server/.env`.
