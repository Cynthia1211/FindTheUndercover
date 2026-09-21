const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

const speechLanguage = process.env.AZURE_SPEECH_LANGUAGE;
const speechVoice = process.env.AZURE_SPEECH_VOICE;

// 1. Configure CORS for cross-origin requests
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parse JSON request bodies
app.use(express.json());

// 3. Wrap Azure speech synthesis
function synthesizeSpeech(text) {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );

    speechConfig.speechSynthesisLanguage = speechLanguage;
    speechConfig.speechSynthesisVoiceName = speechVoice;
    speechConfig.speechSynthesisOutputFormat = 
      sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const audioBuffer = Buffer.from(result.audioData);
          const base64Audio = audioBuffer.toString('base64');
          synthesizer.close();
          resolve(base64Audio);
        } else {
          const errorDetails = result.errorDetails;
          synthesizer.close();
          reject(new Error(`Azure TTS conversion failed: ${errorDetails}`));
        }
      },
      (err) => {
        synthesizer.close();
        reject(err);
      }
    );
  });
}

// 4. TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    if (!speechLanguage || !speechVoice) {
      return res.status(500).json({ error: 'Azure speech configuration is missing on the server' });
    }

    console.log(`[Azure Speech] Generating speech with ${speechLanguage}/${speechVoice}: "${text}"`);
    const audioBase64 = await synthesizeSpeech(text);

    // Return base64 audio for the frontend audioService.js
    res.json({ audioContent: audioBase64 });
  } catch (error) {
    console.error('=== Azure TTS Error Detail ===', error);
    res.status(500).json({ error: 'TTS conversion failed', details: error.message });
  }
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Prevent unexpected process termination
server.on('error', (err) => {
  console.error('Server error:', err);
});
