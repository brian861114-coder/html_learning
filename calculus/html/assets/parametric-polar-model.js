/* === Parametric/Polar Curve Drawer (Ch11) === */
(()=>{document.querySelectorAll('[data-parametric-model]').forEach(c=>{
  const W=540,H=380,M={top:20,right:20,bottom:30,left:45},pW=W-M.left-M.right,pH=H-M.top-M.bottom;
  let tMax=2*Math.PI,t=0,mode='parametric';
  const curves={parametric:[
    {name:'圓 x=cos t, y=sin t',x:t=>Math.cos(t),y:t=>Math.sin(t),tR:2*Math.PI,xR:1.5},
    {name:'擺線 x=t-sin t, y=1-cos t',x:t=>t-Math.sin(t),y:t=>1-Math.cos(t),tR:4*Math.PI,xR:13},
    {name:'Lissajous x=sin 3t, y=cos 2t',x:t=>Math.sin(3*t),y:t=>Math.cos(2*t),tR:2*Math.PI,xR:1.5}
  ],polar:[
    {name:'r=1 (圓)',r:t=>1,tR:2*Math.PI,rMax:1.5},
    {name:'r=2cos θ',r:t=>2*Math.cos(t),tR:2*Math.PI,rMax:2.5},
    {name:'r=1+cos θ (心形線)',r:t=>1+Math.cos(t),tR:2*Math.PI,rMax:2.5}
  ]};
  let ci=0;
  
  c.innerHTML=`<div class="pnm-controls">
    <label>模式：<select class="pnm-mode"><option value="parametric" ${mode==='parametric'?'selected':''}>參數方程</option><option value="polar" ${mode==='polar'?'selected':''}>極座標</option></select></label>
    <label>曲線：<select class="pnm-curve"></select></label>
    <label>t：<input type="range" class="pnm-t" min="0" max="100" value="0"><span class="pnm-val">0</span></label>
    <button class="pnm-btn">▶ 繪製</button>
  </div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  
  const svg=c.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';
  
  function populateCurves(){
    const list=curves[mode],sel=c.querySelector('.pnm-curve');
    sel.innerHTML=list.map((cu,i)=>`<option value="${i}" ${i===ci?'selected':''}>${cu.name}</option>`).join('');
    ci=Math.min(ci,list.length-1);
  }
  populateCurves();

  function draw(animateTo){
    const curve=curves[mode][ci],xR=curve.xR||curve.rMax||2;
    const toX=x=>M.left+(x+xR)/(2*xR)*pW,toY=y=>M.top+pH-(y+xR)/(2*xR)*pH;
    svg.innerHTML='';
    
    // Axes
    const g=document.createElementNS(ns,'g');
    g.innerHTML=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888" stroke-width="1"/>
      <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-width="1"/>`;
    svg.appendChild(g);

    // Full curve (ghost)
    let fd='';
    for(let i=0;i<=200;i++){
      const tt=i*curve.tR/200;
      let px,py;
      if(mode==='parametric'){px=curve.x(tt);py=curve.y(tt);}
      else {const r=curve.r(tt);px=r*Math.cos(tt);py=r*Math.sin(tt);}
      const sx=toX(px),sy=toY(py);
      if(isFinite(sy))fd+=(i===0?'M':'L')+sx+','+sy;
    }
    const ghost=document.createElementNS(ns,'path');
    ghost.setAttribute('d',fd);ghost.setAttribute('fill','none');
    ghost.setAttribute('stroke','#ddd');ghost.setAttribute('stroke-width','1.5');
    svg.appendChild(ghost);

    // Drawn portion
    const endT=animateTo!==undefined?animateTo:t;
    let dd='';const steps=Math.max(2,Math.floor(endT/curve.tR*200));
    for(let i=0;i<=steps;i++){
      const tt=i*endT/steps;
      let px,py;
      if(mode==='parametric'){px=curve.x(tt);py=curve.y(tt);}
      else {const r=curve.r(tt);px=r*Math.cos(tt);py=r*Math.sin(tt);}
      const sx=toX(px),sy=toY(py);
      if(isFinite(sy))dd+=(i===0?'M':'L')+sx+','+sy;
    }
    const drawn=document.createElementNS(ns,'path');
    drawn.setAttribute('d',dd);drawn.setAttribute('fill','none');
    drawn.setAttribute('stroke','var(--ac)');drawn.setAttribute('stroke-width','2.5');
    svg.appendChild(drawn);

    // Current point
    let px,py;
    if(mode==='parametric'){px=curve.x(endT);py=curve.y(endT);}
    else {const r=curve.r(endT);px=r*Math.cos(endT);py=r*Math.sin(endT);}
    const pt=document.createElementNS(ns,'circle');
    pt.setAttribute('cx',toX(px));pt.setAttribute('cy',toY(py));
    pt.setAttribute('r','5');pt.setAttribute('fill','#FF3B30');pt.setAttribute('stroke','#fff');pt.setAttribute('stroke-width','2');
    svg.appendChild(pt);
  }

  draw(0);
  c.querySelector('.pnm-mode').addEventListener('change',e=>{mode=e.target.value;ci=0;populateCurves();t=0;draw(0);});
  c.querySelector('.pnm-curve').addEventListener('change',e=>{ci=+e.target.value;t=0;draw(0);});
  c.querySelector('.pnm-t').addEventListener('input',e=>{
    t=+e.target.value/100*curves[mode][ci].tR;
    e.target.nextElementSibling.textContent=t.toFixed(2);
    draw(t);
  });
  c.querySelector('.pnm-btn').addEventListener('click',()=>{
    const tr=curves[mode][ci].tR,tStart=performance.now(),dur=2000;
    function anim(now){const p=Math.min(1,(now-tStart)/dur);t=p*tr;c.querySelector('.pnm-t').value=Math.round(p*100);c.querySelector('.pnm-t').nextElementSibling.textContent=t.toFixed(2);draw(t);if(p<1)requestAnimationFrame(anim);}
    requestAnimationFrame(anim);
  });
});})();
