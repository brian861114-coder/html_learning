(() => {
  const storageKey = "learning-portal-progress-v1";
  const subjectMatch = location.pathname.match(/\/subjects\/([^/]+)\/index\.html$/);
  if (!subjectMatch) return;

  const decorateCards = () => {
    let progress = { recent: null, pages: {} };
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      progress = { recent: stored.recent || null, pages: stored.pages || {} };
    } catch (_) {}

    document.querySelectorAll("a.card[href]").forEach(card => {
      if (card.querySelector(".chapter-progress")) return;
      const url = new URL(card.getAttribute("href"), location.href);
      const relativePage = decodeURIComponent(url.pathname).replace(/^.*\/subjects\//, "subjects/");
      const state = progress.pages[relativePage];
      if (!state) return;

      const status = document.createElement("div");
      status.className = "chapter-progress";
      const isRecent = progress.recent?.page === relativePage;
      const label = document.createElement("strong");
      label.textContent = isRecent ? "繼續閱讀" : "曾經閱讀";
      const locationLabel = document.createElement("span");
      locationLabel.textContent = state.lastSectionTitle || "從章節開頭繼續";
      status.append(label, locationLabel);
      card.append(status);
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorateCards);
  else decorateCards();
})();
