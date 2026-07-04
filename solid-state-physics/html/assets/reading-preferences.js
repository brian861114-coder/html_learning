(() => {
  const key = 'learning-portal-reading-preferences';
  const defaults = { theme: 'light', font: 'medium', width: 'medium' };
  let state;
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { state = { ...defaults }; }
  const root = document.documentElement;
  const content = document.querySelector('.main, main, article, .content, .container');
  if (content) content.classList.add('reading-content');

  // 涵蓋所有文字元素：基礎標籤 + 章節專用 class + 互動模型 class
  const textSelector = [
    'p','li','td','th','dt','dd','a','label','input','select','textarea',
    'h1','h2','h3','h4','h5','h6',
    'summary','button','figcaption','caption','legend','option',
    '.callout','.callout-warn','.exbox','.eq','.note',
    '.figure figcaption','.header','.header .cl','.header .meta',
    '.sidebar','.sh','.sn a','.sn .ns','.sn .nsub a','.st button',
    '.pnm','.pnm *','.fcm-*','.mcm-*','.div-iv-*','.pbg-*',
    '.derivation-lab','.derivation-lab *',
    '.chapter-breadcrumb','.chapter-pager',
  ].join(',');

  const style = document.createElement('style');
  style.textContent = `:root[data-reading-width="narrow"]{--reader-width:680px}:root[data-reading-width="medium"]{--reader-width:900px}:root[data-reading-width="wide"]{--reader-width:1180px}.reading-content{max-width:var(--reader-width,900px)!important}.theme-toggle,.sidebar-toggle{display:none!important}.portal-home-link{position:fixed;top:16px;right:16px;z-index:1000;display:inline-flex;align-items:center;min-height:36px;padding:7px 11px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#1d4ed8;font:600 13px/1.2 -apple-system,BlinkMacSystemFont,"Noto Sans TC","Microsoft JhengHei",sans-serif;text-decoration:none;box-shadow:0 2px 10px rgba(15,23,42,.08)}.portal-home-link:hover{background:#eff6ff}.portal-home-link:focus-visible,.reader-toggle:focus-visible,.reader-options button:focus-visible{outline:3px solid rgba(37,99,235,.35);outline-offset:2px}.reader-toggle{position:fixed;right:16px;bottom:16px;z-index:2000;width:54px;height:54px;border:0;border-radius:50%;background:#1677ff;color:#fff;box-shadow:0 8px 22px rgba(22,119,255,.3);cursor:pointer}.reader-panel{position:fixed;right:16px;bottom:82px;z-index:2000;width:260px;padding:18px;border:1px solid #d7dce5;border-radius:16px;background:#fff;color:#1d2635;box-shadow:0 14px 36px rgba(15,23,42,.16);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Noto Sans TC","Microsoft JhengHei",sans-serif}.reader-panel[hidden]{display:none}.reader-panel h2{font-size:15px;margin:0 0 4px}.reader-current{margin:0 0 12px;color:#64748b;font-size:12px}.reader-group{margin:13px 0}.reader-group strong{display:block;margin-bottom:6px}.reader-options{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.reader-options button{padding:7px 4px;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;color:#334155;font:inherit;cursor:pointer}.reader-options button[aria-pressed="true"]{background:#1677ff;border-color:#1677ff;color:#fff}.reader-reset{width:100%;margin-top:8px;padding:7px;border:0;background:transparent;color:#64748b;cursor:pointer;font-size:12px}.reader-reset:hover{color:#1d2635}`;
  document.head.append(style);

  const panel = document.createElement('section');
  panel.className = 'reader-panel'; panel.hidden = true; panel.setAttribute('aria-label', '閱讀設定'); panel.tabIndex = -1;
  panel.innerHTML = `<h2>閱讀設定</h2><p class="reader-current"></p><div class="reader-group"><strong>主題</strong><div class="reader-options"><button data-pref="theme" data-pref-value="light">淺色</button><button data-pref="theme" data-pref-value="dark">深色</button></div></div><div class="reader-group"><strong>字體大小</strong><div class="reader-options"><button data-pref="font" data-pref-value="small">小</button><button data-pref="font" data-pref-value="medium">中</button><button data-pref="font" data-pref-value="large">大</button></div></div><div class="reader-group"><strong>閱讀寬度</strong><div class="reader-options"><button data-pref="width" data-pref-value="narrow">窄</button><button data-pref="width" data-pref-value="medium">中</button><button data-pref="width" data-pref-value="wide">寬</button></div></div><button class="reader-complete" hidden></button><button class="reader-reset">重設閱讀設定</button>`;

  const toggle = document.createElement('button'); toggle.className = 'reader-toggle'; toggle.type = 'button';
  toggle.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.8v-.08A1.7 1.7 0 0 0 10.96 18.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2-2 .06-.06A1.7 1.7 0 0 0 7.42 15 1.7 1.7 0 0 0 5.86 13.96H5.8v-2.8h.08A1.7 1.7 0 0 0 7.42 10.12a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2-2 .06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12 5.02V5h2.8v.08a1.7 1.7 0 0 0 1.04 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.54 1.04H21v2.8h-.08A1.7 1.7 0 0 0 19.4 15Z"></path></svg>';
  toggle.setAttribute('aria-label', '開啟閱讀設定'); toggle.setAttribute('aria-expanded', 'false');

  const labels = { theme: { light: '淺色', dark: '深色' }, font: { small: '小字', medium: '中字', large: '大字' }, width: { narrow: '窄版', medium: '中寬', wide: '寬版' } };
  const path = decodeURIComponent(location.pathname);
  const course = path.includes('/solid-state-physics/') ? 'semiconductor' : path.includes('/thermodynamics/') ? 'thermodynamics' : null;
  const completeButton = panel.querySelector('.reader-complete');
  const completedPages = () => JSON.parse(localStorage.getItem('learning-portal-completed-pages') || '[]');
  const updateCompleteButton = () => { if (!course) return; const done = completedPages().includes(location.pathname); completeButton.hidden = false; completeButton.textContent = done ? '標示為未完成' : '標示此頁完成'; };

  document.querySelectorAll('.portal-home-link').forEach((link) => {
    if (!course) return;
    const formulaDetail = path.includes('/formula_reviews/') && !path.endsWith('/formula_reviews/index.html');
    link.href = formulaDetail ? 'index.html' : `${link.href.split('?')[0]}?course=${course}`;
    link.textContent = formulaDetail ? '返回公式摘要' : `返回學習中心 · ${course === 'semiconductor' ? '半導體物理' : '材料熱力學'}`;
  });

  const factorMap = { small: 0.88, medium: 1, large: 1.18 };

  const scaleElement = (el) => {
    const factor = factorMap[state.font] || 1;
    if (!el.dataset.readerBaseSize) {
      el.dataset.readerBaseSize = String(parseFloat(getComputedStyle(el).fontSize));
    }
    el.style.fontSize = `${parseFloat(el.dataset.readerBaseSize) * factor}px`;
  };

  const applyFontScale = () => {
    const factor = factorMap[state.font] || 1;
    // Scale all matching elements in the main content AND sidebar
    const containers = [document.querySelector('.main'), document.querySelector('.sidebar')].filter(Boolean);
    containers.forEach((container) => {
      container.querySelectorAll(textSelector).forEach(scaleElement);
    });
    // Also scale the sidebar directly
    document.querySelectorAll('.sidebar ' + textSelector).forEach(scaleElement);
  };

  // MutationObserver: handle dynamically added elements (e.g., interactive models)
  let observer;
  const startObserver = () => {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      let needsScale = false;
      for (const m of mutations) {
        if (m.addedNodes.length) needsScale = true;
      }
      if (needsScale && state.font !== 'medium') {
        // Delay to let elements render
        requestAnimationFrame(applyFontScale);
      }
    });
    const target = document.querySelector('.main') || document.body;
    observer.observe(target, { childList: true, subtree: true });
  };

  const apply = () => {
    root.dataset.theme = state.theme;
    root.dataset.readingWidth = state.width;
    applyFontScale();
    localStorage.setItem(key, JSON.stringify(state));
    panel.querySelector('.reader-current').textContent = `${labels.theme[state.theme]} · ${labels.font[state.font]} · ${labels.width[state.width]}`;
    panel.querySelectorAll('[data-pref]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.prefValue === state[b.dataset.pref])));
    updateCompleteButton();
  };

  const close = () => { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); };
  toggle.onclick = () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) panel.focus(); };
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pref]');
    if (b) { state[b.dataset.pref] = b.dataset.prefValue; apply(); }
    if (e.target.closest('.reader-reset')) { state = { ...defaults }; apply(); }
    if (e.target.closest('.reader-complete')) { const pages = completedPages(); const i = pages.indexOf(location.pathname); if (i >= 0) pages.splice(i, 1); else pages.push(location.pathname); localStorage.setItem('learning-portal-completed-pages', JSON.stringify(pages)); updateCompleteButton(); }
  });
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !panel.contains(e.target) && !toggle.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });

  document.body.append(panel, toggle);
  startObserver();
  apply();
})();
