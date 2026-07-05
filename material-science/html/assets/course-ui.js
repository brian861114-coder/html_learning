(() => {
  "use strict";

  const chapters = [
    ["ch1_introduction_zh.html", "第 1 章　導論"],
    ["ch2_atomic_structure_zh.html", "第 2 章　原子結構與原子間鍵結"],
    ["ch3_crystalline_solids_zh.html", "第 3 章　晶體固體的結構"],
    ["ch4_imperfections_zh.html", "第 4 章　固體中的缺陷"],
    ["ch5_diffusion_zh.html", "第 5 章　擴散"],
    ["ch6_mechanical_properties_zh.html", "第 6 章　金屬的力學性質"],
    ["ch7_dislocations_zh.html", "第 7 章　差排與強化機制"],
    ["ch8_failure_zh.html", "第 8 章　破壞"],
    ["ch9_phase_diagrams_zh.html", "第 9 章　相圖"],
    ["ch10_phase_transformations_zh.html", "第 10 章　相變態"],
    ["ch11_metal_alloys_zh.html", "第 11 章　金屬合金的應用與加工"],
    ["ch12_ceramic_structures_zh.html", "第 12 章　陶瓷的結構與性質"],
    ["ch13_ceramic_applications_zh.html", "第 13 章　陶瓷的應用與加工"],
    ["ch14_polymer_structures_zh.html", "第 14 章　高分子結構"],
    ["ch15_polymer_applications_zh.html", "第 15 章　高分子的特性、應用與加工"],
    ["ch16_composites_zh.html", "第 16 章　複合材料"],
    ["ch17_corrosion_zh.html", "第 17 章　材料的腐蝕與劣化"],
    ["ch18_electrical_properties_zh.html", "第 18 章　電性"],
    ["ch19_thermal_properties_zh.html", "第 19 章　熱性質"],
    ["ch20_magnetic_properties_zh.html", "第 20 章　磁性"],
    ["ch21_optical_properties_zh.html", "第 21 章　光學性質"],
    ["ch22_environmental_issues_zh.html", "第 22 章　環境與社會議題"]
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

    const legacyMenu = document.querySelector(".sidebar-toggle-btn");
    const menu = legacyMenu || document.createElement("button");
    menu.removeAttribute("onclick");
    menu.type = "button";
    menu.className = "mobile-menu-button";
    menu.setAttribute("aria-controls", sidebar.id);
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "開啟本章目錄");
    menu.textContent = "☰";
    if (!legacyMenu) document.body.prepend(menu);

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
    const imageLink = image.closest("a[href]");
    if (!imageLink) return;
    image.removeAttribute("role");
    image.removeAttribute("tabindex");
    imageLink.setAttribute(
      "aria-label",
      `${image.alt || "章節圖片"}；開啟原尺寸圖片`
    );
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
    breadcrumb.textContent = `材料科學與工程　›　${chapters[currentIndex][1]}`;
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

