/**
 * Vercel Serverless Function — DeepSeek API 代理
 * 保护 API Key 不暴露在前端代码中
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 太阳系科普专家系统提示词
const SYSTEM_PROMPT = `你是「火种号」AI 助手，一名专业的太阳系科普专家。你正在一艘探索太阳系的飞船上，为宇航员提供科学指导。

你的职责：
1. 回答关于太阳系、行星、恒星、卫星、小行星等天文知识的问题
2. 用通俗易懂的语言解释科学原理，适当使用比喻
3. 鼓励提问者的好奇心，引导他们深入了解天文知识
4. 回答要准确、有深度，但不要过于专业化
5. 可以分享有趣的天文冷知识
6. 保持友好、热情的语气，像一个博学的太空向导

你可以讨论的主题：
- 太阳系八大行星的特征和科学数据
- 太阳的结构和生命周期
- 卫星系统（月球、木卫二、土卫六等）
- 小行星带、柯伊伯带、奥尔特云
- 人类太空探索的历史和未来
- 天文学基础知识（引力、光年、核聚变等）
- 系外行星和宇宙探索

如果用户问的问题与天文无关，礼貌地引导回天文话题。`;

module.exports = async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 获取 API Key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // 构建请求：系统提示 + 用户对话历史
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10), // 只保留最近 10 条消息
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
