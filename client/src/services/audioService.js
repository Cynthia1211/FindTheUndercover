export async function playTextToSpeech(text) {
  if (!text || !text.trim()) {
    throw new Error('没有可播放的文本');
  }

  console.info('[TTS] requesting speech:', text);

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, languageCode: 'sa-IN' }),
    });

    console.info('[TTS] response:', response.status, response.headers.get('content-type'));

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`TTS 请求失败 (${response.status}): ${details}`);
    }

    // 1. 读取后端返回的 JSON 数据（包含 audioContent 字段）
    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('TTS 返回了空音频数据');
    }

    // 2. 将 Base64 字符串拼接为标准 Data URL
    const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;

    // 3. 构造 Audio 实例并播放
    const audio = new Audio(audioUrl);

    await audio.play();
    console.info('[TTS] playback started successfully');
  } catch (error) {
    console.error('[TTS] failed:', error);
    throw error;
  }
}