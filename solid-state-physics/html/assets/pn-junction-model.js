(() => {
  "use strict";

  const q = 1.602176634e-19;
  const eps0 = 8.8541878128e-14; // F/cm
  const epsSi = 11.7 * eps0;
  const kEv = 8.617333262e-5; // eV/K

  document.querySelectorAll("[data-pn-disclosure]").forEach((details) => {
    try {
      details.open = localStorage.getItem("pnModelExpanded") === "true";
    } catch (_) {}
    details.addEventListener("toggle", () => {
      try {
        localStorage.setItem("pnModelExpanded", String(details.open));
      } catch (_) {}
    });
  });

  document.querySelectorAll("[data-pn-junction-model]").forEach(initModel);

  function initModel(root) {
    root.classList.add("pnm");
    root.innerHTML = `
      <div class="pnm-shell">
        <aside class="pnm-panel" aria-label="PN 接面模型參數">
          <h3>模型參數</h3>
          ${rangeControl("na", "p 側摻雜 N_A", 14, 18, 0.1, 16)}
          ${rangeControl("nd", "n 側摻雜 N_D", 14, 18, 0.1, 16)}
          ${rangeControl("bias", "外加偏壓 V_A", -3, 0.6, 0.05, 0)}
          ${rangeControl("temp", "溫度 T", 250, 400, 5, 300)}
          <div class="pnm-presets" aria-label="常用工作點">
            <button type="button" data-preset="equilibrium">熱平衡</button>
            <button type="button" data-preset="reverse">反向偏壓 −2 V</button>
            <button type="button" data-preset="asymmetric">不對稱摻雜</button>
          </div>
        </aside>
        <div>
          <div class="pnm-visual">
            <div class="pnm-status" aria-live="polite">
              <span>工作狀態：<strong data-status>熱平衡</strong></span>
              <span>空乏區總位降：<strong data-vdep>—</strong></span>
            </div>
            <div class="pnm-structure-wrap">
              <svg class="pnm-structure" data-structure viewBox="0 0 760 170"
                role="img" aria-label="PN 接面空乏區結構"></svg>
            </div>
            ${chart("charge", "固定空間電荷密度 ρ(x)")}
            ${chart("field", "電場 E(x)")}
            ${chart("potential", "靜電位 φ(x)")}
          </div>
          <div class="pnm-metrics" aria-label="計算結果">
            ${metric("vbi", "內建電位 V_bi")}
            ${metric("width", "空乏區 W")}
            ${metric("xp", "p 側寬度 x_p")}
            ${metric("xn", "n 側寬度 x_n")}
            ${metric("emax", "峰值電場 |E_max|")}
            ${metric("cap", "接面電容密度 C′_j")}
          </div>
          <div class="pnm-note" data-note role="status">
            <strong>模型判讀：</strong><span data-note-text></span>
          </div>
          <details>
            <summary>方程式、邊界條件與適用範圍</summary>
            <div>
              <p><strong>核心關係：</strong>
                N_Ax_p=N_Dx_n，且
                W=[2ε_s(V_bi−V_A)(1/N_A+1/N_D)/q]^{1/2}。
              </p>
              <ul>
                <li>突變接面、均勻摻雜、一維、完全游離、非退化半導體。</li>
                <li>採空乏近似；空乏區外電場為零，接面處電場連續。</li>
                <li>矽材料、準靜態操作，忽略產生—復合電流、串聯電阻與崩潰後導通。</li>
                <li>強正向偏壓、極高摻雜及崩潰附近只能作趨勢判讀。</li>
              </ul>
              <p><strong>單位檢查：</strong>εV/(qN) 的單位為 cm²，開根號後得到空乏寬度；ε/W 的單位為 F/cm²。</p>
            </div>
          </details>
        </div>
      </div>`;

    const controls = Object.fromEntries(
      ["na", "nd", "bias", "temp"].map((name) => [
        name,
        root.querySelector(`[data-input="${name}"]`)
      ])
    );

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(root, controls));
    };

    Object.values(controls).forEach((input) => input.addEventListener("input", schedule));
    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const preset = button.dataset.preset;
        if (preset === "equilibrium") {
          controls.na.value = 16;
          controls.nd.value = 16;
          controls.bias.value = 0;
          controls.temp.value = 300;
        } else if (preset === "reverse") {
          controls.na.value = 16;
          controls.nd.value = 16;
          controls.bias.value = -2;
          controls.temp.value = 300;
        } else {
          controls.na.value = 17.5;
          controls.nd.value = 15;
          controls.bias.value = -1;
          controls.temp.value = 300;
        }
        schedule();
      });
    });

    update(root, controls);
  }

  function rangeControl(name, label, min, max, step, value) {
    return `
      <div class="pnm-control">
        <label for="pnm-${name}">
          <span>${label}</span><output data-output="${name}">—</output>
        </label>
        <input id="pnm-${name}" data-input="${name}" type="range"
          min="${min}" max="${max}" step="${step}" value="${value}">
        <small>${name === "na" || name === "nd" ? "對數刻度：10¹⁴–10¹⁸ cm⁻³" :
          name === "bias" ? "負值為反向偏壓；正值為順向偏壓" : "影響熱電壓與本徵濃度"}</small>
      </div>`;
  }

  function chart(name, caption) {
    return `
      <figure class="pnm-chart">
        <figcaption>${caption}</figcaption>
        <svg data-chart="${name}" viewBox="0 0 760 230"
          role="img" aria-label="${caption} 隨位置變化"></svg>
      </figure>`;
  }

  function metric(name, label) {
    return `<div class="pnm-metric"><span>${label}</span><strong data-metric="${name}">—</strong></div>`;
  }

  function update(root, controls) {
    const logNa = Number(controls.na.value);
    const logNd = Number(controls.nd.value);
    const na = 10 ** logNa;
    const nd = 10 ** logNd;
    const bias = Number(controls.bias.value);
    const temp = Number(controls.temp.value);
    const vt = kEv * temp;
    const eg = 1.12;
    const ni = 1e10 * (temp / 300) ** 1.5 *
      Math.exp((-eg / (2 * kEv)) * (1 / temp - 1 / 300));
    const vbi = Math.max(0, vt * Math.log((na * nd) / (ni * ni)));
    const rawVdep = vbi - bias;
    const vdep = Math.max(rawVdep, 0.005);
    const widthCm = Math.sqrt((2 * epsSi / q) * vdep * (1 / na + 1 / nd));
    const xpCm = widthCm * nd / (na + nd);
    const xnCm = widthCm * na / (na + nd);
    const emax = q * na * xpCm / epsSi;
    const cap = epsSi / widthCm;

    setText(root, "output", "na", `10${superscript(logNa)} cm⁻³`);
    setText(root, "output", "nd", `10${superscript(logNd)} cm⁻³`);
    setText(root, "output", "bias", `${format(bias, 2)} V`);
    setText(root, "output", "temp", `${temp.toFixed(0)} K`);
    setText(root, "metric", "vbi", `${format(vbi, 3)} V`);
    setText(root, "metric", "width", `${format(widthCm * 1e4, 3)} µm`);
    setText(root, "metric", "xp", `${format(xpCm * 1e4, 3)} µm`);
    setText(root, "metric", "xn", `${format(xnCm * 1e4, 3)} µm`);
    setText(root, "metric", "emax", `${format(emax / 1e3, 2)} kV/cm`);
    setText(root, "metric", "cap", `${format(cap * 1e9, 2)} nF/cm²`);
    root.querySelector("[data-vdep]").textContent = `${format(vdep, 3)} V`;

    const state = bias < -0.05 ? "反向偏壓" : bias > 0.05 ? "順向偏壓" : "熱平衡";
    root.querySelector("[data-status]").textContent = state;

    const result = { na, nd, bias, temp, vbi, vdep, rawVdep, widthCm, xpCm, xnCm, emax, cap };
    drawStructure(root.querySelector("[data-structure]"), result);
    drawCharge(root.querySelector('[data-chart="charge"]'), result);
    drawField(root.querySelector('[data-chart="field"]'), result);
    drawPotential(root.querySelector('[data-chart="potential"]'), result);
    updateNote(root, result);
  }

  function drawStructure(svg, r) {
    const junction = 380;
    const depletionPx = 360;
    const xpPx = depletionPx * r.xpCm / r.widthCm;
    const xnPx = depletionPx * r.xnCm / r.widthCm;
    const left = junction - xpPx;
    const right = junction + xnPx;
    const pIons = ionMarks(left, junction, "−", "#c7601b");
    const nIons = ionMarks(junction, right, "+", "#1874c9");
    svg.innerHTML = `
      <rect x="28" y="30" width="352" height="88" rx="8" fill="color-mix(in srgb, var(--pnm-p) 11%, var(--bg))"/>
      <rect x="380" y="30" width="352" height="88" rx="8" fill="color-mix(in srgb, var(--pnm-n) 11%, var(--bg))"/>
      <rect x="${left}" y="30" width="${Math.max(1, right - left)}" height="88"
        fill="color-mix(in srgb, var(--ac) 12%, transparent)" stroke="var(--ac)" stroke-dasharray="5 4"/>
      <line x1="${junction}" y1="22" x2="${junction}" y2="126" stroke="var(--tx)" stroke-width="2"/>
      ${pIons}${nIons}
      <text x="52" y="58" class="pnm-svg-title">p 型：N_A = ${sci(r.na)} cm⁻³</text>
      <text x="708" y="58" text-anchor="end" class="pnm-svg-title">n 型：N_D = ${sci(r.nd)} cm⁻³</text>
      <text x="${(left + junction) / 2}" y="104" text-anchor="middle" class="pnm-svg-label">x_p</text>
      <text x="${(junction + right) / 2}" y="104" text-anchor="middle" class="pnm-svg-label">x_n</text>
      <line x1="${left}" y1="138" x2="${right}" y2="138" stroke="var(--ac)" stroke-width="2"/>
      <line x1="${left}" y1="132" x2="${left}" y2="144" stroke="var(--ac)" stroke-width="2"/>
      <line x1="${right}" y1="132" x2="${right}" y2="144" stroke="var(--ac)" stroke-width="2"/>
      <text x="${(left + right) / 2}" y="160" text-anchor="middle" class="pnm-svg-title">
        W = ${format(r.widthCm * 1e4, 3)} µm
      </text>`;
    svg.setAttribute("aria-label",
      `PN 接面空乏區：p 側 ${format(r.xpCm * 1e4, 3)} 微米，n 側 ${format(r.xnCm * 1e4, 3)} 微米`);
  }

  function ionMarks(start, end, sign, color) {
    const width = end - start;
    if (width < 8) return "";
    const count = Math.max(1, Math.min(9, Math.floor(width / 24)));
    return Array.from({ length: count }, (_, i) => {
      const x = start + width * (i + 0.5) / count;
      return `<text x="${x}" y="82" text-anchor="middle" fill="${color}" font-size="18" font-weight="700">${sign}</text>`;
    }).join("");
  }

  function drawCharge(svg, r) {
    const xMin = -r.xpCm * 1.25;
    const xMax = r.xnCm * 1.25;
    const scale = 10 ** Math.floor(Math.log10(Math.max(r.na, r.nd)));
    const points = [
      [xMin, 0], [-r.xpCm, 0], [-r.xpCm, -r.na / scale],
      [0, -r.na / scale], [0, r.nd / scale],
      [r.xnCm, r.nd / scale], [r.xnCm, 0], [xMax, 0]
    ];
    drawPlot(svg, points, {
      xMin, xMax,
      yMin: -Math.max(1.05, r.na / scale * 1.18),
      yMax: Math.max(1.05, r.nd / scale * 1.18),
      yLabel: `ρ/q（×10^${Math.log10(scale)} cm⁻³）`,
      xLabel: "位置 x（µm）",
      fill: true
    });
  }

  function drawField(svg, r) {
    const xMin = -r.xpCm * 1.25;
    const xMax = r.xnCm * 1.25;
    const points = [];
    for (let i = 0; i <= 120; i++) {
      const x = xMin + (xMax - xMin) * i / 120;
      let e = 0;
      if (x >= -r.xpCm && x <= 0) e = -q * r.na * (x + r.xpCm) / epsSi;
      else if (x > 0 && x <= r.xnCm) e = -q * r.nd * (r.xnCm - x) / epsSi;
      points.push([x, e / 1e3]);
    }
    drawPlot(svg, points, {
      xMin, xMax, yMin: -r.emax / 1e3 * 1.18, yMax: r.emax / 1e3 * 0.18,
      yLabel: "E（kV/cm）", xLabel: "位置 x（µm）", fill: true
    });
  }

  function drawPotential(svg, r) {
    const xMin = -r.xpCm * 1.25;
    const xMax = r.xnCm * 1.25;
    const v0 = q * r.na * r.xpCm ** 2 / (2 * epsSi);
    const points = [];
    for (let i = 0; i <= 120; i++) {
      const x = xMin + (xMax - xMin) * i / 120;
      let v = 0;
      if (x >= -r.xpCm && x <= 0) {
        v = q * r.na * (x + r.xpCm) ** 2 / (2 * epsSi);
      } else if (x > 0 && x <= r.xnCm) {
        v = v0 + q * r.nd * (r.xnCm * x - x ** 2 / 2) / epsSi;
      } else if (x > r.xnCm) {
        v = r.vdep;
      }
      points.push([x, v]);
    }
    drawPlot(svg, points, {
      xMin, xMax, yMin: -r.vdep * 0.08, yMax: r.vdep * 1.12,
      yLabel: "φ（V）", xLabel: "位置 x（µm）", fill: false
    });
  }

  function drawPlot(svg, points, options) {
    const width = 760;
    const height = 230;
    const margin = { left: 82, right: 20, top: 18, bottom: 42 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const xMap = (x) => margin.left + (x - options.xMin) / (options.xMax - options.xMin) * plotW;
    const yMap = (y) => margin.top + (options.yMax - y) / (options.yMax - options.yMin) * plotH;
    const path = points.map(([x, y], i) => `${i ? "L" : "M"}${xMap(x).toFixed(2)},${yMap(y).toFixed(2)}`).join(" ");
    const zeroY = yMap(Math.min(options.yMax, Math.max(options.yMin, 0)));
    const zeroX = xMap(Math.min(options.xMax, Math.max(options.xMin, 0)));
    const fillPath = options.fill
      ? `${path} L${xMap(points.at(-1)[0]).toFixed(2)},${zeroY.toFixed(2)} L${xMap(points[0][0]).toFixed(2)},${zeroY.toFixed(2)} Z`
      : "";
    const xTicks = tickValues(options.xMin * 1e4, options.xMax * 1e4, 5);
    const yTicks = tickValues(options.yMin, options.yMax, 4);

    svg.innerHTML = `
      ${xTicks.map((value) => {
        const x = xMap(value / 1e4);
        return `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotH}" class="pnm-svg-grid"/>
          <text x="${x}" y="${height - 20}" text-anchor="middle" class="pnm-svg-label">${short(value)}</text>`;
      }).join("")}
      ${yTicks.map((value) => {
        const y = yMap(value);
        return `<line x1="${margin.left}" y1="${y}" x2="${margin.left + plotW}" y2="${y}" class="pnm-svg-grid"/>
          <text x="${margin.left - 9}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">${short(value)}</text>`;
      }).join("")}
      <line x1="${margin.left}" y1="${zeroY}" x2="${margin.left + plotW}" y2="${zeroY}" class="pnm-svg-axis"/>
      <line x1="${zeroX}" y1="${margin.top}" x2="${zeroX}" y2="${margin.top + plotH}" class="pnm-svg-axis"/>
      ${fillPath ? `<path d="${fillPath}" class="pnm-svg-fill"/>` : ""}
      <path d="${path}" class="pnm-svg-curve"/>
      <text x="${margin.left + plotW / 2}" y="${height - 2}" text-anchor="middle" class="pnm-svg-label">${options.xLabel}</text>
      <text x="15" y="${margin.top + plotH / 2}" text-anchor="middle" class="pnm-svg-label"
        transform="rotate(-90 15 ${margin.top + plotH / 2})">${options.yLabel}</text>`;
  }

  function updateNote(root, r) {
    const note = root.querySelector("[data-note]");
    const text = root.querySelector("[data-note-text]");
    let level = "ok";
    let message;
    if (r.rawVdep <= 0.02) {
      level = "warn";
      message = "外加順向偏壓已接近或超過內建電位，空乏近似即將失效；此處只保留最小寬度供趨勢觀察。";
    } else if (r.emax > 3e5) {
      level = "warn";
      message = "峰值電場已進入矽接面可能發生崩潰的量級，模型沒有計入雪崩倍增，不能用來預測崩潰後電流。";
    } else if (r.na >= 1e18 || r.nd >= 1e18) {
      level = "warn";
      message = "摻雜接近 10¹⁸ cm⁻³，非退化與完全游離近似開始需要檢查。";
    } else if (r.bias > 0.3) {
      level = "warn";
      message = "強順向偏壓下中性區注入載子不可忽略；空乏寬度趨勢仍可參考，但電流必須使用第 8 章模型。";
    } else if (r.na > r.nd * 3) {
      message = "p 側摻雜較重，因此空乏區主要伸入較輕摻雜的 n 側；這正是電荷中性 N_Ax_p=N_Dx_n 的幾何結果。";
    } else if (r.nd > r.na * 3) {
      message = "n 側摻雜較重，因此空乏區主要伸入較輕摻雜的 p 側；改變重摻雜側對總寬度的影響較小。";
    } else if (r.bias < -0.05) {
      message = "反向偏壓提高總位降，使空乏區變寬、峰值電場上升，而單位面積接面電容下降。";
    } else {
      message = "兩側摻雜相近，因此空乏區近似對稱；電場是三角形，電位則是其積分形成的分段拋物線。";
    }
    note.dataset.level = level;
    text.textContent = message;
  }

  function tickValues(min, max, count) {
    return Array.from({ length: count }, (_, i) => min + (max - min) * i / (count - 1));
  }

  function setText(root, kind, name, value) {
    root.querySelector(`[data-${kind}="${name}"]`).textContent = value;
  }

  function format(value, digits) {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  function short(value) {
    const abs = Math.abs(value);
    if (abs >= 100) return value.toFixed(0);
    if (abs >= 10) return value.toFixed(1);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  function sci(value) {
    return `10${superscript(Math.log10(value))}`;
  }

  function superscript(value) {
    const map = { "-": "⁻", ".": "·", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
    return value.toFixed(Number.isInteger(value) ? 0 : 1).split("").map((c) => map[c] ?? c).join("");
  }
})();
