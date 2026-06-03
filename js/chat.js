/**
 * AI 聊天模块
 * 用户自带 API Key，前端直连 DeepSeek
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM_PROMPT = `你是「火种号」AI 助手，一名专业的太阳系科普专家。你正在一艘探索太阳系的飞船上，为宇航员提供科学指导。

你的职责：
1. 回答关于太阳系、行星、恒星、卫星等天文知识
2. 用通俗易懂的语言解释科学原理
3. 鼓励提问者的好奇心
4. 回答准确有深度，但不要过于专业化
5. 可以分享有趣的天文冷知识
6. 保持友好、热情的语气

如果用户问的问题与天文无关，礼貌地引导回天文话题。`;

class ChatManager {
  constructor() {
    this.messages = [];
    this.isLoading = false;
    this.isOpen = false;
    this.apiKey = localStorage.getItem('deepseek_api_key') || '';
    this.init();
  }

  init() {
    this.createDOM();
    this.bindEvents();
    this.updateKeyStatus();
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
        <button class="chat-settings-btn" id="chat-settings" title="设置 API Key">⚙️</button>
        <button class="chat-close" id="chat-close">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome" id="chat-welcome">
          <div class="chat-welcome-icon">🚀</div>
          <div class="chat-welcome-text">你好！我是火种号的 AI 助手。</div>
          <div class="chat-welcome-sub">你可以问我任何关于太阳系和天文的问题</div>
          <div class="chat-key-status" id="chat-key-status"></div>
          <div class="chat-quick-questions" id="chat-quick-qs">
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

    // API Key 设置弹窗
    const modal = document.createElement('div');
    modal.id = 'api-key-modal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:400px">
        <button class="close-btn" id="close-key-modal">✕</button>
        <h2>🔑 设置 API Key</h2>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
          本作品使用 DeepSeek API 提供 AI 问答功能。<br>
          请在下方输入你的 API Key，密钥仅保存在你的浏览器本地。
        </p>
        <input type="password" id="api-key-input" placeholder="sk-..." style="
          width:100%;padding:12px 14px;border:1px solid rgba(255,255,255,0.15);
          background:rgba(255,255,255,0.05);color:var(--text-primary);border-radius:10px;
          font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;
        ">
        <div style="display:flex;gap:8px">
          <button class="action-btn" id="save-key-btn" style="flex:1">保存</button>
          <button class="action-btn" id="clear-key-btn" style="flex:1;background:rgba(239,83,80,0.15);border-color:var(--accent-red)">清除</button>
        </div>
        <p style="font-size:11px;color:var(--text-secondary);margin-top:12px;text-align:center">
          获取 Key：<a href="https://platform.deepseek.com" target="_blank" style="color:var(--accent-blue)">platform.deepseek.com</a>
        </p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  bindEvents() {
    document.getElementById('chat-toggle').addEventListener('click', () => this.toggle());
    document.getElementById('chat-close').addEventListener('click', () => this.close());
    document.getElementById('chat-send').addEventListener('click', () => this.send());

    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });

    // 快捷问题
    document.querySelectorAll('.quick-q').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.apiKey) { this.showKeyModal(); return; }
        document.getElementById('chat-input').value = btn.dataset.q;
        this.send();
      });
    });

    // API Key 设置
    document.getElementById('chat-settings').addEventListener('click', () => this.showKeyModal());
    document.getElementById('close-key-modal').addEventListener('click', () => this.hideKeyModal());
    document.getElementById('save-key-btn').addEventListener('click', () => this.saveKey());
    document.getElementById('clear-key-btn').addEventListener('click', () => this.clearKey());
    document.getElementById('api-key-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideKeyModal();
    });

    // Enter 保存 Key
    document.getElementById('api-key-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveKey();
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

  showKeyModal() {
    document.getElementById('api-key-modal').classList.remove('hidden');
    const input = document.getElementById('api-key-input');
    input.value = this.apiKey;
    input.focus();
  }

  hideKeyModal() {
    document.getElementById('api-key-modal').classList.add('hidden');
  }

  saveKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key) return;
    this.apiKey = key;
    localStorage.setItem('deepseek_api_key', key);
    this.updateKeyStatus();
    this.hideKeyModal();
  }

  clearKey() {
    this.apiKey = '';
    localStorage.removeItem('deepseek_api_key');
    document.getElementById('api-key-input').value = '';
    this.updateKeyStatus();
    this.hideKeyModal();
  }

  updateKeyStatus() {
    const status = document.getElementById('chat-key-status');
    if (!status) return;
    if (this.apiKey) {
      status.innerHTML = `<span style="color:var(--accent-green)">✅ API Key 已配置</span>`;
    } else {
      status.innerHTML = `
        <span style="color:var(--accent-gold)">⚠️ 请先设置 API Key</span><br>
        <button class="quick-q" onclick="document.getElementById('chat-settings').click()" style="margin-top:8px">🔑 设置 Key</button>
      `;
    }
  }

  async send() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || this.isLoading) return;

    if (!this.apiKey) {
      this.showKeyModal();
      return;
    }

    input.value = '';

    // 隐藏欢迎界面
    const welcome = document.getElementById('chat-welcome');
    if (welcome) welcome.style.display = 'none';

    this.addMessage('user', text);
    this.messages.push({ role: 'user', content: text });
    this.setLoading(true);

    try {
      const reply = await this.callAPI();
      this.addMessage('assistant', reply);
      this.messages.push({ role: 'assistant', content: reply });
    } catch (error) {
      console.error('Chat error:', error);
      let errorMsg = '抱歉，请求失败。请检查网络连接。';
      if (error.message.includes('401')) {
        errorMsg = '⚠️ API Key 无效，请重新设置。';
      } else if (error.message.includes('429')) {
        errorMsg = '⚠️ 请求太频繁，请稍后再试。';
      }
      this.addMessage('assistant', errorMsg);
    } finally {
      this.setLoading(false);
    }
  }

  async callAPI() {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...this.messages.slice(-10),
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
  }

  addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = role === 'assistant' ? this.renderMarkdown(text) : this.escapeHtml(text);

    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  setLoading(loading) {
    this.isLoading = loading;
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');

    if (loading) {
      sendBtn.disabled = true;
      input.disabled = true;
      const el = document.createElement('div');
      el.className = 'chat-msg chat-msg-assistant';
      el.id = 'chat-loading';
      el.innerHTML = `<div class="chat-bubble chat-loading-bubble"><span class="dot-typing"></span></div>`;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    } else {
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
      const el = document.getElementById('chat-loading');
      if (el) el.remove();
    }
  }

  renderMarkdown(text) {
    return this.escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/^- (.+)/gm, '• $1<br>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
