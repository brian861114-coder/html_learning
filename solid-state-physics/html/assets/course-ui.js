(() => {
  "use strict";

  const chapters = [
    ["ch01_crystal_structure_zh.html", "第 1 章　晶體結構"],
    ["ch02_intro_qm_zh.html", "第 2 章　量子力學導論"],
    ["ch03_quantum_theory_solids_zh.html", "第 3 章　固體量子理論"],
    ["ch04_semiconductor_equilibrium_zh.html", "第 4 章　平衡半導體"],
    ["ch05_carrier_transport_zh.html", "第 5 章　載子輸運"],
    ["ch06_nonequilibrium_excess_carriers_zh.html", "第 6 章　非平衡過量載子"],
    ["ch07_pn_junction_zh.html", "第 7 章　PN 接面"],
    ["ch08_pn_junction_diode_zh.html", "第 8 章　PN 接面二極體"],
    ["ch09_ms_heterojunction_zh.html", "第 9 章　金半接面與異質接面"],
    ["ch10_mosfet_zh.html", "第 10 章　MOSFET"],
    ["ch11_mosfet_advanced_zh.html", "第 11 章　進階 MOSFET"],
    ["ch12_bjt_zh.html", "第 12 章上篇　BJT 基礎"],
    ["ch12_bjt_advanced_zh.html", "第 12 章下篇　BJT 進階"],
    ["ch13_jfet_mesfet_zh.html", "第 13 章　JFET／MESFET／HEMT"],
    ["ch14_optical_devices_zh.html", "第 14 章　光電元件"],
    ["ch15_microwave_power_devices_zh.html", "第 15 章　微波與功率元件"]
  ];

  const main = document.querySelector("main");
  const sidebar = document.querySelector(".sidebar");
  if (!main) return;

  main.id ||= "main-content";
  main.tabIndex = -1;

  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#main-content";
  skip.textContent = "跳到主要內容";
  document.body.prepend(skip);

  if (sidebar) {
    sidebar.id ||= "chapter-sidebar";
    sidebar.setAttribute("aria-label", "頁面目錄");

    const menu = document.createElement("button");
    menu.type = "button";
    menu.className = "mobile-menu-button";
    menu.setAttribute("aria-controls", sidebar.id);
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "開啟本章目錄");
    menu.textContent = "☰";
    document.body.prepend(menu);

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "sidebar-overlay";
    overlay.setAttribute("aria-label", "關閉本章目錄");
    overlay.tabIndex = -1;
    document.body.insertBefore(overlay, main);

    const setMenu = (open) => {
      sidebar.classList.toggle("open", open);
      overlay.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "關閉本章目錄" : "開啟本章目錄");
      menu.textContent = open ? "×" : "☰";
    };

    menu.addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
    overlay.addEventListener("click", () => setMenu(false));
    sidebar.addEventListener("click", (event) => {
      if (event.target.closest("a") && matchMedia("(max-width: 768px)").matches) {
        setMenu(false);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && sidebar.classList.contains("open")) {
        setMenu(false);
        menu.focus();
      }
    });
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
      collapse.textContent = collapsed ? "顯示目錄 ›" : "‹ 隱藏目錄";
    };

    let collapsed = false;
    try {
      collapsed = localStorage.getItem("courseSidebarCollapsed") === "true";
    } catch (_) {}
    syncCollapsed(collapsed);

    collapse.addEventListener("click", () => {
      collapsed = !document.body.classList.contains("sidebar-collapsed");
      syncCollapsed(collapsed);
      try {
        localStorage.setItem("courseSidebarCollapsed", String(collapsed));
      } catch (_) {}
    });
  }

  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  document.body.prepend(progress);
  const progressBar = progress.firstElementChild;
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

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

  document.querySelectorAll(".eq").forEach((equation) => {
    equation.tabIndex = 0;
    equation.setAttribute("role", "region");
    equation.setAttribute("aria-label", "可橫向捲動的方程式");
  });

  document.querySelectorAll(".figure img").forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt || "章節圖片"}；按 Enter 開啟原圖`);
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        image.click();
      }
    });
  });

  const themeButton = sidebar?.querySelector(".st button");
  if (themeButton) {
    const syncTheme = () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      themeButton.setAttribute("aria-pressed", String(dark));
      themeButton.setAttribute("aria-label", dark ? "切換為淺色模式" : "切換為深色模式");
    };
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    syncTheme();
  }

  const currentFile = decodeURIComponent(location.pathname.split("/").pop());
  const currentIndex = chapters.findIndex(([file]) => file === currentFile);
  if (currentIndex >= 0) {
    const breadcrumb = document.createElement("nav");
    breadcrumb.className = "chapter-breadcrumb";
    breadcrumb.setAttribute("aria-label", "頁面位置");
    breadcrumb.textContent = `半導體物理與元件　›　${chapters[currentIndex][1]}`;
    const header = main.querySelector(".header");
    if (header) header.prepend(breadcrumb);

    const pager = document.createElement("nav");
    pager.className = "chapter-pager";
    pager.setAttribute("aria-label", "章節導覽");
    const previous = chapters[currentIndex - 1];
    const next = chapters[currentIndex + 1];
    pager.appendChild(makePagerLink(previous, "← 上一章", "已是第一章"));
    pager.appendChild(makePagerLink(next, "下一章 →", "已是最後一章"));
    main.appendChild(pager);
  }

  function makePagerLink(chapter, direction, fallback) {
    if (!chapter) {
      const span = document.createElement("span");
      span.textContent = fallback;
      span.setAttribute("aria-disabled", "true");
      return span;
    }
    const link = document.createElement("a");
    link.href = chapter[0];
    link.innerHTML = `<span>${direction}<br><strong>${chapter[1]}</strong></span>`;
    return link;
  }
})();
