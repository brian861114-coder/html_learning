(() => {
  "use strict";

  const q = 1.602176634e-19;
  const eps0 = 8.8541878128e-14;
  const epsSi = 11.7 * eps0;
  const epsOx = 3.9 * eps0;
  const kEv = 8.617333262e-5;

  setupDisclosure("mos-cv");
  document.querySelectorAll("[data-mos-cv-model]").forEach(init);

  function setupDisclosure(key) {
    document.querySelectorAll(`[data-dm-disclosure="${key}"]`).forEach((details) => {
      try { details.open = localStorage.getItem(`deviceModel:${key}`) === "true"; } catch (_) {}
      details.addEventListener("toggle", () => {
        try { localStorage.setItem(`deviceModel:${key}`, String(details.open)); } catch (_) {}
      });
    });
  }

  function init(root) {
    root.classList.add("dm");
    root.innerHTML = `
      <div class="dm-shell">
        <aside class="dm-panel" aria-label="MOS C-V 模型參數">
          <h3>模型參數</h3>
          ${range("vg", "閘極電壓 V_G", -3, 3, .05, .4, "V")}
          ${range("na", "基板摻雜 N_A", 14, 18, .1, 16, "log")}
          ${range("tox", "氧化層厚度 t_ox", 2, 50, 1, 10, "nm")}
          ${range("vfb", "平帶電壓 V_FB", -1, 1, .05, 0, "V")}
          ${range("temp", "溫度 T", 250, 400, 5, 300, "K")}
          <div class="dm-control">
            <label for="moscv-frequency"><span>小訊號頻率極限</span></label>
            <select id="moscv-frequency" data-input="frequency">
              <option value="high">高頻：反轉載子來不及響應</option>
              <option value="low">低頻：反轉載子可響應</option>
            </select>
          </div>
          <div class="dm-presets">
            <button type="button" data-preset="acc">累積區</button>
            <button type="button" data-preset="dep">空乏區</button>
            <button type="button" data-preset="inv">反轉區</button>
          </div>
        </aside>
        <div>
          <div class="dm-visual">
            <div class="dm-status" aria-live="polite">
              <span>表面狀態：<strong data-status>—</strong></span>
              <span>量測模式：<strong data-frequency>—</strong></span>
            </div>
            <figure class="dm-figure">
              <figcaption>MOS 能帶彎曲與表面狀態</figcaption>
              <svg data-band viewBox="0 0 760 235" role="img" aria-label="MOS 電容能帶示意圖"></svg>
            </figure>
            <figure class="dm-figure">
              <figcaption>理想高頻／低頻 C–V 曲線</figcaption>
              <svg data-cv viewBox="0 0 760 255" role="img" aria-label="MOS 電容電壓曲線"></svg>
            </figure>
          </div>
          <div class="dm-cards">
            ${card("cox", "氧化層電容密度 C′_ox")}
            ${card("cap", "目前電容密度 C′")}
            ${card("ratio", "正規化電容 C/C_ox")}
            ${card("phi", "費米位能 φ_F")}
            ${card("vt", "臨界電壓 V_T")}
            ${card("wd", "空乏寬度 W_d")}
          </div>
          <div class="dm-note" data-note role="status"><strong>模型判讀：</strong><span data-note-text></span></div>
          <details class="dm-equations">
            <summary>方程式、邊界與適用範圍</summary>
            <ul>
              <li>理想 Si/SiO₂、p 型均勻基板、一維、準靜態、非退化且完全游離。</li>
              <li>C′_ox=ε_ox/t_ox；空乏區採 C′=(C′_ox C′_d)/(C′_ox+C′_d)。</li>
              <li>以 V_G−V_FB=ψ_s+√(2qε_sN_Aψ_s)/C′_ox 求空乏區表面位能。</li>
              <li>強反轉後令 ψ_s≈2φ_F；低頻 C→C_ox，高頻 C→C_min。</li>
              <li>未包含界面態、固定氧化層電荷、深空乏、量子修正與多晶矽空乏。</li>
            </ul>
          </details>
        </div>
      </div>`;

    const controls = Object.fromEntries(
      ["vg", "na", "tox", "vfb", "temp", "frequency"].map((name) =>
        [name, root.querySelector(`[data-input="${name}"]`)])
    );
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(root, controls));
    };
    Object.values(controls).forEach((control) => control.addEventListener("input", schedule));
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      const preset = button.dataset.preset;
      controls.vg.value = preset === "acc" ? -2 : preset === "dep" ? .4 : 2;
      schedule();
    }));
    update(root, controls);
  }

  function range(name, label, min, max, step, value, unit) {
    return `<div class="dm-control">
      <label for="moscv-${name}"><span>${label}</span><output data-output="${name}">—</output></label>
      <input id="moscv-${name}" data-input="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
      <small>${unit === "log" ? "對數刻度，單位 cm⁻³" : `單位：${unit}`}</small>
    </div>`;
  }

  function card(name, label) {
    return `<div class="dm-card"><span>${label}</span><strong data-card="${name}">—</strong></div>`;
  }

  function parameters(controls) {
    const vg = Number(controls.vg.value);
    const na = 10 ** Number(controls.na.value);
    const toxNm = Number(controls.tox.value);
    const vfb = Number(controls.vfb.value);
    const temp = Number(controls.temp.value);
    const frequency = controls.frequency.value;
    const vtThermal = kEv * temp;
    const ni = 1e10 * (temp / 300) ** 1.5 *
      Math.exp((-1.12 / (2 * kEv)) * (1 / temp - 1 / 300));
    const phiF = Math.max(0.001, vtThermal * Math.log(na / ni));
    const cox = epsOx / (toxNm * 1e-7);
    const wdMax = Math.sqrt(4 * epsSi * phiF / (q * na));
    const cdMin = epsSi / wdMax;
    const cmin = cox * cdMin / (cox + cdMin);
    const threshold = vfb + 2 * phiF + Math.sqrt(4 * q * epsSi * na * phiF) / cox;
    return { vg, na, toxNm, vfb, temp, frequency, phiF, cox, wdMax, cmin, threshold };
  }

  function cvAt(vg, p, frequency = p.frequency) {
    if (vg <= p.vfb) return { cap: p.cox, psi: Math.max(-1, vg - p.vfb), wd: 0, regime: "累積" };
    if (vg < p.threshold) {
      const a = Math.sqrt(2 * q * epsSi * p.na) / p.cox;
      const y = Math.max(0, (-a + Math.sqrt(a * a + 4 * (vg - p.vfb))) / 2);
      const psi = Math.min(2 * p.phiF, y * y);
      const wd = Math.sqrt(2 * epsSi * Math.max(psi, 1e-8) / (q * p.na));
      const cd = epsSi / wd;
      return { cap: p.cox * cd / (p.cox + cd), psi, wd, regime: "空乏" };
    }
    return {
      cap: frequency === "low" ? p.cox : p.cmin,
      psi: 2 * p.phiF,
      wd: p.wdMax,
      regime: "強反轉"
    };
  }

  function update(root, controls) {
    const p = parameters(controls);
    const point = cvAt(p.vg, p);
    out(root, "vg", `${fmt(p.vg, 2)} V`);
    out(root, "na", `10${sup(Number(controls.na.value))} cm⁻³`);
    out(root, "tox", `${p.toxNm.toFixed(0)} nm`);
    out(root, "vfb", `${fmt(p.vfb, 2)} V`);
    out(root, "temp", `${p.temp.toFixed(0)} K`);
    root.querySelector("[data-status]").textContent = point.regime;
    root.querySelector("[data-frequency]").textContent = p.frequency === "high" ? "高頻" : "低頻";
    setCard(root, "cox", `${fmt(p.cox * 1e9, 2)} nF/cm²`);
    setCard(root, "cap", `${fmt(point.cap * 1e9, 2)} nF/cm²`);
    setCard(root, "ratio", fmt(point.cap / p.cox, 3));
    setCard(root, "phi", `${fmt(p.phiF, 3)} V`);
    setCard(root, "vt", `${fmt(p.threshold, 3)} V`);
    setCard(root, "wd", point.wd ? `${fmt(point.wd * 1e4, 3)} µm` : "≈ 0");
    drawBand(root.querySelector("[data-band]"), p, point);
    drawCV(root.querySelector("[data-cv]"), p, point);
    updateNote(root, p, point);
  }

  function drawBand(svg, p, point) {
    const left = 205;
    const right = 720;
    const yMid = 118;
    const bend = -point.psi * 68;
    const curve = (offset) => {
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const x = left + (right - left) * t;
        const y = yMid + offset + bend * Math.exp(-t * 4.2);
        pts.push(`${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`);
      }
      return pts.join(" ");
    };
    const charge = point.regime === "累積" ? "表面電洞累積" :
      point.regime === "空乏" ? "受體離子形成空乏層" : "電子反轉層形成";
    svg.innerHTML = `
      <rect x="28" y="28" width="82" height="170" rx="8" fill="var(--b3)" stroke="var(--bd)"/>
      <rect x="110" y="28" width="62" height="170" fill="var(--bg)" stroke="var(--bd)"/>
      <rect x="${left}" y="28" width="${right-left}" height="170" rx="8" fill="var(--b2)" stroke="var(--bd)"/>
      <text x="69" y="50" text-anchor="middle" class="dm-svg-title">閘極</text>
      <text x="141" y="50" text-anchor="middle" class="dm-svg-title">SiO₂</text>
      <text x="${left+18}" y="50" class="dm-svg-title">p 型 Si</text>
      <path d="${curve(-55)}" class="dm-svg-curve"/>
      <path d="${curve(0)}" class="dm-svg-curve-secondary"/>
      <path d="${curve(55)}" class="dm-svg-curve"/>
      <line x1="${left}" y1="${yMid}" x2="${right}" y2="${yMid}" stroke="var(--t2)" stroke-dasharray="4 4"/>
      <text x="${right-8}" y="${yMid-61}" text-anchor="end" class="dm-svg-label">E_c</text>
      <text x="${right-8}" y="${yMid-6}" text-anchor="end" class="dm-svg-label">E_i</text>
      <text x="${right-8}" y="${yMid+49}" text-anchor="end" class="dm-svg-label">E_v</text>
      <text x="${left+15}" y="188" class="dm-svg-title">${charge}</text>
      <text x="69" y="178" text-anchor="middle" class="dm-svg-label">V_G=${fmt(p.vg,2)} V</text>`;
    svg.setAttribute("aria-label", `${point.regime}狀態的 MOS 能帶，表面位能 ${fmt(point.psi, 3)} 伏特`);
  }

  function drawCV(svg, p, point) {
    const w = 760, h = 255, m = { l: 72, r: 22, t: 20, b: 45 };
    const pw = w - m.l - m.r, ph = h - m.t - m.b;
    const xm = (v) => m.l + (v + 3) / 6 * pw;
    const ym = (ratio) => m.t + (1.08 - ratio) / 1.08 * ph;
    const high = [], low = [];
    for (let i = 0; i <= 160; i++) {
      const v = -3 + 6 * i / 160;
      high.push([v, cvAt(v, p, "high").cap / p.cox]);
      low.push([v, cvAt(v, p, "low").cap / p.cox]);
    }
    const path = (arr) => arr.map(([x,y],i)=>`${i?"L":"M"}${xm(x).toFixed(1)},${ym(y).toFixed(1)}`).join(" ");
    const xTicks = [-3,-2,-1,0,1,2,3];
    const yTicks = [0,.25,.5,.75,1];
    svg.innerHTML = `
      ${xTicks.map(v=>`<line x1="${xm(v)}" y1="${m.t}" x2="${xm(v)}" y2="${m.t+ph}" class="dm-svg-grid"/>
        <text x="${xm(v)}" y="${h-20}" text-anchor="middle" class="dm-svg-label">${v}</text>`).join("")}
      ${yTicks.map(v=>`<line x1="${m.l}" y1="${ym(v)}" x2="${m.l+pw}" y2="${ym(v)}" class="dm-svg-grid"/>
        <text x="${m.l-10}" y="${ym(v)+4}" text-anchor="end" class="dm-svg-label">${v}</text>`).join("")}
      <line x1="${m.l}" y1="${m.t+ph}" x2="${m.l+pw}" y2="${m.t+ph}" class="dm-svg-axis"/>
      <path d="${path(low)}" class="dm-svg-curve-secondary"/>
      <path d="${path(high)}" class="dm-svg-curve"/>
      <circle cx="${xm(p.vg)}" cy="${ym(point.cap/p.cox)}" r="6" class="dm-svg-point"/>
      <text x="${m.l+pw-8}" y="37" text-anchor="end" class="dm-svg-label">實線：高頻　虛線：低頻</text>
      <text x="${m.l+pw/2}" y="${h-2}" text-anchor="middle" class="dm-svg-label">V_G（V）</text>
      <text x="17" y="${m.t+ph/2}" text-anchor="middle" class="dm-svg-label" transform="rotate(-90 17 ${m.t+ph/2})">C/C_ox</text>`;
  }

  function updateNote(root, p, point) {
    const note = root.querySelector("[data-note]");
    const text = root.querySelector("[data-note-text]");
    let level = "ok";
    let message;
    if (p.na >= 1e18 || p.toxNm <= 3) {
      level = "warn";
      message = "高摻雜或極薄氧化層下，非退化、古典電荷片與忽略量子侷限的假設需要重新檢查。";
    } else if (point.regime === "累積") {
      message = "多數載子電洞聚集在界面，小訊號主要跨越氧化層，因此 C 接近 C_ox。";
    } else if (point.regime === "空乏") {
      message = "空乏層加寬使 C_d 下降；C_ox 與 C_d 串聯，因此總電容隨正閘極電壓下降。";
    } else if (p.frequency === "high") {
      message = "高頻下少數載子來不及跟隨 AC，空乏寬度停在最大值，電容維持 C_min。";
    } else {
      message = "低頻下反轉層電子能跟隨 AC，微分電荷再次靠近界面，因此電容回升至 C_ox。";
    }
    note.dataset.level = level;
    text.textContent = message;
  }

  function out(root, name, value) { root.querySelector(`[data-output="${name}"]`).textContent = value; }
  function setCard(root, name, value) { root.querySelector(`[data-card="${name}"]`).textContent = value; }
  function fmt(value, digits) {
    return Number(value).toLocaleString("zh-TW", { maximumFractionDigits: digits });
  }
  function sup(value) {
    const map = {"-":"⁻",".":"·",0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
    return value.toFixed(Number.isInteger(value) ? 0 : 1).split("").map(c=>map[c]??c).join("");
  }
})();
