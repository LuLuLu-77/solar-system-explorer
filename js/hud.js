/**
 * HUD 界面模块
 * 任务面板、进度指示器、toast通知
 */

class HUDManager {
  constructor(missionManager, achievementManager) {
    this.missions = missionManager;
    this.achievements = achievementManager;
    this.panelExpanded = false;
    this.createHUD();
    this.bindEvents();
    this.update();
  }

  createHUD() {
    // 任务面板
    const panel = document.createElement('div');
    panel.id = 'mission-panel';
    panel.innerHTML = `
      <div class="mission-toggle" id="mission-toggle">
        <span class="mission-toggle-icon">🎯</span>
        <span class="mission-toggle-text">任务</span>
        <span class="mission-toggle-count" id="mission-count">0/0</span>
      </div>
      <div class="mission-list" id="mission-list">
        <div class="mission-header">
          <h3>📋 探索任务</h3>
          <div class="mission-progress-bar">
            <div class="mission-progress-fill" id="mission-progress-fill"></div>
          </div>
        </div>
        <div class="mission-items" id="mission-items"></div>
      </div>
    `;
    document.body.appendChild(panel);

    // 进度指示器（行星图标条）
    const progress = document.createElement('div');
    progress.id = 'planet-progress';
    const planetIcons = [
      { id: 'sun', icon: '☀️', name: '太阳' },
      { id: 'mercury', icon: '🔘', name: '水星' },
      { id: 'venus', icon: '🟡', name: '金星' },
      { id: 'earth', icon: '🌍', name: '地球' },
      { id: 'mars', icon: '🔴', name: '火星' },
      { id: 'jupiter', icon: '🟤', name: '木星' },
      { id: 'saturn', icon: '🪐', name: '土星' },
      { id: 'uranus', icon: '🔵', name: '天王星' },
      { id: 'neptune', icon: '🔵', name: '海王星' },
    ];
    progress.innerHTML = planetIcons.map(p => `
      <div class="planet-dot" data-id="${p.id}" title="${p.name}">
        <span class="planet-dot-icon">${p.icon}</span>
        <span class="planet-dot-label">${p.name}</span>
      </div>
    `).join('');
    document.body.appendChild(progress);

    // 成就计数器
    const badge = document.createElement('div');
    badge.id = 'achievement-badge';
    badge.innerHTML = `
      <span class="badge-icon">🏆</span>
      <span class="badge-count" id="badge-count">0/0</span>
    `;
    document.body.appendChild(badge);

    // 成就详情面板
    const achPanel = document.createElement('div');
    achPanel.id = 'achievement-panel';
    achPanel.className = 'panel hidden';
    achPanel.innerHTML = `
      <button class="close-btn" id="btn-close-achievements">✕</button>
      <h2>🏆 成就徽章</h2>
      <div class="achievement-grid" id="achievement-grid"></div>
    `;
    document.body.appendChild(achPanel);
  }

  bindEvents() {
    // 任务面板折叠/展开
    document.getElementById('mission-toggle').addEventListener('click', () => {
      this.panelExpanded = !this.panelExpanded;
      document.getElementById('mission-panel').classList.toggle('expanded', this.panelExpanded);
    });

    // 成就面板
    document.getElementById('achievement-badge').addEventListener('click', () => {
      this.showAchievementPanel();
    });
    document.getElementById('btn-close-achievements').addEventListener('click', () => {
      document.getElementById('achievement-panel').classList.add('hidden');
    });

    // 监听任务完成和成就解锁
    this.missions.on('mission:complete', (mission) => {
      this.update();
      this.showToast(`✅ 任务完成：${mission.title}`, 'success');
    });

    this.missions.on('achievement:unlock', (badgeId) => {
      this.achievements.unlock(badgeId);
      this.updateBadgeCount();
    });
  }

  update() {
    this.updateMissionList();
    this.updateProgress();
    this.updateBadgeCount();
  }

  updateMissionList() {
    const active = this.missions.getActiveMissions().slice(0, 6); // 显示前6个
    const progress = this.missions.getProgress();

    document.getElementById('mission-count').textContent =
      `${progress.completed}/${progress.total}`;

    const fillPct = (progress.completed / progress.total) * 100;
    document.getElementById('mission-progress-fill').style.width = `${fillPct}%`;

    const itemsEl = document.getElementById('mission-items');
    if (active.length === 0) {
      itemsEl.innerHTML = '<div class="mission-empty">🎉 所有任务已完成！</div>';
      return;
    }

    itemsEl.innerHTML = active.map(m => {
      const typeIcon = { explore: '🚀', quiz: '🧠', compare: '📊', read: '📖' }[m.type] || '📌';
      return `
        <div class="mission-item">
          <span class="mission-type">${typeIcon}</span>
          <div class="mission-info">
            <div class="mission-title">${m.title}</div>
            <div class="mission-desc">${m.description}</div>
          </div>
          <span class="mission-points">+${m.reward.points}</span>
        </div>
      `;
    }).join('');
  }

  updateProgress() {
    const dots = document.querySelectorAll('.planet-dot');
    dots.forEach(dot => {
      const id = dot.dataset.id;
      const visited = this.missions.isVisited(id);
      dot.classList.toggle('visited', visited);
    });
  }

  updateBadgeCount() {
    const prog = this.achievements.getProgress();
    document.getElementById('badge-count').textContent =
      `${prog.unlocked}/${prog.total}`;
  }

  showAchievementPanel() {
    const grid = document.getElementById('achievement-grid');
    const all = this.achievements.getAll();

    grid.innerHTML = all.map(a => `
      <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon">${a.unlocked ? a.icon : '❓'}</div>
        <div class="ach-name">${a.unlocked ? a.name : '???'}</div>
        <div class="ach-desc">${a.unlocked ? a.desc : '未解锁'}</div>
      </div>
    `).join('');

    document.getElementById('achievement-panel').classList.remove('hidden');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 触发入场动画
    requestAnimationFrame(() => toast.classList.add('show'));

    // 3秒后消失
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
}
