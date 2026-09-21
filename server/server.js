const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// 1. 核心：正确配置 CORS 允许跨域及 OPTIONS 预检请求
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. 解析 JSON 请求体
app.use(express.json());

// 3. 初始化 Google TTS 客户端
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

// 4. TTS 接口
app.post('/api/tts', async (req, res) => {
  try {
    const { text, languageCode = 'sa-IN' } = req.body;

    // const request = {
    //   input: { text: text },
    //   voice: {
    //     languageCode: languageCode,
    //     name: 'en-US-Neural2-F',
    //   },
    //   audioConfig: { audioEncoding: 'MP3' },
    // };

    // 构造基本的 voice 请求对象
    const voiceConfig = {
      ssmlGender: 'FEMALE',
    };

    // 如果前端传的是 sa-IN (梵语)，映射至 hi-IN 高清神经发音模型
    if (languageCode === 'sa-IN') {
      voiceConfig.languageCode = 'hi-IN';
      voiceConfig.name = 'hi-IN-Neural2-A'; 
    } else {
      voiceConfig.languageCode = languageCode;
    }

    const request = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioBase64 = response.audioContent.toString('base64');
    
    res.json({ audioContent: audioBase64 });
  } catch (error) {
    console.error('=== Google TTS Error Detail ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', JSON.stringify(error.details || error, null, 2));
    console.error('===============================');
    res.status(500).json({ error: 'TTS 转换失败', details: error.message });
  }
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 防止进程意外退出
server.on('error', (err) => {
  console.error('Server error:', err);
});
