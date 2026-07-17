(() => {
  const catalog = window.LEARNING_CATALOG || [];
  const root = document.querySelector("[data-portal]");
  if (!root) return;
  const mode = root.dataset.portal;
  if (mode === "chapters" && !document.querySelector('link[href*="learning-experience.css"]')) {
    const experienceStyles = document.createElement("link");
    experienceStyles.rel = "stylesheet";
    experienceStyles.href = "../../assets/learning-experience.css";
    document.head.append(experienceStyles);
  }
  const base = root.dataset.base || "";
  const subject = catalog.find(item => item.id === root.dataset.subject);
  const grid = document.querySelector("[data-grid]");
  const search = document.querySelector("[data-search]");
  const empty = document.querySelector("[data-empty]");
  const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
  const formatNumber = value => Number(value || 0).toLocaleString("zh-TW");
  let learningProgress = { recent: null, pages: {} };
  try {
    const stored = JSON.parse(localStorage.getItem("learning-portal-progress-v1") || "{}");
    learningProgress = { recent: stored.recent || null, pages: stored.pages || {} };
  } catch (_) {}

  const statsMarkup = item => {
    const stats = item.stats || {};
    return `<div class="subject-metrics" aria-label="${escapeHTML(item.title)}教材統計"><span><strong>${formatNumber(stats.chapters)}</strong>章</span><span><strong>${formatNumber(stats.models)}</strong>模型</span><span><strong>${formatNumber(stats.exercises)}</strong>練習</span><span class="content-status">${escapeHTML(stats.status || "建置中")}</span></div>`;
  };

  if (mode === "subjects") {
    grid.innerHTML = catalog.map(item => `<a class="card subject-card" style="--accent:${item.accent}" href="${base}${encodeURI(item.href)}"><span class="subject-icon" aria-hidden="true">${escapeHTML(item.icon)}</span><h3>${escapeHTML(item.title)}</h3><div class="en">${escapeHTML(item.subtitle)}</div><p>${escapeHTML(item.description)}</p>${statsMarkup(item)}<div class="meta"><span>${escapeHTML(item.stats?.status || "建置中")}</span><span>進入學習 →</span></div></a>`).join("");
    const totals = catalog.reduce((sum, item) => ({
      chapters: sum.chapters + Number(item.stats?.chapters || 0),
      models: sum.models + Number(item.stats?.models || 0),
      exercises: sum.exercises + Number(item.stats?.exercises || 0),
    }), { chapters: 0, models: 0, exercises: 0 });
    document.querySelectorAll("[data-total]").forEach(element => {
      const key = element.dataset.total;
      if (key === "subjects") element.textContent = formatNumber(catalog.length);
      else if (key in totals) element.textContent = formatNumber(totals[key]);
    });

    const continueSection = document.querySelector("[data-continue]");
    const continueEmpty = continueSection?.querySelector("[data-continue-empty]");
    const continueLink = continueSection?.querySelector("[data-continue-link]");
    const recent = learningProgress.recent;
    if (continueSection && continueLink && recent?.href) {
      const recentSubject = catalog.find(item => item.slug === recent.subject);
      continueEmpty.hidden = true;
      continueLink.hidden = false;
      continueLink.href = `${base}${recent.href}`;
      continueLink.querySelector("[data-continue-subject]").textContent = recentSubject?.title || "學習主題";
      continueLink.querySelector("[data-continue-title]").textContent = recent.title || "上次閱讀章節";
      continueLink.querySelector("[data-continue-section]").textContent = recent.sectionTitle || "從上次位置繼續";
      const mastery = continueLink.querySelector("[data-continue-mastery]");
      mastery.textContent = recent.totalChecks
        ? `自我檢測：已掌握 ${recent.mastered || 0}／${recent.totalChecks} 題`
        : "尚未標記本章自我檢測";
    }
  } else if (subject) {
    document.documentElement.style.setProperty("--accent", subject.accent);
    document.querySelector("[data-title]").textContent = subject.title;
    document.querySelector("[data-subtitle]").textContent = subject.subtitle;
    const description = document.querySelector("[data-description]");
    description.textContent = subject.description;
    const subjectStats = document.createElement("div");
    subjectStats.className = "portal-stats";
    subjectStats.innerHTML = `<span><strong>${formatNumber(subject.stats.chapters)}</strong> 章節</span><span><strong>${formatNumber(subject.stats.models)}</strong> 模型</span><span><strong>${formatNumber(subject.stats.exercises)}</strong> 練習</span><span>${escapeHTML(subject.stats.status)}</span>`;
    description.after(subjectStats);
    grid.innerHTML = subject.chapters.map(([number,title,en,href]) => {
      const pageKey = `subjects/${subject.slug}/${href}`;
      const saved = learningProgress.pages[pageKey];
      const action = saved ? "繼續閱讀 →" : "開始閱讀 →";
      const location = saved?.lastSectionTitle ? `上次：${escapeHTML(saved.lastSectionTitle)}` : `第 ${number} 章`;
      return `<a class="card chapter-card" href="${encodeURI(href)}"><div class="number">CHAPTER ${number}</div><h3>${escapeHTML(title)}</h3><div class="en">${escapeHTML(en)}</div><div class="meta"><span>${location}</span><span>${action}</span></div></a>`;
    }).join("");
  }

  if (search) search.addEventListener("input", () => {
    const keyword = search.value.trim().toLocaleLowerCase("zh-TW");
    let visible = 0;
    grid.querySelectorAll(".card").forEach(card => {
      const match = !keyword || card.textContent.toLocaleLowerCase("zh-TW").includes(keyword);
      card.classList.toggle("hidden", !match);
      if (match) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
  });
})();
