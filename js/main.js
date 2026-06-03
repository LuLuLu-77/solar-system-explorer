/**
 * 主程序入口
 * 集成顺序探索、事件总线、启动流程
 */

(function () {
  'use strict';

  // ===== 初始化核心模块 =====
  const canvas = document.getElementById('solar-system');
  const starsCanvas = document.getElementById('stars-bg');

  const starfield = new Starfield(starsCanvas);
  const solar = new SolarSystem(canvas);
  const ui = new UIManager(solar);
  const quiz = new QuizManager();
  const missions = new MissionManager();
  const achievements = new AchievementManager();
  const narrative = new NarrativeManager();
  const warp = new WarpAnimation(canvas, solar);
  const hud = new HUDManager(missions, achievements);

  // ===== 设置 Canvas 行星状态回调 =====
  solar.isPlanetVisited = (planetId) => missions.isVisited(planetId);
  solar.isPlanetCurrentTarget = (planetId) => missions.canVisit(planetId);

  // ===== 事件总线 =====

  // 已访问行星点击 → 打开信息面板
  solar.onPlanetClick = function (planet) {
    ui.showPlanetInfo(planet);
  };

  // 当前目标行星点击 → 触发跃迁
  solar.onPlanetWarp = function (planet) {
    const planetId = planet.id;

    // 太阳特殊处理（在中心，无跃迁动画）
    if (planet === SUN) {
      solar.visitedPlanets && solar.visitedPlanets.add && solar.visitedPlanets.add('sun');
      missions.visitPlanet('sun');
      narrative.showArrival('sun', '太阳', () => {
        ui.showPlanetInfo(SUN);
      });
      return;
    }

    const index = PLANETS.indexOf(planet);

    // 播放跃迁动画
    warp.start(planet, index, () => {
      // 跃迁完成
      missions.visitPlanet(planetId);

      // 显示章节到达台词
      narrative.showArrival(planetId, planet.name, () => {
        // 台词结束后打开信息面板
        ui.showPlanetInfo(planet);

        // 海王星特殊处理：关闭信息面板后显示终章
        if (planetId === 'neptune') {
          ui.onPanelClose = () => {
            setTimeout(() => {
              narrative.showEnding(() => {
                hud.showToast('🎉 恭喜完成太阳系探索！', 'success');
              });
            }, 800);
          };
        }
      });
    });
  };

  // UI 回调
  ui.onReadAll = function (planetId) {
    missions.readPlanet(planetId);
  };

  ui.onCompare = function () {
    missions.completeCompare();
  };

  // 测验完成事件
  const originalShowResult = quiz.showResult.bind(quiz);
  quiz.showResult = function () {
    originalShowResult();
    missions.completeQuiz(quiz.score, quiz.totalQuestions);
  };

  // ===== 时间控制 =====
  const speedSteps = [0.25, 0.5, 1, 2, 4, 8, 16];
  let speedIndex = 2;

  function updateSpeedDisplay() {
    solar.speed = speedSteps[speedIndex];
    document.getElementById('speed-display').textContent = `速度: ${solar.speed}x`;
  }

  document.getElementById('btn-slower').addEventListener('click', () => {
    if (speedIndex > 0) { speedIndex--; updateSpeedDisplay(); }
  });

  document.getElementById('btn-faster').addEventListener('click', () => {
    if (speedIndex < speedSteps.length - 1) { speedIndex++; updateSpeedDisplay(); }
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    solar.paused = !solar.paused;
    document.getElementById('btn-pause').textContent = solar.paused ? '▶️' : '⏸️';
  });

  // ===== 视图控制 =====
  document.getElementById('btn-reset-view').addEventListener('click', () => {
    solar.offsetX = 0; solar.offsetY = 0; solar.scale = 1;
  });

  document.getElementById('btn-labels').addEventListener('click', () => {
    solar.showLabels = !solar.showLabels;
    document.getElementById('btn-labels').style.opacity = solar.showLabels ? 1 : 0.4;
  });

  document.getElementById('btn-orbits').addEventListener('click', () => {
    solar.showOrbits = !solar.showOrbits;
    document.getElementById('btn-orbits').style.opacity = solar.showOrbits ? 1 : 0.4;
  });

  // ===== 比例切换 =====
  document.getElementById('btn-scale').addEventListener('click', () => {
    solar.realisticScale = !solar.realisticScale;
    solar.recalcScale();
    document.getElementById('btn-scale').textContent =
      solar.realisticScale ? '📏 可视化模式' : '📏 真实比例';
    solar.offsetX = 0; solar.offsetY = 0; solar.scale = 1;
  });

  // ===== 知识测验 =====
  document.getElementById('btn-quiz').addEventListener('click', () => {
    document.getElementById('quiz-panel').classList.remove('hidden');
    document.getElementById('info-panel').classList.add('hidden');
    document.getElementById('compare-panel').classList.add('hidden');
    quiz.start();
  });

  document.getElementById('btn-close-quiz').addEventListener('click', () => {
    document.getElementById('quiz-panel').classList.add('hidden');
  });

  // ===== 键盘快捷键 =====
  document.addEventListener('keydown', (e) => {
    if (narrative.isShowing) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        solar.paused = !solar.paused;
        document.getElementById('btn-pause').textContent = solar.paused ? '▶️' : '⏸️';
        break;
      case 'ArrowUp':
        if (speedIndex < speedSteps.length - 1) { speedIndex++; updateSpeedDisplay(); }
        break;
      case 'ArrowDown':
        if (speedIndex > 0) { speedIndex--; updateSpeedDisplay(); }
        break;
      case 'r': case 'R':
        solar.offsetX = 0; solar.offsetY = 0; solar.scale = 1;
        break;
      case 'Escape':
        ui.triggerPanelClose();
        document.getElementById('info-panel').classList.add('hidden');
        document.getElementById('compare-panel').classList.add('hidden');
        document.getElementById('quiz-panel').classList.add('hidden');
        document.getElementById('guide-modal').classList.add('hidden');
        document.getElementById('achievement-panel').classList.add('hidden');
        break;
    }
  });

  // ===== 动画循环 =====
  let lastTime = 0;

  function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    warp.update();
    solar.update(deltaTime);
    starfield.update(timestamp);

    starfield.draw();
    solar.draw();
    warp.draw();

    requestAnimationFrame(animate);
  }

  // ===== 启动流程 =====
  function init() {
    updateSpeedDisplay();

    // 隐藏加载动画
    const loading = document.getElementById('loading');
    loading.classList.add('fade-out');
    setTimeout(() => loading.style.display = 'none', 600);

    // 开始动画
    requestAnimationFrame(animate);

    // 显示开场剧情
    narrative.showOpening(() => {
      // 剧情结束，太阳成为当前目标，用户可以开始探索
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
