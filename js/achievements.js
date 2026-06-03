/**
 * 成就系统模块
 * 管理成就徽章的定义、解锁和展示
 */

const ACHIEVEMENTS = {
  'sun-visitor': { icon: '☀️', name: '太阳使者', desc: '首次近距离观察太阳' },
  'sun-scholar': { icon: '📚', name: '太阳物理学家', desc: '阅读太阳的全部科学数据' },
  'mercury-explorer': { icon: '🚀', name: '水星先锋', desc: '首次着陆水星' },
  'mercury-scholar': { icon: '🔬', name: '水星研究员', desc: '通过水星知识测验' },
  'venus-explorer': { icon: '🔥', name: '金星穿越者', desc: '首次着陆金星' },
  'venus-scientist': { icon: '🌡️', name: '温室效应专家', desc: '完成金星-地球数据对比' },
  'earth-visitor': { icon: '🌍', name: '归乡者', desc: '回到地球' },
  'earth-scholar': { icon: '📖', name: '地球守护者', desc: '阅读地球的全部科学数据' },
  'mars-explorer': { icon: '🔴', name: '火星先驱', desc: '首次着陆火星' },
  'mars-scholar': { icon: '🧪', name: '火星地质学家', desc: '通过火星知识测验' },
  'jupiter-explorer': { icon: '🟤', name: '巨行星探秘者', desc: '首次着陆木星' },
  'jupiter-scholar': { icon: '🌀', name: '大红斑研究者', desc: '阅读木星的全部科学数据' },
  'saturn-explorer': { icon: '🪐', name: '光环猎人', desc: '首次着陆土星' },
  'saturn-scientist': { icon: '⚖️', name: '密度之谜破解者', desc: '完成土星-地球数据对比' },
  'uranus-explorer': { icon: '💎', name: '冰巨星探访者', desc: '首次着陆天王星' },
  'uranus-scholar': { icon: '🔄', name: '天王星研究员', desc: '通过天王星知识测验' },
  'neptune-explorer': { icon: '💨', name: '风暴追踪者', desc: '首次着陆海王星' },
  'neptune-scholar': { icon: '📐', name: '深空探索者', desc: '阅读海王星的全部科学数据' },
  'terrestrial-expert': { icon: '🪨', name: '类地行星专家', desc: '探索完水金地火四颗类地行星' },
  'giant-hunter': { icon: '🏆', name: '巨行星猎手', desc: '探索完木土天海四颗巨行星' },
  'solar-master': { icon: '🌌', name: '太阳系全解锁', desc: '访问太阳系中所有天体' },
  'quiz-perfect': { icon: '🧠', name: '满分学霸', desc: '知识测验获得满分' },
  'data-analyst': { icon: '📊', name: '数据分析师', desc: '完成 3 次行星数据对比' },
};

class AchievementManager {
  constructor() {
    this.unlocked = new Set();
    this.queue = []; // 待展示的成就动画队列
    this.isShowing = false;
  }

  unlock(badgeId) {
    if (this.unlocked.has(badgeId)) return false;
    if (!ACHIEVEMENTS[badgeId]) return false;

    this.unlocked.add(badgeId);
    this.queue.push(badgeId);
    this.processQueue();
    return true;
  }

  processQueue() {
    if (this.isShowing || this.queue.length === 0) return;
    this.isShowing = true;

    const badgeId = this.queue.shift();
    const achievement = ACHIEVEMENTS[badgeId];
    this.showAnimation(achievement, () => {
      this.isShowing = false;
      this.processQueue();
    });
  }

  showAnimation(achievement, callback) {
    // 创建成就弹窗 DOM
    const overlay = document.createElement('div');
    overlay.className = 'achievement-overlay';
    overlay.innerHTML = `
      <div class="achievement-popup">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-label">成就解锁</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.desc}</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 2.5秒后移除
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        if (callback) callback();
      }, 400);
    }, 2200);
  }

  getProgress() {
    const total = Object.keys(ACHIEVEMENTS).length;
    return { unlocked: this.unlocked.size, total };
  }

  isUnlocked(badgeId) {
    return this.unlocked.has(badgeId);
  }

  getAll() {
    return Object.entries(ACHIEVEMENTS).map(([id, info]) => ({
      id,
      ...info,
      unlocked: this.unlocked.has(id),
    }));
  }
}
