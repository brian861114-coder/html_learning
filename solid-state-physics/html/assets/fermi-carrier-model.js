(() => {
  "use strict";

  const q = 1.602176634e-19;
  const kEv = 8.617333262e-5;

  const materials = {
    Si:   { Eg: 1.12, Nc0: 2.8e19, Nv0: 1.04e19, name: "Si" },
    Ge:   { Eg: 0.66, Nc0: 1.04e19, Nv0: 6.0e18,  name: "Ge" },
    GaAs: { Eg: 1.42, Nc0: 4.7e17, Nv0: 7.0e18,  name: "GaAs" },
  };

  document.querySelectorAll("[data-fermi-disclosure]").forEach((details) => {
    try {
      details.open = localStorage.getItem("fermiModelExpanded") === "true";
    } catch (_) {}
    details.addEventListener("toggle", () => {
      try { localStorage.setItem("fermiModelExpanded", String(details.open)); } catch (_) {}
    });
  });

  document.querySelectorAll("[data-fermi-model]").forEach(initModel);

  function initModel(root) {
    root.classList.add("pnm");
    root.innerHTML = `
      <div class="pnm-shell">
        <aside class="pnm-panel" aria-label="費米能階模型參數">
          <h3>模型參數</h3>
          ${rangeControl("temp", "溫度 T", 200, 600, 5, 300, "K")}
          ${rangeControl("logNd", "施體濃度 N<sub>D</sub>", 10, 19, 0.1, 10, "cm⁻³")}
          ${rangeControl("logNa", "受體濃度 N<sub>A</sub>", 10, 19, 0.1, 10, "cm⁻³")}
          <div class="fcm-material-select" aria-label="材料選擇">
            ${Object.entries(materials).map(([key, m]) =>
              `<button type="button" data-material="${key}"${key === "Si" ? " aria-pressed=\"true\"" : ""}>${m.name}</button>`
            ).join("")}
          </div>
          <div class="pnm-presets" aria-label="預設工作點">
            <button type="button" data-preset="intrinsic">本徵半導體</button>
            <button type="button" data-preset="ntype">n 型摻雜</button>
            <button type="button" data-preset="ptype">p 型摻雜</button>
            <button type="button" data-preset="compensated">補償摻雜</button>
          </div>
        </aside>
        <div>
          <div class="pnm-visual">
            <div class="pnm-status" aria-live="polite">
              <span>材料：<strong data-status-mat>Si</strong></span>
              <span>類型：<strong data-status-type>本徵</strong></span>
              <span>n<sub>i</sub>：<strong data-status-ni>—</strong></span>
            </div>
            <div class="fcm-band-wrap">
              <svg class="fcm-band" data-band viewBox="0 0 540 200"
                role="img" aria-label="能帶示意圖：Ec、Ei、EF、Ev 相對位置"></svg>
            </div>
            <div class="fcm-bar-wrap">
              <svg class="fcm-bar" data-bar viewBox="0 0 540 170"
                role="img" aria-label="載子濃度對數長條圖：n、p、ni"></svg>
            </div>
            ${chart("ef-vs-t", "E<sub>F</sub> − E<sub>i</sub> 隨溫度變化")}
          </div>
          <div class="pnm-metrics" aria-label="關鍵數值">
            ${metric("ni", "本徵濃度 n<sub>i</sub>")}
            ${metric("n", "電子濃度 n")}
            ${metric("p", "電洞濃度 p")}
            ${metric("efEi", "E<sub>F</sub> − E<sub>i</sub>")}
            ${metric("vt", "熱電壓 V<sub>T</sub>")}
          </div>
          <div class="pnm-note" data-note role="status">
            <strong>模型判讀：</strong><span data-note-text></span>
          </div>
          <details>
            <summary>方程式、假設與適用範圍</summary>
            <div>
              <p><strong>核心關係：</strong> n = N<sub>c</sub> exp[−(E<sub>c</sub>−E<sub>F</sub>)/kT]，
                p = N<sub>v</sub> exp[−(E<sub>F</sub>−E<sub>v</sub>)/kT]，
                n p = n<sub>i</sub><sup>2</sup>。
                E<sub>F</sub> − E<sub>i</sub> = kT ln(n/n<sub>i</sub>)。
              </p>
              <p><strong>電中性：</strong> n + N<sub>A</sub><sup>−</sup> = p + N<sub>D</sub><sup>+</sup>。
                完全游離近似（室溫以上適用）：
                n = (ΔN + √(ΔN² + 4n<sub>i</sub>²))/2，其中 ΔN = N<sub>D</sub> − N<sub>A</sub>。
              </p>
              <ul>
                <li>採用 Maxwell–Boltzmann 近似（非退化半導體，n &lt; N<sub>c</sub>/10）。</li>
                <li>完全游離近似：300–500 K 範圍內成立；低溫時部分游離未計入。</li>
                <li>N<sub>c</sub>(T) ∝ T<sup>3/2</sup>，n<sub>i</sub> ∝ T<sup>3/2</sup> exp(−E<sub>g</sub>/2kT)。</li>
                <li>摻雜 &gt; 10<sup>18</sup> cm⁻³ 時提醒檢查非退化近似。</li>
                <li>T &lt; 250 K 時提醒不完全游離效應。</li>
              </ul>
              <p><strong>單位檢查：</strong> kT 單位為 eV；N<sub>c</sub>、N<sub>v</sub>、n、p、n<sub>i</sub> 單位為 cm⁻³。</p>
            </div>
          </details>
        </div>
      </div>`;

    const controls = Object.fromEntries(
      ["temp", "logNd", "logNa"].map((name) => [
        name,
        root.querySelector(`[data-input="${name}"]`)
      ])
    );

    let material = "Si";
    root.querySelectorAll("[data-material]").forEach((btn) => {
      btn.addEventListener("click", () => {
        material = btn.dataset.material;
        root.querySelectorAll("[data-material]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === btn)));
        schedule();
      });
    });

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(root, controls, material));
    };

    Object.values(controls).forEach((input) => input.addEventListener("input", schedule));
    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const preset = button.dataset.preset;
        if (preset === "intrinsic") {
          controls.logNd.value = 10; controls.logNa.value = 10;
          controls.temp.value = 300; material = "Si";
        } else if (preset === "ntype") {
          controls.logNd.value = 16; controls.logNa.value = 10;
          controls.temp.value = 300; material = "Si";
        } else if (preset === "ptype") {
          controls.logNd.value = 10; controls.logNa.value = 16;
          controls.temp.value = 300; material = "Si";
        } else if (preset === "compensated") {
          controls.logNd.value = 16; controls.logNa.value = 15;
          controls.temp.value = 300; material = "Si";
        }
        root.querySelectorAll("[data-material]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b.dataset.material === material)));
        schedule();
      });
    });

    update(root, controls, material);
  }

  function rangeControl(name, label, min, max, step, value, unit) {
    const id = `fcm-${name}`;
    const isLog = name.startsWith("log");
    return `
      <div class="pnm-control">
        <label for="${id}">
          <span>${label}</span><output data-output="${name}">—</output>
        </label>
        <input id="${id}" data-input="${name}" type="range"
          min="${min}" max="${max}" step="${step}" value="${value}">
        <small>${isLog ? "對數刻度：10¹⁰–10¹⁹ cm⁻³" : `範圍 ${min}–${max} ${unit}`}</small>
      </div>`;
  }

  function chart(name, caption) {
    return `
      <figure class="pnm-chart">
        <figcaption>${caption}</figcaption>
        <svg data-chart="${name}" viewBox="0 0 760 230"
          role="img" aria-label="${caption}"></svg>
      </figure>`;
  }

  function metric(name, label) {
    return `<div class="pnm-metric"><span>${label}</span><strong data-metric="${name}">—</strong></div>`;
  }

  function update(root, controls, material) {
    const temp = Number(controls.temp.value);
    const Nd = 10 ** Number(controls.logNd.value);
    const Na = 10 ** Number(controls.logNa.value);
    const mat = materials[material];
    const vt = kEv * temp;

    const Nc = mat.Nc0 * (temp / 300) ** 1.5;
    const Nv = mat.Nv0 * (temp / 300) ** 1.5;
    const ni = Math.sqrt(Nc * Nv) * Math.exp(-mat.Eg / (2 * vt));
    const dN = Nd - Na;
    const n = 0.5 * (dN + Math.sqrt(dN * dN + 4 * ni * ni));
    const p = ni * ni / n;

    const nCheck = Nc * Math.exp(-(mat.Eg * 0.5) / vt);  // approximate check
    let efEi = 0;
    if (n > 0 && ni > 0) efEi = vt * Math.log(n / ni);

    const npProduct = n * p;
    const npOk = Math.abs(npProduct - ni * ni) / (ni * ni) < 1e-6;

    // Outputs
    setText(root, "output", "temp", `${temp.toFixed(0)} K`);
    setText(root, "output", "logNd", `10${superscript(Math.log10(Nd))} cm⁻³`);
    setText(root, "output", "logNa", `10${superscript(Math.log10(Na))} cm⁻³`);
    setText(root, "metric", "ni", sciStr(ni, "cm⁻³"));
    setText(root, "metric", "n", sciStr(n, "cm⁻³"));
    setText(root, "metric", "p", sciStr(p, "cm⁻³"));
    setText(root, "metric", "efEi", `${format(efEi * 1000, 1)} meV`);
    setText(root, "metric", "vt", `${format(vt * 1000, 1)} meV`);

    root.querySelector("[data-status-mat]").textContent = mat.name;
    root.querySelector("[data-status-ni]").textContent = sciStr(ni, "cm⁻³");

    let typeLabel;
    if (n > p * 100) typeLabel = "n 型";
    else if (p > n * 100) typeLabel = "p 型";
    else if (Math.abs(dN) < ni * 0.1) typeLabel = "本徵";
    else typeLabel = "補償";
    root.querySelector("[data-status-type]").textContent = typeLabel;

    // Drawings
    drawBand(root.querySelector("[data-band]"), { mat, temp, n, p, ni, efEi, Nd, Na });
    drawBars(root.querySelector("[data-bar]"), { n, p, ni });
    drawEfVsT(root.querySelector('[data-chart="ef-vs-t"]'), { mat, temp, Nd, Na, ni, n, efEi });

    // Model warnings
    updateNote(root, { Nd, Na, n, ni, temp, mat, efEi });
  }

  function drawBand(svg, r) {
    const w = 540, h = 200, ml = 72, mr = 16, mt = 24, mb = 30;
    const pw = w - ml - mr, ph = h - mt - mb;
    const eg = r.mat.Eg;
    const vt = kEv * r.temp;
    const efRel = r.efEi; // positive = toward Ec

    // Scale: map energy range from -eg/2 below Ei to +eg/2 above Ei
    // with padding for EF movement
    const pad = Math.max(0.3, Math.abs(efRel) + 0.15);
    const yMin = -eg / 2 - pad;
    const yMax = eg / 2 + pad;
    const yMap = (val) => mt + (yMax - val) / (yMax - yMin) * ph;
    const xMid = ml + pw / 2;

    const ecY = yMap(eg / 2);
    const evY = yMap(-eg / 2);
    const eiY = yMap(0);
    const efY = yMap(efRel);

    svg.innerHTML = `
      <rect x="${ml}" y="${ecY}" width="${pw}" height="3" class="fcm-svg-band-fill"/>
      <rect x="${ml}" y="${mt}" width="${pw}" height="${ecY - mt}" class="fcm-svg-band-empty"/>
      <rect x="${ml}" y="${evY + 3}" width="${pw}" height="${h - mb - evY - 3}" class="fcm-svg-band-fill"/>
      <text x="${ml + 10}" y="${ecY - 8}" class="fcm-svg-band-label">E<sub>c</sub></text>
      <text x="${ml + 10}" y="${evY + 17}" class="fcm-svg-band-label">E<sub>v</sub></text>
      <line x1="${ml}" y1="${eiY}" x2="${ml + pw}" y2="${eiY}" class="fcm-svg-ei-line"/>
      <text x="${ml + 10}" y="${eiY - 6}" class="pnm-svg-label">E<sub>i</sub></text>
      <line x1="${ml + 20}" y1="${efY}" x2="${ml + pw - 10}" y2="${efY}" class="fcm-svg-ef-line"/>
      <text x="${ml + pw - 8}" y="${efY - 6}" text-anchor="end" class="fcm-svg-ef-label">E<sub>F</sub></text>
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${h - mb}" stroke="var(--t2)" stroke-width="1"/>
      <text x="${ml + pw / 2}" y="${h - 4}" text-anchor="middle" class="pnm-svg-label">能帶示意（eV）</text>
      <text x="14" y="${mt + ph / 2}" text-anchor="middle" class="pnm-svg-label"
        transform="rotate(-90 14 ${mt + ph / 2})">能量</text>`;

    svg.setAttribute("aria-label",
      `能帶圖：E_c=+${format(eg/2,2)} eV, E_v=−${format(eg/2,2)} eV, E_F−E_i=${format(efRel*1000,1)} meV`);
  }

  function drawBars(svg, r) {
    const w = 540, h = 170, ml = 72, mr = 24, mt = 16, mb = 36;
    const pw = w - ml - mr, ph = h - mt - mb;
    const maxLog = Math.ceil(Math.log10(Math.max(r.n, r.p, r.ni) * 1.2));
    const minLog = maxLog - 8; // show 8 orders of magnitude
    const yMap = (val) => mt + (maxLog - val) / (maxLog - minLog) * ph;

    const logN = Math.log10(Math.max(r.n, 1));
    const logP = Math.log10(Math.max(r.p, 1));
    const logNi = Math.log10(Math.max(r.ni, 1));
    const barW = Math.min(80, (pw - 40) / 3);
    const xN = ml + 20 + pw * 0.17;
    const xP = ml + 20 + pw * 0.50;
    const xNi = ml + 20 + pw * 0.83;

    // Grid
    let gridLines = "";
    for (let v = minLog; v <= maxLog; v++) {
      const y = yMap(v);
      gridLines += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>\n`;
      gridLines += `<text x="${ml - 8}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">10<sup>${v}</sup></text>\n`;
    }

    svg.innerHTML = `
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      ${gridLines}
      <rect x="${xN - barW / 2}" y="${yMap(logN)}" width="${barW}" height="${mt + ph - yMap(logN)}"
        rx="4" class="fcm-svg-bar-fill"/>
      <text x="${xN}" y="${yMap(logN) - 6}" text-anchor="middle" class="pnm-svg-title">n</text>
      <text x="${xN}" y="${h - 8}" text-anchor="middle" class="pnm-svg-label">${sciStr(r.n, "")}</text>

      <rect x="${xP - barW / 2}" y="${yMap(logP)}" width="${barW}" height="${mt + ph - yMap(logP)}"
        rx="4" fill="var(--pnm-p)"/>
      <text x="${xP}" y="${yMap(logP) - 6}" text-anchor="middle" class="pnm-svg-title">p</text>
      <text x="${xP}" y="${h - 8}" text-anchor="middle" class="pnm-svg-label">${sciStr(r.p, "")}</text>

      <rect x="${xNi - barW / 2}" y="${yMap(logNi)}" width="${barW}" height="${mt + ph - yMap(logNi)}"
        rx="4" class="fcm-svg-bar-ni"/>
      <text x="${xNi}" y="${yMap(logNi) - 6}" text-anchor="middle" class="pnm-svg-title">n<sub>i</sub></text>
      <text x="${xNi}" y="${h - 8}" text-anchor="middle" class="pnm-svg-label">${sciStr(r.ni, "")}</text>`;

    svg.setAttribute("aria-label",
      `載子濃度：n=${sciStr(r.n,"")}，p=${sciStr(r.p,"")}，n_i=${sciStr(r.ni,"")} cm⁻³`);
  }

  function drawEfVsT(svg, r) {
    const w = 760, h = 230, ml = 82, mr = 20, mt = 18, mb = 42;
    const pw = w - ml - mr, ph = h - mt - mb;
    const mat = r.mat;
    const Nd = r.Nd, Na = r.Na;

    // Generate curve: EF-Ei vs T from 200 to 600K
    const points = [];
    const tMin = 200, tMax = 600;
    for (let i = 0; i <= 120; i++) {
      const T = tMin + (tMax - tMin) * i / 120;
      const vt2 = kEv * T;
      const Nc2 = mat.Nc0 * (T / 300) ** 1.5;
      const Nv2 = mat.Nv0 * (T / 300) ** 1.5;
      const ni2 = Math.sqrt(Nc2 * Nv2) * Math.exp(-mat.Eg / (2 * vt2));
      const dN2 = Nd - Na;
      const n2 = 0.5 * (dN2 + Math.sqrt(dN2 * dN2 + 4 * ni2 * ni2));
      const ef2 = vt2 * Math.log(Math.max(n2, 1e-10) / Math.max(ni2, 1e-10)) * 1000; // meV
      points.push([T, ef2]);
    }

    const yAbsMax = Math.max(1, ...points.map(p => Math.abs(p[1]))) * 1.25;
    const yMinPlot = -yAbsMax;
    const yMaxPlot = yAbsMax;
    const xMap = (x) => ml + (x - tMin) / (tMax - tMin) * pw;
    const yMap = (y) => mt + (yMaxPlot - y) / (yMaxPlot - yMinPlot) * ph;
    const zeroY = yMap(0);

    const path = points.map(([x, y], i) =>
      `${i ? "L" : "M"}${xMap(x).toFixed(2)},${yMap(y).toFixed(2)}`).join(" ");

    // Current point marker
    const cx = xMap(r.temp);
    const cy = yMap(r.efEi * 1000);

    const xTicks = [200, 300, 400, 500, 600];
    const yTickRange = Math.ceil(yAbsMax / 100) * 100;
    const yTicks = [-yTickRange, -yTickRange / 2, 0, yTickRange / 2, yTickRange].filter(v =>
      v >= yMinPlot && v <= yMaxPlot);

    svg.innerHTML = `
      ${xTicks.map((v) => {
        const x = xMap(v);
        return `<line x1="${x}" y1="${mt}" x2="${x}" y2="${mt + ph}" class="pnm-svg-grid"/>
          <text x="${x}" y="${h - 20}" text-anchor="middle" class="pnm-svg-label">${v} K</text>`;
      }).join("")}
      ${yTicks.map((v) => {
        const y = yMap(v);
        return `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>
          <text x="${ml - 9}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">${v} meV</text>`;
      }).join("")}
      <line x1="${ml}" y1="${zeroY}" x2="${ml + pw}" y2="${zeroY}" class="pnm-svg-axis"/>
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" class="pnm-svg-axis"/>
      <path d="${path}" class="fcm-svg-curve-ef"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="var(--pnm-p)" stroke="var(--bg)" stroke-width="2.5"/>
      <text x="${cx + 10}" y="${cy - 6}" class="fcm-svg-ef-label">T=${r.temp.toFixed(0)} K</text>
      <text x="${ml + pw / 2}" y="${h - 2}" text-anchor="middle" class="pnm-svg-label">溫度 T</text>
      <text x="15" y="${mt + ph / 2}" text-anchor="middle" class="pnm-svg-label"
        transform="rotate(-90 15 ${mt + ph / 2})">E<sub>F</sub> − E<sub>i</sub>（meV）</text>`;
  }

  function updateNote(root, r) {
    const note = root.querySelector("[data-note]");
    const text = root.querySelector("[data-note-text]");
    let level = "ok";
    let message;

    if (r.Nd >= 1e18 || r.Na >= 1e18) {
      level = "warn";
      message = "摻雜濃度高於約 10¹⁸ cm⁻³，非退化近似（Maxwell–Boltzmann）可能開始失效；當 E<sub>F</sub> 進入導帶或價帶時，應改用 Fermi–Dirac 積分。";
    } else if (r.temp < 250) {
      level = "warn";
      message = "低溫下摻雜原子可能未完全游離（凍結效應），本模型未包含此行為，n 可能被高估。";
    } else if (r.n > r.mat.Nc0 * 0.1) {
      level = "warn";
      message = "載子濃度已達 N<sub>c</sub> 的 10% 以上，簡併效應開始顯著；此處只提供 Boltzmann 近似結果，精確計算需 Fermi–Dirac 積分。";
    } else if (Math.abs(r.Nd - r.Na) < Math.max(r.Nd, r.Na) * 0.01 && r.Nd > 1e13) {
      message = "施體與受體濃度接近，屬於高度補償半導體；淨載子濃度 n − p ≈ N<sub>D</sub> − N<sub>A</sub> 很小，實際電導率遠低於單一摻雜的情況。";
    } else if (r.p > r.n * 100) {
      message = "p 型半導體：電洞為多數載子，E<sub>F</sub> 位於本徵能階下方。導電率主要由電洞貢獻。";
    } else if (r.n > r.p * 100) {
      message = "n 型半導體：電子為多數載子，E<sub>F</sub> 位於本徵能階上方。導電率主要由電子貢獻。";
    } else {
      message = "本徵或近本徵半導體：n ≈ p ≈ n<sub>i</sub>，E<sub>F</sub> 接近 E<sub>i</sub>。載子濃度主要由溫度決定，對摻雜不敏感。";
    }
    note.dataset.level = level;
    text.innerHTML = message;
  }

  function setText(root, kind, name, value) {
    const el = root.querySelector(`[data-${kind}="${name}"]`);
    if (el) el.innerHTML = value;
  }

  function format(value, digits) {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  function superscript(value) {
    const map = { "-": "⁻", ".": "·", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
    return value.toFixed(Number.isInteger(value) ? 0 : 1).split("").map((c) => map[c] ?? c).join("");
  }

  function sciStr(value, unit) {
    if (!Number.isFinite(value) || value <= 0) return "—";
    const exp = Math.floor(Math.log10(value));
    const mantissa = value / 10 ** exp;
    const suffix = unit ? ` ${unit}` : "";
    return `${format(mantissa, 2)} × 10<sup>${exp}</sup>${suffix}`;
  }
})();
