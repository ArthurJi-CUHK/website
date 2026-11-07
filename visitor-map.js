(() => {
  'use strict';
  const KEY = 'arthur-mapmyvisitors-consent-v1';
  const PROVIDER = 'https://mapmyvisitors.com';
  const words = {
    en: {
      eyebrow: 'A WORLD OF SHARED CURIOSITY', title: 'Hello, from around the world.',
      intro: 'An optional visitor globe, with locations and counts supplied directly by MapMyVisitors.',
      allow: 'Load globe & include my visit', retry: 'Try loading again', withdraw: 'Withdraw map consent',
      stats: 'View public visitor statistics ↗', details: 'How this visitor globe works', policy: 'MapMyVisitors privacy policy ↗',
      disclosure: 'Loading the globe sends your IP address, approximate location, browser and page/referrer information to MapMyVisitors. Its privacy policy says visitor data is retained while the site owner’s account remains active. Your choice is saved separately from Cloudflare analytics.',
      retention: 'Withdrawal removes the widget and stops future loads in this browser. It cannot recall requests already sent or delete data held by the provider. You can contact the site owner about that data.',
      metric: 'Counts reflect widget loads, not unique people. Locations are approximate. All dots and numbers come from the provider; this website does not generate them.',
      off: 'The globe is off. No MapMyVisitors widget request is made until you allow it.',
      loading: 'Loading the official visitor globe…', script: 'The widget script loaded; waiting for the provider to render the globe.',
      ready: 'The provider’s globe is displayed. This does not independently confirm that this visit was recorded.',
      error: 'The visitor globe could not be loaded. The provider or a browser restriction may be preventing it.',
      waiting: 'The provider has not finished rendering the globe. You can withdraw consent or try loading again.',
      blocked: 'The globe is disabled because your browser sends Do Not Track or Global Privacy Control.',
      storage: 'Your choice could not be saved. The visitor globe remains off.',
      withdrawn: 'Map consent withdrawn. Already-sent requests cannot be recalled.',
      withdrawStorage: 'The globe is off on this page, but withdrawal could not be saved. Clear this site’s saved data before your next visit.',
      frameTitle: 'MapMyVisitors visitor globe and provider-rendered visit totals',
      useLink: 'Use “View public visitor statistics” below to open the provider’s full report.'
    },
    zh: {
      eyebrow: '好奇心，让世界相遇', title: '来自世界各地的问候。',
      intro: '可选的访客地球：位置光点和计数由 MapMyVisitors 直接提供。',
      allow: '加载地球并计入本次访问', retry: '重新尝试加载', withdraw: '撤回访客地图同意',
      stats: '查看公开访客统计 ↗', details: '访客地球如何运作', policy: 'MapMyVisitors 隐私政策 ↗',
      disclosure: '加载地球会向 MapMyVisitors 发送 IP 地址、近似位置、浏览器及页面／来源信息。其隐私政策说明，访客数据会在站主账号活跃期间保留。此选项与 Cloudflare 统计分别保存。',
      retention: '撤回后会移除组件，停止此浏览器今后的加载；已经发送的请求无法撤回，也不会自动删除服务商保存的数据。如需处理该数据，可联系站主。',
      metric: '计数反映组件加载次数，并非独立人数；位置为近似值。所有光点和数字均来自服务商，本网站不会自行生成。',
      off: '访客地球已关闭。同意之前，不会请求 MapMyVisitors 组件。',
      loading: '正在加载官方访客地球……', script: '组件脚本已加载，正在等待服务商绘制地球。',
      ready: '服务商的地球已显示；这不代表已独立确认本次访问被计入。',
      error: '访客地球未能加载，可能是服务商暂不可用或浏览器限制所致。',
      waiting: '服务商尚未完成地球绘制。你可以撤回同意，或重新尝试加载。',
      blocked: '浏览器已启用 Do Not Track 或 Global Privacy Control，访客地球已停用。',
      storage: '无法保存选择，访客地球保持关闭。',
      withdrawn: '已撤回访客地图同意；已发送的请求无法撤回。',
      withdrawStorage: '本页地球已关闭，但无法保存撤回选择。请在下次访问前清除此网站的已保存数据。',
      frameTitle: 'MapMyVisitors 访客地球及服务商显示的访问计数',
      useLink: '请使用下方“查看公开访客统计”打开服务商的完整报告。'
    }
  };
  let lang = 'en', root, elements, config, frame = null, nonce = '', timer = null;
  let consent = false, state = 'off', initialized = false;

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
  function render() {
    if (!initialized) return;
    const text = words[lang];
    for (const name of ['eyebrow', 'title', 'intro', 'disclosure', 'retention', 'metric', 'details', 'policy', 'stats']) elements[name].textContent = text[name];
    elements.allow.textContent = ['error', 'waiting'].includes(state) ? text.retry : text.allow;
    elements.allow.disabled = blocked() || ['loading', 'script', 'ready'].includes(state);
    elements.withdraw.textContent = text.withdraw;
    elements.withdraw.hidden = !consent;
    elements.status.textContent = text[blocked() ? 'blocked' : state];
    elements.host.hidden = !frame;
    elements.stats.hidden = !elements.stats.getAttribute('href');
    if (frame) frame.title = text.frameTitle;
  }
  function removeFrame() {
    if (timer !== null) clearTimeout(timer);
    timer = null; nonce = '';
    if (frame) frame.remove();
    frame = null;
    if (elements) elements.host.replaceChildren();
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
      const report = () => {
        const body = document.body;
        if (!body) return;
        const height = Math.ceil(Math.max(body.scrollHeight, body.getBoundingClientRect().height) + 16);
        if (height > 100) send('height', {height});
        const globe = document.querySelector('.mmvst_inner');
        if (globe && getComputedStyle(globe).display !== 'none') send('ready');
        const link = document.querySelector('#mmvst_a');
        if (link) send('stats', {url:link.href});
      };
      window.addEventListener('load', () => { report(); setTimeout(report,1000); });
      document.addEventListener('DOMContentLoaded', () => {
        new MutationObserver(report).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href','style']});
        if ('ResizeObserver' in window) new ResizeObserver(report).observe(document.body);
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
    if (!initialized || !consent || blocked()) { render(); return; }
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
    if (!config) return;
    root.classList.add('visitor-map');
    const card = make('div', 'vm-card', root);
    const content = make('div', 'vm-copy', card);
    elements = {};
    elements.eyebrow = make('p', 'vm-eyebrow', content);
    elements.title = make('h2', 'vm-title', content);
    elements.intro = make('p', 'vm-intro', content);
    elements.disclosure = make('p', 'vm-disclosure', content);
    const actions = make('div', 'vm-actions', content);
    elements.allow = make('button', 'vm-button', actions); elements.allow.type = 'button';
    elements.withdraw = make('button', 'vm-button vm-button-secondary', actions); elements.withdraw.type = 'button';
    elements.status = make('p', 'vm-status', content);
    elements.status.setAttribute('role', 'status'); elements.status.setAttribute('aria-live', 'polite');
    elements.stats = externalLink(content, statsURL(window.SITE_CONFIG?.visitorMapLink || ''));
    if (!statsURL(window.SITE_CONFIG?.visitorMapLink || '')) elements.stats.removeAttribute('href');
    const details = make('details', 'vm-details', content);
    elements.details = make('summary', '', details);
    elements.retention = make('p', '', details);
    elements.metric = make('p', '', details);
    elements.policy = externalLink(details, PROVIDER + '/b/policy');
    elements.host = make('div', 'vm-host', card);
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
      if (data.kind === 'height' && Number.isFinite(data.height)) frame.style.height = Math.min(1400, Math.max(220, data.height)) + 'px';
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
    const checkPrivacy = () => { if (blocked() && frame) removeFrame(); render(); };
    window.addEventListener('pageshow', checkPrivacy);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkPrivacy(); });
    render();
    if (consent) load();
  }
  window.VisitorMap = {
    setLanguage(value) { lang = String(value).toLowerCase().startsWith('zh') ? 'zh' : 'en'; render(); }
  };
  window.VisitorMap.setLanguage(document.documentElement.lang);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
