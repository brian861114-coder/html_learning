(() => {
  "use strict";

  setupDisclosure("mos-channel");
  document.querySelectorAll("[data-mos-channel-model]").forEach(init);

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
        <aside class="dm-panel" aria-label="MOSFET 通道模型參數">
          <h3>模型參數</h3>
          ${range("vgs", "閘源電壓 V_GS", 0, 3.5, .05, 2, "V")}
          ${range("vds", "汲源電壓 V_DS", 0, 3.5, .05, .5, "V")}
          ${range("vt", "臨界電壓 V_T", .2, 1.2, .05, .6, "V")}
          ${range("beta", "β=μC_ox(W/L)", 50, 1000, 10, 300, "µA/V²")}
          ${range("lambda", "通道長度調變 λ", 0, .15, .005, .02, "V⁻¹")}
          <div class="dm-presets">
            <button type="button" data-preset="cutoff">截止</button>
            <button type="button" data-preset="linear">線性區</button>
            <button type="button" data-preset="sat">飽和／夾止</button>
          </div>
        </aside>
        <div>
          <div class="dm-visual">
            <div class="dm-status" aria-live="polite">
              <span>工作區域：<strong data-status>—</strong></span>
              <span>通道條件：<strong data-condition>—</strong></span>
            </div>
            <figure class="dm-figure">
              <figcaption>沿通道反轉電荷與夾止位置</figcaption>
              <svg data-channel viewBox="0 0 760 245" role="img" aria-label="MOSFET 通道剖面"></svg>
            </figure>
            <figure class="dm-figure">
              <figcaption>長通道 MOSFET 輸出特性</figcaption>
              <svg data-output-chart viewBox="0 0 760 265" role="img" aria-label="MOSFET 汲極電流對汲源電壓曲線"></svg>
            </figure>
          </div>
          <div class="dm-cards">
            ${card("id", "汲極電流 I_D")}
            ${card("gm", "跨導 g_m")}
            ${card("vov", "過驅動 V_OV")}
            ${card("vdsat", "理想飽和電壓 V_DS,sat")}
            ${card("qsource", "源極端相對電荷")}
            ${card("qdrain", "汲極端相對電荷")}
          </div>
          <div class="dm-note" data-note role="status"><strong>模型判讀：</strong><span data-note-text></span></div>
          <details class="dm-equations">
            <summary>方程式、邊界與適用範圍</summary>
            <ul>
              <li>長通道、強反轉、漸變通道、電荷片、常數遷移率與低橫向電場。</li>
              <li>Q_i(x)=−C_ox[V_GS−V_T−V(x)]，邊界 V(0)=0、V(L)=V_DS。</li>
              <li>線性區 I_D=β[(V_OV)V_DS−V_DS²/2]；飽和區 I_D=βV_OV²/2。</li>
              <li>λ 只作一階通道長度調變；未包含速度飽和、DIBL、串聯電阻與次臨界電流。</li>
            </ul>
          </details>
        </div>
      </div>`;

    const controls = Object.fromEntries(["vgs","vds","vt","beta","lambda"].map(
      name => [name, root.querySelector(`[data-input="${name}"]`)]
    ));
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(root, controls));
    };
    Object.values(controls).forEach(c => c.addEventListener("input", schedule));
    root.querySelectorAll("[data-preset]").forEach(button => button.addEventListener("click", () => {
      const preset = button.dataset.preset;
      if (preset === "cutoff") { controls.vgs.value=.4; controls.vds.value=1; }
      if (preset === "linear") { controls.vgs.value=2; controls.vds.value=.3; }
      if (preset === "sat") { controls.vgs.value=2; controls.vds.value=2.5; }
      schedule();
    }));
    update(root, controls);
  }

  function range(name, label, min, max, step, value, unit) {
    return `<div class="dm-control">
      <label for="mosch-${name}"><span>${label}</span><output data-output="${name}">—</output></label>
      <input id="mosch-${name}" data-input="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
      <small>單位：${unit}</small>
    </div>`;
  }

  function card(name, label) {
    return `<div class="dm-card"><span>${label}</span><strong data-card="${name}">—</strong></div>`;
  }

  function current(vgs, vds, vt, beta, lambda) {
    const vov = Math.max(0, vgs - vt);
    if (vov <= 0) return { id: 0, gm: 0, region: "截止區", vov };
    if (vds < vov) {
      return {
        id: beta * (vov * vds - vds * vds / 2),
        gm: beta * vds,
        region: "線性區",
        vov
      };
    }
    return {
      id: beta * vov * vov / 2 * (1 + lambda * vds),
      gm: beta * vov * (1 + lambda * vds),
      region: "飽和區",
      vov
    };
  }

  function update(root, c) {
    const p = {
      vgs:Number(c.vgs.value), vds:Number(c.vds.value), vt:Number(c.vt.value),
      beta:Number(c.beta.value) * 1e-6, lambda:Number(c.lambda.value)
    };
    const r = current(p.vgs, p.vds, p.vt, p.beta, p.lambda);
    out(root,"vgs",`${fmt(p.vgs,2)} V`);
    out(root,"vds",`${fmt(p.vds,2)} V`);
    out(root,"vt",`${fmt(p.vt,2)} V`);
    out(root,"beta",`${fmt(p.beta*1e6,0)} µA/V²`);
    out(root,"lambda",`${fmt(p.lambda,3)} V⁻¹`);
    root.querySelector("[data-status]").textContent = r.region;
    root.querySelector("[data-condition]").textContent =
      r.region === "截止區" ? "V_GS≤V_T，無強反轉通道" :
      r.region === "線性區" ? "V_DS<V_GS−V_T" : "V_DS≥V_GS−V_T";
    const drainCharge = r.vov > 0 ? Math.max(0, 1 - p.vds / r.vov) : 0;
    setCard(root,"id",formatCurrent(r.id));
    setCard(root,"gm",`${fmt(r.gm*1e3,3)} mS`);
    setCard(root,"vov",`${fmt(r.vov,2)} V`);
    setCard(root,"vdsat",r.vov ? `${fmt(r.vov,2)} V` : "—");
    setCard(root,"qsource",r.vov ? "1.000" : "0");
    setCard(root,"qdrain",fmt(drainCharge,3));
    drawChannel(root.querySelector("[data-channel]"), p, r);
    drawOutput(root.querySelector("[data-output-chart]"), p, r);
    updateNote(root,p,r);
  }

  function drawChannel(svg, p, r) {
    const x0=122, x1=642, yTop=122;
    let polygon = "";
    let pinch = x1;
    if (r.vov > 0) {
      const vEnd = Math.min(p.vds, r.vov);
      const totalF = r.vov*vEnd-vEnd*vEnd/2;
      const bottom = [];
      for(let i=0;i<=80;i++){
        const t=i/80;
        const discriminant=Math.max(0,r.vov*r.vov-2*totalF*t);
        const vx=r.vov-Math.sqrt(discriminant);
        const charge=Math.max(0,(r.vov-vx)/r.vov);
        bottom.push([x0+(x1-x0)*t,yTop+4+34*charge]);
      }
      polygon=`M${x0},${yTop} L${x1},${yTop} `+
        bottom.reverse().map(([x,y])=>`L${x.toFixed(1)},${y.toFixed(1)}`).join(" ")+" Z";
      if(p.vds>=r.vov) pinch=x1-42*Math.min(1,(p.vds-r.vov+0.2)/1.2);
    }
    svg.innerHTML=`
      <rect x="70" y="32" width="625" height="42" rx="8" fill="var(--b3)" stroke="var(--bd)"/>
      <text x="382" y="58" text-anchor="middle" class="dm-svg-title">閘極　V_GS=${fmt(p.vgs,2)} V</text>
      <rect x="92" y="74" width="580" height="30" fill="var(--bg)" stroke="var(--bd)"/>
      <text x="382" y="95" text-anchor="middle" class="dm-svg-label">氧化層</text>
      <rect x="78" y="104" width="608" height="108" rx="8" fill="var(--b2)" stroke="var(--bd)"/>
      <rect x="84" y="111" width="72" height="72" rx="6" fill="color-mix(in srgb,var(--ac) 20%,var(--bg))"/>
      <rect x="608" y="111" width="72" height="72" rx="6" fill="color-mix(in srgb,var(--ac) 20%,var(--bg))"/>
      <text x="120" y="153" text-anchor="middle" class="dm-svg-title">源極</text>
      <text x="644" y="153" text-anchor="middle" class="dm-svg-title">汲極</text>
      ${polygon?`<path d="${polygon}" class="dm-svg-fill" stroke="var(--ac)" stroke-width="2"/>`:""}
      ${r.region==="飽和區"?`<line x1="${pinch}" y1="111" x2="${pinch}" y2="174" stroke="var(--wbd)" stroke-width="3" stroke-dasharray="5 4"/>
        <text x="${pinch-8}" y="198" text-anchor="end" class="dm-svg-label">夾止點附近</text>`:""}
      <text x="382" y="229" text-anchor="middle" class="dm-svg-label">${
        r.region==="截止區"?"沒有強反轉通道":"藍色厚度代表 |Q_i(x)| 的相對大小"
      }</text>`;
    svg.setAttribute("aria-label",`${r.region} MOSFET 通道剖面，汲源電壓 ${fmt(p.vds,2)} 伏特`);
  }

  function drawOutput(svg,p,r){
    const w=760,h=265,m={l:78,r:24,t:22,b:46},pw=w-m.l-m.r,ph=h-m.t-m.b;
    const maxV=3.5;
    const gates=[1,1.5,2,2.5,3,3.5];
    let maxI=1e-9;
    const families=gates.map(vg=>{
      const pts=[];
      for(let i=0;i<=100;i++){const vd=maxV*i/100;const rr=current(vg,vd,p.vt,p.beta,p.lambda);pts.push([vd,rr.id]);maxI=Math.max(maxI,rr.id);}
      return {vg,pts};
    });
    maxI*=1.08;
    const xm=v=>m.l+v/maxV*pw, ym=i=>m.t+(maxI-i)/maxI*ph;
    const paths=families.map((f,index)=>{
      const d=f.pts.map(([x,y],i)=>`${i?"L":"M"}${xm(x).toFixed(1)},${ym(y).toFixed(1)}`).join(" ");
      return `<path d="${d}" fill="none" stroke="var(--ac)" stroke-width="${index===2?3:1.6}" opacity="${.35+index*.1}"/>
        <text x="${xm(3.48)}" y="${ym(f.pts.at(-1)[1])+3}" text-anchor="end" class="dm-svg-label">${f.vg} V</text>`;
    }).join("");
    svg.innerHTML=`
      ${[0,1,2,3].map(v=>`<line x1="${xm(v)}" y1="${m.t}" x2="${xm(v)}" y2="${m.t+ph}" class="dm-svg-grid"/>
        <text x="${xm(v)}" y="${h-20}" text-anchor="middle" class="dm-svg-label">${v}</text>`).join("")}
      ${[0,.25,.5,.75,1].map(fr=>`<line x1="${m.l}" y1="${ym(maxI*fr)}" x2="${m.l+pw}" y2="${ym(maxI*fr)}" class="dm-svg-grid"/>
        <text x="${m.l-9}" y="${ym(maxI*fr)+4}" text-anchor="end" class="dm-svg-label">${fmt(maxI*fr*1e3,2)}</text>`).join("")}
      ${paths}
      <circle cx="${xm(p.vds)}" cy="${ym(r.id)}" r="6" class="dm-svg-point"/>
      <text x="${m.l+pw/2}" y="${h-2}" text-anchor="middle" class="dm-svg-label">V_DS（V）</text>
      <text x="17" y="${m.t+ph/2}" text-anchor="middle" class="dm-svg-label" transform="rotate(-90 17 ${m.t+ph/2})">I_D（mA）</text>`;
  }

  function updateNote(root,p,r){
    const note=root.querySelector("[data-note]"), text=root.querySelector("[data-note-text]");
    let level="ok",message;
    if(r.region==="截止區") message="V_GS 尚未超過 V_T；本模型將強反轉通道電流設為零，但真實元件仍有次臨界漏電。";
    else if(r.region==="線性區") message="通道從源極到汲極逐漸變薄，汲極端仍有非零反轉電荷，元件表現為閘極控制電阻。";
    else message="汲極端反轉電荷降至零而形成夾止；載子仍被高場掃入汲極，所以電流飽和而不是消失。";
    if((p.vgs>3&&p.vt<.4)||p.vds>3){
      level="warn";
      message+=" 此工作點可能已進入高場、速度飽和或可靠度限制，長通道平方律只宜作趨勢比較。";
    }
    note.dataset.level=level;text.textContent=message;
  }

  function out(root,name,value){root.querySelector(`[data-output="${name}"]`).textContent=value;}
  function setCard(root,name,value){root.querySelector(`[data-card="${name}"]`).textContent=value;}
  function fmt(v,d){return Number(v).toLocaleString("zh-TW",{maximumFractionDigits:d});}
  function formatCurrent(a){return Math.abs(a)>=1e-3?`${fmt(a*1e3,3)} mA`:`${fmt(a*1e6,2)} µA`;}
})();
