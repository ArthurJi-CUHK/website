// The official globe resolves protocol-relative recording URLs against
// location.href. Give it a real HTTPS document, not an about:srcdoc URL.
(() => {
  'use strict';
  const nonce = location.hash.slice(1);
  const host = document.getElementById('providerHost');
  if (window.parent === window || !host || !/^[0-9a-f]{1,8}(?:-[0-9a-f]{1,8}){3}$/.test(nonce)) return;
  let parentUrl, scriptUrl, reportUrl;
  try {
    parentUrl = new URL(document.referrer);
    scriptUrl = new URL(window.SITE_CONFIG.visitorMapScript);
    reportUrl = new URL(window.SITE_CONFIG.visitorMapLink);
    if (parentUrl.origin !== location.origin || parentUrl.protocol !== 'https:' ||
        scriptUrl.origin !== 'https://mapmyvisitors.com' || scriptUrl.pathname !== '/globe.js' ||
        scriptUrl.username || scriptUrl.password || scriptUrl.hash ||
        scriptUrl.searchParams.getAll('d').length !== 1 || !/^[A-Za-z0-9_-]{16,128}$/.test(scriptUrl.searchParams.get('d')) ||
        reportUrl.origin !== scriptUrl.origin || !/^\/web\/[A-Za-z0-9_-]+\/?$/.test(reportUrl.pathname)) return;
  } catch { return; }

  const send = (kind, details = {}) => parent.postMessage({type:'arthur-visitor-map',nonce,kind,...details}, parentUrl.origin);
  let scheduled = false, lastHeight = 0, ready = false;
  const inspect = () => {
    scheduled = false;
    const height = Math.ceil(Math.max(host.scrollHeight, host.getBoundingClientRect().height) + 16);
    if (height > 100 && height !== lastHeight) { lastHeight = height; send('height',{height}); }
    const globe = host.querySelector('.mmvst_inner');
    const link = host.querySelector('#mmvst_a');
    // The visual globe appears before the provider's JSONP callback. Only
    // recognize readiness when the widget links to this site's real report.
    if (!ready && globe && link && link.origin === reportUrl.origin && link.pathname === reportUrl.pathname &&
        getComputedStyle(globe).display !== 'none') { ready = true; send('ready'); }
  };
  const schedule = () => { if (!scheduled) { scheduled = true; setTimeout(inspect,100); } };
  new MutationObserver(changes => {
    if (changes.some(c => c.type !== 'attributes' || c.attributeName !== 'style' || c.target.matches('.mmvst_inner'))) schedule();
  }).observe(host,{subtree:true,childList:true,attributes:true,attributeFilter:['style','href']});
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(host);
  window.addEventListener('load',schedule,{once:true});
  host.addEventListener('click',event => {
    if (event.target.closest?.('a')) { event.preventDefault(); send('link',{url:reportUrl.href}); }
  });
  const script = document.createElement('script');
  script.id = 'mmvst_globe'; script.src = scriptUrl.href; script.async = false;
  script.addEventListener('load',()=>send('script'),{once:true});
  script.addEventListener('error',()=>send('error'),{once:true});
  host.append(script);
})();
