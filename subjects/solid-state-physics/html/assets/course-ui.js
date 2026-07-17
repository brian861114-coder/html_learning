(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src;
  const main = document.querySelector("main");
  const sidebar = document.querySelector(".sidebar");
  if (!main) return;

  main.id ||= "main-content";
  main.tabIndex = -1;

  if (sidebar) {
    sidebar.id ||= "chapter-sidebar";
    sidebar.setAttribute("aria-label", "頁面目錄");
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
    if (image.closest("a[href]")) return;
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

  const validTemplateValue = (value) => value && !value.includes("{{");
  const addChapterNavigation = (currentLabel, previous, next) => {
    const breadcrumb = document.createElement("nav");
    breadcrumb.className = "chapter-breadcrumb";
    breadcrumb.setAttribute("aria-label", "頁面位置");
    breadcrumb.textContent = currentLabel;
    const header = main.querySelector(".header");
    if (header) header.prepend(breadcrumb);

    const pager = document.createElement("nav");
    pager.className = "chapter-pager";
    pager.setAttribute("aria-label", "章節導覽");
    pager.appendChild(makePagerLink(previous, "← 上一章", "已是第一章"));
    pager.appendChild(makePagerLink(next, "下一章 →", "已是最後一章"));
    main.appendChild(pager);
  };

  const explicitPrevious = validTemplateValue(main.dataset.prevHref)
    ? [main.dataset.prevHref, main.dataset.prevLabel || "上一章"]
    : null;
  const explicitNext = validTemplateValue(main.dataset.nextHref)
    ? [main.dataset.nextHref, main.dataset.nextLabel || "下一章"]
    : null;
  const explicitTitle = main.dataset.chapterTitle;

  if (document.documentElement.hasAttribute("data-shared-navigation")) {
    /* shared/core.js owns the canonical pager. */
  } else if (validTemplateValue(explicitTitle)) {
    addChapterNavigation(explicitTitle, explicitPrevious, explicitNext);
  } else {
    loadCourseSequence();
  }

  async function loadCourseSequence() {
    if (!scriptUrl) return;
    try {
      const sequenceUrl = new URL("course-sequence.json", scriptUrl);
      const response = await fetch(sequenceUrl);
      if (!response.ok) return;
      const chapters = await response.json();
      const currentFile = decodeURIComponent(location.pathname.split("/").pop());
      const currentIndex = chapters.findIndex((chapter) => chapter.file === currentFile);
      if (currentIndex < 0) return;
      const previous = chapters[currentIndex - 1];
      const next = chapters[currentIndex + 1];
      addChapterNavigation(
        `半導體物理與元件　›　${chapters[currentIndex].label}`,
        previous ? [previous.file, previous.label] : null,
        next ? [next.file, next.label] : null
      );
    } catch (_) {
      /* 導覽索引不存在時保留頁面本身，不建立猜測連結。 */
    }
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
