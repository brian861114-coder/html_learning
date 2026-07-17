(() => {
  "use strict";

  const q = 1.602176634e-19;
  const kEv = 8.617333262e-5;

  document.querySelectorAll("[data-bjt-base-model]").forEach(init);

  function init(root) {
    root.classList.add("dm");
    root.innerHTML = `
      <div class="dm-shell">
        <aside class="dm-panel" aria-label="BJT 基極載子模型參數">
          <h3>模型參數</h3>
          ${range("vbe", "BE 接面偏壓 V_BE", .35, .85, .01, .70, "V")}
          ${range("vbc", "BC 接面偏壓 V_BC", -2, .8, .02, -1, "V")}
          ${range("wb", "中性基極寬度 W_B", .05, 2, .05, .5, "µm")}
          ${range("ln", "電子擴散長度 L_n", .5, 20, .1, 10, "µm")}
          ${range("nb", "基極摻雜 N_B", 15, 18, .1, 17, "log")}
          ${range("gamma", "射極注入效率 γ", 90, 99.99, .01, 99.5, "%")}
          ${range("temp", "溫度 T", 250, 400, 5, 300, "K")}
          <div class="dm-presets">
            <button type="button" data-preset="active">順向主動</button>
            <button type="button" data-preset="sat">飽和</button>
            <button type="button" data-preset="cutoff">截止</button>
          </div>
        </aside>
        <div>
          <div class="dm-visual">
            <div class="dm-status" aria-live="polite">
              <span>操作模式：<strong data-status>—</strong></span>
              <span>短基極程度：<strong data-short-base>—</strong></span>
            </div>
            <figure class="dm-figure">
              <figcaption>npn BJT 結構與電子電流路徑</figcaption>
              <svg data-structure viewBox="0 0 760 220" role="img" aria-label="BJT 結構與電流方向"></svg>
            </figure>
            <figure class="dm-figure">
              <figcaption>p 型基極中的少數載子電子分布</figcaption>
              <svg data-profile viewBox="0 0 760 265" role="img" aria-label="BJT 基極少數載子濃度分布"></svg>
            </figure>
          </div>
          <div class="dm-cards">
            ${card("alphaT", "基極傳輸因子 α_T")}
            ${card("beta", "估算共射增益 β")}
            ${card("jc", "集極電子電流密度 J_C")}
            ${card("jb", "基極電流密度 J_B")}
            ${card("nbe", "BE 邊界電子濃度")}
            ${card("nbc", "BC 邊界電子濃度")}
          </div>
          <div class="dm-note" data-note role="status"><strong>模型判讀：</strong><span data-note-text></span></div>
          <details class="dm-equations">
            <summary>方程式、邊界與適用範圍</summary>
            <ul>
              <li>一維、均勻 p 型中性基極、低階注入、準中性、穩態且電場忽略。</li>
              <li>邊界 Δn(0)=n_B0[exp(V_BE/V_T)−1]、Δn(W_B)=n_B0[exp(V_BC/V_T)−1]。</li>
              <li>基極內滿足 d²Δn/dx²=Δn/L_n²；W_B≪L_n 時退化為近似直線。</li>
              <li>α_T≈1/cosh(W_B/L_n)，α≈γα_T，β≈α/(1−α)。</li>
              <li>未包含 Early effect、高階注入、基極內建漂移場、接面電容與速度限制。</li>
            </ul>
          </details>
        </div>
      </div>`;

    const names=["vbe","vbc","wb","ln","nb","gamma","temp"];
    const controls=Object.fromEntries(names.map(name=>[name,root.querySelector(`[data-input="${name}"]`)]));
    let frame=0;
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>update(root,controls));};
    Object.values(controls).forEach(c=>c.addEventListener("input",schedule));
    root.querySelectorAll("[data-preset]").forEach(button=>button.addEventListener("click",()=>{
      const p=button.dataset.preset;
      if(p==="active"){controls.vbe.value=.70;controls.vbc.value=-1;}
      if(p==="sat"){controls.vbe.value=.75;controls.vbc.value=.65;}
      if(p==="cutoff"){controls.vbe.value=.35;controls.vbc.value=-1;}
      schedule();
    }));
    update(root,controls);
  }

  function range(name,label,min,max,step,value,unit){
    return `<div class="dm-control">
      <label for="bjt-${name}"><span>${label}</span><output data-output="${name}">—</output></label>
      <input id="bjt-${name}" data-input="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
      <small>${unit==="log"?"對數刻度，單位 cm⁻³":`單位：${unit}`}</small>
    </div>`;
  }

  function card(name,label){
    return `<div class="dm-card"><span>${label}</span><strong data-card="${name}">—</strong></div>`;
  }

  function update(root,c){
    const p={
      vbe:Number(c.vbe.value),vbc:Number(c.vbc.value),
      wbUm:Number(c.wb.value),lnUm:Number(c.ln.value),
      nb:10**Number(c.nb.value),gamma:Number(c.gamma.value)/100,
      temp:Number(c.temp.value)
    };
    const vt=kEv*p.temp;
    const ni=1e10*(p.temp/300)**1.5*Math.exp((-1.12/(2*kEv))*(1/p.temp-1/300));
    const n0=ni*ni/p.nb;
    const expSafe=v=>Math.exp(Math.max(-40,Math.min(40,v/vt)));
    const dE=n0*(expSafe(p.vbe)-1);
    const dC=n0*(expSafe(p.vbc)-1);
    const nE=n0+dE,nC=n0+dC;
    const wb=p.wbUm*1e-4,ln=p.lnUm*1e-4,u=wb/ln;
    const sinh=Math.sinh(u),coth=Math.cosh(u)/sinh,csch=1/sinh;
    const dn=25*(p.temp/300);
    const je=q*dn/ln*(dE*coth-dC*csch);
    const jc=q*dn/ln*(dE*csch-dC*coth);
    const ie=je/p.gamma;
    const jb=ie-jc;
    const alphaT=1/Math.cosh(u);
    const alpha=p.gamma*alphaT;
    const beta=alpha<.999999?alpha/(1-alpha):Infinity;
    const mode=p.vbe>.5?(p.vbc>.5?"飽和模式":"順向主動模式"):(p.vbc>.5?"反向主動模式":"截止模式");
    const r={...p,vt,ni,n0,dE,dC,nE,nC,wb,ln,u,dn,je,jc,jb,alphaT,alpha,beta,mode};

    out(root,"vbe",`${fmt(p.vbe,2)} V`);out(root,"vbc",`${fmt(p.vbc,2)} V`);
    out(root,"wb",`${fmt(p.wbUm,2)} µm`);out(root,"ln",`${fmt(p.lnUm,1)} µm`);
    out(root,"nb",`10${sup(Number(c.nb.value))} cm⁻³`);
    out(root,"gamma",`${fmt(p.gamma*100,2)} %`);out(root,"temp",`${p.temp.toFixed(0)} K`);
    root.querySelector("[data-status]").textContent=mode;
    root.querySelector("[data-short-base]").textContent=`W_B/L_n=${fmt(u,3)}`;
    setCard(root,"alphaT",fmt(alphaT,6));
    setCard(root,"beta",Number.isFinite(beta)?fmt(beta,1):"≫10⁵");
    setCard(root,"jc",formatDensity(jc));
    setCard(root,"jb",formatDensity(jb));
    setCard(root,"nbe",formatConcentration(nE));
    setCard(root,"nbc",formatConcentration(nC));
    drawStructure(root.querySelector("[data-structure]"),r);
    drawProfile(root.querySelector("[data-profile]"),r);
    updateNote(root,r);
  }

  function profileAt(t,r){
    const den=Math.sinh(r.u);
    return r.dE*Math.sinh((1-t)*r.u)/den+r.dC*Math.sinh(t*r.u)/den;
  }

  function drawStructure(svg,r){
    const maxJ=Math.max(Math.abs(r.je),Math.abs(r.jc),1e-20);
    const eWidth=2+12*Math.min(1,Math.abs(r.je)/maxJ);
    const cWidth=2+12*Math.min(1,Math.abs(r.jc)/maxJ);
    svg.innerHTML=`
      <rect x="56" y="40" width="190" height="120" rx="8" fill="color-mix(in srgb,var(--ac) 18%,var(--bg))" stroke="var(--bd)"/>
      <rect x="246" y="40" width="150" height="120" fill="color-mix(in srgb,var(--wbd) 14%,var(--bg))" stroke="var(--bd)"/>
      <rect x="396" y="40" width="308" height="120" rx="8" fill="color-mix(in srgb,var(--ac) 18%,var(--bg))" stroke="var(--bd)"/>
      <text x="151" y="70" text-anchor="middle" class="dm-svg-title">n⁺ 射極</text>
      <text x="321" y="70" text-anchor="middle" class="dm-svg-title">p 基極</text>
      <text x="550" y="70" text-anchor="middle" class="dm-svg-title">n 集極</text>
      <line x1="120" y1="110" x2="292" y2="110" stroke="var(--ac)" stroke-width="${eWidth}"/>
      <polygon points="292,110 274,100 274,120" fill="var(--ac)"/>
      <line x1="350" y1="110" x2="615" y2="110" stroke="var(--ac)" stroke-width="${cWidth}"/>
      <polygon points="615,110 597,100 597,120" fill="var(--ac)"/>
      <text x="196" y="143" text-anchor="middle" class="dm-svg-label">電子注入 J_nE</text>
      <text x="490" y="143" text-anchor="middle" class="dm-svg-label">收集 J_nC</text>
      <text x="321" y="191" text-anchor="middle" class="dm-svg-title">${r.mode}</text>
      <text x="80" y="205" class="dm-svg-label">V_BE=${fmt(r.vbe,2)} V</text>
      <text x="680" y="205" text-anchor="end" class="dm-svg-label">V_BC=${fmt(r.vbc,2)} V</text>`;
    svg.setAttribute("aria-label",`${r.mode}，電子由射極經基極流向集極的示意圖`);
  }

  function drawProfile(svg,r){
    const w=760,h=265,m={l:82,r:25,t:22,b:48},pw=w-m.l-m.r,ph=h-m.t-m.b;
    const exact=[],linear=[];
    let minN=Infinity,maxN=-Infinity;
    for(let i=0;i<=120;i++){
      const t=i/120;
      const ne=r.n0+profileAt(t,r);
      const nl=r.n0+r.dE*(1-t)+r.dC*t;
      exact.push([t,ne]);linear.push([t,nl]);
      minN=Math.min(minN,ne,nl);maxN=Math.max(maxN,ne,nl);
    }
    minN=Math.min(0,minN);maxN=Math.max(maxN,r.n0*1.1,1);
    const pad=(maxN-minN)*.08||1;minN-=pad;maxN+=pad;
    const xm=t=>m.l+t*pw,ym=n=>m.t+(maxN-n)/(maxN-minN)*ph;
    const path=arr=>arr.map(([x,y],i)=>`${i?"L":"M"}${xm(x).toFixed(1)},${ym(y).toFixed(1)}`).join(" ");
    const scale=10**Math.floor(Math.log10(Math.max(Math.abs(maxN),1)));
    svg.innerHTML=`
      ${[0,.25,.5,.75,1].map(t=>`<line x1="${xm(t)}" y1="${m.t}" x2="${xm(t)}" y2="${m.t+ph}" class="dm-svg-grid"/>
        <text x="${xm(t)}" y="${h-21}" text-anchor="middle" class="dm-svg-label">${fmt(t*r.wbUm,2)}</text>`).join("")}
      ${[0,.25,.5,.75,1].map(fr=>{const n=minN+(maxN-minN)*fr;return `<line x1="${m.l}" y1="${ym(n)}" x2="${m.l+pw}" y2="${ym(n)}" class="dm-svg-grid"/>
        <text x="${m.l-9}" y="${ym(n)+4}" text-anchor="end" class="dm-svg-label">${fmt(n/scale,2)}</text>`;}).join("")}
      <path d="${path(linear)}" class="dm-svg-curve-secondary"/>
      <path d="${path(exact)}" class="dm-svg-curve"/>
      <circle cx="${xm(0)}" cy="${ym(r.nE)}" r="5" class="dm-svg-point"/>
      <circle cx="${xm(1)}" cy="${ym(r.nC)}" r="5" class="dm-svg-point"/>
      <text x="${m.l+pw-8}" y="38" text-anchor="end" class="dm-svg-label">實線：擴散方程　虛線：短基極線性近似</text>
      <text x="${m.l+pw/2}" y="${h-2}" text-anchor="middle" class="dm-svg-label">基極位置 x（µm）</text>
      <text x="17" y="${m.t+ph/2}" text-anchor="middle" class="dm-svg-label" transform="rotate(-90 17 ${m.t+ph/2})">n_B（×10^${Math.log10(scale)} cm⁻³）</text>`;
  }

  function updateNote(root,r){
    const note=root.querySelector("[data-note]"),text=root.querySelector("[data-note-text]");
    let level="ok",message;
    if(r.nE>.1*r.nb){
      level="warn";
      message="BE 邊界注入電子已接近基極摻雜量級，低階注入假設可能失效，β 與電流密度只宜作趨勢判讀。";
    }else if(r.u>.5){
      level="warn";
      message="W_B/L_n 已不小，基極內復合使分布明顯偏離直線，短基極近似不再精確。";
    }else if(r.mode==="順向主動模式"){
      message="BE 順偏建立高電子濃度，BC 逆偏將抵達末端的電子掃入集極；基極越薄，梯度與集極電流越大。";
    }else if(r.mode==="飽和模式"){
      message="BE 與 BC 接面同時順偏，基極兩端都累積少數載子，濃度梯度減小且儲存電荷增加。";
    }else if(r.mode==="截止模式"){
      message="兩個接面都沒有有效順向注入，基極中沒有顯著過量少數載子，理想集極電流接近零。";
    }else{
      message="BC 接面順偏而 BE 未順偏，電晶體進入反向主動模式，射極與集極角色近似交換。";
    }
    note.dataset.level=level;text.textContent=message;
  }

  function out(root,name,value){root.querySelector(`[data-output="${name}"]`).textContent=value;}
  function setCard(root,name,value){root.querySelector(`[data-card="${name}"]`).textContent=value;}
  function fmt(v,d){return Number(v).toLocaleString("zh-TW",{maximumFractionDigits:d});}
  function formatDensity(v){
    const sign=v<0?"−":"";const a=Math.abs(v);
    if(a>=1)return `${sign}${fmt(a,3)} A/cm²`;
    if(a>=1e-3)return `${sign}${fmt(a*1e3,3)} mA/cm²`;
    return `${sign}${fmt(a*1e6,3)} µA/cm²`;
  }
  function formatConcentration(v){
    if(v<=0)return "≈ 0";
    const e=Math.floor(Math.log10(v)),m=v/10**e;
    return `${fmt(m,3)}×10${sup(e)} cm⁻³`;
  }
  function sup(value){
    const map={"-":"⁻",".":"·",0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
    return String(value).split("").map(c=>map[c]??c).join("");
  }
})();
