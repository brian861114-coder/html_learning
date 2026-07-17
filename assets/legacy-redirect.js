(() => {
  const script = document.currentScript;
  const target = script?.dataset.legacyTarget;
  if (!target) return;

  const destination = new URL(target, location.href);
  destination.search = location.search;
  destination.hash = location.hash;
  location.replace(destination.href);
})();
