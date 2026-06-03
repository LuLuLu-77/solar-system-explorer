/**
 * AI 聊天模块
 * 聊天面板 UI + DeepSeek API 调用
 */

class ChatManager {
  constructor() {
    this.messages = []; // 对话历史
    this.isLoading = false;
    this.isOpen = false;
    this.apiEndpoint = '/api/chat'; // Vercel Serverless Function 路径
    this.init();
  }

  init() {
    // 创建聊天 DOM
    this.createDOM();
    this.bindEvents();
  }

  createDOM() {
    // 聊天按钮
    const btn = document.createElement('div');
    btn.id = 'chat-toggle';
    btn.innerHTML = '💬';
    btn.title = '向 AI 助手提问';
    document.body.appendChild(btn);

    // 聊天面板
    const panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.className = 'hidden';
    panel.innerHTML = `
      <div class="chat-header">
        <span class="chat-header-icon">🤖</span>
        <span class="chat-header-title">火种号 AI 助手</span>
        <button class="chat-close" id="chat-close">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome">
          <div class="chat-welcome-icon">🚀</div>
          <div class="chat-welcome-text">你好！我是火种号的 AI 助手。</div>
          <div class="chat-welcome-sub">你可以问我任何关于太阳系和天文的问题</div>
          <div class="chat-quick-questions">
            <button class="quick-q" data-q="介绍一下太阳的结构">☀️ 太阳的结构</button>
            <button class="quick-q" data-q="火星上有可能存在生命吗？">🔴 火星生命</button>
            <button class="quick-q" data-q="土星环是怎么形成的？">🪐 土星环</button>
            <button class="quick-q" data-q="什么是黑洞？">🕳️ 黑洞</button>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" placeholder="输入你的问题..." autocomplete="off">
        <button id="chat-send" title="发送">➤</button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  bindEvents() {
    // 打开/关闭聊天面板
    document.getElementById('chat-toggle').addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('chat-close').addEventListener('click', () => {
      this.close();
    });

    // 发送消息
    document.getElementById('chat-send').addEventListener('click', () => {
      this.send();
    });

    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });

    // 快捷问题
    document.querySelectorAll('.quick-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        document.getElementById('chat-input').value = q;
        this.send();
      });
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('chat-panel').classList.toggle('hidden', !this.isOpen);
    document.getElementById('chat-toggle').classList.toggle('active', this.isOpen);
    if (this.isOpen) {
      document.getElementById('chat-input').focus();
    }
  }

  close() {
    this.isOpen = false;
    document.getElementById('chat-panel').classList.add('hidden');
    document.getElementById('chat-toggle').classList.remove('active');
  }

  async send() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || this.isLoading) return;

    // 清空输入
    input.value = '';

    // 隐藏欢迎界面
    const welcome = document.querySelector('.chat-welcome');
    if (welcome) welcome.style.display = 'none';

    // 显示用户消息
    this.addMessage('user', text);

    // 添加到历史
    this.messages.push({ role: 'user', content: text });

    // 显示加载状态
    this.setLoading(true);

    try {
      const reply = await this.callAPI();
      this.addMessage('assistant', reply);
      this.messages.push({ role: 'assistant', content: reply });
    } catch (error) {
      console.error('Chat error:', error);
      let errorMsg = '抱歉，暂时无法连接到 AI 服务。请稍后再试。';
      if (error.message === 'API key not configured') {
        errorMsg = '⚠️ API Key 未配置。请在 Vercel 项目设置中添加 DEEPSEEK_API_KEY 环境变量。';
      }
      this.addMessage('assistant', errorMsg);
    } finally {
      this.setLoading(false);
    }
  }

  async callAPI() {
    // 检测是否为本地环境（file:// 协议）
    if (window.location.protocol === 'file:') {
      return '⚠️ AI 聊天功能需要部署到 Vercel 后才能使用。\n\n本地测试请运行 `vercel dev` 启动开发服务器，或将项目部署到 Vercel。';
    }

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: this.messages }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error('API key not configured');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || '抱歉，我暂时无法回答这个问题。';
  }

  addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    if (role === 'assistant') {
      // 简单的 Markdown 渲染
      bubble.innerHTML = this.renderMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    msg.appendChild(bubble);
    container.appendChild(msg);

    // 滚动到底部
    container.scrollTop = container.scrollHeight;
  }

  setLoading(loading) {
    this.isLoading = loading;
    const container = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');

    if (loading) {
      sendBtn.disabled = true;
      input.disabled = true;
      // 添加加载动画
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'chat-msg chat-msg-assistant';
      loadingMsg.id = 'chat-loading';
      loadingMsg.innerHTML = `
        <div class="chat-bubble chat-loading-bubble">
          <span class="dot-typing"></span>
        </div>
      `;
      container.appendChild(loadingMsg);
      container.scrollTop = container.scrollHeight;
    } else {
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
      // 移除加载动画
      const loadingEl = document.getElementById('chat-loading');
      if (loadingEl) loadingEl.remove();
    }
  }

  renderMarkdown(text) {
    return text
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 换行
      .replace(/\n/g, '<br>')
      // 列表项
      .replace(/^- (.+)/gm, '• $1<br>')
      .replace(/^\d+\. (.+)/gm, (match, p1) => `${p1}<br>`);
  }
}
