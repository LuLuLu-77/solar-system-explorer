/**
 * UI 交互模块
 * 处理信息面板、对比面板、使用指南等界面交互
 */

class UIManager {
  constructor(solarSystem) {
    this.solar = solarSystem;
    this.compareMode = false;
    this.comparePlanet = null;
    this.onPanelClose = null; // 面板关闭回调
    this.bindEvents();
  }

  bindEvents() {
    // 关闭信息面板
    document.getElementById('btn-close-panel').addEventListener('click', () => {
      this.hidePanel();
    });

    // 关闭对比面板
    document.getElementById('btn-close-compare').addEventListener('click', () => {
      this.hideCompare();
    });

    // 行星对比按钮
    document.getElementById('btn-compare').addEventListener('click', () => {
      this.showCompare();
    });

    // 使用指南
    document.getElementById('btn-guide').addEventListener('click', () => {
      document.getElementById('guide-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-guide').addEventListener('click', () => {
      document.getElementById('guide-modal').classList.add('hidden');
    });
    document.getElementById('guide-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('guide-modal').classList.add('hidden');
      }
    });
  }

  showPlanetInfo(planet) {
    const panel = document.getElementById('info-panel');
    document.getElementById('planet-icon').textContent = planet.emoji;
    document.getElementById('planet-name').textContent = `${planet.name} ${planet.nameEn}`;
    document.getElementById('planet-subtitle').textContent = planet.subtitle;

    // 统计数据
    const statsHtml = Object.entries(planet.stats).map(([label, value]) => `
      <div class="stat-item">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
      </div>
    `).join('');
    document.getElementById('planet-stats').innerHTML = statsHtml;

    // 描述
    document.getElementById('planet-desc').innerHTML = `<p>${planet.description}</p>`;

    // 趣味知识
    const factsHtml = planet.facts.map(f => `
      <div class="fact-item">
        <span class="fact-icon">${f.icon}</span>
        <span>${f.text}</span>
      </div>
    `).join('');
    document.getElementById('planet-facts').innerHTML = factsHtml;

    // 对比按钮
    document.getElementById('btn-compare').style.display =
      (planet === SUN) ? 'none' : 'block';

    this.currentPlanet = planet;
    panel.classList.remove('hidden');

    // 隐藏对比面板
    document.getElementById('compare-panel').classList.add('hidden');

    // 检测是否阅读完毕（滚动到底部触发 readAll）
    this.setupReadDetection(planet);
  }

  setupReadDetection(planet) {
    const panel = document.getElementById('info-panel');
    const readPlanets = this._readPlanets || (this._readPlanets = new Set());

    // 如果已经标记为已读，不重复检测
    if (readPlanets.has(planet.id)) return;

    // 使用 scroll 事件检测是否滚动到底部
    const checkRead = () => {
      if (panel.classList.contains('hidden')) return;
      const scrollTop = panel.scrollTop;
      const scrollHeight = panel.scrollHeight;
      const clientHeight = panel.clientHeight;
      // 滚动到距底部 30px 以内视为阅读完毕
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        readPlanets.add(planet.id);
        if (this.onReadAll) this.onReadAll(planet.id);
        panel.removeEventListener('scroll', checkRead);
      }
    };
    panel.addEventListener('scroll', checkRead);

    // 对于内容较短的面板（不需要滚动），直接标记为已读
    setTimeout(() => {
      if (panel.scrollHeight <= panel.clientHeight + 10) {
        readPlanets.add(planet.id);
        if (this.onReadAll) this.onReadAll(planet.id);
      }
    }, 500);
  }

  hidePanel() {
    this.triggerPanelClose();
    document.getElementById('info-panel').classList.add('hidden');
    this.solar.selectedPlanet = null;
  }

  triggerPanelClose() {
    if (this.onPanelClose) {
      const cb = this.onPanelClose;
      this.onPanelClose = null; // 一次性回调
      setTimeout(cb, 100);
    }
  }

  showCompare() {
    if (!this.currentPlanet || this.currentPlanet === SUN) return;

    const panel = document.getElementById('compare-panel');
    const content = document.getElementById('compare-content');

    // 与地球对比（地球作为参考）
    const earth = PLANETS.find(p => p.id === 'earth');
    const target = this.currentPlanet;

    // 数值化的对比数据
    const compareData = [
      {
        label: '赤道直径 (km)',
        earthVal: 12742,
        targetVal: parseInt(target.stats['赤道直径'].replace(/[^0-9]/g, '')),
        format: v => v.toLocaleString() + ' km',
      },
      {
        label: '距太阳距离 (万km)',
        earthVal: 14960,
        targetVal: parseInt(target.stats['距太阳距离'].replace(/[^0-9]/g, '')),
        format: v => v.toLocaleString() + ' 万km',
      },
      {
        label: '公转周期 (地球日)',
        earthVal: 365.25,
        targetVal: this.parseOrbitPeriod(target.stats['公转周期']),
        format: v => v > 365 ? (v / 365.25).toFixed(2) + ' 年' : v.toFixed(1) + ' 天',
      },
      {
        label: '表面重力 (m/s²)',
        earthVal: 9.81,
        targetVal: parseFloat(target.stats['表面重力']),
        format: v => v.toFixed(2) + ' m/s²',
      },
      {
        label: '质量 (地球=1)',
        earthVal: 1,
        targetVal: parseFloat(target.stats['质量(地球=1)']),
        format: v => v.toFixed(v < 1 ? 3 : 1),
      },
    ];

    let tableHtml = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>指标</th>
            <th>🌍 地球</th>
            <th>${target.emoji} ${target.name}</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const item of compareData) {
      const maxVal = Math.max(item.earthVal, item.targetVal);
      const earthBarW = Math.max(5, (item.earthVal / maxVal) * 100);
      const targetBarW = Math.max(5, (item.targetVal / maxVal) * 100);

      tableHtml += `
        <tr>
          <td style="text-align:left;font-weight:600">${item.label}</td>
          <td>
            ${item.format(item.earthVal)}
            <br><div class="compare-bar" style="width:${earthBarW}px"></div>
          </td>
          <td>
            ${item.format(item.targetVal)}
            <br><div class="compare-bar" style="width:${targetBarW}px"></div>
          </td>
        </tr>
      `;
    }

    tableHtml += '</tbody></table>';

    // 添加对比结论
    const ratio = (target.stats['质量(地球=1)']);
    tableHtml += `
      <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.04);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.8">
        <strong style="color:var(--accent-gold)">📊 对比小结：</strong><br>
        ${target.name}的直径是地球的 ${(parseInt(target.stats['赤道直径'].replace(/[^0-9]/g, '')) / 12742).toFixed(2)} 倍，
        质量是地球的 ${ratio} 倍，
        表面重力为地球的 ${(parseFloat(target.stats['表面重力']) / 9.81).toFixed(2)} 倍。
      </div>
    `;

    content.innerHTML = tableHtml;
    panel.classList.remove('hidden');
    document.getElementById('info-panel').classList.add('hidden');

    // 触发对比完成事件
    if (this.onCompare) this.onCompare();
  }

  parseOrbitPeriod(str) {
    // 解析公转周期为天数
    if (str.includes('年')) {
      return parseFloat(str) * 365.25;
    }
    return parseFloat(str);
  }

  hideCompare() {
    document.getElementById('compare-panel').classList.add('hidden');
  }
}
