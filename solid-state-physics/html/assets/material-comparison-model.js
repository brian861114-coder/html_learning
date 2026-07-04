(() => {
  "use strict";

  const MATERIALS = {
    Si: {
      name: "Si (矽)", Eg: 1.12, muN: 1350, vsat: 1.0e7, Ecrit: 3e5,
      kappa: 1.5, epsR: 11.7, color: "#1874c9",
      desc: "主流 IC 材料，成本最低、製程最成熟。間接能隙限制光電應用，中等耐壓。"
    },
    GaAs: {
      name: "GaAs (砷化鎵)", Eg: 1.42, muN: 8500, vsat: 1.3e7, Ecrit: 4e5,
      kappa: 0.55, epsR: 13.1, color: "#c7601b",
      desc: "直接能隙、高遷移率。RF/微波首選，但熱導率低、成本高、無自然氧化層。"
    },
    "4H-SiC": {
      name: "4H-SiC (碳化矽)", Eg: 3.26, muN: 900, vsat: 2.0e7, Ecrit: 2.5e6,
      kappa: 3.7, epsR: 9.7, color: "#2e8b57",
      desc: "寬能隙、高崩潰電場、高熱導率。電動車逆變器與電源轉換的理想材料。"
    },
    GaN: {
      name: "GaN (氮化鎵)", Eg: 3.39, muN: 1500, vsat: 2.5e7, Ecrit: 3.3e6,
      kappa: 1.3, epsR: 9.0, color: "#8b2252",
      desc: "最高頻率潛力、高崩潰電場。5G基地台、快充與雷達的關鍵材料。"
    }
  };

  const APPS = {
    "high-voltage": {
      label: "高壓轉換器 (EV/電網)",
      rec: ["4H-SiC", "GaN"],
      reason: "寬能隙提供高 Ecrit，大幅降低導通損耗與散熱需求。"
    },
    "rf-amp": {
      label: "RF 功率放大器 (5G/雷達)",
      rec: ["GaN", "GaAs"],
      reason: "高 vsat 與高 Ecrit 使 GaN 成為高頻高功率首選；GaAs 在中功率低雜訊場合仍具優勢。"
    },
    "low-cost": {
      label: "低成本數位 IC",
      rec: ["Si"],
      reason: "Si 製程成熟度、晶圓成本與整合密度遠優於其他材料，是數位邏輯的唯一實際選擇。"
    },
    "led": {
      label: "LED / 光電元件",
      rec: ["GaAs", "GaN"],
      reason: "直接能隙為發光必要條件；GaN 用於藍光/白光 LED，GaAs 用於紅外 LED。"
    },
    "high-temp": {
      label: "高溫電子 (>300°C)",
      rec: ["4H-SiC", "GaN"],
      reason: "寬能隙使本徵載子濃度在高温下保持極低，元件可在 >300°C 正常操作。"
    },
    "low-noise": {
      label: "低雜訊放大器 (LNA)",
      rec: ["GaAs"],
      reason: "GaAs 的高遷移率與低雜訊特性使其在微波低雜訊放大中無可替代。"
    }
  };

  document.querySelectorAll("[data-matcomp-disclosure]").forEach((details) => {
    try { details.open = localStorage.getItem("matcompExpanded") === "true"; } catch (_) {}
    details.addEventListener("toggle", () => {
      try { localStorage.setItem("matcompExpanded", String(details.open)); } catch (_) {}
    });
  });

  document.querySelectorAll("[data-matcomp-model]").forEach(initModel);

  function initModel(root) {
    root.classList.add("pnm");

    const paramKeys = ["Eg", "muN", "vsat", "Ecrit", "kappa", "epsR"];
    const paramLabels = {
      Eg: "能隙 E<sub>g</sub> (eV)",
      muN: "電子遷移率 μ<sub>n</sub> (cm²/V·s)",
      vsat: "飽和速度 v<sub>sat</sub> (10⁷ cm/s)",
      Ecrit: "臨界崩潰電場 E<sub>crit</sub> (MV/cm)",
      kappa: "熱導率 κ (W/cm·K)",
      epsR: "相對介電常數 ε<sub>r</sub>"
    };
    const paramFormatters = {
      Eg: (v) => format(v, 2),
      muN: (v) => format(v, 0),
      vsat: (v) => format(v / 1e7, 1),
      Ecrit: (v) => format(v / 1e6, 1),
      kappa: (v) => format(v, 1),
      epsR: (v) => format(v, 1)
    };

    const matKeys = Object.keys(MATERIALS);
    const buildMaterialToggles = () => matKeys.map((k) => {
      const m = MATERIALS[k];
      return `<button type="button" data-mat="${k}" aria-pressed="true"
        style="border-left:3px solid ${m.color}">${m.name.split(" ")[0]}</button>`;
    }).join("");

    const buildParamSelector = () => {
      return paramKeys.map((pk, i) =>
        `<button type="button" data-param="${pk}" ${i === 0 ? 'aria-pressed="true"' : ""}
          style="font-size:0.75rem">${paramLabels[pk].replace(/<[^>]+>/g, "")}</button>`
      ).join("");
    };

    const buildAppButtons = () => Object.entries(APPS).map(([id, a]) =>
      `<button type="button" class="mcm-app-btn" data-app="${id}">
        ${a.label}<small>推薦：${a.rec.join("、")}</small></button>`
    ).join("");

    root.innerHTML = `
      <div class="pnm-shell">
        <aside class="pnm-panel" aria-label="材料比較模型參數">
          <h3>選擇材料</h3>
          <div class="mcm-check-grid" data-mat-toggles>${buildMaterialToggles()}</div>
          <h3 style="margin-top:18px">比較參數</h3>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px" data-param-selector>
            ${buildParamSelector()}
          </div>
          <div class="pnm-control" style="margin-top:10px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem">
              <input type="checkbox" data-log-scale style="width:18px;height:18px;accent-color:var(--ac)">
              對數尺度
            </label>
          </div>
          <div style="margin-top:12px">
            <strong style="font-size:0.82rem">選擇應用需求</strong>
            <div class="mcm-app-grid">${buildAppButtons()}</div>
          </div>
        </aside>
        <div>
          <div class="pnm-visual">
            <div class="pnm-status" aria-live="polite">
              <span>參數：<strong data-param-name>能隙</strong></span>
              <span>尺度：<strong data-scale-name>線性</strong></span>
            </div>
            <div class="mcm-bar-wrap">
              <svg class="mcm-bar" data-bar viewBox="0 0 540 200"
                role="img" aria-label="材料參數比較長條圖"></svg>
            </div>
            ${fomChart()}
          </div>
          <div class="mcm-table-wrap">
            <table class="mcm-table" data-table>
              <thead><tr><th>參數</th>${matKeys.map(k => `<th>${MATERIALS[k].name}</th>`).join("")}</tr></thead>
              <tbody data-table-body></tbody>
            </table>
          </div>
          <div class="mcm-card-grid" data-cards></div>
          <div class="pnm-note" data-note role="status">
            <strong>模型判讀：</strong><span data-note-text></span>
          </div>
          <details>
            <summary>公式、假設與適用範圍</summary>
            <div>
              <p><strong>Baliga FOM：</strong> BFOM = ε<sub>r</sub> · μ<sub>n</sub> · E<sub>crit</sub><sup>3</sup>（正規化至 Si=1）。
                衡量材料在高壓低頻功率轉換中的潛力；E<sub>crit</sub> 的三次方使寬能隙材料大幅領先。</p>
              <p><strong>Johnson FOM：</strong> JFOM = E<sub>crit</sub><sup>2</sup> · v<sub>sat</sub><sup>2</sup>（正規化至 Si=1）。
                衡量高頻功率能力；結合崩潰電場與載子速度。</p>
              <ul>
                <li>FOM 僅反映材料層級潛力，不等於實際元件性能（製程、封裝、熱管理均未計入）。</li>
                <li>所有數值為 300 K 典型值（約值），實際值因摻雜、晶向與量測方法而異。</li>
                <li>遷移率為低場電子遷移率；電洞遷移率通常低 2–4 倍。</li>
                <li>本模型不包含成本、良率、可靠度與製程成熟度之量化比較。</li>
              </ul>
              <p><strong>單位檢查：</strong> BFOM 與 JFOM 均為無因次比值（除以 Si 參考值）。</p>
            </div>
          </details>
        </div>
      </div>`;

    let selectedMats = new Set(matKeys);
    let selectedParam = "Eg";
    let logScale = false;

    root.querySelectorAll("[data-mat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.mat;
        if (selectedMats.has(key)) selectedMats.delete(key);
        else selectedMats.add(key);
        btn.setAttribute("aria-pressed", String(selectedMats.has(key)));
        render();
      });
    });

    root.querySelectorAll("[data-param]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedParam = btn.dataset.param;
        root.querySelectorAll("[data-param]").forEach(b =>
          b.setAttribute("aria-pressed", String(b === btn)));
        render();
      });
    });

    const logCheck = root.querySelector("[data-log-scale]");
    logCheck.addEventListener("change", () => {
      logScale = logCheck.checked;
      render();
    });

    root.querySelectorAll("[data-app]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const app = APPS[btn.dataset.app];
        root.querySelectorAll("[data-app]").forEach(b =>
          b.setAttribute("aria-pressed", String(b === btn)));
        // Highlight recommended materials
        selectedMats = new Set(app.rec);
        root.querySelectorAll("[data-mat]").forEach((mb) => {
          mb.setAttribute("aria-pressed", String(selectedMats.has(mb.dataset.mat)));
        });
        updateNote(root, `應用推薦：${app.label}——${app.reason}`, "ok");
        selectedParam = "Ecrit"; // Default to most relevant param
        root.querySelectorAll("[data-param]").forEach(b =>
          b.setAttribute("aria-pressed", String(b.dataset.param === selectedParam)));
        render();
      });
    });

    function render() {
      drawBar(root.querySelector("[data-bar]"), selectedMats, selectedParam, logScale);
      drawFOM(root.querySelector("[data-fom]"), selectedMats);
      updateTable(root, selectedMats);
      updateCards(root, selectedMats);
      root.querySelector("[data-param-name]").innerHTML = paramLabels[selectedParam];
      root.querySelector("[data-scale-name]").textContent = logScale ? "對數" : "線性";
    }

    function updateNote(root, msg, level) {
      const note = root.querySelector("[data-note]");
      const text = root.querySelector("[data-note-text]");
      if (msg) {
        note.dataset.level = level || "ok";
        text.innerHTML = msg;
      } else {
        note.dataset.level = "ok";
        text.innerHTML = "勾選材料、切換參數，比較不同半導體在高壓、高頻、高溫應用中的材料潛力。點選應用需求可獲得材料推薦。";
      }
    }

    render();
  }

  function drawBar(svg, mats, param, logScale) {
    const w = 540, h = 200, ml = 64, mr = 16, mt = 14, mb = 40;
    const pw = w - ml - mr, ph = h - mt - mb;
    const matList = [...mats].filter(k => MATERIALS[k]);
    if (!matList.length) { svg.innerHTML = ""; return; }

    const values = matList.map(k => MATERIALS[k][param]);
    let vMin = Math.min(...values);
    let vMax = Math.max(...values);

    if (logScale) {
      vMin = Math.max(vMin, vMax / 1e4);
      vMax = vMax * 1.2;
    } else {
      const pad = (vMax - vMin) * 0.15 || vMax * 0.1;
      vMin = Math.max(0, vMin - pad);
      vMax = vMax + pad;
    }

    const yMap = (v) => {
      if (logScale) {
        return mt + (Math.log10(vMax) - Math.log10(Math.max(v, vMin))) /
          (Math.log10(vMax) - Math.log10(vMin)) * ph;
      }
      return mt + (vMax - v) / (vMax - vMin) * ph;
    };

    const barW = Math.min(80, (pw - 20) / matList.length - 8);
    const labels = { Eg: "eV", muN: "cm²/V·s", vsat: "cm/s", Ecrit: "V/cm", kappa: "W/cm·K", epsR: "" };
    const formatters = {
      Eg: (v) => format(v, 2) + " eV",
      muN: (v) => format(v, 0),
      vsat: (v) => format(v / 1e7, 1) + "×10⁷",
      Ecrit: (v) => format(v / 1e6, 1) + " MV/cm",
      kappa: (v) => format(v, 1),
      epsR: (v) => format(v, 1)
    };

    // Grid
    let grid = "";
    const nGrid = 4;
    for (let i = 0; i <= nGrid; i++) {
      const val = logScale ? vMin * (vMax / vMin) ** (i / nGrid) : vMin + (vMax - vMin) * i / nGrid;
      const y = yMap(val);
      grid += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>
        <text x="${ml - 8}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">${(formatters[param] || String)(val)}</text>`;
    }

    let bars = "";
    matList.forEach((k, i) => {
      const m = MATERIALS[k];
      const v = m[param];
      const x = ml + 10 + (pw / matList.length) * (i + 0.5) - barW / 2;
      const y = yMap(v);
      const bh = mt + ph - y;
      bars += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(1, bh)}" rx="4" fill="${m.color}" opacity="0.85"/>
        <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" class="pnm-svg-title" fill="${m.color}">${(formatters[param] || String)(v)}</text>
        <text x="${x + barW / 2}" y="${h - 8}" text-anchor="middle" class="pnm-svg-label">${m.name.split(" ")[0]}</text>`;
    });

    svg.innerHTML = `
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      <line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      ${grid}${bars}`;
  }

  function drawFOM(svg, mats) {
    const w = 540, h = 200, ml = 72, mr = 16, mt = 14, mb = 40;
    const pw = w - ml - mr, ph = h - mt - mb;
    const matList = [...mats].filter(k => MATERIALS[k]);
    if (!matList.length) { svg.innerHTML = ""; return; }

    const si = MATERIALS["Si"];
    const siBFOM = si.epsR * si.muN * si.Ecrit ** 3;
    const siJFOM = si.Ecrit ** 2 * si.vsat ** 2;

    const groups = [
      { label: "BFOM", values: matList.map(k => MATERIALS[k].epsR * MATERIALS[k].muN * MATERIALS[k].Ecrit ** 3 / siBFOM) },
      { label: "JFOM", values: matList.map(k => MATERIALS[k].Ecrit ** 2 * MATERIALS[k].vsat ** 2 / siJFOM) }
    ];

    const allVals = groups.flatMap(g => g.values);
    const vMax = Math.max(...allVals) * 1.15;
    const yMap = (v) => mt + (vMax - v) / vMax * ph;

    let grid = "";
    for (let i = 0; i <= 4; i++) {
      const val = vMax * i / 4;
      const y = yMap(val);
      grid += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" class="pnm-svg-grid"/>
        <text x="${ml - 8}" y="${y + 4}" text-anchor="end" class="pnm-svg-label">×${format(val, 0)}</text>`;
    }

    const groupW = (pw - 30) / 2;
    const barW = Math.min(40, (groupW - 10) / matList.length - 4);

    let bars = "";
    groups.forEach((g, gi) => {
      const gx = ml + 10 + gi * (groupW + 10);
      // Group label
      bars += `<text x="${gx + groupW / 2}" y="${mt - 2}" text-anchor="middle" class="pnm-svg-title">${g.label}</text>`;
      g.values.forEach((val, i) => {
        const m = MATERIALS[matList[i]];
        const x = gx + (groupW / matList.length) * (i + 0.5) - barW / 2;
        const y = yMap(val);
        bars += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(1, mt + ph - y)}" rx="3" fill="${m.color}" opacity="0.85"/>
          <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" class="pnm-svg-label" fill="${m.color}">×${format(val, 0)}</text>
          <text x="${x + barW / 2}" y="${h - 8}" text-anchor="middle" class="pnm-svg-label" font-size="9">${m.name.split(" ")[0]}</text>`;
      });
    });

    svg.innerHTML = `
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      <line x1="${ml}" y1="${mt + ph}" x2="${ml + pw}" y2="${mt + ph}" stroke="var(--t2)" stroke-width="1"/>
      ${grid}${bars}
      <text x="${ml + pw / 2}" y="${h - 2}" text-anchor="middle" class="pnm-svg-label">Figure of Merit（正規化至 Si = 1）</text>`;
    svg.setAttribute("aria-label", "Baliga 與 Johnson figure of merit 比較");
  }

  function fomChart() {
    return `<figure class="pnm-chart">
      <figcaption>Figure of Merit 比較（正規化至 Si = 1）</figcaption>
      <svg data-fom viewBox="0 0 540 200" role="img" aria-label="FOM 比較"></svg>
    </figure>`;
  }

  function updateTable(root, mats) {
    const tbody = root.querySelector("[data-table-body]");
    const matList = [...mats].filter(k => MATERIALS[k]);
    if (!matList.length) { tbody.innerHTML = ""; return; }

    const rows = [
      { label: "能隙 E<sub>g</sub>", unit: "eV", key: "Eg", fmt: (v) => format(v, 2) },
      { label: "μ<sub>n</sub>", unit: "cm²/V·s", key: "muN", fmt: (v) => format(v, 0) },
      { label: "v<sub>sat</sub>", unit: "10⁷ cm/s", key: "vsat", fmt: (v) => format(v / 1e7, 1) },
      { label: "E<sub>crit</sub>", unit: "MV/cm", key: "Ecrit", fmt: (v) => format(v / 1e6, 1) },
      { label: "熱導率 κ", unit: "W/cm·K", key: "kappa", fmt: (v) => format(v, 1) },
      { label: "ε<sub>r</sub>", unit: "", key: "epsR", fmt: (v) => format(v, 1) },
      { label: "BFOM (vs Si)", unit: "", key: "bfom", fmt: (v) => "×" + format(v, 0) },
      { label: "JFOM (vs Si)", unit: "", key: "jfom", fmt: (v) => "×" + format(v, 0) },
    ];

    const si = MATERIALS["Si"];
    const siBFOM = si.epsR * si.muN * si.Ecrit ** 3;
    const siJFOM = si.Ecrit ** 2 * si.vsat ** 2;

    tbody.innerHTML = rows.map(r => {
      const cells = matList.map(k => {
        const m = MATERIALS[k];
        let val;
        if (r.key === "bfom") val = m.epsR * m.muN * m.Ecrit ** 3 / siBFOM;
        else if (r.key === "jfom") val = m.Ecrit ** 2 * m.vsat ** 2 / siJFOM;
        else val = m[r.key];
        const cls = k === "Si" ? ' class="si-col"' : "";
        return `<td${cls}>${r.fmt(val)}</td>`;
      }).join("");
      return `<tr><td style="text-align:left;font-weight:600">${r.label}</td>${cells}</tr>`;
    }).join("");
    tbody.innerHTML += `<tr><td colspan="${matList.length + 1}" style="font-size:0.7rem;color:var(--t2);padding:6px">
      ※ 300 K 典型值（約值）。BFOM/JFOM 正規化至 Si = 1。FOM 僅為材料級指標。</td></tr>`;
  }

  function updateCards(root, mats) {
    const container = root.querySelector("[data-cards]");
    const matList = [...mats].filter(k => MATERIALS[k]);
    container.innerHTML = matList.map(k => {
      const m = MATERIALS[k];
      return `<div class="mcm-card" style="border-left:3px solid ${m.color}">
        <h4 style="color:${m.color}">${m.name}</h4>
        <p style="font-size:0.78rem;color:var(--t2);margin:0">${m.desc}</p>
        <ul>${buildCardBullets(k, m)}</ul>
      </div>`;
    }).join("");
  }

  function buildCardBullets(key, m) {
    const bullets = [];
    if (m.Eg > 3) bullets.push("寬能隙 → 高溫、高壓操作");
    else if (m.Eg < 1.5) bullets.push("窄/中能隙 → 室溫主流");
    if (m.muN > 5000) bullets.push("高遷移率 → 高頻優勢");
    if (m.Ecrit > 2e6) bullets.push("超高 E<sub>crit</sub> → 功率密度領先");
    if (m.kappa > 3) bullets.push("高熱導率 → 優異散熱");
    if (m.kappa < 1) bullets.push("低熱導率 → 需外加散熱方案");
    if (key === "Si") bullets.push("製程成熟、12 吋晶圓、低成本");
    if (key === "GaAs") bullets.push("無自然氧化層 → 需替代閘極介質");
    return bullets.map(b => `<li>${b}</li>`).join("");
  }

  function format(value, digits) {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }
})();
