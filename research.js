/* A deterministic research illustration. No clinical inference, patient data, API or storage. */
(() => {
  'use strict';
  const root = document.querySelector('.research-v2');
  if (!root) return;
  let language = 'en';
  let scenario = 'sufficient';
  const strings = {
    en: {
      womenKicker: '01 — WEARABLE INTELLIGENCE', womenScope: "Women's health research scope",
      womenCount: 'women', womenCaption: 'Research participants', provinceCount: 'provinces', provinceCaption: 'Guangdong · Shaanxi',
      cycleVisual: 'A WINDOW INTO EVERYDAY RHYTHMS', ageingKicker: '02 — INTELLIGENT HOME SENSING',
      hkLabel: 'HONG KONG · HOME SENSING', homes: 'older-adult homes', deploymentScope: 'Cumulative programme deployments',
      mapAlt: 'Geographic outline of Hong Kong; no household locations shown', mapCaption: 'Geographic illustration · no household locations shown.',
      scopeCaption: 'Programme-wide scale, not a paper’s analysis cohort.', demoEyebrow: 'DemScreen Demo',
      demoTitle: 'Missing observations ≠ inactivity.', synthetic: 'Synthetic demo · not clinical',
      demoIntro: 'The same day can tell a different story when the evidence changes. Explore how a research system can ask for more information before producing a report.',
      scenarioGroup: 'Illustrative evidence scenarios', sufficient: 'Enough evidence', sparse: 'Sparse observations', context: 'Needs context',
      activityLegend: 'Illustrative activity', missingLegend: 'Not observed', contextLegend: 'Needs context', observedLabel: 'OBSERVED WINDOWS',
      previewLabel: 'Fixed synthetic output · not generated from the grid', riskLabel: 'Dementia risk · demo', diagnosisLabel: 'Diagnosis · demo',
      riskCaption: 'Illustrative score, not a probability', diagnosisCaption: 'AD is a fixed display example',
      diagnosisDescription: 'Fixed illustrative diagnosis categories: AD is highlighted, not a clinical finding',
      previewNote: '78/100 and AD are fixed examples—not a clinical diagnosis, calibrated probability or model inference. The buttons above change evidence coverage only.',
      demoDisclaimer: 'Fixed synthetic examples · no patient data · no clinical inference. Scores, categories and observation counts are illustrative, not research results.',
      activities: ['Rest / still', 'Daily tasks', 'Media use', 'Exercise', 'Social activity'], mask: 'Observed',
      windowWord: 'window', notObserved: 'Not observed', observed: 'Observed', contextCell: 'Observed activity; context needed',
      gridDescription: 'Synthetic daily activity grid: 5 activity categories, 26 half-hour windows, 07:00–20:00. {count} windows observed. Blank activity cells are not evidence of inactivity; check the observation row.',
      statuses: {
        sufficient: ['Illustrative report ready', 'Most windows are observed. In this fixed scenario, the evidence check allows an illustrative report.', 'Evidence sufficient in this example'],
        sparse: ['More observations needed', 'Many periods are unobserved. The illustrative report is held; missing recordings cannot establish inactivity.', 'Report held · observation request'],
        context: ['More context needed', 'Coverage alone is not enough. Two observed periods need context about what was happening before an illustrative report can proceed.', 'Report held · context request']
      }
    },
    zh: {
      womenKicker: '01 — 可穿戴智能', womenScope: '女性健康研究规模', womenCount: '名女性', womenCaption: '研究参与者', provinceCount: '个省份', provinceCaption: '广东 · 陕西',
      cycleVisual: '从日常信号，看见身体节律', ageingKicker: '02 — 智能居家感知', hkLabel: '香港 · 居家感知', homes: '户长者家庭',
      deploymentScope: '整体项目累计部署', mapAlt: '香港地理轮廓，不显示任何家庭位置', mapCaption: '地域示意 · 不展示家庭位置。',
      scopeCaption: '整体项目规模，非单篇论文分析队列。', demoEyebrow: 'DemScreen Demo', demoTitle: '没有观测，不等于没有活动。',
      synthetic: '合成演示 · 非临床用途', demoIntro: '同一天，证据不同，能得出的结论也不同。看看研究系统如何先请求更多信息，再生成报告。',
      scenarioGroup: '示意性证据场景', sufficient: '证据充分', sparse: '观测稀疏', context: '需要更多背景',
      activityLegend: '示意活动', missingLegend: '未被观测', contextLegend: '需补充背景', observedLabel: '已观测时间窗',
      previewLabel: '固定合成输出 · 并非从上方活动图生成', riskLabel: '认知症风险 · 演示', diagnosisLabel: '诊断分类 · 演示',
      riskCaption: '示意分数，不代表患病概率', diagnosisCaption: 'AD 仅为固定展示示例',
      diagnosisDescription: '固定示意分类：AD 高亮仅用于展示，并非临床结论',
      previewNote: '78/100 与 AD 均为固定示例，并非临床诊断、校准概率或模型推断结果。上方按钮只切换证据覆盖场景。',
      demoDisclaimer: '固定合成示例 · 不含患者数据 · 不进行临床推断。分数、分类与观测数量均用于示意，并非研究结果。',
      activities: ['静息', '日常事务', '媒体使用', '运动', '社交活动'], mask: '观测覆盖', windowWord: '时间窗',
      notObserved: '未被观测', observed: '已观测', contextCell: '已观测到活动，需补充背景',
      gridDescription: '合成日内活动示意：5 类活动、26 个半小时时间窗，覆盖 07:00 至 20:00。其中 {count} 个时间窗有观测。活动栏空白不代表没有活动，请同时查看观测覆盖行。',
      statuses: {
        sufficient: ['示意报告可生成', '大部分时间窗已有观测。在这个固定场景中，证据检查允许生成示意报告。', '仅本示例中的证据充分'],
        sparse: ['需要更多观测', '多个时段没有被观测到。示意报告暂缓生成；记录缺失不能说明没有活动。', '报告暂缓 · 请求更多观测'],
        context: ['需要更多背景', '有观测并不代表信息完整。两个已观测时段需要补充活动背景，才能继续生成示意报告。', '报告暂缓 · 请求活动背景']
      }
    }
  };
  // These small hand-authored arrays are educational examples, not clinical records.
  const activities = [0,0,1,1,3,3,1,0,2,2,4,4,1,1,0,0,3,3,2,2,4,4,1,0,0,2];
  const available = {
    sufficient: Array.from({length:26}, (_, index) => ![5,14,22].includes(index)),
    sparse: Array.from({length:26}, (_, index) => [0,1,6,7,12,13,20,25].includes(index)),
    context: Array.from({length:26}, (_, index) => ![5,14,22].includes(index))
  };
  const container = root.querySelector('#observationDemo');
  const grid = root.querySelector('#observationGrid');
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const clock = index => `${String(7 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`;
  function renderScenario() {
    const text = strings[language];
    const mask = available[scenario];
    const count = mask.filter(Boolean).length;
    const fragment = document.createDocumentFragment();
    text.activities.forEach((label, rowIndex) => {
      const row = make('div', 'rx-grid-row');
      row.dataset.activity = String(rowIndex);
      row.append(make('span', 'rx-row-label', label));
      activities.forEach((activity, index) => {
        const isActive = mask[index] && activity === rowIndex;
        const needsContext = isActive && scenario === 'context' && [10,11].includes(index);
        const classes = ['rx-cell', !mask[index] ? 'is-missing' : '', isActive ? 'is-active' : '', needsContext ? 'is-context' : ''].filter(Boolean).join(' ');
        const cell = make('span', classes);
        cell.setAttribute('aria-hidden', 'true');
        cell.title = `${clock(index)}–${clock(index + 1)} · ${!mask[index] ? text.notObserved : needsContext ? text.contextCell : isActive ? label : text.observed}`;
        row.append(cell);
      });
      fragment.append(row);
    });
    const maskRow = make('div', 'rx-grid-row rx-mask-row');
    maskRow.append(make('span', 'rx-row-label', text.mask));
    mask.forEach(observed => maskRow.append(make('span', `rx-cell${observed ? '' : ' is-missing'}`)));
    fragment.append(maskRow);
    const axis = make('div', 'rx-axis');
    ['07:00','10:00','13:00','16:00','20:00'].forEach(time => axis.append(make('span', '', time)));
    fragment.append(axis);
    grid.replaceChildren(fragment);
    grid.setAttribute('aria-label', text.gridDescription.replace('{count}', count));
    container.dataset.scenario = scenario;
    root.querySelector('#observedCount').textContent = count;
    const [heading, explanation, action] = text.statuses[scenario];
    root.querySelector('#evidenceStatus').textContent = heading;
    root.querySelector('#evidenceExplanation').textContent = explanation;
    root.querySelector('#evidenceAction').textContent = action;
    root.querySelectorAll('[data-scenario]').forEach(button => {
      if (button.tagName !== 'BUTTON') return;
      const selected = button.dataset.scenario === scenario;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function setLanguage(value) {
    language = String(value).toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const text = strings[language];
    root.querySelectorAll('[data-rx]').forEach(element => {
      const value = text[element.dataset.rx];
      if (typeof value === 'string') element.textContent = value;
    });
    root.querySelectorAll('[data-rx-aria]').forEach(element => element.setAttribute('aria-label', text[element.dataset.rxAria]));
    root.querySelectorAll('[data-rx-alt]').forEach(element => element.alt = text[element.dataset.rxAlt]);
    renderScenario();
  }
  root.querySelectorAll('button[data-scenario]').forEach(button => button.addEventListener('click', () => {
    scenario = button.dataset.scenario;
    renderScenario();
  }));
  window.ResearchDemo = Object.freeze({setLanguage});
  setLanguage(document.documentElement.lang || 'en');
})();
