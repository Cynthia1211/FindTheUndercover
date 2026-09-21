export async function playTextToSpeech(text) {
  if (!text || !text.trim()) {
    throw new Error('No text available for playback');
  }

  console.info('[TTS] requesting speech:', text);

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`TTS request failed (${response.status}): ${details}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('TTS returned empty audio data');
    }

    const audioBase64 = data.audioContent;
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    const audio = new Audio(audioUrl);

    await audio.play();
    console.info('[TTS] playback started successfully');
  } catch (error) {
    console.error('[TTS] failed:', error);
    throw error;
  }
}
