/**
 * 太阳系知识测验模块
 * 包含多选题和判断题
 */

const QUIZ_QUESTIONS = [
  {
    question: '太阳系中体积最大的行星是哪一颗？',
    options: ['土星', '木星', '天王星', '海王星'],
    answer: 1,
    explanation: '木星是太阳系中体积和质量最大的行星，直径约为地球的11倍。',
  },
  {
    question: '太阳系中哪颗行星被称为"红色星球"？',
    options: ['金星', '水星', '火星', '木星'],
    answer: 2,
    explanation: '火星因表面富含氧化铁（铁锈）而呈现红色，因此被称为"红色星球"。',
  },
  {
    question: '太阳系中表面温度最高的行星是哪颗？',
    options: ['水星', '金星', '火星', '地球'],
    answer: 1,
    explanation: '金星表面温度约462°C，比离太阳更近的水星还热，这是因为浓厚的二氧化碳大气层产生了强烈的温室效应。',
  },
  {
    question: '以下哪颗行星的自转方向与其他行星相反？',
    options: ['火星', '天王星', '金星', '海王星'],
    answer: 2,
    explanation: '金星是太阳系中唯一逆向自转的行星，在金星上太阳从西边升起。',
  },
  {
    question: '太阳占太阳系总质量的百分比约为多少？',
    options: ['约 80%', '约 90%', '约 99.86%', '约 95%'],
    answer: 2,
    explanation: '太阳的质量占太阳系总质量的约99.86%，其余所有天体加起来仅占约0.14%。',
  },
  {
    question: '太阳系中哪颗行星拥有壮观的环系统？',
    options: ['木星', '天王星', '海王星', '土星'],
    answer: 3,
    explanation: '土星以其壮观的环系统闻名，环宽达28万公里，但厚度仅约10米。',
  },
  {
    question: '以下哪颗行星是通过数学计算预测而非直接观测发现的？',
    options: ['天王星', '海王星', '冥王星', '水星'],
    answer: 1,
    explanation: '海王星是1846年通过数学计算预测发现的，科学家根据天王星轨道的异常推算出了它的位置。',
  },
  {
    question: '太阳系中风速最快的行星是哪颗？',
    options: ['木星', '土星', '天王星', '海王星'],
    answer: 3,
    explanation: '海王星拥有太阳系中最快的风速，可达2100 km/h。',
  },
  {
    question: '地球到太阳的平均距离约为多少？',
    options: ['1 光年', '1.496 亿公里', '3.84 亿公里', '5 亿公里'],
    answer: 1,
    explanation: '地球到太阳的平均距离约1.496亿公里，天文学上定义为1个天文单位（1 AU）。',
  },
  {
    question: '太阳系中最高的山峰位于哪颗行星？',
    options: ['地球', '火星', '金星', '水星'],
    answer: 1,
    explanation: '奥林匹斯山位于火星，高约21.9公里，是珠穆朗玛峰的近3倍，也是太阳系最高的山峰。',
  },
  {
    question: '以下哪颗卫星是太阳系中唯一拥有浓厚大气层的卫星？',
    options: ['月球', '木卫二（欧罗巴）', '土卫六（泰坦）', '海卫一'],
    answer: 2,
    explanation: '土卫六（泰坦）是太阳系中唯一拥有浓厚大气层的卫星，其大气主要由氮气组成，表面还有液态甲烷湖泊。',
  },
  {
    question: '光从太阳到达地球大约需要多长时间？',
    options: ['约 8 秒', '约 8 分 20 秒', '约 1 小时', '约 1 天'],
    answer: 1,
    explanation: '光速约为30万公里/秒，太阳到地球的距离约1.5亿公里，光需要约8分20秒才能到达。',
  },
  {
    question: '太阳系中密度最低的行星是哪颗？',
    options: ['木星', '土星', '天王星', '海王星'],
    answer: 1,
    explanation: '土星的密度仅为0.687 g/cm³，是太阳系中唯一密度低于水的行星。',
  },
  {
    question: '天王星的自转轴倾斜角度约为多少？',
    options: ['23.5°', '45°', '78°', '98°'],
    answer: 3,
    explanation: '天王星自转轴倾斜约98°，几乎是"躺着"绕太阳公转，这可能是远古时期一次巨大撞击的结果。',
  },
  {
    question: '太阳的能量来源于什么反应？',
    options: ['化学燃烧', '核裂变', '核聚变', '引力收缩'],
    answer: 2,
    explanation: '太阳通过核心的氢核聚变反应产生能量，每秒将约400万吨物质转化为能量（E=mc²）。',
  },
];

class QuizManager {
  constructor() {
    this.questions = this.shuffle([...QUIZ_QUESTIONS]);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.totalQuestions = 10; // 每次测验10题
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  start() {
    this.questions = this.shuffle([...QUIZ_QUESTIONS]);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.showQuestion();
  }

  showQuestion() {
    const q = this.questions[this.currentIndex];
    document.getElementById('quiz-progress').textContent =
      `第 ${this.currentIndex + 1} / ${this.totalQuestions} 题`;
    document.getElementById('quiz-question').textContent = q.question;
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-score').textContent = '';

    const optionsHtml = q.options.map((opt, i) => `
      <div class="quiz-option" data-index="${i}">${String.fromCharCode(65 + i)}. ${opt}</div>
    `).join('');
    document.getElementById('quiz-options').innerHTML = optionsHtml;

    // 绑定选项点击
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => this.selectAnswer(parseInt(opt.dataset.index)));
    });

    this.answered = false;
  }

  selectAnswer(index) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.currentIndex];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quiz-feedback');

    // 标记正确和错误答案
    options[q.answer].classList.add('correct');
    if (index !== q.answer) {
      options[index].classList.add('wrong');
    } else {
      this.score++;
    }

    // 禁用所有选项
    options.forEach(opt => opt.classList.add('disabled'));

    // 显示解释
    feedback.textContent = q.explanation;
    feedback.style.color = index === q.answer ? 'var(--accent-green)' : 'var(--accent-red)';

    // 延迟后进入下一题
    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.totalQuestions) {
        this.showResult();
      } else {
        this.showQuestion();
      }
    }, 2500);
  }

  showResult() {
    const qArea = document.getElementById('quiz-question');
    const optArea = document.getElementById('quiz-options');
    const feedback = document.getElementById('quiz-feedback');
    const scoreArea = document.getElementById('quiz-score');
    const progress = document.getElementById('quiz-progress');

    progress.textContent = '测验完成！';
    qArea.innerHTML = `
      <div style="text-align:center;font-size:48px;margin-bottom:12px">
        ${this.score >= 8 ? '🏆' : this.score >= 6 ? '🌟' : this.score >= 4 ? '👍' : '📚'}
      </div>
      <div style="text-align:center">
        你答对了 <strong style="color:var(--accent-gold);font-size:24px">${this.score}</strong> / ${this.totalQuestions} 题
      </div>
      <div style="text-align:center;margin-top:8px;color:var(--text-secondary);font-size:14px">
        ${this.score >= 8 ? '太棒了！你是太阳系专家！' :
          this.score >= 6 ? '不错！你对太阳系有很好的了解！' :
          this.score >= 4 ? '继续加油！多探索一下行星吧！' :
          '别灰心！回到太阳系中探索学习吧！'}
      </div>
    `;
    optArea.innerHTML = `
      <button class="action-btn" id="btn-restart-quiz" style="margin-top:16px">🔄 再来一次</button>
    `;
    feedback.textContent = '';
    scoreArea.textContent = '';

    document.getElementById('btn-restart-quiz').addEventListener('click', () => {
      this.start();
    });
  }
}
