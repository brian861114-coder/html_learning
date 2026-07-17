/* === Double Integral Region Model (Ch15) === */
(()=>{document.querySelectorAll('[data-double-integral-model]').forEach(box=>{
  const W=480,H=360,M={top:20,right:20,bottom:30,left:50},pW=W-M.left-M.right,pH=H-M.top-M.bottom;
  const regions=[{name:'y=x², y=2 (Type I)',desc:'Type I：x:−√2→√2, 對每個x: y:x²→2'},{name:'x=y², x=2 (Type II)',desc:'Type II：y:−√2→√2, 對每個y: x:y²→2'}];let ri=0;
  const xR=3,toX=x=>M.left+(x+xR)/(2*xR)*pW,toY=y=>M.top+pH-(y+xR)/(2*xR)*pH;

  box.innerHTML=`<div class="pnm-controls">
    <label>區域：<select class="rg">${regions.map((r,i)=>`<option value="${i}" ${i===ri?'selected':''}>${r.name}</option>`).join('')}</select></label>
    <button class="pnm-btn pnm-sweep">▶ 掃描</button>
  </div>
  <div class="pnm-display"><div class="pnm-card" style="flex:2"><strong class="rd">${regions[0].desc}</strong></div></div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  const svg=box.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';
  
  function draw(sweepPos){
    svg.innerHTML='';
    const g=document.createElementNS(ns,'g');
    g.innerHTML=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888"/><line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888"/>`;
    svg.appendChild(g);
    box.querySelector('.rd').textContent=regions[ri].desc;

    // Shaded region + boundaries
    if(ri===0){
      // y=x² and y=2
      const xs=Math.sqrt(2);
      let d='';for(let i=0;i<=100;i++){const x=-xs+i*2*xs/100,y=Math.min(2,Math.max(x*x,0));d+=(i===0?'M':'L')+toX(x)+','+toY(y);}
      for(let i=100;i>=0;i--){const x=-xs+i*2*xs/100;d+='L'+toX(x)+','+toY(2);}
      const reg=document.createElementNS(ns,'path');reg.setAttribute('d',d+'Z');reg.setAttribute('fill','var(--ac)');reg.setAttribute('opacity','0.15');reg.setAttribute('stroke','var(--ac)');reg.setAttribute('stroke-width','1.5');svg.appendChild(reg);
      if(sweepPos!==undefined){const sx=-xs+(sweepPos/100)*2*xs;svg.innerHTML+=`<line x1="${toX(sx)}" y1="${toY(sx*sx)}" x2="${toX(sx)}" y2="${toY(2)}" stroke="#FF3B30" stroke-width="2"/>`;}
    }else{
      const ys=Math.sqrt(2);
      let d='';for(let i=0;i<=100;i++){const y=-ys+i*2*ys/100;d+=(i===0?'M':'L')+toX(Math.min(2,y*y))+','+toY(y);}
      for(let i=100;i>=0;i--){const y=-ys+i*2*ys/100;d+='L'+toX(2)+','+toY(y);}
      const reg=document.createElementNS(ns,'path');reg.setAttribute('d',d+'Z');reg.setAttribute('fill','var(--ac)');reg.setAttribute('opacity','0.15');reg.setAttribute('stroke','var(--ac)');reg.setAttribute('stroke-width','1.5');svg.appendChild(reg);
      if(sweepPos!==undefined){const sy=-ys+(sweepPos/100)*2*ys;svg.innerHTML+=`<line x1="${toX(sy*sy)}" y1="${toY(sy)}" x2="${toX(2)}" y2="${toY(sy)}" stroke="#FF3B30" stroke-width="2"/>`;}
    }
  }
  draw();
  box.querySelector('.rg').addEventListener('change',e=>{ri=+e.target.value;draw();});
  box.querySelector('.pnm-sweep').addEventListener('click',()=>{
    let pos=0,start=performance.now();
    function anim(now){pos=Math.min(100,(now-start)/20);draw(pos);if(pos<100)requestAnimationFrame(anim);}
    requestAnimationFrame(anim);
  });
});})();
