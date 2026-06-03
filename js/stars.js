/**
 * 星空背景模块
 * 创建动态闪烁的星空效果
 */

class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.resize();
    this.initStars();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initStars() {
    const count = Math.floor((this.canvas.width * this.canvas.height) / 2000);
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  spawnShootingStar() {
    if (this.shootingStars.length > 2) return;
    if (Math.random() > 0.003) return;
    this.shootingStars.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height * 0.5,
      vx: (Math.random() * 4 + 3) * (Math.random() > 0.5 ? 1 : -1),
      vy: Math.random() * 2 + 1,
      length: Math.random() * 60 + 40,
      alpha: 1,
      decay: Math.random() * 0.02 + 0.01,
    });
  }

  update(time) {
    // 更新星星闪烁
    for (const star of this.stars) {
      star.alpha = 0.3 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
    }
    // 生成流星
    this.spawnShootingStar();
    // 更新流星
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;
      if (s.alpha <= 0) this.shootingStars.splice(i, 1);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制星星
    for (const star of this.stars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    }

    // 绘制流星
    for (const s of this.shootingStars) {
      const gradient = ctx.createLinearGradient(
        s.x, s.y,
        s.x - s.vx * (s.length / 5), s.y - s.vy * (s.length / 5)
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * (s.length / 5), s.y - s.vy * (s.length / 5));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}
