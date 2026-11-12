/* Count only semantic quantities, not dates, codes or citation page numbers. */
(() => {
  'use strict';
  const records = new WeakMap();
  const selector = '[data-count]';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const format = new Intl.NumberFormat('en');
  const entryThreshold = .2;
  const show = (record, n) => { record.current = n; record.visual.textContent = format.format(n); };
  function stop(record) {
    cancelAnimationFrame(record.raf);
    record.raf = 0;
  }
  function settle(record) {
    stop(record);
    show(record, record.target);
  }
  function animate(el, record, from = record.current) {
    const to = record.target;
    if (from === to || reduced.matches || !el.isConnected || document.hidden) { settle(record); return; }
    stop(record);
    show(record, from);
    const start = performance.now();
    const duration = Math.min(1300, 450 + Math.log10(Math.abs(to - from) + 1) * 230);
    const tick = now => {
      record.raf = 0;
      if (!el.isConnected) return;
      if (reduced.matches || document.hidden || !record.visible) { settle(record); return; }
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      show(record, Math.round(from + (to - from) * (1 - (1 - t) ** 3)));
      if (t < 1) record.raf = requestAnimationFrame(tick);
    };
    record.raf = requestAnimationFrame(tick);
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const el = entry.target, record = records.get(el);
      if (!record || !el.isConnected) continue;
      if (!entry.isIntersecting) {
        record.visible = false;
        settle(record);
      } else if (!record.visible && entry.intersectionRatio >= entryThreshold) {
        // Require enough visibility to play, but a full exit to rearm. Small
        // movements at the entry threshold must not repeatedly reset the value.
        record.visible = true;
        animate(el, record, 0);
      }
    }
  }, {threshold: [0, entryThreshold]}) : null;

  function set(el, target) {
    if (!(el instanceof HTMLElement) || !Number.isSafeInteger(target) || target < 0) return false;
    let record = records.get(el);
    if (record?.target === target) {
      if (el.isConnected) observer?.observe(el);
      return true;
    }
    if (!record) {
      const visual = document.createElement('span'), spoken = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true'); visual.className = 'count-visual';
      spoken.className = 'count-spoken';
      record = {visual, spoken, current:target, target, visible:!observer, raf:0};
      records.set(el, record); el.replaceChildren(visual, spoken); el.classList.add('count-up');
    }
    record.target = target;
    el.dataset.count = String(target);
    el.dataset.countWidth = format.format(target);
    record.spoken.textContent = format.format(target);
    if (reduced.matches || !observer || !record.visible) settle(record);
    else animate(el, record);
    if (el.isConnected) observer?.observe(el);
    return true;
  }
  function register(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(selector)) set(node, Number(node.dataset.count));
    node.querySelectorAll(selector).forEach(el => set(el, Number(el.dataset.count)));
  }
  function unregister(el) {
    const record = records.get(el);
    if (!record) return;
    observer?.unobserve(el);
    record.visible = !observer;
    settle(record);
  }
  const mutations = new MutationObserver(changes => {
    for (const change of changes) {
      for (const node of change.addedNodes) register(node);
      for (const node of change.removedNodes) {
        if (node.nodeType !== 1 || node.isConnected) continue;
        unregister(node);
        node.querySelectorAll(selector).forEach(unregister);
      }
    }
  });
  window.SiteNumbers = Object.freeze({set});
  register(document.documentElement);
  mutations.observe(document.body, {childList:true, subtree:true});
})();
