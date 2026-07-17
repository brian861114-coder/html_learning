(() => {
  "use strict";

  const html = document.documentElement;
  const main = document.querySelector("main");
  const sidebar = document.querySelector(".sidebar");
  if (!main) return;

  main.id ||= "main-content";
  main.tabIndex = -1;
  html.dataset.sharedNavigation = "true";

  if (!document.querySelector(".skip-link")) {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = `#${main.id}`;
    skip.textContent = "跳到主要內容";
    document.body.prepend(skip);
  }

  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  document.body.prepend(progress);
  const progressBar = progress.firstElementChild;
  let progressTicking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    progressTicking = false;
  };
  addEventListener("scroll", () => {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  if (sidebar) {
    sidebar.id ||= "chapter-sidebar";
    const menu = document.createElement("button");
    menu.type = "button";
    menu.className = "mobile-menu-button";
    menu.setAttribute("aria-controls", sidebar.id);
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "開啟本章目錄");
    menu.textContent = "☰";
    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "sidebar-overlay";
    overlay.setAttribute("aria-label", "關閉本章目錄");
    document.body.prepend(overlay);
    document.body.prepend(menu);

    const setMenu = open => {
      sidebar.classList.toggle("open", open);
      overlay.classList.toggle("open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "關閉本章目錄" : "開啟本章目錄");
      menu.textContent = open ? "×" : "☰";
    };
    menu.addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
    overlay.addEventListener("click", () => setMenu(false));
    sidebar.addEventListener("click", event => {
      if (event.target.closest("a") && matchMedia("(max-width: 768px)").matches) setMenu(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  const buildChapterPager = () => {
    const makeItem = (href, label, direction, fallback) => {
      const item = href ? document.createElement("a") : document.createElement("span");
      if (href) item.href = href;
      else item.setAttribute("aria-disabled", "true");
      const directionLabel = document.createElement("span");
      directionLabel.textContent = direction;
      const title = document.createElement("strong");
      title.textContent = label || fallback;
      item.append(directionLabel, title);
      return item;
    };
    if (!main.dataset.chapterTitle) return;
    main.querySelectorAll(":scope > .chapter-pager").forEach(item => item.remove());
    const pager = document.createElement("nav");
    pager.className = "chapter-pager";
    pager.setAttribute("aria-label", "章節導覽");
    pager.append(
      makeItem(main.dataset.prevHref, main.dataset.prevLabel, "← 上一章", "已是第一章"),
      makeItem(main.dataset.nextHref, main.dataset.nextLabel, "下一章 →", "已是最後一章")
    );
    main.append(pager);
  };
  buildChapterPager();

  document.querySelectorAll("table").forEach(table => {
    if (table.closest(".table-scroll")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "可橫向捲動的表格");
    table.before(wrapper);
    wrapper.append(table);
  });
  document.querySelectorAll(".eq").forEach(equation => {
    equation.tabIndex = 0;
    equation.setAttribute("role", "region");
    equation.setAttribute("aria-label", "可橫向捲動的方程式");
  });

  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"], .sidebar .nsub a[href^="#"]')];
  const sections = tocLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: "-15% 0px -72%", threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  const storageKey = "learning-portal-reading-preferences";
  const defaults = { theme: "light", font: "medium", width: "wide" };
  const labels = {
    theme: { light: "淺色", dark: "深色" },
    font: { small: "小字", medium: "中字", large: "大字" },
    width: { narrow: "窄版", medium: "中版", wide: "寬版" },
  };
  let preferences = { ...defaults };
  try { preferences = { ...preferences, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch (_) {}

  let panel = document.querySelector(".reader-panel");
  let readerToggle = document.querySelector(".reader-toggle");
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "reader-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "閱讀設定");
    panel.innerHTML = `
      <h2>閱讀設定</h2><p class="reader-current"></p>
      ${preferenceGroup("主題", "theme", [["light","淺色"],["dark","深色"]])}
      ${preferenceGroup("字體", "font", [["small","小"],["medium","中"],["large","大"]])}
      ${preferenceGroup("閱讀寬度", "width", [["narrow","窄"],["medium","中"],["wide","寬"]])}
      <button class="reader-display-settings" type="button">顯示內容設定</button>
      <button class="reader-reset" type="button">重設閱讀設定</button>`;
    document.body.append(panel);
  }
  if (!readerToggle) {
    readerToggle = document.createElement("button");
    readerToggle.type = "button";
    readerToggle.className = "reader-toggle";
    readerToggle.setAttribute("aria-label", "開啟閱讀設定");
    readerToggle.setAttribute("aria-expanded", "false");
    readerToggle.textContent = "⚙";
    document.body.append(readerToggle);
  }

  function preferenceGroup(title, preference, options) {
    return `<div class="reader-group"><strong>${title}</strong><div class="reader-options">${options.map(([value,label]) => `<button type="button" data-pref="${preference}" data-value="${value}">${label}</button>`).join("")}</div></div>`;
  }
  function applyPreferences() {
    html.dataset.theme = preferences.theme;
    html.dataset.font = preferences.font;
    html.dataset.width = preferences.width;
    panel.querySelectorAll("[data-pref]").forEach(button => button.setAttribute("aria-pressed", String(preferences[button.dataset.pref] === button.dataset.value)));
    const current = panel.querySelector(".reader-current");
    if (current) current.textContent = `${labels.theme[preferences.theme]} · ${labels.font[preferences.font]} · ${labels.width[preferences.width]}`;
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) {}
  }
  applyPreferences();
  document.addEventListener("click", event => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "expand-details") document.querySelectorAll("main details").forEach(item => { item.open = true; });
    if (action === "collapse-details") document.querySelectorAll("main details").forEach(item => { item.open = false; });
    if (action === "toggle-theme") {
      preferences.theme = preferences.theme === "dark" ? "light" : "dark";
      applyPreferences();
    }
  });
  panel.addEventListener("click", event => {
    const button = event.target.closest("[data-pref]");
    if (button) {
      preferences[button.dataset.pref] = button.dataset.value;
      applyPreferences();
    }
    if (event.target.closest(".reader-reset")) {
      preferences = { ...defaults };
      applyPreferences();
    }
  });
  readerToggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    readerToggle.setAttribute("aria-expanded", String(!panel.hidden));
  });

  const displayStorageKey = "learning-portal-display-preferences-v1";
  const displayGroups = {
    orientation: { label: "章前引導", description: "章前預覽、學習目標、先備知識與推理地圖" },
    keypoints: { label: "重點與摘要", description: "本節重點、核心概念、章末摘要與常見錯誤" },
    formulas: { label: "公式與推導", description: "核心公式、方程式、完整推導與證明", groups: ["formula", "derivation"] },
    examples: { label: "例題與案例", description: "示範計算、例題與案例研究", groups: ["example"] },
    visuals: { label: "圖片與圖解", description: "課本圖、示意圖、SVG 與心智圖", groups: ["visual"] },
    tables: { label: "表格與參考資料", description: "比較表、常數表與資料表", groups: ["table"] },
    insights: { label: "補充提示", description: "物理直覺、深入說明與一般補充", groups: ["insight", "supplemental"] },
    practice: { label: "練習與自我檢測", description: "練習題、概念診斷與答案", groups: ["practice"] },
    models: { label: "互動模型", description: "可操作的視覺化模型", groups: ["model"] },
    resources: { label: "延伸閱讀", description: "延伸資源與跨章參考", groups: ["resource"] },
    source: { label: "內容來源", description: "原書、作者、頁碼與詳細來源", groups: ["source"] },
  };
  Object.entries(displayGroups).forEach(([key, item]) => { item.groups ||= [key]; });
  const displayDefaults = {
    orientation: true,
    keypoints: true,
    formulas: true,
    examples: true,
    visuals: true,
    tables: true,
    insights: true,
    practice: true,
    models: true,
    resources: false,
    source: false,
  };
  const displayPresets = {
    standard: displayDefaults,
    focus: { ...displayDefaults, insights: false, examples: false, tables: false, practice: false, models: false, resources: false, source: false },
    complete: Object.fromEntries(Object.keys(displayDefaults).map(key => [key, true])),
  };
  let displayPreferences = { ...displayDefaults };
  try {
    const stored = JSON.parse(localStorage.getItem(displayStorageKey) || "{}");
    Object.keys(displayDefaults).forEach(key => {
      if (typeof stored[key] === "boolean") displayPreferences[key] = stored[key];
    });
  } catch (_) {}

  const markDisplayGroup = (element, group) => {
    if (!element || element.dataset.displayGroup || element.closest("[data-display-group]")) return false;
    element.dataset.displayGroup = group;
    return true;
  };
  const summaryLooksLikeQuestion = element => /^(?:題\s*\d+|\d+[.、]|自我檢測|概念診斷)/.test(element.querySelector("summary")?.textContent?.trim() || "");
  const classifyDisplayContent = () => {
    document.querySelectorAll(".chapter-header .tag").forEach(tag => {
      const text = tag.textContent.trim();
      if (!text.includes("·") || !/(?:OpenStax|Volume|Chapter|\bCh\s*\d)/i.test(text)) return;
      const [chapterLabel, ...sourceParts] = text.split("·");
      tag.textContent = chapterLabel.trim();
      const source = document.createElement("span");
      source.className = "chapter-source-inline";
      source.textContent = sourceParts.join("·").trim();
      source.dataset.displayGroup = "source";
      tag.after(source);
    });
    document.querySelectorAll("[data-model-host], .model-host").forEach(element => markDisplayGroup(element, "model"));
    document.querySelectorAll("main > section#preview, main > section.chapter-preview, main > section.prerequisite, main > section[id^='prereq']").forEach(element => markDisplayGroup(element, "orientation"));
    document.querySelectorAll("main > section#summary, main > section#common-mistakes, main > section.chapter-summary, main > section.common-mistakes").forEach(element => markDisplayGroup(element, "keypoints"));
    document.querySelectorAll("main > section#extras, main > section.further-reading").forEach(element => markDisplayGroup(element, "resource"));
    document.querySelectorAll("#self-check, main > section.self-check, .self-check-item, .problem-card, details.problem-statement").forEach(element => markDisplayGroup(element, "practice"));
    document.querySelectorAll("details.derive").forEach(element => {
      markDisplayGroup(element, summaryLooksLikeQuestion(element) ? "practice" : "derivation");
    });
    document.querySelectorAll("details.example, .example-panel").forEach(element => markDisplayGroup(element, "example"));
    document.querySelectorAll(".chapter-preview, .core-question, .learning-objectives, .prerequisite, .reasoning-map, .reasoning-path").forEach(element => markDisplayGroup(element, "orientation"));
    document.querySelectorAll(".section-keypoints, .key-concept-list, .chapter-summary, .common-mistakes").forEach(element => markDisplayGroup(element, "keypoints"));
    document.querySelectorAll(".further-reading, .resource-list, .cross-reference").forEach(element => markDisplayGroup(element, "resource"));
    document.querySelectorAll(".deep-dive").forEach(element => markDisplayGroup(element, "supplemental"));
    document.querySelectorAll(".callout-warn").forEach(element => markDisplayGroup(element, "warning"));
    document.querySelectorAll(".callout").forEach(element => markDisplayGroup(element, "insight"));
    document.querySelectorAll(".formula-card").forEach(element => markDisplayGroup(element, "formula"));
    document.querySelectorAll(".eq").forEach(element => markDisplayGroup(element, "formula"));
    document.querySelectorAll("figure, main svg, .figure-grid, .content-diagram, .diagram, .mindmap, .mindmap-wrap").forEach(element => markDisplayGroup(element, "visual"));
    document.querySelectorAll("table, .structure-table, .data-table").forEach(element => markDisplayGroup(element.closest(".table-scroll") || element, "table"));
    document.querySelectorAll(".chapter-meta").forEach(element => markDisplayGroup(element, "source"));
    document.querySelectorAll(".chapter-header > p:not(.chapter-subtitle), .chapter-header > div:not(.tag):not(.chapter-meta)").forEach(element => {
      if (/(?:OpenStax|原文(?:頁碼|作者)|\bpp?\.\s*\d|Volume\s+\d|Chapter\s+\d)/i.test(element.textContent)) markDisplayGroup(element, "source");
    });
    document.querySelectorAll("main details").forEach(element => markDisplayGroup(element, "supplemental"));
    const classificationTargets = main.querySelectorAll("details, figure, table, svg, [data-model-host], .model-host, .callout, .callout-warn, .formula-card, .eq, .chapter-meta, section#preview, section#summary, section#common-mistakes, section#self-check, section#extras");
    const unclassified = [...classificationTargets].filter(element => !element.closest("[data-display-group]"));
    main.dataset.displayClassification = unclassified.length ? "incomplete" : "complete";
    main.dataset.displayUnclassified = String(unclassified.length);
    if (unclassified.length) console.warn("Unclassified display content", unclassified);
  };
  classifyDisplayContent();

  let displayDialog = document.querySelector(".display-settings-dialog");
  if (!displayDialog) {
    displayDialog = document.createElement("dialog");
    displayDialog.className = "display-settings-dialog";
    displayDialog.setAttribute("aria-labelledby", "display-settings-title");
    displayDialog.innerHTML = `
      <form method="dialog" class="display-settings-form">
        <div class="display-settings-header">
          <div><h2 id="display-settings-title">顯示內容設定</h2><p>選擇閱讀時要保留的內容。主要內容與重要警告會固定顯示。</p></div>
          <button class="display-settings-close" value="close" aria-label="關閉顯示內容設定">×</button>
        </div>
        <fieldset class="display-presets"><legend>快速模式</legend>
          <button type="button" data-display-preset="standard">標準</button>
          <button type="button" data-display-preset="focus">專注</button>
          <button type="button" data-display-preset="complete">完整</button>
        </fieldset>
        <fieldset class="display-options"><legend>自訂顯示</legend>
          <label class="display-option display-option--locked"><input type="checkbox" checked disabled><span><strong>主要內容</strong><small>章節標題、正文與基本結構</small></span></label>
          ${Object.entries(displayGroups).map(([key, item]) => `<label class="display-option"><input type="checkbox" data-display-option="${key}"><span><strong>${item.label}</strong><small>${item.description}</small></span></label>`).join("")}
          <label class="display-option display-option--locked"><input type="checkbox" checked disabled><span><strong>重要警告</strong><small>限制條件與重要概念提醒固定顯示</small></span></label>
        </fieldset>
        <div class="display-settings-actions"><button type="button" data-display-reset>恢復預設</button><button class="display-settings-done" value="close">完成</button></div>
      </form>`;
    document.body.append(displayDialog);
  }

  const groupVisibility = () => {
    const visibility = { warning: true };
    Object.entries(displayGroups).forEach(([key, item]) => item.groups.forEach(group => { visibility[group] = displayPreferences[key]; }));
    return visibility;
  };
  const syncDisplayControls = () => {
    displayDialog.querySelectorAll("[data-display-option]").forEach(input => {
      input.checked = displayPreferences[input.dataset.displayOption];
    });
    displayDialog.querySelectorAll("[data-display-preset]").forEach(button => {
      const preset = displayPresets[button.dataset.displayPreset];
      const active = Object.keys(displayDefaults).every(key => displayPreferences[key] === preset[key]);
      button.setAttribute("aria-pressed", String(active));
    });
  };
  const openDisplayDialog = () => {
    panel.hidden = true;
    readerToggle.setAttribute("aria-expanded", "false");
    syncDisplayControls();
    if (!displayDialog.open) displayDialog.showModal();
  };
  const displayRootForTarget = target => target?.closest?.("[data-display-group]") || null;
  const syncDisplayNavigation = () => {
    document.querySelectorAll('.sidebar a[href^="#"], .learning-route a[href^="#"]').forEach(anchor => {
      let target = null;
      try { target = document.getElementById(decodeURIComponent(anchor.hash.slice(1))); } catch (_) {}
      const root = displayRootForTarget(target);
      const item = anchor.classList.contains("learning-route-card") ? anchor : anchor.closest("li, .nsub") || anchor;
      item.hidden = Boolean(root?.hidden);
    });
    document.querySelectorAll(".sidebar .toc > .ns").forEach(label => {
      let sibling = label.nextElementSibling;
      let hasVisibleItem = false;
      while (sibling && !sibling.classList.contains("ns")) {
        if (!sibling.hidden) hasVisibleItem = true;
        sibling = sibling.nextElementSibling;
      }
      label.hidden = !hasVisibleItem;
    });
  };
  const clearHashReveal = () => {
    document.querySelectorAll("[data-display-hash-reveal]").forEach(element => delete element.dataset.displayHashReveal);
    document.querySelectorAll(".display-reveal-notice").forEach(element => element.remove());
  };
  const revealHashTarget = () => {
    if (!location.hash || location.hash.length < 2) return;
    let target = null;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (_) {}
    const root = displayRootForTarget(target);
    if (!target || !root?.hidden) return;
    root.hidden = false;
    root.dataset.displayHashReveal = "true";
    const notice = document.createElement("div");
    notice.className = "display-reveal-notice";
    notice.setAttribute("role", "status");
    const message = document.createElement("p");
    message.textContent = "此區塊目前依顯示設定隱藏，已為這個連結暫時顯示。";
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = "調整顯示設定";
    action.addEventListener("click", openDisplayDialog);
    notice.append(message, action);
    const heading = root.querySelector(":scope > h2, :scope > h3");
    if (heading) heading.after(notice);
    else root.prepend(notice);
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  };
  const applyDisplayPreferences = ({ includeModels = document.readyState === "complete" } = {}) => {
    clearHashReveal();
    const visibility = groupVisibility();
    document.querySelectorAll("[data-display-group]").forEach(element => {
      const group = element.dataset.displayGroup;
      if (group === "model" && !includeModels) return;
      element.hidden = visibility[group] === false;
    });
    try { localStorage.setItem(displayStorageKey, JSON.stringify(displayPreferences)); } catch (_) {}
    syncDisplayControls();
    revealHashTarget();
    syncDisplayNavigation();
  };
  applyDisplayPreferences({ includeModels: false });
  addEventListener("load", () => applyDisplayPreferences({ includeModels: true }), { once: true });
  addEventListener("hashchange", () => applyDisplayPreferences({ includeModels: true }));

  panel.querySelector(".reader-display-settings")?.addEventListener("click", openDisplayDialog);
  displayDialog.addEventListener("click", event => {
    const presetButton = event.target.closest("[data-display-preset]");
    if (presetButton) {
      displayPreferences = { ...displayPresets[presetButton.dataset.displayPreset] };
      applyDisplayPreferences();
      return;
    }
    if (event.target.closest("[data-display-reset]")) {
      displayPreferences = { ...displayDefaults };
      applyDisplayPreferences();
    }
  });
  displayDialog.addEventListener("change", event => {
    const input = event.target.closest("[data-display-option]");
    if (!input) return;
    displayPreferences[input.dataset.displayOption] = input.checked;
    applyDisplayPreferences();
  });

  const learningStorageKey = "learning-portal-progress-v1";
  const subjectMatch = location.pathname.match(/\/subjects\/([^/]+)/);
  const pagePath = subjectMatch
    ? `subjects/${subjectMatch[1]}${location.pathname.split(`/subjects/${subjectMatch[1]}`)[1]}`
    : location.pathname.replace(/^\//, "");
  let learningProgress = { version: 1, recent: null, pages: {} };
  try {
    const stored = JSON.parse(localStorage.getItem(learningStorageKey) || "{}");
    learningProgress = {
      version: 1,
      recent: stored.recent || null,
      pages: stored.pages && typeof stored.pages === "object" ? stored.pages : {},
    };
  } catch (_) {}

  const saveLearningProgress = () => {
    try { localStorage.setItem(learningStorageKey, JSON.stringify(learningProgress)); } catch (_) {}
  };
  const chapterTitle = main.dataset.chapterTitle;
  const pageState = learningProgress.pages[pagePath] || {
    title: chapterTitle || document.title,
    subject: subjectMatch?.[1] || "",
    lastSection: "",
    lastSectionTitle: "",
    selfChecks: {},
  };
  pageState.selfChecks ||= {};
  learningProgress.pages[pagePath] = pageState;

  const updateRecent = (sectionId = "", sectionTitle = "") => {
    if (!chapterTitle || !subjectMatch) return;
    pageState.title = chapterTitle;
    pageState.subject = subjectMatch[1];
    pageState.lastSection = sectionId;
    pageState.lastSectionTitle = sectionTitle;
    pageState.updatedAt = Date.now();
    const checkValues = Object.values(pageState.selfChecks || {});
    learningProgress.recent = {
      href: `${pagePath}${sectionId ? `#${sectionId}` : ""}`,
      page: pagePath,
      title: chapterTitle,
      subject: subjectMatch[1],
      sectionId,
      sectionTitle,
      mastered: checkValues.filter(value => value === "mastered").length,
      review: checkValues.filter(value => value === "review").length,
      totalChecks: pageState.totalChecks || checkValues.length,
      updatedAt: pageState.updatedAt,
    };
    saveLearningProgress();
  };

  const findSelfCheckSection = () => {
    const directMatch = document.querySelector("#self-check");
    if (directMatch) return directMatch;
    const titleMatch = [...main.querySelectorAll(":scope > section")].find(section =>
      /自我檢測|概念診斷/.test(section.querySelector("h2")?.textContent || "")
    );
    if (titleMatch && !titleMatch.id) titleMatch.id = "self-check";
    return titleMatch || null;
  };

  const selfCheckSection = findSelfCheckSection();

  const buildLearningRoute = () => {
    if (!chapterTitle || main.querySelector(".learning-route")) return;
    const route = document.createElement("nav");
    route.className = "learning-route";
    route.setAttribute("aria-label", "本章學習路徑");
    const heading = document.createElement("h2");
    heading.textContent = "本章學習路徑";
    const intro = document.createElement("p");
    intro.textContent = "依照目前需求選擇入口；不必每次都從頁首線性讀到底。";
    const grid = document.createElement("div");
    grid.className = "learning-route-grid";
    const addRoute = (label, title, href, current = false) => {
      const item = href ? document.createElement("a") : document.createElement("span");
      item.className = "learning-route-card";
      if (href) item.href = href;
      if (current) item.setAttribute("aria-current", "step");
      const kicker = document.createElement("small");
      kicker.textContent = label;
      const name = document.createElement("strong");
      name.textContent = title;
      item.append(kicker, name);
      grid.append(item);
    };
    if (main.dataset.prevHref) {
      addRoute("建議先備章節", main.dataset.prevLabel || "上一章", main.dataset.prevHref);
    } else {
      addRoute("建議先備章節", "本課程起點", "", true);
    }
    if (document.querySelector("#summary")) addRoute("快速複習", "直接閱讀本章摘要", "#summary");
    if (document.querySelector("#common-mistakes")) addRoute("診斷觀念", "查看常見錯誤", "#common-mistakes");
    if (selfCheckSection) addRoute("檢查掌握度", "前往自我檢測", "#self-check");
    if (main.dataset.nextHref) addRoute("完成後延伸", main.dataset.nextLabel || "下一章", main.dataset.nextHref);
    route.append(heading, intro, grid);
    const header = main.querySelector(":scope > .chapter-header, :scope > header");
    if (header) header.after(route);
    else main.prepend(route);
  };

  const enhanceSelfCheck = () => {
    const section = selfCheckSection;
    if (!section || section.querySelector(".self-check-dashboard")) return;
    const detailItems = [...section.querySelectorAll("details")];
    const listItems = [...section.querySelectorAll(":scope > ol > li, :scope > ul > li")];
    const items = [...detailItems, ...listItems];
    if (!items.length) return;

    const dashboard = document.createElement("div");
    dashboard.className = "self-check-dashboard";
    const dashboardTitle = document.createElement("strong");
    dashboardTitle.textContent = "本章掌握度";
    const summary = document.createElement("p");
    summary.setAttribute("aria-live", "polite");
    const meter = document.createElement("progress");
    meter.max = items.length;
    meter.setAttribute("aria-label", "已掌握題數");
    dashboard.append(dashboardTitle, summary, meter);
    section.querySelector("h2")?.after(dashboard);

    const render = () => {
      pageState.totalChecks = items.length;
      const states = items.map((_, index) => pageState.selfChecks[`check-${index + 1}`] || "unmarked");
      const mastered = states.filter(value => value === "mastered").length;
      const review = states.filter(value => value === "review").length;
      meter.value = mastered;
      summary.textContent = `已掌握 ${mastered}／${items.length} 題 · 待複習 ${review} 題 · 未標記 ${items.length - mastered - review} 題`;
      items.forEach((item, index) => {
        const state = states[index];
        item.dataset.checkState = state;
        item.querySelectorAll("[data-check-result]").forEach(button => {
          button.setAttribute("aria-pressed", String(button.dataset.checkResult === state));
        });
      });
      updateRecent(pageState.lastSection, pageState.lastSectionTitle);
    };

    items.forEach((item, index) => {
      const id = `check-${index + 1}`;
      const controls = document.createElement("div");
      controls.className = "self-check-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `第 ${index + 1} 題學習狀態`);
      [["mastered", "我會了"], ["review", "待複習"]].forEach(([value, label]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.checkResult = value;
        button.textContent = label;
        button.addEventListener("click", () => {
          if (pageState.selfChecks[id] === value) delete pageState.selfChecks[id];
          else pageState.selfChecks[id] = value;
          render();
        });
        controls.append(button);
      });
      item.append(controls);
    });
    render();
  };

  buildLearningRoute();
  enhanceSelfCheck();
  syncDisplayNavigation();

  if (chapterTitle) {
    const trackableSections = [...main.querySelectorAll(":scope > section[id]")];
    updateRecent(pageState.lastSection, pageState.lastSectionTitle);
    if ("IntersectionObserver" in window && trackableSections.length) {
      const learningObserver = new IntersectionObserver(entries => {
        const currentSection = entries.find(entry => entry.isIntersecting);
        if (!currentSection) return;
        const section = currentSection.target;
        const title = section.querySelector("h2")?.textContent?.trim() || "";
        if (pageState.lastSection !== section.id) updateRecent(section.id, title);
      }, { rootMargin: "-18% 0px -68%", threshold: 0 });
      trackableSections.forEach(section => learningObserver.observe(section));
    }
  }
})();
