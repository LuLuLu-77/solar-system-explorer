/**
 * 任务系统模块
 * 管理探索任务的数据、状态和顺序探索逻辑
 */

// ===== 探索顺序（按距太阳由近到远）=====
const EXPLORATION_ORDER = [
  'sun', 'mercury', 'venus', 'earth', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune',
];

const MISSIONS = [
  // ===== 太阳 =====
  {
    id: 'sun-visit',
    planetId: 'sun',
    title: '恒星之心',
    description: '近距离观察太阳——太阳系的能量之源',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'sun-visitor', points: 10 },
  },
  {
    id: 'sun-read',
    planetId: 'sun',
    title: '太阳物理学家',
    description: '阅读太阳的全部科学数据',
    type: 'read',
    condition: 'readAll',
    reward: { badge: 'sun-scholar', points: 15 },
  },

  // ===== 水星 =====
  {
    id: 'mercury-visit',
    planetId: 'mercury',
    title: '水星着陆',
    description: '探索离太阳最近的行星',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'mercury-explorer', points: 10 },
  },
  {
    id: 'mercury-quiz',
    planetId: 'mercury',
    title: '水星研究员',
    description: '回答水星相关知识问题',
    type: 'quiz',
    condition: 'quizPass',
    reward: { badge: 'mercury-scholar', points: 15 },
  },

  // ===== 金星 =====
  {
    id: 'venus-visit',
    planetId: 'venus',
    title: '金星穿越',
    description: '探索太阳系最热的行星',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'venus-explorer', points: 10 },
  },
  {
    id: 'venus-compare',
    planetId: 'venus',
    title: '温室效应研究',
    description: '对比金星和地球的数据',
    type: 'compare',
    condition: 'compare',
    reward: { badge: 'venus-scientist', points: 20 },
  },

  // ===== 地球 =====
  {
    id: 'earth-visit',
    planetId: 'earth',
    title: '蓝色家园',
    description: '回到我们的母星地球',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'earth-visitor', points: 10 },
  },
  {
    id: 'earth-read',
    planetId: 'earth',
    title: '地球守护者',
    description: '阅读地球的全部科学数据',
    type: 'read',
    condition: 'readAll',
    reward: { badge: 'earth-scholar', points: 15 },
  },

  // ===== 火星 =====
  {
    id: 'mars-visit',
    planetId: 'mars',
    title: '红色星球着陆',
    description: '探索人类最感兴趣的移民目标',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'mars-explorer', points: 10 },
  },
  {
    id: 'mars-quiz',
    planetId: 'mars',
    title: '火星地质学家',
    description: '回答火星相关知识问题',
    type: 'quiz',
    condition: 'quizPass',
    reward: { badge: 'mars-scholar', points: 15 },
  },

  // ===== 木星 =====
  {
    id: 'jupiter-visit',
    planetId: 'jupiter',
    title: '巨行星探秘',
    description: '近距离观察太阳系最大的行星',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'jupiter-explorer', points: 10 },
  },
  {
    id: 'jupiter-read',
    planetId: 'jupiter',
    title: '大红斑研究者',
    description: '阅读木星的全部科学数据',
    type: 'read',
    condition: 'readAll',
    reward: { badge: 'jupiter-scholar', points: 15 },
  },

  // ===== 土星 =====
  {
    id: 'saturn-visit',
    planetId: 'saturn',
    title: '光环之王',
    description: '欣赏太阳系最壮观的环系统',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'saturn-explorer', points: 10 },
  },
  {
    id: 'saturn-compare',
    planetId: 'saturn',
    title: '密度之谜',
    description: '对比土星和地球的数据',
    type: 'compare',
    condition: 'compare',
    reward: { badge: 'saturn-scientist', points: 20 },
  },

  // ===== 天王星 =====
  {
    id: 'uranus-visit',
    planetId: 'uranus',
    title: '冰巨星探访',
    description: '探索"躺着转"的行星',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'uranus-explorer', points: 10 },
  },
  {
    id: 'uranus-quiz',
    planetId: 'uranus',
    title: '天王星研究员',
    description: '回答天王星相关知识问题',
    type: 'quiz',
    condition: 'quizPass',
    reward: { badge: 'uranus-scholar', points: 15 },
  },

  // ===== 海王星 =====
  {
    id: 'neptune-visit',
    planetId: 'neptune',
    title: '风暴之王',
    description: '探索太阳系最远的行星',
    type: 'explore',
    condition: 'visit',
    reward: { badge: 'neptune-explorer', points: 10 },
  },
  {
    id: 'neptune-read',
    planetId: 'neptune',
    title: '深空探索者',
    description: '阅读海王星的全部科学数据',
    type: 'read',
    condition: 'readAll',
    reward: { badge: 'neptune-scholar', points: 15 },
  },

  // ===== 全局任务 =====
  {
    id: 'all-terrestrial',
    planetId: null,
    title: '类地行星专家',
    description: '探索完水金地火四颗类地行星',
    type: 'explore',
    condition: 'visitGroup',
    targetGroup: ['mercury', 'venus', 'earth', 'mars'],
    reward: { badge: 'terrestrial-expert', points: 30 },
  },
  {
    id: 'all-giants',
    planetId: null,
    title: '巨行星猎手',
    description: '探索完木土天海四颗巨行星',
    type: 'explore',
    condition: 'visitGroup',
    targetGroup: ['jupiter', 'saturn', 'uranus', 'neptune'],
    reward: { badge: 'giant-hunter', points: 30 },
  },
  {
    id: 'all-solar-system',
    planetId: null,
    title: '太阳系全解锁',
    description: '访问太阳系中所有天体',
    type: 'explore',
    condition: 'visitAll',
    reward: { badge: 'solar-master', points: 50 },
  },
  {
    id: 'quiz-master',
    planetId: null,
    title: '知识达人',
    description: '在知识测验中获得满分',
    type: 'quiz',
    condition: 'quizPerfect',
    reward: { badge: 'quiz-perfect', points: 40 },
  },
  {
    id: 'compare-master',
    planetId: null,
    title: '数据分析师',
    description: '完成 3 次行星数据对比',
    type: 'compare',
    condition: 'compareCount',
    targetCount: 3,
    reward: { badge: 'data-analyst', points: 30 },
  },
];

class MissionManager {
  constructor() {
    this.missions = MISSIONS.map(m => ({ ...m, completed: false }));
    this.visitedPlanets = new Set();
    this.readPlanets = new Set();
    this.compareCount = 0;
    this.quizPassed = false;
    this.listeners = {};

    // 顺序探索：当前步骤索引
    this.currentStepIndex = 0;
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * 获取当前应该探索的星球 ID
   */
  getCurrentTarget() {
    if (this.currentStepIndex >= EXPLORATION_ORDER.length) return null;
    return EXPLORATION_ORDER[this.currentStepIndex];
  }

  /**
   * 判断某个星球是否可以探索
   */
  canVisit(planetId) {
    return this.getCurrentTarget() === planetId;
  }

  /**
   * 判断某个星球是否已访问
   */
  isVisited(planetId) {
    return this.visitedPlanets.has(planetId);
  }

  /**
   * 访问星球（顺序探索模式）
   */
  visitPlanet(planetId) {
    // 只有当前目标才能访问
    if (!this.canVisit(planetId)) return false;

    this.visitedPlanets.add(planetId);
    this.currentStepIndex++;

    this.checkMissions('visit', planetId);
    this.checkGroupMissions();

    // 检查是否全部完成
    if (this.currentStepIndex >= EXPLORATION_ORDER.length) {
      this.emit('exploration:complete', {});
    }

    return true;
  }

  readPlanet(planetId) {
    this.readPlanets.add(planetId);
    this.checkMissions('readAll', planetId);
  }

  completeQuiz(score, total) {
    if (score >= Math.floor(total * 0.6)) {
      this.quizPassed = true;
      for (const planetId of this.visitedPlanets) {
        this.checkMissions('quizPass', planetId);
      }
    }
    if (score === total) {
      this.checkMissions('quizPerfect', null);
    }
  }

  completeCompare() {
    this.compareCount++;
    for (const planetId of this.visitedPlanets) {
      this.checkMissions('compare', planetId);
    }
    if (this.compareCount >= 3) {
      this.checkMissions('compareCount', null);
    }
  }

  checkMissions(conditionType, planetId) {
    for (const mission of this.missions) {
      if (mission.completed) continue;
      if (mission.condition !== conditionType) continue;

      let shouldComplete = false;

      if (mission.planetId === planetId) {
        shouldComplete = true;
      } else if (mission.planetId === null && conditionType !== 'visit') {
        shouldComplete = true;
      }

      if (shouldComplete) {
        this.completeMission(mission);
      }
    }
  }

  checkGroupMissions() {
    for (const mission of this.missions) {
      if (mission.completed) continue;
      if (mission.condition !== 'visitGroup') continue;

      const allVisited = mission.targetGroup.every(id => this.visitedPlanets.has(id));
      if (allVisited) {
        this.completeMission(mission);
      }
    }

    // 检查 visitAll
    const allVisited = EXPLORATION_ORDER.every(id => this.visitedPlanets.has(id));
    if (allVisited) {
      const mission = this.missions.find(m => m.id === 'all-solar-system' && !m.completed);
      if (mission) this.completeMission(mission);
    }
  }

  completeMission(mission) {
    mission.completed = true;
    this.emit('mission:complete', mission);
    this.emit('achievement:unlock', mission.reward.badge);
  }

  getActiveMissions() {
    return this.missions.filter(m => !m.completed);
  }

  getCompletedMissions() {
    return this.missions.filter(m => m.completed);
  }

  getProgress() {
    const completed = this.missions.filter(m => m.completed).length;
    return { completed, total: this.missions.length };
  }

  getVisitedCount() {
    return this.visitedPlanets.size;
  }

  /**
   * 获取探索进度（按故事章节）
   */
  getStoryProgress() {
    return {
      current: this.currentStepIndex,
      total: EXPLORATION_ORDER.length,
      currentTarget: this.getCurrentTarget(),
    };
  }
}
