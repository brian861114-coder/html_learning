(() => {
  "use strict";

  const hc_eVnm = 1240; // eV·nm

  const MATERIALS = {
    Si:   { name: "Si (矽)",     Eg: 1.12, color: "#1874c9", direct: false },
    Ge:   { name: "Ge (鍺)",     Eg: 0.66, color: "#c7601b", direct: false },
    GaAs: { name: "GaAs (砷化鎵)", Eg: 1.42, color: "#2e8b57", direct: true },
    GaN:  { name: "GaN (氮化鎵)", Eg: 3.39, color: "#8b2252", direct: true },
  };

  const PRESETS = [
    { label: "藍光 450 nm", wl: 450 },
    { label: "紅光 650 nm", wl: 650 },
    { label: "850 nm (IR)", wl: 850 },
    { label: "1550 nm (通訊)", wl: 1550 },
  ];

  document.querySelectorAll("[data-photon-disclosure]").forEach((details) => {
    try { details.open = localStorage.getItem("photonModelExpanded") === "true"; } catch (_) {}
    details.addEventListener("toggle", () => {
      try { localStorage.setItem("photonModelExpanded", String(details.open)); } catch (_) {}
    });
  });

  document.querySelectorAll("[data-photon-model]").forEach(initModel);

  function initModel(root) {
    root.classList.add("pnm");
    const matKeys = Object.keys(MATERIALS);
    const matToggles = matKeys.map(k =>
      `<button type="button" data-photon-mat="${k}" aria-pressed="true"
        style="border-left:3px solid ${MATERIALS[k].color}">${MATERIALS[k].name.split(" ")[0]}</button>`
    ).join("");

    root.innerHTML = `
      <div class="pnm-shell">
        <aside class="pnm-panel" aria-label="光子能量模型參數">
          <h3>模型參數</h3>
          ${rangeControl("wl", "波長 λ", 200, 2500, 10, 550, "nm")}
          <div class="pnm-presets" aria-label="常用波長">
            ${PRESETS.map(p => `<button type="button" data-preset="${p.wl}">${p.label}</button>`).join("")}
          </div>
          <h3 style="margin-top:18px">選擇材料</h3>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px">${matToggles}</div>
        </aside>
        <div>
          <div class="pnm-visual">
            <div class="pnm-status" aria-live="polite">
              <span>λ：<strong data-status-wl>—</strong></span>
              <span>E<sub>γ</sub>：<strong data-status-egamma>—</strong></span>
            </div>
            <div class="mcm-bar-wrap">
              <svg class="pbg-comparison" data-band-svg viewBox="0 0 540 180"
                role="img" aria-label="光子能量與材料能隙比較"></svg>
            </div>
          </div>
          <div class="pnm-metrics" aria-label="關鍵數值">
            ${metric("wl", "波長 λ")}
            ${metric("egamma", "光子能量 E<sub>γ</sub>")}
            ${metric("freq", "頻率 ν")}
          </div>
          <div class="mcm-table-wrap">
            <table class="mcm-table">
              <thead><tr><th>材料</th><th>E<sub>g</sub> (eV)</th><th>λ<sub>g</sub> = 1240/E<sub>g</sub></th><th>直接能隙</th><th>E<sub>γ</sub> ≥ E<sub>g</sub>？</th></tr></thead>
              <tbody data-table-body></tbody>
            </table>
          </div>
          <div class="pnm-note" data-note role="status">
            <strong>模型判讀：</strong><span data-note-text></span>
          </div>
          <details>
            <summary>物理說明、假設與適用範圍</summary>
            <div>
              <p><strong>光子能量：</strong> E<sub>γ</sub> = hc/λ ≈ 1240/λ(nm) eV。</p>
              <p><strong>吸收門檻：</strong> E<sub>γ</sub> ≥ E<sub>g</sub> 是光子被吸收的<em>必要條件</em>，但非充分條件。</p>
              <ul>
                <li><strong>直接能隙（GaAs、GaN）：</strong>動量守恆自動滿足——導帶最小與價帶最大位於相同 k。光子吸收效率高。</li>
                <li><strong>間接能隙（Si、Ge）：</strong>導帶最小與價帶最大位於<em>不同</em> k。光子動量極小，無法單獨滿足動量守恆——必須有聲子參與。因此 Si 的吸收係數在能隙附近遠低於 GaAs。</li>
                <li>實際吸收係數 α 在能隙以上隨 E<sub>γ</sub> − E<sub>g</sub> 以 ∼(E<sub>γ</sub> − E<sub>g</sub>)<sup>1/2</sup>（直接）或 ∼(E<sub>γ</sub> − E<sub>g</sub>)<sup>2</sup>（間接）增長。</li>
                <li>本模型僅判斷門檻，不可據以推斷實際光電流或量子效率。</li>
              </ul>
            </div>
          </details>
        </div>
      </div>`;

    let selectedMats = new Set(matKeys);

    root.querySelectorAll("[data-photon-mat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.photonMat;
        if (selectedMats.has(k)) selectedMats.delete(k);
        else selectedMats.add(k);
        btn.setAttribute("aria-pressed", String(selectedMats.has(k)));
        render();
      });
    });

    const wlInput = root.querySelector(`[data-input="wl"]`);
    wlInput.addEventListener("input", () => {
      cancelAnimationFrame(render._frame);
      render._frame = requestAnimationFrame(render);
    });

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        wlInput.value = btn.dataset.preset;
        wlInput.dispatchEvent(new Event("input"));
      });
    });

    function render() {
      const wl = Number(wlInput.value);
      const eGamma = hc_eVnm / wl;
      const nu = 3e17 / wl; // THz

      setText(root, "output", "wl", `${wl.toFixed(0)} nm`);
      setText(root, "output", "temp", "");
      setText(root, "metric", "wl", `${wl.toFixed(0)} nm`);
      setText(root, "metric", "egamma", `${format(eGamma, 3)} eV`);
      setText(root, "metric", "freq", `${format(nu, 1)} THz`);
      root.querySelector("[data-status-wl]").textContent = `${wl.toFixed(0)} nm`;
      root.querySelector("[data-status-egamma]").textContent = `${format(eGamma, 3)} eV`;

      drawBand(root.querySelector("[data-band-svg]"), selectedMats, eGamma);
      updateTable(root, selectedMats, eGamma);
      updateNote(root, selectedMats, eGamma, wl);
    }

    render();
  }

  function rangeControl(name, label, min, max, step, value, unit) {
    const id = `pbg-${name}`;
    return `
      <div class="pnm-control">
        <label for="${id}">
          <span>${label}</span><output data-output="${name}">—</output>
        </label>
        <input id="${id}" data-input="${name}" type="range"
          min="${min}" max="${max}" step="${step}" value="${value}">
        <small>範圍 ${min}–${max} ${unit}</small>
      </div>`;
  }

  function metric(name, label) {
    return `<div class="pnm-metric"><span>${label}</span><strong data-metric="${name}">—</strong></div>`;
  }

  function drawBand(svg, mats, eGamma) {
    const w = 540, h = 180, ml = 66, mr = 16, mt = 14, mb = 36;
    const pw = w - ml - mr, ph = h - mt - mb;
    const matList = [...mats].filter(k => MATERIALS[k]);
    if (!matList.length) { svg.innerHTML = ""; return; }

    // Energy axis: 0 to ~4 eV
    const eMax = 4.2;
    const yMap = (e) => mt + (eMax - e) / eMax * ph;

    // Draw materials as horizontal bands at their Eg
    let elems = "";
    const barH = Math.min(30, ph / matList.length - 6);
    const eGammaY = yMap(eGamma);

    matList.forEach((mKey, i) => {
      const m = MATERIALS[mKey];
      const egY = yMap(m.Eg);
      const centerY = egY - barH / 2;
      const crosses = eGamma >= m.Eg;

      elems += `
        <rect x="${ml}" y="${centerY}" width="${pw}" height="${barH}" rx="4"
          fill="${m.color}" opacity="0.15"/>
        <line x1="${ml}" y1="${egY}" x2="${ml + pw}" y2="${egY}"
          stroke="${m.color}" stroke-width="2" stroke-dasharray="6 3"/>
        <text x="${ml + 8}" y="${egY - 6}" class="pnm-svg-title" fill="${m.color}">
          ${m.name.split(" ")[0]} E<sub>g</sub>=${format(m.Eg, 2)} eV</text>
        <text x="${ml + pw - 8}" y="${egY - 6}" text-anchor="end"
          class="pnm-svg-label" fill="${crosses ? '#2e8b57' : '#c7601b'}">
          ${crosses ? "✓ 可吸收" : "✗ 低於門檻"}</text>`;
    });

    // Photon energy line
    elems += `
      <line x1="${ml - 10}" y1="${eGammaY}" x2="${ml + pw + 10}" y2="${eGammaY}"
        stroke="var(--pnm-p)" stroke-width="3" stroke-dasharray="10 5"/>
      <circle cx="${ml - 10}" cy="${eGammaY}" r="6" fill="var(--pnm-p)"/>
      <text x="${ml - 16}" y="${eGammaY + 4}" text-anchor="end" class="fcm-svg-ef-label">
        E<sub>γ</sub> = ${format(eGamma, 2)} eV</text>`;

    // Energy axis
    for (let e = 0; e <= 4; e += 1) {
      const y = yMap(e);
      elems += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>
        <text x="${ml - 8}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">${e}</text>`;
    }

    // Visible spectrum indicator (380-750 nm → 1.65-3.26 eV)
    const visTop = yMap(3.26);
    const visBot = yMap(1.65);
    elems += `
      <rect x="${ml + pw - 40}" y="${visTop}" width="18" height="${visBot - visTop}" rx="3"
        fill="url(#pbg-vis)" opacity="0.5"/>
      <text x="${ml + pw - 49}" y="${(visTop + visBot) / 2 + 4}" text-anchor="end"
        class="pnm-svg-label" font-size="9">可見光</text>`;

    svg.innerHTML = `
      <defs><linearGradient id="pbg-vis" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8b00ff"/><stop offset="33%" stop-color="#0000ff"/>
        <stop offset="50%" stop-color="#00ff00"/><stop offset="66%" stop-color="#ffff00"/>
        <stop offset="100%" stop-color="#ff0000"/>
      </linearGradient></defs>
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      ${elems}
      <text x="14" y="${mt + ph / 2}" text-anchor="middle" class="pnm-svg-label"
        transform="rotate(-90 14 ${mt + ph / 2})">能量 (eV)</text>`;
  }

  function updateTable(root, mats, eGamma) {
    const tbody = root.querySelector("[data-table-body]");
    tbody.innerHTML = [...mats].filter(k => MATERIALS[k]).map(k => {
      const m = MATERIALS[k];
      const lambdaG = hc_eVnm / m.Eg;
      const crosses = eGamma >= m.Eg;
      return `<tr>
        <td style="font-weight:600;color:${m.color}">${m.name}</td>
        <td>${format(m.Eg, 2)}</td>
        <td>${format(lambdaG, 0)} nm</td>
        <td>${m.direct ? "✓ 直接" : "間接（需聲子）"}</td>
        <td style="color:${crosses ? '#2e8b57' : '#c7601b'};font-weight:700">${crosses ? "✓ 是" : "✗ 否"}</td>
      </tr>`;
    }).join("");
  }

  function updateNote(root, mats, eGamma, wl) {
    const text = root.querySelector("[data-note-text]");
    let msg = `λ = ${wl.toFixed(0)} nm → E<sub>γ</sub> = ${format(eGamma, 3)} eV。`;
    const absorbing = [...mats].filter(k => MATERIALS[k] && eGamma >= MATERIALS[k].Eg);
    const nonAbsorbing = [...mats].filter(k => MATERIALS[k] && eGamma < MATERIALS[k].Eg);

    if (absorbing.length) {
      msg += ` 可被 ${absorbing.map(k => MATERIALS[k].name.split(" ")[0]).join("、")} 吸收`;
      const indirect = absorbing.filter(k => !MATERIALS[k].direct);
      if (indirect.length) msg += `（${indirect.map(k => MATERIALS[k].name.split(" ")[0]).join("、")} 為間接能隙，實際吸收需聲子參與）`;
      msg += "。";
    }
    if (nonAbsorbing.length) {
      msg += ` 無法被 ${nonAbsorbing.map(k => MATERIALS[k].name.split(" ")[0]).join("、")} 吸收（E<sub>γ</sub> < E<sub>g</sub>）。`;
    }
    text.innerHTML = msg;
  }

  function setText(root, kind, name, value) {
    const el = root.querySelector(`[data-${kind}="${name}"]`);
    if (el) el.innerHTML = value;
  }

  function format(value, digits) {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }
})();
