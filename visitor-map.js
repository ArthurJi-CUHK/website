(() => {
  'use strict';
  const KEY = 'arthur-mapmyvisitors-consent-v1';
  const PROVIDER = 'https://mapmyvisitors.com';
  const words = {
    en: {
      eyebrow: 'A WORLD OF SHARED CURIOSITY', title: 'Hello, from around the world.',
      intro: 'A shared view of the curiosity that brings us here.',
      allow: 'Add my visit to the globe', retry: 'Try loading again', withdraw: 'Turn off visitor globe',
      stats: 'Public report ↗', details: 'Data & privacy details', policy: 'MapMyVisitors privacy policy ↗', privacyTitle: 'Optional visitor globe',
      disclosure: 'Public counts are read without recording a visit. Loading the optional globe sends your IP address, approximate location, browser and page/referrer information to MapMyVisitors; data is retained while the owner’s account remains active. This choice is separate from Cloudflare analytics.',
      retention: 'Withdrawal removes the widget and stops future loads in this browser. It cannot recall requests already sent or delete data held by the provider. You can contact the site owner about that data.',
      metric: 'Total page views are cumulative widget loads, not unique people. Countries/regions cover the dates shown in the public report, not necessarily the site’s lifetime. Public counts refresh every 60 seconds while this page is visible; the globe itself is not automatically reloaded. The unlit globe is decorative.',
      off: 'The globe records a visit only after you choose to load it.',
      loading: 'Loading the official visitor globe…', script: 'The widget script loaded; waiting for the provider to render the globe.',
      ready: 'MapMyVisitors globe loaded.',
      error: 'The visitor globe could not be loaded. The provider or a browser restriction may be preventing it.',
      waiting: 'The provider has not finished rendering the globe. You can withdraw consent or try loading again.',
      blocked: 'Visitor recording is off because your browser sends a privacy signal.',
      storage: 'Your choice could not be saved. The visitor globe remains off.',
      withdrawn: 'Map consent withdrawn. Already-sent requests cannot be recalled.',
      withdrawStorage: 'The globe is off on this page, but withdrawal could not be saved. Clear this site’s saved data before your next visit.',
      frameTitle: 'MapMyVisitors visitor globe and provider-rendered visit totals',
      useLink: 'Open the public report below for more detail.',
      totalLabel: 'Total page views', countryLabel: 'Countries / regions',
      statsLoading: 'Checking the public report…', statsUnavailable: 'Statistics unavailable — open the public report.',
      updated: 'Checked', cadence: 'refreshes every 60s', stale: 'Last checked', snapshot: 'Report checked',
      period: 'Report period', unknown: 'Unavailable', fromReport: 'Public report'
    },
    zh: {
      eyebrow: '好奇心，让世界相遇', title: '来自世界各地的问候。',
      intro: '让好奇心，连接世界各地的你我。',
      allow: '在地球上留下本次访问', retry: '重新尝试加载', withdraw: '关闭访客地球',
      stats: '公开报告 ↗', details: '数据与隐私说明', policy: 'MapMyVisitors 隐私政策 ↗', privacyTitle: '可选访客地球',
      disclosure: '公开数字只读更新，不会计入一次访问。加载可选地球会向 MapMyVisitors 发送 IP 地址、近似位置、浏览器及页面／来源信息；其政策说明，数据会在站主账号活跃期间保留。此选项与 Cloudflare 统计分别保存。',
      retention: '撤回后会移除组件，停止此浏览器今后的加载；已经发送的请求无法撤回，也不会自动删除服务商保存的数据。如需处理该数据，可联系站主。',
      metric: '累计浏览量是组件加载次数，不是独立人数；国家／地区数仅覆盖所标注的报告日期，不一定是网站全周期。公开数字在本页可见时每60秒刷新，地球本身不会自动重新加载。未点亮的地球仅为装饰。',
      off: '选择加载地球后，才会记录本次访问。',
      loading: '正在加载官方访客地球……', script: '组件脚本已加载，正在等待服务商绘制地球。',
      ready: 'MapMyVisitors 访客地球已加载。',
      error: '访客地球未能加载，可能是服务商暂不可用或浏览器限制所致。',
      waiting: '服务商尚未完成地球绘制。你可以撤回同意，或重新尝试加载。',
      blocked: '浏览器已发送隐私信号，访客记录保持关闭。',
      storage: '无法保存选择，访客地球保持关闭。',
      withdrawn: '已撤回访客地图同意；已发送的请求无法撤回。',
      withdrawStorage: '本页地球已关闭，但无法保存撤回选择。请在下次访问前清除此网站的已保存数据。',
      frameTitle: 'MapMyVisitors 访客地球及服务商显示的访问计数',
      useLink: '可打开下方公开报告查看详情。',
      totalLabel: '累计浏览量', countryLabel: '国家／地区',
      statsLoading: '正在读取公开报告……', statsUnavailable: '统计暂不可用，可打开公开报告。',
      updated: '核对于', cadence: '每60秒刷新', stale: '上次核对', snapshot: '报告采集于',
      period: '报告期', unknown: '暂不可用', fromReport: '公开报告'
    }
  };
  let lang = 'en', root, elements, config, frame = null, nonce = '', timer = null;
  let consent = false, state = 'off', initialized = false;
  let statsEndpoint = '', aggregate = null, aggregateState = 'loading';
  let statsTimer = null, statsController = null, lastAttempt = 0;
  let statsFallback = '', fallbackAttempted = false, aggregateSource = '';
  let privacyControls = false, localGlobe = null;
  const displayedMetrics = {totalValue: undefined, countryValue: undefined};

  function configuredScript() {
    try {
      const raw = window.SITE_CONFIG?.visitorMapScript;
      if (typeof raw !== 'string' || !raw) return null;
      const url = new URL(raw.startsWith('//') ? 'https:' + raw : raw);
      if (url.origin !== PROVIDER || url.pathname !== '/globe.js' || url.username || url.password || url.hash) return null;
      if (url.searchParams.getAll('d').length !== 1 || !/^[A-Za-z0-9_-]{16,128}$/.test(url.searchParams.get('d'))) return null;
      return url.href;
    } catch { return null; }
  }
  function statsURL(value) {
    try {
      const url = new URL(value, PROVIDER);
      return url.origin === PROVIDER && /^\/web\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) && !url.username && !url.password ? url.href : '';
    } catch { return ''; }
  }
  function configuredStatsEndpoint() {
    try {
      const value = window.SITE_CONFIG?.visitorStatsEndpoint;
      if (typeof value !== 'string' || !value) return '';
      const url = new URL(value, location.href);
      return url.protocol === 'https:' && !url.username && !url.password && !url.hash ? url.href : '';
    } catch { return ''; }
  }
  function configuredFallback() {
    try {
      const value = window.SITE_CONFIG?.visitorStatsFallback;
      if (typeof value !== 'string' || !value) return '';
      const url = new URL(value, location.href);
      return url.origin === location.origin && !url.username && !url.password && !url.hash ? url.href : '';
    } catch { return ''; }
  }
  function readConsent() { try { return localStorage.getItem(KEY) === 'yes'; } catch { return false; } }
  function blocked() {
    return navigator.globalPrivacyControl === true || [navigator.doNotTrack, navigator.msDoNotTrack, window.doNotTrack].some(value => value === '1' || value === 'yes');
  }
  function make(tag, className, parent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (parent) parent.append(element);
    return element;
  }
  function externalLink(parent, href) {
    const link = make('a', 'vm-link', parent);
    link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  }
  function setMetric(name, value) {
    const normalized = Number.isSafeInteger(value) && value >= 0 ? value : null;
    if (displayedMetrics[name] === normalized) return;
    displayedMetrics[name] = normalized;
    // Replace a formerly animated number when it becomes unknown, so its
    // animation cannot continue and turn an error state into an apparent zero.
    if (normalized === null) {
      const replacement = make('strong', 'vm-metric-number');
      replacement.textContent = '—';
      elements[name].replaceWith(replacement);
      elements[name] = replacement;
    } else if (!window.SiteNumbers?.set(elements[name], normalized)) {
      elements[name].textContent = new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en').format(normalized);
    }
  }
  function renderAggregates() {
    if (!elements?.metrics) return;
    const text = words[lang];
    elements.metrics.hidden = !statsEndpoint;
    elements.statsMeta.hidden = !statsEndpoint;
    elements.totalLabel.textContent = text.totalLabel;
    elements.countryLabel.textContent = text.countryLabel;
    elements.totalScope.textContent = 'MapMyVisitors';
    setMetric('totalValue', aggregate?.totalPageviews);
    setMetric('countryValue', aggregate?.countryCount);
    localGlobe?.setCountries(aggregate?.countryCodes || []);
    localGlobe?.setLanguage(lang);
    if (aggregate?.countryPeriod) {
      const format = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {year:'numeric', month:'short', day:'numeric', timeZone:'UTC'});
      const start = format.format(new Date(aggregate.countryPeriod.start + 'T00:00:00Z'));
      const end = format.format(new Date(aggregate.countryPeriod.end + 'T00:00:00Z'));
      elements.countryScope.textContent = `${text.period}: ${start} – ${end}`;
    } else elements.countryScope.textContent = aggregate ? text.unknown : text.fromReport;
    if (aggregate) {
      const checkedAt = new Date(aggregate.updatedAt);
      const when = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}).format(checkedAt);
      const delayed = aggregateState === 'error' || Date.now() - checkedAt.getTime() > 5 * 60 * 1000;
      const label = aggregateSource === 'snapshot' ? text.snapshot : delayed ? text.stale : text.updated;
      elements.statsMeta.textContent = `${label} ${when}${!delayed && aggregateSource === 'live' ? ' · ' + text.cadence : ''}`;
    } else elements.statsMeta.textContent = text[aggregateState === 'error' ? 'statsUnavailable' : 'statsLoading'];
  }
  function validAggregates(data) {
    const expectedReport = statsURL(window.SITE_CONFIG?.visitorMapLink || '');
    const validCount = value => Number.isSafeInteger(value) && value >= 0;
    const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
    if (!data || data.version !== 1 || !expectedReport || data.reportUrl !== expectedReport || !validCount(data.totalPageviews)) return false;
    if (data.countryCount !== null && (!validCount(data.countryCount) || data.countryCount > 250 || data.countryCount > data.totalPageviews)) return false;
    if (data.countryCodes !== null && (!Array.isArray(data.countryCodes) || data.countryCodes.length > 250 || data.countryCodes.some(code => typeof code !== 'string' || !/^[A-Z]{2}$/.test(code)) || new Set(data.countryCodes).size !== data.countryCodes.length || data.countryCodes.length !== data.countryCount)) return false;
    if (data.countryCount !== null && data.countryCodes === null) return false;
    if (data.countryPeriod !== null && (!data.countryPeriod || !validDate(data.countryPeriod.start) || !validDate(data.countryPeriod.end) || data.countryPeriod.start > data.countryPeriod.end)) return false;
    if (data.countryCount !== null && !data.countryPeriod) return false;
    const updated = Date.parse(data.updatedAt);
    return typeof data.updatedAt === 'string' && Number.isFinite(updated) && updated <= Date.now() + 5 * 60 * 1000;
  }
  async function readFallback() {
    if (!statsFallback || fallbackAttempted || aggregate) return;
    fallbackAttempted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(statsFallback, {method:'GET', credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer', signal:controller.signal});
      if (!response.ok) return;
      const data = await response.json();
      if (!validAggregates(data)) return;
      aggregate = data; aggregateSource = 'snapshot';
    } catch { /* A missing snapshot remains unknown; never manufacture zero. */ }
    finally { clearTimeout(timeout); }
  }
  async function refreshAggregates() {
    if (!statsEndpoint || document.hidden || statsController) return;
    if (statsTimer !== null) clearTimeout(statsTimer);
    const remaining = 60000 - (Date.now() - lastAttempt);
    if (remaining > 0) { statsTimer = setTimeout(refreshAggregates, remaining); return; }
    lastAttempt = Date.now();
    const controller = new AbortController();
    statsController = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      // This endpoint reads a public aggregate report. It never requests the
      // counting widget and remains available with DNT/GPC or no map consent.
      const response = await fetch(statsEndpoint, {method:'GET', mode:'cors', credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer', signal:controller.signal});
      if (!response.ok) throw new Error('Public report unavailable');
      const data = await response.json();
      if (!validAggregates(data)) throw new Error('Invalid public aggregates');
      aggregate = data; aggregateState = 'ready'; aggregateSource = 'live';
    } catch { aggregateState = 'error'; await readFallback(); }
    finally {
      clearTimeout(timeout); statsController = null; renderAggregates();
      if (!document.hidden) statsTimer = setTimeout(refreshAggregates, 60000);
    }
  }
  function render() {
    if (!initialized) return;
    const text = words[lang];
    for (const name of ['eyebrow', 'title', 'intro', 'disclosure', 'retention', 'metric', 'details', 'policy', 'stats', 'privacyTitle']) elements[name].textContent = text[name];
    elements.allow.textContent = ['error', 'waiting'].includes(state) ? text.retry : text.allow;
    elements.allow.disabled = !config || blocked() || Boolean(frame && !['error', 'waiting'].includes(state));
    elements.withdraw.textContent = text.withdraw;
    elements.withdraw.hidden = !consent;
    elements.status.textContent = text[blocked() ? 'blocked' : state];
    const providerVisible = Boolean(frame && ['ready', 'useLink'].includes(state));
    elements.decoration.hidden = providerVisible;
    elements.stats.hidden = !elements.stats.getAttribute('href');
    if (frame) {
      frame.title = text.frameTitle; frame.dataset.ready = String(providerVisible);
      frame.setAttribute('tabindex', providerVisible ? '0' : '-1');
      frame.setAttribute('aria-hidden', String(!providerVisible));
    }
    renderAggregates();
  }
  function removeFrame() {
    if (timer !== null) clearTimeout(timer);
    timer = null; nonce = '';
    if (frame) frame.remove();
    frame = null;
  }
  function escapeAttribute(value) { return value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
  function frameDocument(scriptURL, messageNonce) {
    // The unmodified legacy provider script binds window.load. A fresh frame gives
    // it that event even when consent is granted after the main page has loaded.
    const adapter = `(() => {
      const nonce = ${JSON.stringify(messageNonce)};
      const send = (kind, extra = {}) => parent.postMessage({type:'arthur-visitor-map',nonce,kind,...extra}, '*');
      window.__visitorMapLoaded = () => send('script');
      window.__visitorMapError = () => send('error');
      let scheduled = false, lastHeight = 0, wasReady = false, lastLink = '';
      const report = () => {
        scheduled = false;
        const body = document.body;
        if (!body) return;
        const height = Math.ceil(Math.max(body.scrollHeight, body.getBoundingClientRect().height) + 16);
        if (height > 100 && height !== lastHeight) { lastHeight = height; send('height', {height}); }
        const globe = document.querySelector('.mmvst_inner');
        if (!wasReady && globe && getComputedStyle(globe).display !== 'none') { wasReady = true; send('ready'); }
        const link = document.querySelector('#mmvst_a');
        if (link && link.href !== lastLink) { lastLink = link.href; send('stats', {url:link.href}); }
      };
      const schedule = () => { if (!scheduled) { scheduled = true; setTimeout(report, 100); } };
      window.addEventListener('load', () => { report(); setTimeout(report,1000); });
      document.addEventListener('DOMContentLoaded', () => {
        // Ignore the animation's frame-by-frame transforms. Only visibility of
        // the globe itself, links and actual content/layout can change our UI.
        new MutationObserver(changes => {
          if (changes.some(change => change.type !== 'attributes' || change.attributeName !== 'style' || change.target.matches('.mmvst_inner'))) schedule();
        }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href','style']});
        if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
        document.addEventListener('click', event => {
          const link = event.target.closest && event.target.closest('a');
          if (link) { event.preventDefault(); send('link', {url:link.href}); }
        });
        report();
      });
    })();`;
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;font:13px/1.5 system-ui,sans-serif;color:#142d37}body{padding-bottom:8px}#providerHost{width:100%;max-width:360px;margin:0 auto}a{color:#176a69}img,svg{max-width:100%}.dots_svg{max-width:none}@media(prefers-reduced-motion:reduce){.mmvst_map_f,.mmvst_map_b,.mmvst_dots{transform:none!important}.mmvst_globe{transform:none!important}}</style><script>${adapter}<\/script></head><body><div id="providerHost"><script type="text/javascript" id="mmvst_globe" src="${escapeAttribute(scriptURL)}" onload="window.__visitorMapLoaded()" onerror="window.__visitorMapError()"><\/script></div></body></html>`;
  }
  function load() {
    if (!initialized || !consent || !config || !privacyControls || blocked()) { render(); return; }
    if (frame && !['error', 'waiting'].includes(state)) return;
    removeFrame();
    nonce = Array.from(crypto.getRandomValues(new Uint32Array(4))).map(value => value.toString(16)).join('-');
    frame = make('iframe', 'vm-frame');
    frame.title = words[lang].frameTitle;
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.style.height = '440px';
    frame.srcdoc = frameDocument(config, nonce);
    state = 'loading';
    elements.host.append(frame);
    render();
    timer = setTimeout(() => { if (frame && ['loading', 'script'].includes(state)) { state = 'waiting'; render(); } }, 20000);
  }
  function withdraw() {
    consent = false;
    removeFrame();
    state = 'withdrawn';
    try { localStorage.removeItem(KEY); if (readConsent()) state = 'withdrawStorage'; }
    catch { state = 'withdrawStorage'; }
    render();
  }
  function init() {
    if (initialized) return;
    root = document.getElementById('visitorMap');
    if (!root) return;
    root.hidden = true;
    config = configuredScript();
    statsEndpoint = configuredStatsEndpoint();
    statsFallback = configuredFallback();
    if (!config && !statsEndpoint) return;
    root.classList.add('visitor-map');
    const card = make('div', 'vm-card', root);
    const content = make('div', 'vm-copy', card);
    elements = {};
    elements.eyebrow = make('p', 'vm-eyebrow', content);
    elements.title = make('h2', 'vm-title', content);
    elements.intro = make('p', 'vm-intro', content);
    elements.metrics = make('div', 'vm-metrics', content);
    for (const name of ['total', 'country']) {
      const metric = make('div', 'vm-metric', elements.metrics);
      elements[name + 'Value'] = make('strong', 'vm-metric-number', metric);
      elements[name + 'Label'] = make('span', 'vm-metric-label', metric);
      elements[name + 'Scope'] = make('span', 'vm-metric-scope', metric);
    }
    elements.statsMeta = make('p', 'vm-stats-meta', content);
    // Recording controls live in the existing footer privacy dialog. Public
    // aggregates above require no tracking consent or third-party widget load.
    const privacyDialog = document.getElementById('privacyDialog');
    privacyControls = Boolean(privacyDialog);
    const privacyGroup = make('section', 'vm-privacy-group', privacyDialog);
    elements.privacyTitle = make('h3', '', privacyGroup);
    const actions = make('div', 'vm-actions', privacyGroup);
    elements.allow = make('button', 'vm-button', actions); elements.allow.type = 'button';
    elements.withdraw = make('button', 'vm-button vm-button-secondary', actions); elements.withdraw.type = 'button';
    elements.status = make('p', 'vm-status', privacyGroup);
    elements.status.setAttribute('role', 'status'); elements.status.setAttribute('aria-live', 'polite');
    elements.stats = externalLink(content, statsURL(window.SITE_CONFIG?.visitorMapLink || ''));
    if (!statsURL(window.SITE_CONFIG?.visitorMapLink || '')) elements.stats.removeAttribute('href');
    const details = make('details', 'vm-details', privacyGroup);
    elements.details = make('summary', '', details);
    elements.disclosure = make('p', 'vm-disclosure', details);
    elements.retention = make('p', '', details);
    elements.metric = make('p', '', details);
    elements.policy = externalLink(details, PROVIDER + '/b/policy');
    elements.host = make('div', 'vm-host', card);
    elements.decoration = make('div', 'vm-decorative-globe', elements.host);
    elements.decoration.setAttribute('aria-hidden', 'true');
    for (const name of ['vm-orbit vm-orbit-one', 'vm-orbit vm-orbit-two', 'vm-orbit vm-orbit-three', 'vm-equator']) make('span', name, elements.decoration);
    if (window.VisitorGlobe?.mount) {
      const globeHost = make('div', 'vm-local-globe', elements.host);
      localGlobe = window.VisitorGlobe.mount(globeHost);
      if (localGlobe) { elements.decoration.remove(); elements.decoration = globeHost; }
    }
    initialized = true;
    root.dataset.visitorMapReady = 'true'; root.hidden = false;
    consent = readConsent();
    elements.allow.addEventListener('click', () => {
      if (blocked()) return;
      try { localStorage.setItem(KEY, 'yes'); if (!readConsent()) throw new Error('Consent not saved'); }
      catch { state = 'storage'; render(); return; }
      consent = true; load();
    });
    elements.withdraw.addEventListener('click', withdraw);
    window.addEventListener('message', event => {
      const data = event.data;
      if (!frame || event.source !== frame.contentWindow || !data || data.type !== 'arthur-visitor-map' || data.nonce !== nonce) return;
      if (data.kind === 'height') {
        if (Number.isFinite(data.height)) frame.style.height = Math.min(1400, Math.max(220, data.height)) + 'px';
        return;
      }
      if (['script', 'ready', 'error'].includes(data.kind)) {
        if (state !== 'ready' || data.kind === 'error') state = data.kind;
        if (state === 'ready' || state === 'error') { clearTimeout(timer); timer = null; }
      }
      if (data.kind === 'stats' || data.kind === 'link') {
        const url = statsURL(data.url);
        if (url) { elements.stats.href = url; elements.stats.hidden = false; }
        if (data.kind === 'link' && url) { state = 'useLink'; elements.stats.focus(); }
      }
      render();
    });
    window.addEventListener('storage', event => {
      if (event.key !== KEY && event.key !== null) return;
      consent = readConsent();
      if (!consent) { removeFrame(); state = 'withdrawn'; render(); }
      else load();
    });
    const checkPrivacy = () => { if (blocked() && frame) { removeFrame(); state = 'off'; } render(); };
    window.addEventListener('pageshow', checkPrivacy);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { checkPrivacy(); refreshAggregates(); }
      else if (statsTimer !== null) { clearTimeout(statsTimer); statsTimer = null; }
    });
    render();
    refreshAggregates();
    if (consent) load();
  }
  window.VisitorMap = {
    setLanguage(value) { lang = String(value).toLowerCase().startsWith('zh') ? 'zh' : 'en'; render(); }
  };
  window.VisitorMap.setLanguage(document.documentElement.lang);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
