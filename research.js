/* A deterministic research illustration. No clinical inference, patient data, API or storage. */
(() => {
  'use strict';
  const root = document.querySelector('.research-v2');
  if (!root) return;
  let language = 'en';
  let scenario = 'sufficient';
  let selectedWindow = 10;
  let windowButtons = [];
  const strings = {
    en: {
      womenKicker: '01 — SMART-RING INTELLIGENCE', womenScope: "Women's health research scope",
      womenCount: 'women', womenCaption: 'Research participants', provinceCount: 'provinces', provinceCaption: 'Guangdong · Shaanxi',
      cycleVisual: 'SMART-RING HEALTH SENSING', ringAlt: 'Polished smart finger ring with an open centre and inner sensors', ageingKicker: '02 — INTELLIGENT HOME SENSING',
      hkLabel: 'HONG KONG · HOME SENSING', homes: 'older-adult homes', deploymentScope: 'Cumulative programme deployments',
      mapAlt: 'Geographic outline of Hong Kong; no household locations shown', mapCaption: 'Geographic illustration · no household locations shown.',
      scopeCaption: 'Programme-wide scale, not a paper’s analysis cohort.', demoEyebrow: 'DemScreen Demo',
      demoTitle: 'Dementia Screening', synthetic: 'Synthetic data',
      demoIntro: 'Choose an evidence scenario, then select a time window to inspect the daily routine.',
      scenarioGroup: 'Evidence scenarios', sufficient: 'Broad coverage', sparse: 'Missing periods', context: 'Unclear activity',
      activityLegend: 'Illustrative activity', missingLegend: 'Not observed', contextLegend: 'Needs context', observedLabel: 'OBSERVED WINDOWS',
      previewLabel: 'Example output', riskLabel: 'Dementia risk', diagnosisLabel: 'Diagnosis',
      riskCaption: 'Illustrative score, not a probability', diagnosisCaption: 'AD is a fixed display example',
      diagnosisDescription: 'Fixed illustrative diagnosis categories: AD is highlighted, not a clinical finding',
      previewNote: 'Fixed example · not a probability or diagnosis.',
      demoDisclaimer: 'Fixed synthetic examples · no patient data · no clinical inference. Scores, categories and observation counts are illustrative, not research results.',
      activities: ['Rest / still', 'Daily tasks', 'Media use', 'Exercise', 'Social activity'], mask: 'Observed',
      windowWord: 'window', notObserved: 'Not observed', observed: 'Observed', contextCell: 'Observed activity; context needed',
      inspectLabel: 'SELECTED WINDOW', inspectHint: 'Select a time window. Use ← → to move through the day.', previousWindow: 'Inspect previous half-hour window', nextWindow: 'Inspect next half-hour window',
      missingActivity: 'No observation available', uncertainActivity: 'Social activity · context missing', windowSelect: 'Inspect',
      missingDetail: 'No recording covers this period. Activity cannot be inferred from an empty window.',
      contextDetail: 'Conversation is logged, but who initiated it and whether assistance was needed are unspecified.',
      activityDetails: ['A quiet period appears in the example routine.', 'A household task is logged in this interval.', 'TV or media use appears in this interval.', 'A movement or exercise activity is logged.', 'A social interaction is logged in this interval.'],
      gridDescription: 'Interactive daily routine: 5 activities, 26 half-hour windows, 07:00–20:00. {count} windows observed. Select a window to inspect its evidence; arrow keys move through the day.',
      statuses: {
        sufficient: ['Ready for evidence review', 'The day includes five activity categories across morning, afternoon and evening.', 'Next step · review supporting periods'],
        sparse: ['Request more observations', 'Several periods are missing. Select a striped window to see what the record cannot tell us.', 'Next step · fill the observation gaps'],
        context: ['Clarify activity context', 'Two midday periods contain social activity but lack context. Select an amber window to inspect it.', 'Next step · clarify task and assistance']
      }
    },
    zh: {
      womenKicker: '01 — 智能指环', womenScope: '女性健康研究规模', womenCount: '名女性', womenCaption: '研究参与者', provinceCount: '个省份', provinceCaption: '广东 · 陕西',
      cycleVisual: '智能指环 · 健康感知', ringAlt: '抛光金属智能指环，中央镂空，内侧设有感知元件', ageingKicker: '02 — 智能居家感知', hkLabel: '香港 · 居家感知', homes: '户长者家庭',
      deploymentScope: '整体项目累计部署', mapAlt: '香港地理轮廓，不显示任何家庭位置', mapCaption: '地域示意 · 不展示家庭位置。',
      scopeCaption: '整体项目规模，非单篇论文分析队列。', demoEyebrow: 'DemScreen Demo', demoTitle: '认知障碍筛查',
      synthetic: '合成数据', demoIntro: '选择一种证据场景，再点选具体时间窗，查看日常活动记录。',
      scenarioGroup: '证据场景', sufficient: '覆盖较完整', sparse: '部分时段缺失', context: '活动背景不明',
      activityLegend: '示意活动', missingLegend: '未被观测', contextLegend: '需补充背景', observedLabel: '已观测时间窗',
      previewLabel: '输出示例', riskLabel: '认知症风险', diagnosisLabel: '诊断分类',
      riskCaption: '示意分数，不代表患病概率', diagnosisCaption: 'AD 仅为固定展示示例',
      diagnosisDescription: '固定示意分类：AD 高亮仅用于展示，并非临床结论',
      previewNote: '固定示例 · 非患病概率或诊断。',
      demoDisclaimer: '固定合成示例 · 不含患者数据 · 不进行临床推断。分数、分类与观测数量均用于示意，并非研究结果。',
      activities: ['静息', '日常事务', '媒体使用', '运动', '社交活动'], mask: '观测覆盖', windowWord: '时间窗',
      notObserved: '未被观测', observed: '已观测', contextCell: '已观测到活动，需补充背景',
      inspectLabel: '当前时间窗', inspectHint: '点选时间窗，或用 ← → 沿时间轴查看。', previousWindow: '查看上一个半小时时间窗', nextWindow: '查看下一个半小时时间窗',
      missingActivity: '暂无观测记录', uncertainActivity: '社交活动 · 背景缺失', windowSelect: '查看',
      missingDetail: '这一时段没有记录，不能从空白时间窗推断是否发生了活动。',
      contextDetail: '记录显示发生了交谈，但未说明由谁发起，以及是否需要他人协助。',
      activityDetails: ['示例日程中，这是一段安静时段。', '这一时段记录了一项日常家务。', '这一时段出现了电视或其他媒体使用活动。', '这一时段记录了运动活动。', '这一时段记录了一次社交互动。'],
      gridDescription: '可交互日常活动记录：5 类活动、26 个半小时时间窗，覆盖 07:00 至 20:00。其中 {count} 个时间窗有观测。选择时间窗查看证据，也可用方向键沿时间轴浏览。',
      statuses: {
        sufficient: ['可进入证据复核', '记录覆盖上午、下午和傍晚，包含五类日常活动。', '下一步 · 复核支持时段'],
        sparse: ['请求补充观测', '多个时段缺少记录。点选斜纹时间窗，查看当前证据的空缺。', '下一步 · 补充缺失时段'],
        context: ['澄清活动背景', '中午的两个时段记录到社交活动，但背景不明。点选琥珀色时间窗查看。', '下一步 · 明确活动与协助情况']
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
  const inspectionHint = make('p', 'rx-inspection-hint');
  inspectionHint.dataset.rx = 'inspectHint';
  const inspector = make('div', 'rx-window-inspector');
  inspector.setAttribute('aria-live', 'polite');
  const inspectorHead = make('div', 'rx-inspector-head');
  const inspectorCaption = make('div', 'rx-inspector-caption');
  const inspectorLabel = make('span', 'rx-inspector-label');
  inspectorLabel.dataset.rx = 'inspectLabel';
  const inspectorTime = make('strong', 'rx-inspector-time');
  inspectorCaption.append(inspectorLabel, inspectorTime);
  const inspectorControls = make('div', 'rx-window-controls');
  const previousButton = make('button', '', '←');
  const nextButton = make('button', '', '→');
  previousButton.type = nextButton.type = 'button';
  previousButton.dataset.rxAria = 'previousWindow';
  nextButton.dataset.rxAria = 'nextWindow';
  inspectorControls.append(previousButton, nextButton);
  inspectorHead.append(inspectorCaption, inspectorControls);
  const inspectorActivity = make('strong', 'rx-inspector-activity');
  const inspectorState = make('span', 'rx-inspector-state');
  const inspectorNote = make('p', 'rx-inspector-note');
  const inspectorDetail = make('div', 'rx-inspector-detail');
  inspectorDetail.append(inspectorActivity, inspectorState, inspectorNote);
  inspector.append(inspectorHead, inspectorDetail);
  root.querySelector('.rx-pattern').append(inspectionHint, inspector);

  function windowEvidence(index) {
    const text = strings[language];
    const observed = available[scenario][index];
    const uncertain = observed && scenario === 'context' && [10,11].includes(index);
    return {
      state: !observed ? 'missing' : uncertain ? 'context' : 'observed',
      label: !observed ? text.missingActivity : uncertain ? text.uncertainActivity : text.activities[activities[index]],
      note: !observed ? text.missingDetail : uncertain ? text.contextDetail : text.activityDetails[activities[index]],
      status: !observed ? text.notObserved : uncertain ? text.contextLegend : text.observed
    };
  }
  function selectWindow(index, focus = false) {
    selectedWindow = Math.max(0, Math.min(25, index));
    const evidence = windowEvidence(selectedWindow);
    inspectorTime.textContent = `${clock(selectedWindow)}–${clock(selectedWindow + 1)}`;
    inspectorActivity.textContent = evidence.label;
    inspectorState.textContent = evidence.status;
    inspectorNote.textContent = evidence.note;
    inspector.dataset.state = evidence.state;
    previousButton.disabled = selectedWindow === 0;
    nextButton.disabled = selectedWindow === 25;
    windowButtons.forEach((button, index) => {
      const selected = selectedWindow === index;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    if (focus) windowButtons[selectedWindow]?.focus();
  }
  previousButton.addEventListener('click', () => selectWindow(selectedWindow - 1));
  nextButton.addEventListener('click', () => selectWindow(selectedWindow + 1));

  function renderScenario() {
    const text = strings[language];
    const mask = available[scenario];
    const count = mask.filter(Boolean).length;
    const fragment = document.createDocumentFragment();
    const activityRows = make('div', 'rx-activity-rows');
    text.activities.forEach((label, rowIndex) => {
      const row = make('div', 'rx-grid-row');
      row.dataset.activity = String(rowIndex);
      row.setAttribute('aria-hidden', 'true');
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
      activityRows.append(row);
    });
    const windowTargets = make('div', 'rx-window-targets');
    windowButtons = activities.map((_, index) => {
      const evidence = windowEvidence(index);
      const button = make('button', `rx-window-target is-${evidence.state}`);
      button.type = 'button';
      button.dataset.window = String(index);
      button.setAttribute('aria-label', `${text.windowSelect} ${clock(index)}–${clock(index + 1)} · ${evidence.label} · ${evidence.status}`);
      button.title = `${clock(index)}–${clock(index + 1)} · ${evidence.label}`;
      button.addEventListener('click', () => selectWindow(index));
      button.addEventListener('keydown', event => {
        const offsets = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1};
        let next = index;
        if (event.key in offsets) next = index + offsets[event.key];
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = 25;
        else return;
        event.preventDefault();
        selectWindow(next, true);
      });
      windowTargets.append(button);
      return button;
    });
    activityRows.append(windowTargets);
    fragment.append(activityRows);
    const maskRow = make('div', 'rx-grid-row rx-mask-row');
    maskRow.setAttribute('aria-hidden', 'true');
    maskRow.append(make('span', 'rx-row-label', text.mask));
    mask.forEach(observed => maskRow.append(make('span', `rx-cell${observed ? '' : ' is-missing'}`)));
    fragment.append(maskRow);
    const axis = make('div', 'rx-axis');
    axis.setAttribute('aria-hidden', 'true');
    ['07:00','10:00','13:00','16:00','20:00'].forEach(time => axis.append(make('span', '', time)));
    fragment.append(axis);
    grid.replaceChildren(fragment);
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', text.gridDescription.replace('{count}', count));
    container.dataset.scenario = scenario;
    const countElement = root.querySelector('#observedCount');
    if (window.SiteNumbers?.set) window.SiteNumbers.set(countElement, count);
    else countElement.textContent = count;
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
    selectWindow(selectedWindow);
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
    selectedWindow = scenario === 'sparse' ? 2 : 10;
    renderScenario();
  }));
  window.ResearchDemo = Object.freeze({setLanguage});
  setLanguage(document.documentElement.lang || 'en');
})();
