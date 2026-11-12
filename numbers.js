/* Count only semantic quantities, not dates, codes or citation page numbers. */
(() => {
  'use strict';
  const records = new WeakMap();
  const selector = '[data-count]';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const format = new Intl.NumberFormat('en');
  const show = (record, n) => { record.current = n; record.visual.textContent = format.format(n); };
  function animate(el, record) {
    cancelAnimationFrame(record.raf);
    if (reduced.matches || !el.isConnected || document.hidden) { show(record, record.target); return; }
    const from = record.current, to = record.target, start = performance.now();
    const duration = Math.min(1300, 450 + Math.log10(Math.abs(to - from) + 1) * 230);
    const tick = now => {
      if (!el.isConnected) return;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      show(record, Math.round(from + (to - from) * (1 - (1 - t) ** 3)));
      if (t < 1 && !reduced.matches && !document.hidden) record.raf = requestAnimationFrame(tick);
      else show(record, record.target);
    };
    if (from !== to) record.raf = requestAnimationFrame(tick);
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const el = entry.target, record = records.get(el);
      if (!record) continue;
      record.visible = entry.isIntersecting;
      if (record.visible && !record.started) { record.started = true; animate(el, record); }
      else if (record.visible && record.current !== record.target) animate(el, record);
    }
  }, {threshold: .2}) : null;

  function set(el, target) {
    if (!(el instanceof HTMLElement) || !Number.isSafeInteger(target) || target < 0) return false;
    let record = records.get(el);
    if (record?.target === target) return true;
    if (!record) {
      const visual = document.createElement('span'), spoken = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true'); visual.className = 'count-visual';
      spoken.className = 'count-spoken';
      record = {visual, spoken, current:0, target, visible:!observer, started:!observer, raf:0};
      records.set(el, record); el.replaceChildren(visual, spoken); el.classList.add('count-up');
      show(record, reduced.matches || !observer ? target : 0);
      observer?.observe(el);
    }
    record.target = target;
    el.dataset.count = String(target);
    el.dataset.countWidth = format.format(target);
    record.spoken.textContent = format.format(target);
    if (reduced.matches || !observer) show(record, target);
    else if (record.visible) animate(el, record);
    return true;
  }
  function register(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(selector)) set(node, Number(node.dataset.count));
    node.querySelectorAll(selector).forEach(el => set(el, Number(el.dataset.count)));
  }
  const mutations = new MutationObserver(changes => {
    for (const change of changes) {
      for (const node of change.addedNodes) register(node);
      for (const node of change.removedNodes) {
        if (node.nodeType !== 1 || node.isConnected) continue;
        if (records.has(node)) observer?.unobserve(node);
        node.querySelectorAll(selector).forEach(el => observer?.unobserve(el));
      }
    }
  });
  window.SiteNumbers = Object.freeze({set});
  register(document.documentElement);
  mutations.observe(document.body, {childList:true, subtree:true});
})();
