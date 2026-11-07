(() => {
  'use strict';

  // A separate choice: consent to the former custom Worker is not reused.
  const CONSENT_KEY = 'arthur-webanalytics-consent-v1';
  const BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js';
  const PRIVACY_URL = 'https://developers.cloudflare.com/web-analytics/about/';
  const copy = {
    en: {
      notice: 'Optional Cloudflare Web Analytics receives traffic and performance information, including page paths, referrers, country, browser and device information. Cloudflare reports are private; the separate optional visitor globe uses MapMyVisitors. Your Cloudflare choice is saved in this browser. Withdrawal reloads the page; the current page may still send a report while unloading.',
      docs: 'About Cloudflare Web Analytics ↗',
      allow: 'Allow optional analytics', retry: 'Retry loading analytics',
      withdraw: 'Withdraw consent & reload', reload: 'Reload to stop analytics',
      off: 'Optional analytics is off. The analytics script has not been loaded.',
      unconfigured: 'Optional analytics is unavailable because it has not been configured.',
      signal: 'Optional analytics is disabled because your browser sends a Do Not Track or Global Privacy Control preference.',
      forcedOff: 'Optional analytics is disabled for this URL.',
      loading: 'Loading the optional Cloudflare analytics script…',
      loaded: 'The analytics script has loaded. This does not confirm that Cloudflare has recorded a visit.',
      failed: 'The analytics script could not be loaded. No successful measurement is confirmed. You can retry or withdraw consent.',
      storage: 'Your choice could not be saved in this browser. Analytics remains off.',
      withdrawing: 'Consent has been withdrawn. Reloading to stop the loaded script; an unload report may still be sent.',
      reloadFailed: 'Consent has been withdrawn. Please reload this page to stop the loaded script; an unload report may still be sent.'
    },
    zh: {
      notice: '可选的 Cloudflare Web Analytics 会接收页面路径、来源、国家、浏览器、设备及性能信息。Cloudflare 报告为私有统计；另一个可选访客地球由 MapMyVisitors 提供。Cloudflare 选项保存在当前浏览器。撤回后页面会刷新；当前页面卸载时仍可能发送一份报告。',
      docs: '了解 Cloudflare Web Analytics ↗',
      allow: '允许可选访问统计', retry: '重新加载统计脚本',
      withdraw: '撤回同意并刷新', reload: '刷新以停止统计',
      off: '可选访问统计已关闭，尚未加载统计脚本。',
      unconfigured: '尚未配置可选访问统计，目前不可用。',
      signal: '浏览器已启用 Do Not Track 或 Global Privacy Control，可选访问统计已停用。',
      forcedOff: '此网址已停用可选访问统计。',
      loading: '正在加载可选的 Cloudflare 统计脚本……',
      loaded: '统计脚本已加载；这不代表 Cloudflare 已成功记录本次访问。',
      failed: '统计脚本未能加载，无法确认有成功的统计记录。你可以重试或撤回同意。',
      storage: '无法在当前浏览器保存选择，访问统计保持关闭。',
      withdrawing: '已撤回同意，正在刷新以停止已加载的脚本；页面卸载时仍可能发送报告。',
      reloadFailed: '已撤回同意。请刷新页面以停止已加载的脚本；页面卸载时仍可能发送报告。'
    }
  };

  let language = 'en';
  let initialized = false;
  let consent = false;
  let state = 'off';
  let script = null;
  let generation = 0;
  let reloading = false;
  let allowButton, withdrawButton, privacyExtra;

  function readChoice() {
    try { return window.localStorage.getItem(CONSENT_KEY) === 'yes'; }
    catch { return false; }
  }

  function privacyPreference() {
    const dnt = [navigator.doNotTrack, navigator.msDoNotTrack, window.doNotTrack];
    return navigator.globalPrivacyControl === true || dnt.some(value => value === '1' || value === 'yes');
  }

  function forcedOff() {
    try { return new URL(window.location.href).searchParams.get('analytics') === 'off'; }
    catch { return true; }
  }

  function token() {
    const value = window.SITE_CONFIG?.webAnalyticsToken;
    return typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value) ? value : '';
  }

  function render() {
    if (!initialized) return;
    const words = copy[language];
    const blocked = privacyPreference() || forcedOff();
    allowButton.disabled = reloading || blocked || !token() || state === 'loading' || state === 'loaded';
    allowButton.textContent = state === 'failed' ? words.retry : words.allow;
    withdrawButton.hidden = !consent && !reloading;
    withdrawButton.disabled = state === 'withdrawing';
    withdrawButton.textContent = state === 'reloadFailed' ? words.reload : words.withdraw;

    let status = state;
    if (!reloading) {
      if (forcedOff()) status = 'forcedOff';
      else if (privacyPreference()) status = 'signal';
      else if (!token()) status = 'unconfigured';
    }
    const message = document.createElement('span');
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    message.textContent = words[status];
    const link = document.createElement('a');
    link.href = PRIVACY_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = words.docs;
    privacyExtra.replaceChildren(
      document.createTextNode(words.notice), document.createElement('br'),
      message, document.createElement('br'), link
    );
  }

  function loadBeacon() {
    if (!initialized || !consent || reloading || privacyPreference() || forcedOff() || !token() || script) {
      render();
      return;
    }
    const attempt = ++generation;
    state = 'loading';
    script = document.createElement('script');
    // Use the official module snippet. Its public site token is not an API credential.
    script.type = 'module';
    script.src = BEACON_URL;
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: token() }));
    const pendingScript = script;
    script.addEventListener('load', () => {
      if (attempt !== generation || reloading) return;
      state = 'loaded';
      render();
    }, { once: true });
    script.addEventListener('error', () => {
      if (attempt !== generation || reloading) return;
      pendingScript.remove();
      script = null;
      state = 'failed';
      render();
    }, { once: true });
    render();
    document.head.append(script);
  }

  function stopAndReload() {
    ++generation;
    consent = false;
    reloading = true;
    state = 'withdrawing';
    // Removing an executed script does not stop its listeners. A reload is required.
    if (script) script.remove();
    render();
    let choiceCleared = false;
    try {
      window.localStorage.removeItem(CONSENT_KEY);
      choiceCleared = !readChoice();
    } catch { /* A URL opt-out below also works if browser storage is read-only. */ }
    try {
      if (!choiceCleared) {
        const url = new URL(window.location.href);
        url.searchParams.set('analytics', 'off');
        window.location.replace(url.href);
      } else {
        window.location.reload();
      }
    } catch {
      state = 'reloadFailed';
      render();
    }
  }

  function init() {
    if (initialized) return;
    allowButton = document.getElementById('consent');
    withdrawButton = document.getElementById('withdraw');
    privacyExtra = document.getElementById('privacyExtra');
    // Fail closed if visitors would have no visible way to manage their choice.
    if (!allowButton || !withdrawButton || !privacyExtra) return;
    initialized = true;
    consent = readChoice();
    allowButton.addEventListener('click', () => {
      if (reloading || privacyPreference() || forcedOff() || !token()) return;
      try {
        window.localStorage.setItem(CONSENT_KEY, 'yes');
        if (!readChoice()) throw new Error('Choice not saved');
      } catch {
        consent = false;
        state = 'storage';
        render();
        return;
      }
      consent = true;
      loadBeacon();
    });
    withdrawButton.addEventListener('click', stopAndReload);
    window.addEventListener('storage', event => {
      if (event.key !== CONSENT_KEY && event.key !== null) return;
      const next = readChoice();
      if (!next && script) { stopAndReload(); return; }
      consent = next;
      if (next) loadBeacon();
      else { state = 'off'; render(); }
    });
    const checkPrivacy = () => {
      if (privacyPreference() && script && !reloading) stopAndReload();
      else render();
    };
    window.addEventListener('pageshow', checkPrivacy);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkPrivacy();
    });
    render();
    if (consent) loadBeacon();
  }

  window.SiteAnalytics = {
    setLanguage(lang) {
      language = String(lang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
      render();
    }
  };
  window.SiteAnalytics.setLanguage(document.documentElement.lang);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
