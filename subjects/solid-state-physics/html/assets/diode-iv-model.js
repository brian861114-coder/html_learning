(() => {
  "use strict";

  const q = 1.602176634e-19;
  const kEv = 8.617333262e-5;

  document.querySelectorAll("[data-diode-disclosure]").forEach((details) => {
    try { details.open = localStorage.getItem("diodeModelExpanded") === "true"; } catch (_) {}
    details.addEventListener("toggle", () => {
      try { localStorage.setItem("diodeModelExpanded", String(details.open)); } catch (_) {}
    });
  });

  document.querySelectorAll("[data-diode-model]").forEach(initModel);

  function initModel(root) {
    root.classList.add("pnm");
    root.innerHTML = `
      <div class="pnm-shell">
        <aside class="pnm-panel" aria-label="二極體 I-V 模型參數">
          <h3>模型參數</h3>
          ${rangeControl("vd", "二極體電壓 V<sub>D</sub>", -5, 0.9, 0.01, 0, "V")}
          ${rangeControl("temp", "溫度 T", 250, 400, 5, 300, "K")}
          ${rangeControl("logIs", "反向飽和電流 I<sub>S</sub>", -15, -6, 0.1, -12, "A")}
          ${rangeControl("nIdeality", "理想因子 n", 1, 2, 0.01, 1, "")}
          ${rangeControl("rs", "串聯電阻 R<sub>S</sub>", 0, 100, 1, 0, "Ω")}
          <div class="pnm-control">
            <label>顯示模式</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px">
              <button type="button" data-mode="both" aria-pressed="true" style="font-size:0.75rem">理想 + R<sub>S</sub></button>
              <button type="button" data-mode="ideal" style="font-size:0.75rem">僅理想</button>
            </div>
          </div>
          <div class="pnm-presets" aria-label="常用工作點">
            <button type="button" data-preset="ideal">理想 Si 二極體</button>
            <button type="button" data-preset="recomb">復合主導</button>
            <button type="button" data-preset="highrs">高串聯電阻</button>
            <button type="button" data-preset="reverse">反向偏壓</button>
          </div>
        </aside>
        <div>
          <div class="pnm-visual">
            <div class="pnm-status" aria-live="polite">
              <span>狀態：<strong data-status>正向偏壓</strong></span>
              <span>V<sub>T</sub>：<strong data-status-vt>—</strong></span>
              <span>I<sub>S</sub>：<strong data-status-is>—</strong></span>
            </div>
            ${chart("iv-linear", "線性尺度 I–V 曲線")}
            ${chart("iv-semilog", "半對數正向 I–V 曲線")}
          </div>
          <div class="pnm-metrics" aria-label="計算結果">
            ${metric("vdVal", "V<sub>D</sub>")}
            ${metric("iVal", "二極體電流 I")}
            ${metric("rd", "動態電阻 r<sub>d</sub>")}
            ${metric("power", "耗散功率 P")}
            ${metric("vtVal", "熱電壓 V<sub>T</sub>")}
            ${metric("isVal", "I<sub>S</sub>")}
          </div>
          <div class="pnm-note" data-note role="status">
            <strong>模型判讀：</strong><span data-note-text></span>
          </div>
          <details>
            <summary>方程式、假設與適用範圍</summary>
            <div>
              <p><strong>Shockley 理想方程：</strong> I = I<sub>S</sub>[exp(V<sub>D</sub>/(nV<sub>T</sub>)) − 1]，
                V<sub>T</sub> = kT/q。</p>
              <p><strong>含串聯電阻：</strong> I = I<sub>S</sub>{exp[(V<sub>D</sub> − I·R<sub>S</sub>)/(nV<sub>T</sub>)] − 1}。
                此為隱式方程，使用二分法迭代求解，I 的上限設為 V<sub>D</sub>/R<sub>S</sub>（當 R<sub>S</sub> > 0 時）。</p>
              <ul>
                <li>n = 1：擴散電流主導（理想 pn 接面）。</li>
                <li>n ≈ 2：空乏區產生–復合電流主導。</li>
                <li>R<sub>S</sub> 包含中性區體電阻與接觸電阻；高電流時 I·R<sub>S</sub> 壓降使有效接面電壓降低。</li>
                <li>本模型未包含崩潰（反向 > 5 V 僅供趨勢參考）、高階注入與溫度對 I<sub>S</sub> 的影響。</li>
                <li>I<sub>S</sub> 實際隨溫度劇烈變化（∝ T³ exp(−E<sub>g</sub>/kT)），此處視為獨立參數以便探討。</li>
              </ul>
              <p><strong>單位檢查：</strong> V<sub>T</sub> 單位為 V；exp 引數無因次；I 單位為 A。</p>
            </div>
          </details>
        </div>
      </div>`;

    const controls = Object.fromEntries(
      ["vd", "temp", "logIs", "nIdeality", "rs"].map((name) => [
        name,
        root.querySelector(`[data-input="${name}"]`)
      ])
    );

    let showMode = "both";
    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        showMode = btn.dataset.mode;
        root.querySelectorAll("[data-mode]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === btn)));
        schedule();
      });
    });

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(root, controls, showMode));
    };

    Object.values(controls).forEach((input) => input.addEventListener("input", schedule));
    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const p = button.dataset.preset;
        if (p === "ideal") {
          controls.vd.value = 0.6; controls.temp.value = 300;
          controls.logIs.value = -12; controls.nIdeality.value = 1; controls.rs.value = 0;
        } else if (p === "recomb") {
          controls.vd.value = 0.5; controls.temp.value = 300;
          controls.logIs.value = -12; controls.nIdeality.value = 1.8; controls.rs.value = 0;
        } else if (p === "highrs") {
          controls.vd.value = 0.7; controls.temp.value = 300;
          controls.logIs.value = -12; controls.nIdeality.value = 1; controls.rs.value = 30;
        } else if (p === "reverse") {
          controls.vd.value = -3; controls.temp.value = 300;
          controls.logIs.value = -12; controls.nIdeality.value = 1; controls.rs.value = 0;
        }
        schedule();
      });
    });

    update(root, controls, showMode);
  }

  function rangeControl(name, label, min, max, step, value, unit) {
    const id = `div-${name}`;
    const isLog = name === "logIs";
    return `
      <div class="pnm-control">
        <label for="${id}">
          <span>${label}</span><output data-output="${name}">—</output>
        </label>
        <input id="${id}" data-input="${name}" type="range"
          min="${min}" max="${max}" step="${step}" value="${value}">
        <small>${isLog ? "對數刻度：10⁻¹⁵–10⁻⁶ A" : `範圍 ${min}–${max} ${unit}`}</small>
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

  function update(root, controls, showMode) {
    const vd = Number(controls.vd.value);
    const temp = Number(controls.temp.value);
    const Is = 10 ** Number(controls.logIs.value);
    const nVal = Number(controls.nIdeality.value);
    const rs = Number(controls.rs.value);
    const vt = kEv * temp;

    // Solve diode current
    const iIdeal = Is * (Math.exp(Math.min(vd / (nVal * vt), 50)) - 1);

    let iRs = iIdeal;
    if (rs > 0 && vd > -5) {
      // Bisection: I is in [0, max(Is, vd/rs)] for vd > 0, or [vd/rs, 0] for vd < 0
      const sign = vd >= 0 ? 1 : -1;
      let lo = sign < 0 ? vd / rs : -Is * 10;
      let hi = sign < 0 ? Is * 10 : Math.max(vd / rs, Is * 10);
      // Clamp to prevent overflow
      const maxArg = 50;
      const maxI = Is * Math.exp(maxArg);
      if (vd > 0) hi = Math.min(hi, maxI);
      if (vd < 0) lo = Math.max(lo, -maxI);

      for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2;
        const arg = Math.max(-50, Math.min(maxArg, (vd - mid * rs) / (nVal * vt)));
        const f = Is * (Math.exp(arg) - 1) - mid;
        if (Math.abs(f) < 1e-18 || Math.abs(hi - lo) < 1e-18) {
          iRs = mid;
          break;
        }
        if ((f > 0 && sign >= 0) || (f < 0 && sign < 0)) {
          lo = mid;
        } else {
          hi = mid;
        }
        if (iter === 59) iRs = (lo + hi) / 2;
      }
    }

    const iShow = rs > 0 ? iRs : iIdeal;
    const rd = (iShow > 1e-30) ? nVal * vt / (iShow + Is) : 1e12; // dynamic resistance
    const power = Math.abs(vd * iShow);

    // Outputs
    setText(root, "output", "vd", `${format(vd, 3)} V`);
    setText(root, "output", "temp", `${temp.toFixed(0)} K`);
    setText(root, "output", "logIs", `${format(Is * 1e12, 2)} pA`);
    setText(root, "output", "nIdeality", `${format(nVal, 2)}`);
    setText(root, "output", "rs", `${rs.toFixed(0)} Ω`);
    setText(root, "metric", "vdVal", `${format(vd, 3)} V`);
    setText(root, "metric", "iVal", formatCurrent(iShow));
    setText(root, "metric", "rd", formatResistance(rd));
    setText(root, "metric", "power", formatPower(power));
    setText(root, "metric", "vtVal", `${format(vt * 1000, 1)} mV`);
    setText(root, "metric", "isVal", formatCurrent(Is));

    root.querySelector("[data-status-vt]").textContent = `${format(vt * 1000, 1)} mV`;
    root.querySelector("[data-status-is]").textContent = formatCurrent(Is);

    // Status
    let status;
    if (vd > 0.05) status = "正向偏壓";
    else if (vd < -0.05) status = "反向偏壓";
    else status = "近零偏壓";
    root.querySelector("[data-status]").textContent = status;

    // Draw curves
    drawIVCurve(root.querySelector('[data-chart="iv-linear"]'), {
      vd, vt, Is, nVal, rs, showMode
    }, "linear");
    drawIVCurve(root.querySelector('[data-chart="iv-semilog"]'), {
      vd, vt, Is, nVal, rs, showMode
    }, "semilog");

    // Note
    updateNote(root, { vd, iShow, iIdeal, iRs, rs, nVal, Is });
  }

  function drawIVCurve(svg, r, scale) {
    const w = 760, h = 230, ml = 82, mr = 20, mt = 18, mb = 42;
    const pw = w - ml - mr, ph = h - mt - mb;

    const isSemilog = scale === "semilog";
    let vMin, vMax;
    if (isSemilog) {
      vMin = 0; vMax = 0.9;
    } else {
      vMin = -5; vMax = 0.9;
    }

    const xMap = (x) => ml + (x - vMin) / (vMax - vMin) * pw;

    // Generate curves
    const nPts = 200;
    const idealPts = [];
    const rsPts = [];
    let iMin = Infinity, iMax = -Infinity;

    for (let i = 0; i <= nPts; i++) {
      const v = vMin + (vMax - vMin) * i / nPts;
      const arg = Math.min(50, v / (r.nVal * r.vt));
      const iIdeal = r.Is * (Math.exp(arg) - 1);
      idealPts.push([v, iIdeal]);

      let iRs = iIdeal;
      if (r.rs > 0) {
        const sign = v >= 0 ? 1 : -1;
        let lo = sign < 0 ? v / r.rs : -r.Is * 10;
        let hi = sign < 0 ? r.Is * 10 : Math.max(v / r.rs, r.Is * 10);
        for (let j = 0; j < 50; j++) {
          const mid = (lo + hi) / 2;
          const a = Math.max(-50, Math.min(50, (v - mid * r.rs) / (r.nVal * r.vt)));
          const f = r.Is * (Math.exp(a) - 1) - mid;
          if (Math.abs(f) < 1e-18) { iRs = mid; break; }
          if ((f > 0 && sign >= 0) || (f < 0 && sign < 0)) lo = mid; else hi = mid;
          if (j === 49) iRs = (lo + hi) / 2;
        }
      }
      rsPts.push([v, iRs]);
      iMin = Math.min(iMin, iIdeal, iRs);
      iMax = Math.max(iMax, iIdeal, iRs);
    }

    // For semilog: use positive values, floor at Is/100
    if (isSemilog) {
      const floor = Math.max(r.Is / 100, 1e-15);
      iMin = floor;
      iMax = Math.max(iMax, r.Is * 100);
    } else {
      const pad = Math.max(Math.abs(iMin), Math.abs(iMax)) * 0.1;
      iMin = iMin - pad;
      iMax = iMax + pad;
    }

    const yMap = (y) => {
      if (!Number.isFinite(y)) return mt + ph / 2;
      const clamped = Math.max(iMin, Math.min(iMax, y));
      if (isSemilog) {
        return mt + (Math.log10(iMax) - Math.log10(clamped)) /
          (Math.log10(iMax) - Math.log10(iMin)) * ph;
      }
      return mt + (iMax - clamped) / (iMax - iMin) * ph;
    };

    const makePath = (pts) => pts.map(([x, y], i) =>
      `${i ? "L" : "M"}${xMap(x).toFixed(2)},${yMap(y).toFixed(2)}`).join(" ");

    // Grid
    let gridLines = "";
    if (isSemilog) {
      for (let exp = Math.floor(Math.log10(iMin)); exp <= Math.ceil(Math.log10(iMax)); exp++) {
        const y = yMap(10 ** exp);
        gridLines += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>
          <text x="${ml - 9}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">10<sup>${exp}</sup> A</text>`;
      }
    } else {
      const yTicks = tickValues(iMin, iMax, 5);
      yTicks.forEach((value) => {
        const y = yMap(value);
        gridLines += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>
          <text x="${ml - 9}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">${formatCurrent(value)}</text>`;
      });
    }
    const xTicks = isSemilog ? [0, 0.2, 0.4, 0.6, 0.8, 0.9] : [-5, -3, -1, 0, 0.3, 0.6, 0.9];
    xTicks.forEach((value) => {
      const x = xMap(value);
      gridLines += `<line x1="${x}" y1="${mt}" x2="${x}" y2="${mt + ph}" class="pnm-svg-grid"/>
        <text x="${x}" y="${h - 20}" text-anchor="middle" class="pnm-svg-label">${format(value, 1)} V</text>`;
    });

    // Current operation point
    const cx = xMap(r.vd);
    const cy = yMap(r.iRs > 0 ? r.iRs : r.iIdeal);

    let idealPath = "", rsPath = "", legend = "";
    if (r.showMode === "both" || r.showMode === "ideal") {
      idealPath = `<path d="${makePath(idealPts)}" class="pnm-svg-curve"/>`;
      legend += `<span>理想 Shockley</span>`;
    }
    if ((r.showMode === "both" || r.showMode === "rs") && r.rs > 0) {
      rsPath = `<path d="${makePath(rsPts)}" class="pnm-svg-curve" stroke="var(--pnm-p)" stroke-dasharray="6 4"/>`;
      legend += `<span class="legend-rs">含 R<sub>S</sub></span>`;
    }

    svg.innerHTML = `
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      <line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      ${gridLines}
      <line x1="${ml}" y1="${yMap(0)}" x2="${ml + pw}" y2="${yMap(0)}" class="pnm-svg-axis"/>
      ${idealPath}${rsPath}
      <circle cx="${cx}" cy="${cy}" r="6" class="div-iv-dot"/>
      ${legend ? `<foreignObject x="${ml + 6}" y="${mt + 2}" width="${pw - 12}" height="22">
        <div xmlns="http://www.w3.org/1999/xhtml" class="div-iv-legend">${legend}</div>
      </foreignObject>` : ""}
      <text x="${ml + pw / 2}" y="${h - 2}" text-anchor="middle" class="pnm-svg-label">V<sub>D</sub>（V）</text>
      <text x="15" y="${mt + ph / 2}" text-anchor="middle" class="pnm-svg-label"
        transform="rotate(-90 15 ${mt + ph / 2})">I（${isSemilog ? "對數" : "A"}）</text>`;
  }

  function updateNote(root, r) {
    const note = root.querySelector("[data-note]");
    const text = root.querySelector("[data-note-text]");
    let level = "ok";
    let message;

    if (r.vd < -3 && r.rs === 0) {
      level = "warn";
      message = "反向偏壓 > 3 V：理想模型預測 I ≈ −I<sub>S</sub>（常數）。實際二極體中，空乏區產生電流與可能的崩潰效應會使反向電流更大；本模型未包含這些機制。";
    } else if (r.nVal > 1.7) {
      message = "n ≈ 2 表示空乏區產生–復合電流主導，常見於低順向偏壓或寬能隙材料。擴散電流（n = 1）在高偏壓時仍會成為主導。";
    } else if (r.rs > 10 && r.vd > 0.5) {
      message = "R<sub>S</sub> > 10 Ω：高順向偏壓下 I·R<sub>S</sub> 壓降顯著降低有效接面電壓，使 I–V 曲線偏離指數。功率元件中 R<sub>S</sub> 是關鍵設計參數。";
    } else if (r.vd > 0.7 && r.rs === 0) {
      message = "順向偏壓 > 0.7 V：電流呈指數增長。每增加 ~60 mV（n=1 時），電流增加約 10 倍——這就是 pn 接面的「60 mV/decade」規則。";
    } else if (r.vd < 0.05 && r.vd > -0.05) {
      message = "近零偏壓：I ≈ 0，二極體處於截止狀態。I–V 曲線在原點處斜率為 I<sub>S</sub>/(nV<sub>T</sub>)。";
    } else if (r.rs > 0 && r.iRs < r.iIdeal * 0.8 && r.vd > 0.5) {
      message = "串聯電阻使實際電流僅為理想值的 " + format(r.iRs / r.iIdeal * 100, 0) + "%。有效接面電壓 = V<sub>D</sub> − I·R<sub>S</sub> = " + format(r.vd - r.iRs * r.rs, 3) + " V。";
    } else if (r.vd > 0.05) {
      message = "正向偏壓：擴散電流主導，I ≈ I<sub>S</sub> exp(V<sub>D</sub>/(nV<sub>T</sub>))。動態電阻 r<sub>d</sub> = nV<sub>T</sub>/I，隨電流增大而降低。";
    } else {
      message = "反向偏壓：理想 Shockley 模型預測 I → −I<sub>S</sub>（飽和）。實際元件中需考慮產生–復合與崩潰效應。";
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

  function formatCurrent(value) {
    if (!Number.isFinite(value)) return "—";
    const abs = Math.abs(value);
    if (abs >= 1) return format(value, 3) + " A";
    if (abs >= 1e-3) return format(value * 1e3, 2) + " mA";
    if (abs >= 1e-6) return format(value * 1e6, 2) + " µA";
    if (abs >= 1e-9) return format(value * 1e9, 2) + " nA";
    if (abs >= 1e-12) return format(value * 1e12, 2) + " pA";
    return format(value * 1e15, 2) + " fA";
  }

  function formatResistance(value) {
    if (!Number.isFinite(value)) return "∞";
    if (value >= 1e6) return format(value / 1e6, 1) + " MΩ";
    if (value >= 1e3) return format(value / 1e3, 1) + " kΩ";
    return format(value, 1) + " Ω";
  }

  function formatPower(value) {
    if (!Number.isFinite(value)) return "—";
    if (value >= 1) return format(value, 3) + " W";
    if (value >= 1e-3) return format(value * 1e3, 2) + " mW";
    if (value >= 1e-6) return format(value * 1e6, 2) + " µW";
    return format(value * 1e9, 2) + " nW";
  }

  function tickValues(min, max, count) {
    return Array.from({ length: count }, (_, i) => min + (max - min) * i / (count - 1));
  }
})();
