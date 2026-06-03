/**
 * 主程序入口
 * 初始化所有模块并启动动画循环
 */

(function () {
  'use strict';

  // ===== 初始化 =====
  const canvas = document.getElementById('solar-system');
  const starsCanvas = document.getElementById('stars-bg');

  const starfield = new Starfield(starsCanvas);
  const solar = new SolarSystem(canvas);
  const ui = new UIManager(solar);
  const quiz = new QuizManager();

  // ===== 行星点击回调 =====
  solar.onPlanetClick = function (planet) {
    ui.showPlanetInfo(planet);
  };

  // ===== 时间控制 =====
  const speedSteps = [0.25, 0.5, 1, 2, 4, 8, 16];
  let speedIndex = 2; // 默认 1x

  function updateSpeedDisplay() {
    solar.speed = speedSteps[speedIndex];
    document.getElementById('speed-display').textContent = `速度: ${solar.speed}x`;
  }

  document.getElementById('btn-slower').addEventListener('click', () => {
    if (speedIndex > 0) {
      speedIndex--;
      updateSpeedDisplay();
    }
  });

  document.getElementById('btn-faster').addEventListener('click', () => {
    if (speedIndex < speedSteps.length - 1) {
      speedIndex++;
      updateSpeedDisplay();
    }
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    solar.paused = !solar.paused;
    document.getElementById('btn-pause').textContent = solar.paused ? '▶️' : '⏸️';
  });

  // ===== 视图控制 =====
  document.getElementById('btn-reset-view').addEventListener('click', () => {
    solar.offsetX = 0;
    solar.offsetY = 0;
    solar.scale = 1;
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
    const btn = document.getElementById('btn-scale');
    btn.textContent = solar.realisticScale ? '📏 可视化模式' : '📏 真实比例';
    // 重置视图
    solar.offsetX = 0;
    solar.offsetY = 0;
    solar.scale = 1;
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
    switch (e.key) {
      case ' ':
        e.preventDefault();
        solar.paused = !solar.paused;
        document.getElementById('btn-pause').textContent = solar.paused ? '▶️' : '⏸️';
        break;
      case 'ArrowUp':
        if (speedIndex < speedSteps.length - 1) {
          speedIndex++;
          updateSpeedDisplay();
        }
        break;
      case 'ArrowDown':
        if (speedIndex > 0) {
          speedIndex--;
          updateSpeedDisplay();
        }
        break;
      case 'r':
      case 'R':
        solar.offsetX = 0;
        solar.offsetY = 0;
        solar.scale = 1;
        break;
      case 'l':
      case 'L':
        solar.showLabels = !solar.showLabels;
        break;
      case 'o':
      case 'O':
        solar.showOrbits = !solar.showOrbits;
        break;
      case 'Escape':
        document.getElementById('info-panel').classList.add('hidden');
        document.getElementById('compare-panel').classList.add('hidden');
        document.getElementById('quiz-panel').classList.add('hidden');
        document.getElementById('guide-modal').classList.add('hidden');
        break;
    }
  });

  // ===== 动画循环 =====
  let lastTime = 0;
  let frameCount = 0;

  function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 更新
    solar.update(deltaTime);
    starfield.update(timestamp);

    // 绘制
    starfield.draw();
    solar.draw();

    requestAnimationFrame(animate);
  }

  // ===== 启动 =====
  function init() {
    updateSpeedDisplay();

    // 隐藏加载动画
    setTimeout(() => {
      const loading = document.getElementById('loading');
      loading.classList.add('fade-out');
      setTimeout(() => loading.style.display = 'none', 600);
    }, 800);

    // 开始动画
    requestAnimationFrame(animate);
  }

  // 确保DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
