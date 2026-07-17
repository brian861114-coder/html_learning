(() => {
  "use strict";
  document.querySelectorAll("[data-model-host]").forEach((host) => {
    const key = host.dataset.modelHost;
    if (!key) return;
    try { host.open = localStorage.getItem(`learningModel:${key}`) === "true"; } catch (_) {}
    host.addEventListener("toggle", () => {
      try { localStorage.setItem(`learningModel:${key}`, String(host.open)); } catch (_) {}
      if (host.open) host.dispatchEvent(new CustomEvent("learning-model:open", { bubbles: true, detail: { key } }));
    });
    const mount = host.querySelector("[data-model-mount]");
    if (!mount) {
      host.dataset.modelState = "error";
      console.warn(`[model-runtime] Missing mount point for ${key}`);
      return;
    }
    host.dataset.modelState = "ready";
  });
})();
