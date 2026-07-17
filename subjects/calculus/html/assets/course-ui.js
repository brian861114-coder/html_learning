(() => {
  "use strict";

  const chapters = [
    ["ch01_functions_zh.html", "第 1 章　函數與圖形"],
    ["ch02_limits_zh.html", "第 2 章　極限"],
    ["ch03_derivatives_zh.html", "第 3 章　導數"],
    ["ch04_applications_derivatives_zh.html", "第 4 章　導數的應用"],
    ["ch05_integration_zh.html", "第 5 章　積分"],
    ["ch06_applications_integration_zh.html", "第 6 章　積分的應用"],
    ["ch07_integration_techniques_zh.html", "第 7 章　積分技巧"],
    ["ch08_differential_equations_zh.html", "第 8 章　微分方程入門"],
    ["ch09_sequences_series_zh.html", "第 9 章　序列與級數"],
    ["ch10_power_series_zh.html", "第 10 章　冪級數"],
    ["ch11_parametric_polar_zh.html", "第 11 章　參數方程式與極座標"],
    ["ch12_vectors_space_zh.html", "第 12 章　空間向量"],
    ["ch13_vector_functions_zh.html", "第 13 章　向量值函數"],
    ["ch14_partial_derivatives_zh.html", "第 14 章　偏導數"],
    ["ch15_multiple_integration_zh.html", "第 15 章　多重積分"],
    ["ch16_vector_calculus_zh.html", "第 16 章　向量微積分"],
    ["ch17_second_order_ode_zh.html", "第 17 章　二階微分方程"]
  ];

  const main = document.querySelector("main");
  const sidebar = document.querySelector(".sidebar");
  if (!main) return;
  const sharedNavigation = document.documentElement.hasAttribute("data-shared-navigation");
  main.id ||= "main-content";

  // === Desktop sidebar collapse ===
  if (sidebar) {
    sidebar.id ||= "chapter-sidebar";
    
    // Collapse button
    const collapse = document.createElement("button");
    collapse.type = "button";
    collapse.className = "sidebar-collapse-button";
    collapse.setAttribute("aria-controls", sidebar.id);
    document.body.prepend(collapse);

    const syncCollapsed = (collapsed) => {
      document.body.classList.toggle("sidebar-collapsed", collapsed);
      collapse.setAttribute("aria-expanded", String(!collapsed));
      collapse.setAttribute("aria-label", collapsed ? "顯示側欄" : "隱藏側欄");
      collapse.title = collapsed ? "顯示側欄" : "隱藏側欄";
      collapse.textContent = collapsed ? "▶" : "◀";
    };

    let collapsed = false;
    try { collapsed = localStorage.getItem("calcSidebarCollapsed") === "true"; } catch (_) {}
    syncCollapsed(collapsed);

    collapse.addEventListener("click", () => {
      collapsed = !document.body.classList.contains("sidebar-collapsed");
      syncCollapsed(collapsed);
      try { localStorage.setItem("calcSidebarCollapsed", String(collapsed)); } catch (_) {}
    });

    if (!sharedNavigation) {
      // Transitional fallback for pages that have not loaded shared/core.js.
      let menu = document.querySelector('.sidebar-toggle-btn');
      if (!menu) {
        menu = document.createElement("button");
        menu.type = "button";
        menu.className = "sidebar-toggle-btn";
        menu.setAttribute("aria-label", "開啟章節目錄");
        menu.textContent = "☰";
        document.body.prepend(menu);
      }
      menu.setAttribute("aria-controls", sidebar.id);
      menu.style.cssText = "position:fixed;top:12px;left:12px;z-index:200;width:40px;height:40px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx);font-size:20px;cursor:pointer";

      const overlay = document.createElement("button");
      overlay.type = "button";
      overlay.className = "sidebar-overlay";
      overlay.setAttribute("aria-label", "關閉章節目錄");
      overlay.tabIndex = -1;
      overlay.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:99;border:none;cursor:pointer";
      document.body.insertBefore(overlay, main);

      const setMenu = (open) => {
        sidebar.classList.toggle("open", open);
        overlay.style.display = open ? "block" : "none";
        document.body.classList.toggle("menu-open", open);
        menu.setAttribute("aria-expanded", String(open));
        menu.textContent = open ? "✕" : "☰";
      };

      menu.addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
      overlay.addEventListener("click", () => setMenu(false));
      sidebar.addEventListener("click", (e) => {
        if (e.target.closest("a") && matchMedia("(max-width: 768px)").matches) setMenu(false);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("open")) { setMenu(false); menu.focus(); }
      });
    }
  }

  // === Reading progress ===
  if (!document.querySelector(".reading-progress")) {
    const progress = document.createElement("div");
    progress.className = "reading-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    progress.style.cssText = "position:fixed;top:0;left:0;width:100%;height:3px;z-index:1000;pointer-events:none";
    document.body.prepend(progress);
    const progressBar = progress.firstElementChild;
    progressBar.style.cssText = "display:block;height:100%;background:var(--ac);transform-origin:left;transform:scaleX(0)";
    let ticking = false;
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; } }, { passive: true });
    updateProgress();
  }

  // === Table wrappers ===
  document.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("table-scroll")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "可橫向捲動的表格");
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  // === Figure accessibility (keyboard + screen reader) ===
  document.querySelectorAll(".figure img").forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "章節圖片"}；按 Enter 或空白鍵開啟原圖`);
    image.style.cursor = "pointer";
    const openImage = () => {
      const w = window.open("", "_blank", "noopener");
      if (w) { w.document.write(`<img src="${image.src}" style="max-width:100%" alt="${image.alt||''}">`); w.document.title = image.alt || "圖片"; }
      else { window.open(image.src, "_blank", "noopener"); }
    };
    image.addEventListener("click", openImage);
    image.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openImage(); }
    });
  });

  // === Chapter pager ===
  const currentFile = decodeURIComponent(location.pathname.split("/").pop());
  const currentIndex = chapters.findIndex(([file]) => file === currentFile);
  if (currentIndex >= 0 && !document.documentElement.hasAttribute("data-shared-navigation")) {
    const pager = document.createElement("nav");
    pager.className = "chapter-pager";
    pager.setAttribute("aria-label", "章節導覽");
    pager.style.cssText = "display:flex;justify-content:space-between;margin:40px 0 20px;gap:16px";
    const prev = chapters[currentIndex - 1];
    const next = chapters[currentIndex + 1];
    const makeLink = (ch, label, strong) => ch
      ? `<a href="${ch[0]}" style="flex:1;padding:14px 18px;border:1px solid var(--bd);border-radius:8px;text-decoration:none;color:var(--tx);background:var(--bg2);font-size:13px;transition:.15s" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='var(--bd)'">${label}<br><strong style="color:var(--ac)">${ch[1]}</strong></a>`
      : `<span style="flex:1;padding:14px 18px;border:1px solid var(--bd);border-radius:8px;color:var(--tx2);font-size:13px;opacity:.5">${strong}</span>`;
    pager.innerHTML = makeLink(prev, "← 上一章", "已是第一章") + makeLink(next, "下一章 →", "已是最後一章");
    main.appendChild(pager);
  }

  // === Unified theme (sync with reading-preferences) ===
  const PREF_KEY = "learning-portal-reading-preferences";
  const themeBtn = document.getElementById("themeBtn");
  
  const applyTheme = (dark) => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    if (themeBtn) themeBtn.textContent = dark ? "☀️ 淺色模式" : "🌙 深色模式";
  };

  // Initialize from reading-preferences
  try {
    const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    applyTheme(prefs.theme === "dark");
  } catch (_) {
    applyTheme(false);
  }

  window.toggleTheme = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(!isDark);
    // Also update reading-preferences
    try {
      const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
      prefs.theme = isDark ? "light" : "dark";
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch (_) {}
  };

  // Bind theme button via event listener (no inline onclick)
  if (themeBtn) {
    themeBtn.addEventListener("click", () => window.toggleTheme());
  }
})();
