/**
 * 剧情叙事模块
 * 序章、各章到达台词、终章、打字机效果
 */

// ===== 序章 · 火种计划 =====
const OPENING_LINES = [
  '公元 2147 年。',
  '',
  '太阳观测站发出最高级别警报——',
  '太阳核心的氢燃料加速消耗，',
  '预计 50 年内，太阳将膨胀为红巨星，',
  '届时地球轨道将被吞没。',
  '',
  '人类面临前所未有的生存危机。',
  '全球联合政府启动「火种计划」：',
  '派遣一艘深空探测飞船，',
  '对太阳系所有天体进行全面评估。',
  '',
  '你，是这艘飞船的唯一乘员。',
  '代号：火种号。',
  '',
  '任务：系统探索太阳系八大行星，',
  '为人类文明的延续寻找新的家园。',
  '',
  '飞船已就绪。引擎启动。',
  '目标——太阳。',
];

// ===== 各章到达台词 =====
const ARRIVAL_DIALOGUES = {
  sun: [
    '恒星就在眼前。',
    '日冕层的温度超过百万度，核心正在进行每秒 3.8×10²⁶ 瓦特的核聚变。',
    '这是整个太阳系的能量之源，也是即将毁灭我们的力量。',
    '',
    'AI 助手说："要理解太阳系中的一切，首先要理解这颗恒星。它是衡量万物的尺度。"',
    '',
    '你采集太阳数据。核心温度 1500 万°C，年龄 46 亿年。',
    '但异常膨胀信号表明，它的寿命可能要大幅修正。',
    '',
    '离开太阳时，AI 说："太阳给了地球生命，也将收回它。但我们还有时间。下一站——水星。"',
  ],
  mercury: [
    '水星表面布满了陨石坑，和月球惊人地相似。',
    '昼夜温差超过 600°C——白天 427°C，夜间零下 173°C。',
    '',
    'AI 发现了关键数据："注意，水星的极地陨石坑中存在水冰的痕迹。"',
    '',
    '你很震惊。离太阳最近的行星，居然有水。',
    'AI 说："水冰的存在说明，即使是极端环境下，水——生命最基本的要素——也能以某种形式保存下来。"',
    '',
    '"但水星不适合人类。温差太大，没有大气层。我们需要找一个有大气层的星球。"',
    '',
    '下一站——金星。',
  ],
  venus: [
    '金星被浓硫酸云层包裹，表面温度高达 462°C——比离太阳更近的水星还热。',
    '',
    'AI 的语气变得严肃："金星曾经可能拥有海洋，和地球非常相似。但失控的温室效应把它变成了炼狱。"',
    '',
    '大气中 96.5% 是二氧化碳，气压是地球的 92 倍。',
    '',
    'AI 说："金星是地球的一面镜子。如果我们不改变，地球的未来可能就是金星。温室效应的教训就写在这里。"',
    '',
    '"但反过来想——如果金星的温室效应可以被逆转，那地球的危机也有希望。"',
    '',
    '下一站——地球。你的家园。',
  ],
  earth: [
    '从太空看去，地球依然那么美丽。蓝色的海洋，白色的云层，绿色的大陆。',
    '',
    'AI 列出数据："过去 200 年间，地球平均温度上升了 1.2°C，海平面上升了 20 厘米。"',
    '',
    '你问："地球还有救吗？"',
    '',
    'AI 回答："地球是已知唯一存在生命的行星。它的磁场保护着大气层，液态水覆盖了 71% 的表面。这在太阳系中独一无二。"',
    '',
    '"答案是：地球值得拯救，但也需要准备后路。这就是我们探索的意义。"',
    '',
    '下一站——火星。人类最有可能的第二个家园。',
  ],
  mars: [
    '红色的大地展现在眼前。',
    '奥林匹斯山高耸入云——21.9 公里，太阳系最高的山。',
    '水手号谷绵延 4000 公里——太阳系最大的峡谷。',
    '',
    'AI 兴奋地说："火星是最有可能被改造的行星！它的自转周期和地球接近，一天只多 37 分钟。它有水冰，有稀薄的大气。"',
    '',
    '你降落在火星表面。土壤中含有高氯酸盐，需要处理后才能种植作物。大气中 95% 是二氧化碳。',
    '',
    'AI 说："改造火星需要几百年，但理论上是可行的。这是最现实的备选方案。"',
    '',
    '下一站——木星。太阳系的巨人。',
  ],
  jupiter: [
    '木星的体积是地球的 1300 倍。大红斑就在眼前——一个持续了 350 年的巨大风暴。',
    '',
    'AI 说："木星是太阳系的守护者。它的强大引力像一面盾牌，为内行星挡住了大量小天体。"',
    '',
    '你飞越木星的卫星系统。木卫二——冰层下可能存在液态海洋，是最有可能存在地外生命的地方。',
    '',
    'AI 总结："木星本身不适合人类，但它的卫星系统可能是一个隐藏的宝藏。特别是木卫二——冰下的海洋中，也许正有生命在游动。"',
    '',
    '下一站——土星。',
  ],
  saturn: [
    '土星环在阳光下闪耀。28 万公里宽，却只有 10 米厚。',
    '',
    'AI 说："土星是太阳系中最美的行星，也是密度最低的——比水还轻。理论上，它能浮在水面上。"',
    '',
    '你穿过土星环采集样本。环中的冰粒含有有机分子——生命的基础材料。',
    '',
    '然后你飞向土卫六——泰坦。它是太阳系中唯一拥有浓厚大气层的卫星，表面有液态甲烷湖泊。',
    '',
    'AI 说："泰坦有自己的天气系统。如果火星改造失败，泰坦可能是更远的备选。"',
    '',
    '下一站——天王星。',
  ],
  uranus: [
    '天王星几乎是"躺着"绕太阳公转的。自转轴倾斜 98 度。',
    '',
    'AI 推测："数十亿年前，一个地球大小的天体撞击了天王星，把它撞成了现在这个样子。"',
    '',
    '你探测天王星的内部。AI 发现了一个惊人事实："天王星内部的压力和温度足以将甲烷分解，碳原子被压缩成钻石——这里可能在下钻石雨。"',
    '',
    'AI 说："天王星告诉我们，太阳系的形成远比我们想象的更暴力。每一次撞击，都在塑造今天的太阳系。"',
    '',
    '最后一站——海王星。太阳系的边疆。',
  ],
  neptune: [
    '海王星是太阳系最远的行星。风速高达 2100 公里/小时——太阳系中最快的风。',
    '',
    'AI 说："海王星是唯一通过数学计算预测后才被发现的行星。1846 年，科学家用笔和纸算出了它的位置。这是人类智慧的胜利。"',
    '',
    '你飞越海卫一——特里同。它的表面有氮冰间歇泉，正在慢慢靠近海王星。',
    '',
    'AI 说："几亿年后，它会被潮汐力撕碎，可能形成第二个土星环。"',
    '',
    '你完成了所有数据采集。海王星之后，是无尽的黑暗。',
    '',
    'AI 说："探索完成了。该回地球了。"',
  ],
};

// ===== 终章 · 火种 =====
const ENDING_LINES = [
  '你回到了地球。',
  '带着 9 颗天体的全部数据。',
  '',
  'AI 汇报道：',
  '"水星：不可居住，但极地有水冰。"',
  '"金星：温室效应的反面教材。"',
  '"地球：值得守护的家园。"',
  '"火星：最现实的改造目标。"',
  '"木星：卫星系统是隐藏宝藏。"',
  '"土星：泰坦是远期备选。"',
  '"天王星和海王星：资源丰富但距离太远。"',
  '',
  '你问："所以，答案是什么？"',
  '',
  'AI 沉默了一会儿，说：',
  '',
  '"我在每一颗星球上都发现了人类曾经不知道的东西。"',
  '"水星的极地冰，金星的温室教训，"',
  '"火星的改造可能，木卫二的地下海洋..."',
  '',
  '"答案不是某一颗星球。"',
  '"答案是——探索本身。"',
  '',
  '"每一个发现，每一次突破，都在扩展人类生存的边界。"',
  '"火种计划的真正目的不是找到一个新家，"',
  '"而是点燃永不熄灭的探索之火。"',
  '',
  '"这，才是延续文明的真正火种。"',
  '',
  '你望向窗外的星空。太阳还在头顶闪耀。',
  '它终有一天会膨胀，但不是今天。',
  '',
  '今天，人类还有时间。还有希望。',
  '还有星辰大海等待探索。',
  '',
  '—— 全剧终 ——',
];

class NarrativeManager {
  constructor() {
    this.isShowing = false;
    this.skipRequested = false;
    this.currentCallback = null;
  }

  /**
   * 显示开场剧情
   */
  showOpening(onComplete) {
    this.showTypewriterSequence(OPENING_LINES, onComplete, true);
  }

  /**
   * 显示终章
   */
  showEnding(onComplete) {
    this.showTypewriterSequence(ENDING_LINES, onComplete, false);
  }

  /**
   * 通用打字机序列
   */
  showTypewriterSequence(lines, onComplete, isOpening) {
    this.isShowing = true;
    this.skipRequested = false;
    this.textFullyRevealed = false;
    this.currentCallback = onComplete;

    const overlay = document.createElement('div');
    overlay.id = isOpening ? 'narrative-overlay' : 'narrative-overlay';
    overlay.className = isOpening ? '' : 'ending-overlay';
    overlay.innerHTML = `
      <div class="narrative-content">
        <div class="narrative-text" id="narrative-text"></div>
        <div class="narrative-skip">点击显示全部</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 第一次点击：显示全部文字；第二次点击：关闭
    overlay.addEventListener('click', () => {
      if (!this.textFullyRevealed) {
        this.textFullyRevealed = true;
        this.skipRequested = true;
        this.revealAllText(overlay, lines, isOpening);
      } else {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          this.isShowing = false;
          if (this.currentCallback) this.currentCallback();
        }, 500);
      }
    });

    this.typeLines(overlay, lines, 0);
  }

  revealAllText(overlay, lines, isOpening) {
    const textEl = overlay.querySelector('#narrative-text');
    textEl.innerHTML = lines.map(line =>
      line === '' ? '<br>' : `<div class="narrative-line">${line}</div>`
    ).join('');

    const skipEl = overlay.querySelector('.narrative-skip');
    skipEl.textContent = isOpening ? '点击开始探索 →' : '点击结束';
    skipEl.classList.add('ready');
  }

  typeLines(overlay, lines, lineIndex) {
    if (this.skipRequested) return;
    if (lineIndex >= lines.length) {
      // 所有行已显示完毕
      this.textFullyRevealed = true;
      const skipEl = overlay.querySelector('.narrative-skip');
      if (skipEl) { skipEl.textContent = '点击继续'; skipEl.classList.add('ready'); }
      return;
    }

    const textEl = overlay.querySelector('#narrative-text');
    const line = lines[lineIndex];

    if (line === '') {
      const br = document.createElement('br');
      textEl.appendChild(br);
      setTimeout(() => this.typeLines(overlay, lines, lineIndex + 1), 200);
      return;
    }

    const lineEl = document.createElement('div');
    lineEl.className = 'narrative-line';
    textEl.appendChild(lineEl);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (this.skipRequested) {
        clearInterval(typeInterval);
        return;
      }
      if (charIndex >= line.length) {
        clearInterval(typeInterval);
        setTimeout(() => this.typeLines(overlay, lines, lineIndex + 1), 350);
        return;
      }
      lineEl.textContent += line[charIndex];
      charIndex++;
    }, 45);
  }

  /**
   * 显示行星到达台词（章节剧情）
   */
  showArrival(planetId, planetName, onComplete) {
    const lines = ARRIVAL_DIALOGUES[planetId];
    if (!lines || lines.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    this.isShowing = true;
    this.arrivalTextRevealed = false;

    const overlay = document.createElement('div');
    overlay.id = 'arrival-overlay';
    overlay.innerHTML = `
      <div class="arrival-content">
        <div class="arrival-header">
          <span class="arrival-icon">${this.getPlanetEmoji(planetId)}</span>
          <span class="arrival-title">已到达 ${planetName}</span>
        </div>
        <div class="arrival-text" id="arrival-text"></div>
        <div class="arrival-skip">点击显示全部</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 第一次点击：显示全部文字；第二次点击：关闭
    overlay.addEventListener('click', () => {
      if (!this.arrivalTextRevealed) {
        // 第一次点击：跳过打字机，显示全部文字
        this.arrivalTextRevealed = true;
        this.showAllArrivalText(overlay, lines);
      } else {
        // 第二次点击：关闭
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          this.isShowing = false;
          if (onComplete) onComplete();
        }, 400);
      }
    });

    this.typeArrivalLines(overlay, lines, 0);
  }

  showAllArrivalText(overlay, lines) {
    const textEl = overlay.querySelector('#arrival-text');
    textEl.innerHTML = lines.map(line =>
      line === '' ? '<br>' : `<div class="arrival-line">${line}</div>`
    ).join('');

    const skipEl = overlay.querySelector('.arrival-skip');
    skipEl.textContent = '点击继续';
    skipEl.classList.add('ready');
  }

  typeArrivalLines(overlay, lines, lineIndex) {
    if (this.arrivalTextRevealed) return;
    if (lineIndex >= lines.length) {
      // 所有行已显示完毕
      this.arrivalTextRevealed = true;
      const skipEl = overlay.querySelector('.arrival-skip');
      if (skipEl) { skipEl.textContent = '点击继续'; skipEl.classList.add('ready'); }
      return;
    }

    const textEl = overlay.querySelector('#arrival-text');
    const line = lines[lineIndex];

    if (line === '') {
      const br = document.createElement('br');
      textEl.appendChild(br);
      setTimeout(() => this.typeArrivalLines(overlay, lines, lineIndex + 1), 200);
      return;
    }

    const lineEl = document.createElement('div');
    lineEl.className = 'arrival-line';
    textEl.appendChild(lineEl);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (this.arrivalTextRevealed) {
        clearInterval(typeInterval);
        return;
      }
      if (charIndex >= line.length) {
        clearInterval(typeInterval);
        setTimeout(() => this.typeArrivalLines(overlay, lines, lineIndex + 1), 500);
        return;
      }
      lineEl.textContent += line[charIndex];
      charIndex++;
    }, 35);
  }

  getPlanetEmoji(planetId) {
    const map = {
      sun: '☀️', mercury: '🔘', venus: '🟡', earth: '🌍',
      mars: '🔴', jupiter: '🟤', saturn: '🪐', uranus: '🔵', neptune: '🔵',
    };
    return map[planetId] || '🪐';
  }
}
