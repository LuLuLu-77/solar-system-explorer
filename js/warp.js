/**
 * 跃迁动画模块
 * 点击行星时播放跃迁飞行动画
 */

class WarpAnimation {
  constructor(canvas, solarSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.solar = solarSystem;
    this.isPlaying = false;
    this.progress = 0;
    this.duration = 1800; // 动画时长 ms
    this.targetPlanet = null;
    this.targetIndex = -1;
    this.startScale = 1;
    this.startOffsetX = 0;
    this.startOffsetY = 0;
    this.speedLines = [];
    this.onComplete = null;
    this.startTime = 0;
  }

  /**
   * 启动跃迁动画
   * @param {Object} planet - 目标行星数据
   * @param {number} index - 行星索引
   * @param {Function} onComplete - 动画完成回调
   */
  start(planet, index, onComplete) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.targetPlanet = planet;
    this.targetIndex = index;
    this.onComplete = onComplete;
    this.progress = 0;
    this.startTime = performance.now();

    // 记录起始状态
    this.startScale = this.solar.scale;
    this.startOffsetX = this.solar.offsetX;
    this.startOffsetY = this.solar.offsetY;

    // 生成速度线
    this.generateSpeedLines();
  }

  generateSpeedLines() {
    this.speedLines = [];
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < 80; i++) {
      // 从中心向外辐射
      const angle = Math.random() * Math.PI * 2;
      const startDist = Math.random() * 50;
      const endDist = Math.random() * Math.max(w, h) * 0.8;
      this.speedLines.push({
        angle,
        startDist,
        endDist,
        alpha: Math.random() * 0.6 + 0.2,
        width: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.7,
      });
    }
  }

  update() {
    if (!this.isPlaying) return false;

    const elapsed = performance.now() - this.startTime;
    this.progress = Math.min(elapsed / this.duration, 1);

    // easeInOutCubic
    const t = this.progress;
    const ease = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // 缩放：逐渐放大
    const targetScale = 2.5;
    const currentScale = this.startScale + (targetScale - this.startScale) * ease;
    this.solar.scale = currentScale;

    // 计算目标行星在当前缩放下的"无偏移位置"
    const orbit = this.solar.realisticScale
      ? this.targetPlanet.orbitRadius
      : this.targetPlanet.visualOrbit;
    const angle = this.solar.planetAngles[this.targetIndex];
    const baseScale = this.solar.baseScale;
    const planetBaseX = this.solar.centerX + Math.cos(angle) * orbit * baseScale * currentScale;
    const planetBaseY = this.solar.centerY + Math.sin(angle) * orbit * baseScale * currentScale;

    // 目标偏移：让行星出现在屏幕中央
    const targetOffsetX = this.solar.centerX - planetBaseX;
    const targetOffsetY = this.solar.centerY - planetBaseY;

    // 插值：从起始偏移飞向目标偏移
    this.solar.offsetX = this.startOffsetX + (targetOffsetX - this.startOffsetX) * ease;
    this.solar.offsetY = this.startOffsetY + (targetOffsetY - this.startOffsetY) * ease;

    // 动画结束
    if (this.progress >= 1) {
      this.isPlaying = false;
      if (this.onComplete) this.onComplete(this.targetPlanet);
      return false;
    }

    return true; // 仍在播放
  }

  draw() {
    if (!this.isPlaying) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const t = this.progress;

    // 阶段1：0-0.3 加速 + 速度线
    // 阶段2：0.3-0.7 高速飞行 + 星空模糊
    // 阶段3：0.7-1.0 减速 + 接近行星

    if (t < 0.7) {
      // 速度线效果
      const lineAlpha = t < 0.3
        ? t / 0.3  // 淡入
        : 1 - (t - 0.3) / 0.4; // 淡出

      for (const line of this.speedLines) {
        const p = (t * line.speed * 3) % 1;
        const dist = line.startDist + (line.endDist - line.startDist) * p;
        const len = 20 + p * 60;

        const x1 = cx + Math.cos(line.angle) * dist;
        const y1 = cy + Math.sin(line.angle) * dist;
        const x2 = cx + Math.cos(line.angle) * (dist + len);
        const y2 = cy + Math.sin(line.angle) * (dist + len);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(180, 200, 255, 0)`);
        grad.addColorStop(0.5, `rgba(180, 200, 255, ${line.alpha * lineAlpha})`);
        grad.addColorStop(1, `rgba(180, 200, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.width;
        ctx.stroke();
      }
    }

    // 阶段2：屏幕中央闪光（跃迁瞬间）
    if (t > 0.15 && t < 0.35) {
      const flashT = (t - 0.15) / 0.2;
      const flashAlpha = Math.sin(flashT * Math.PI) * 0.15;
      ctx.fillStyle = `rgba(180, 200, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 阶段3：接近时的光晕
    if (t > 0.7) {
      const glowT = (t - 0.7) / 0.3;
      const glowR = 50 + glowT * 100;
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glowGrad.addColorStop(0, `rgba(255, 220, 100, ${0.2 * (1 - glowT)})`);
      glowGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }
  }
}
