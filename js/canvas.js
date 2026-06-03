/**
 * 太阳系 Canvas 渲染引擎
 * 处理行星轨道绘制、动画、交互检测
 */

class SolarSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 视图状态
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.baseScale = 1;

    // 动画状态
    this.time = 0;
    this.speed = 1;
    this.paused = false;
    this.showLabels = true;
    this.showOrbits = true;
    this.realisticScale = false;

    // 交互状态
    this.isDragging = false;
    this.hasDragged = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.hoveredPlanet = null;
    this.selectedPlanet = null;

    // 行星角度状态
    this.planetAngles = PLANETS.map(() => Math.random() * Math.PI * 2);

    // 触摸支持
    this.lastTouchDist = 0;
    this.lastTouchCenter = null;

    this.resize();
    this.setupEvents();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.recalcScale();
  }

  recalcScale() {
    const minDim = Math.min(this.canvas.width, this.canvas.height);
    // 确保最远的行星（海王星）在屏幕上可见
    const maxOrbit = this.realisticScale ? 4500 : 620;
    this.baseScale = (minDim * 0.42) / maxOrbit;
  }

  setupEvents() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', () => this.onPointerUp());
    this.canvas.addEventListener('mouseleave', () => this.onPointerUp());
    this.canvas.addEventListener('click', (e) => this.onClick(e.clientX, e.clientY));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        this.lastTouchDist = this.getTouchDist(e.touches);
        this.lastTouchCenter = this.getTouchCenter(e.touches);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isDragging) {
        this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        const dist = this.getTouchDist(e.touches);
        const center = this.getTouchCenter(e.touches);
        const scaleDelta = dist / this.lastTouchDist;
        this.scale *= scaleDelta;
        this.scale = Math.max(0.2, Math.min(5, this.scale));
        this.offsetX += center.x - this.lastTouchCenter.x;
        this.offsetY += center.y - this.lastTouchCenter.y;
        this.lastTouchDist = dist;
        this.lastTouchCenter = center;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        // 检测是否为点击（未拖拽）
        if (!this.hasDragged) {
          const touch = e.changedTouches[0];
          this.onClick(touch.clientX, touch.clientY);
        }
        this.onPointerUp();
      }
    });

    // 窗口大小
    window.addEventListener('resize', () => this.resize());
  }

  getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }

  onPointerDown(x, y) {
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragOffsetX = this.offsetX;
    this.dragOffsetY = this.offsetY;
  }

  onPointerMove(x, y) {
    if (this.isDragging) {
      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this.hasDragged = true;
      }
      this.offsetX = this.dragOffsetX + dx;
      this.offsetY = this.dragOffsetY + dy;
    }
    // 悬停检测
    this.hoveredPlanet = this.hitTest(x, y);
    this.canvas.style.cursor = this.hoveredPlanet ? 'pointer' : (this.isDragging ? 'grabbing' : 'grab');
  }

  onPointerUp() {
    this.isDragging = false;
  }

  onClick(x, y) {
    // 如果拖拽过，不触发点击
    if (this.hasDragged) return;
    const planet = this.hitTest(x, y);
    if (planet) {
      this.selectedPlanet = planet;
      if (this.onPlanetClick) this.onPlanetClick(planet);
    }
  }

  onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = this.scale * delta;
    if (newScale >= 0.15 && newScale <= 8) {
      // 缩放时以鼠标位置为中心
      const mx = e.clientX;
      const my = e.clientY;
      this.offsetX = mx - (mx - this.offsetX) * delta;
      this.offsetY = my - (my - this.offsetY) * delta;
      this.scale = newScale;
    }
  }

  hitTest(x, y) {
    const effectiveScale = this.baseScale * this.scale;
    for (let i = PLANETS.length - 1; i >= 0; i--) {
      const p = PLANETS[i];
      const pos = this.getPlanetScreenPos(p, i);
      const r = this.getPlanetScreenRadius(p);
      const dx = x - pos.x;
      const dy = y - pos.y;
      if (dx * dx + dy * dy <= (r + 8) * (r + 8)) {
        return p;
      }
    }
    // 检测太阳
    const sunR = this.getSunRadius();
    const dx = x - this.centerX - this.offsetX;
    const dy = y - this.centerY - this.offsetY;
    if (dx * dx + dy * dy <= (sunR + 10) * (sunR + 10)) {
      return SUN;
    }
    return null;
  }

  getPlanetScreenPos(planet, index) {
    const effectiveScale = this.baseScale * this.scale;
    const orbit = this.realisticScale ? planet.orbitRadius : planet.visualOrbit;
    const angle = this.planetAngles[index];
    return {
      x: this.centerX + this.offsetX + Math.cos(angle) * orbit * effectiveScale,
      y: this.centerY + this.offsetY + Math.sin(angle) * orbit * effectiveScale,
    };
  }

  getPlanetScreenRadius(planet) {
    const effectiveScale = this.baseScale * this.scale;
    const r = this.realisticScale
      ? Math.max(planet.radius * effectiveScale, 2)
      : planet.visualRadius * Math.min(effectiveScale * 0.6, 1.2);
    return Math.max(r, 4);
  }

  getSunRadius() {
    const effectiveScale = this.baseScale * this.scale;
    return this.realisticScale
      ? Math.max(60 * effectiveScale, 10)
      : 30 * Math.min(effectiveScale * 0.6, 1.5);
  }

  update(deltaTime) {
    if (this.paused) return;
    const dt = deltaTime * this.speed * 0.001;
    for (let i = 0; i < PLANETS.length; i++) {
      // 公转速度：周期越短，角速度越快
      const angularSpeed = (2 * Math.PI) / (PLANETS[i].orbitPeriod * 0.5);
      this.planetAngles[i] += angularSpeed * dt;
    }
  }

  draw() {
    const ctx = this.ctx;
    const effectiveScale = this.baseScale * this.scale;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制轨道
    if (this.showOrbits) {
      this.drawOrbits(ctx, effectiveScale);
    }

    // 绘制太阳
    this.drawSun(ctx);

    // 绘制行星
    for (let i = 0; i < PLANETS.length; i++) {
      this.drawPlanet(ctx, PLANETS[i], i, effectiveScale);
    }

    // 绘制标签
    if (this.showLabels) {
      ctx.font = `11px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      for (let i = 0; i < PLANETS.length; i++) {
        const p = PLANETS[i];
        const pos = this.getPlanetScreenPos(p, i);
        const r = this.getPlanetScreenRadius(p);
        ctx.fillStyle = this.hoveredPlanet === p ? '#ffd54f' : 'rgba(255,255,255,0.7)';
        ctx.fillText(p.name, pos.x, pos.y - r - 8);
      }
      // 太阳标签
      ctx.fillStyle = '#ffd54f';
      ctx.fillText('太阳', this.centerX + this.offsetX, this.centerY + this.offsetY - this.getSunRadius() - 12);
    }
  }

  drawOrbits(ctx, effectiveScale) {
    for (const p of PLANETS) {
      const orbit = this.realisticScale ? p.orbitRadius * effectiveScale : p.visualOrbit * effectiveScale;
      ctx.beginPath();
      ctx.arc(
        this.centerX + this.offsetX,
        this.centerY + this.offsetY,
        orbit, 0, Math.PI * 2
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  drawSun(ctx) {
    const cx = this.centerX + this.offsetX;
    const cy = this.centerY + this.offsetY;
    const r = this.getSunRadius();
    const isHovered = this.hoveredPlanet === SUN;

    // 光晕
    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 3);
    glowGrad.addColorStop(0, 'rgba(255, 200, 50, 0.25)');
    glowGrad.addColorStop(0.5, 'rgba(255, 150, 0, 0.08)');
    glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // 太阳主体
    const sunGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    sunGrad.addColorStop(0, '#fff8e1');
    sunGrad.addColorStop(0.3, '#ffeb3b');
    sunGrad.addColorStop(0.7, '#ff9800');
    sunGrad.addColorStop(1, '#e65100');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // 日冕效果
    const coronaGrad = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.6);
    coronaGrad.addColorStop(0, 'rgba(255, 200, 50, 0.15)');
    coronaGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    // 悬停光晕
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  drawPlanet(ctx, planet, index, effectiveScale) {
    const pos = this.getPlanetScreenPos(planet, index);
    const r = this.getPlanetScreenRadius(planet);

    // 行星阴影（面向太阳侧有光，背向太阳侧有暗）
    const isHovered = this.hoveredPlanet === planet;

    // 悬停光晕
    if (isHovered) {
      const hoverGrad = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r * 2.5);
      hoverGrad.addColorStop(0, `${planet.color}44`);
      hoverGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = hoverGrad;
      ctx.fill();
    }

    // 行星本体
    const grad = ctx.createRadialGradient(
      pos.x - r * 0.3, pos.y - r * 0.3, r * 0.1,
      pos.x, pos.y, r
    );
    grad.addColorStop(0, planet.gradient[0]);
    grad.addColorStop(1, planet.gradient[1]);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 地球特殊处理：添加海洋和大陆的感觉
    if (planet.id === 'earth' && r > 8) {
      ctx.beginPath();
      ctx.arc(pos.x - r * 0.15, pos.y - r * 0.1, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
      ctx.fill();
    }

    // 火星特殊处理：极冠
    if (planet.id === 'mars' && r > 6) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - r * 0.6, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }

    // 土星环
    if (planet.hasRing) {
      this.drawRing(ctx, pos.x, pos.y, r);
    }

    // 木星条纹
    if (planet.id === 'jupiter' && r > 15) {
      this.drawJupiterStripes(ctx, pos.x, pos.y, r);
    }

    // 光照效果
    const lightAngle = Math.atan2(
      this.centerY + this.offsetY - pos.y,
      this.centerX + this.offsetX - pos.x
    );
    const lightGrad = ctx.createRadialGradient(
      pos.x + Math.cos(lightAngle) * r * 0.4,
      pos.y + Math.sin(lightAngle) * r * 0.4,
      r * 0.1,
      pos.x, pos.y, r
    );
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = lightGrad;
    ctx.fill();

    // 边框
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = planet.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  drawRing(ctx, x, y, planetR) {
    ctx.save();
    ctx.translate(x, y);
    // 倾斜角度模拟3D效果
    ctx.scale(1, 0.35);
    ctx.rotate(-0.3);

    // 外环
    ctx.beginPath();
    ctx.arc(0, 0, planetR * 2.2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 224, 130, 0.5)';
    ctx.lineWidth = planetR * 0.6;
    ctx.stroke();

    // 内环
    ctx.beginPath();
    ctx.arc(0, 0, planetR * 1.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200, 180, 120, 0.3)';
    ctx.lineWidth = planetR * 0.3;
    ctx.stroke();

    ctx.restore();
  }

  drawJupiterStripes(ctx, x, y, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    const stripes = [
      { y: -0.6, h: 0.12, color: 'rgba(180, 120, 60, 0.3)' },
      { y: -0.25, h: 0.15, color: 'rgba(200, 140, 80, 0.25)' },
      { y: 0.1, h: 0.1, color: 'rgba(160, 100, 50, 0.3)' },
      { y: 0.4, h: 0.12, color: 'rgba(190, 130, 70, 0.25)' },
    ];

    for (const s of stripes) {
      ctx.fillStyle = s.color;
      ctx.fillRect(x - r, y + s.y * r, r * 2, s.h * r);
    }

    // 大红斑
    ctx.beginPath();
    ctx.ellipse(x + r * 0.3, y + r * 0.15, r * 0.25, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 80, 60, 0.35)';
    ctx.fill();

    ctx.restore();
  }
}
