/* === Damped Spring + Ch16 Vector Field === */
(()=>{document.querySelectorAll('[data-spring-model]').forEach(box=>{
  const W=560,H=260,M={top:30,right:20,bottom:40,left:50};
  let m=1,damp=0.3,k=2,t=0,playing=!1,animId;
  function sol(ms,ds,ks,yi,vi,ti){const d=ds*ds-4*ms*ks;if(d>0){const r1=(-ds+Math.sqrt(d))/(2*ms),r2=(-ds-Math.sqrt(d))/(2*ms),A=(vi-r2*yi)/(r1-r2),B=yi-A;return A*Math.exp(r1*ti)+B*Math.exp(r2*ti);}if(Math.abs(d)<.001){const r=-ds/(2*ms);return(yi+(vi-r*yi)*ti)*Math.exp(r*ti);}const a=ds/(2*ms),o=Math.sqrt(4*ms*ks-ds*ds)/(2*ms);return Math.exp(-a*ti)*(yi*Math.cos(o*ti)+(vi+a*yi)/o*Math.sin(o*ti));}
  box.innerHTML=`<div class="pnm-controls">
    <label>m：<input type="range" class="sm" min="0.5" max="3" step="0.1" value="1"><span class="pnm-val">1.0</span></label>
    <label>c：<input type="range" class="sd" min="0" max="4" step="0.1" value="0.3"><span class="pnm-val">0.3</span></label>
    <label>k：<input type="range" class="sk" min="0.5" max="5" step="0.1" value="2"><span class="pnm-val">2.0</span></label>
    <button class="pnm-btn sp">▶ 播放</button>
  </div>
  <div class="pnm-display">
    <div class="pnm-card">狀態：<strong class="st">—</strong></div>
    <div class="pnm-card">t = <strong class="ti">0.0</strong> s</div>
    <div class="pnm-card">y = <strong class="yv">2.00</strong></div>
  </div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  const svg=box.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';
  const pW=W-M.left-M.right,pH=H-M.top-M.bottom,toX=x=>M.left+(x+3)/6*pW,toY=y=>M.top+pH/2-y*30;
  function draw(){
    const d=damp*damp-4*m*k,dt=damp===0?'無阻尼':d>0?'過阻尼':Math.abs(d)<.001?'臨界阻尼':'欠阻尼';
    box.querySelector('.st').textContent=dt;box.querySelector('.ti').textContent=t.toFixed(1);
    const y=sol(m,damp,k,2,0,t);box.querySelector('.yv').textContent=y.toFixed(3);
    svg.innerHTML=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888"/><line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-dasharray="4,3"/><line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#34C759" stroke-dasharray="3,3"/>`;
    let cd='';for(let i=0;i<=200;i++){const tt=Math.max(0,t-6)+i*6/200,yy=sol(m,damp,k,2,0,tt),sx=toX(tt-Math.max(0,t-6)),sy=toY(yy);if(isFinite(sy))cd+=(i===0?'M':'L')+sx+','+sy;}
    const cp=document.createElementNS(ns,'path');cp.setAttribute('d',cd);cp.setAttribute('fill','none');cp.setAttribute('stroke','var(--ac)');cp.setAttribute('stroke-width','2');svg.appendChild(cp);
    const pt=document.createElementNS(ns,'circle');pt.setAttribute('cx',toX(Math.min(6,t)));pt.setAttribute('cy',toY(y));pt.setAttribute('r','5');pt.setAttribute('fill','#FF3B30');pt.setAttribute('stroke','#fff');pt.setAttribute('stroke-width','2');svg.appendChild(pt);
  }
  draw();
  function stop(){playing=!1;if(animId)cancelAnimationFrame(animId);box.querySelector('.sp').textContent='▶ 播放';}
  box.querySelector('.sp').addEventListener('click',()=>{if(playing){stop();return;}playing=!0;box.querySelector('.sp').textContent='⏸ 暫停';const t0=performance.now()/1000-t;function anim(now){if(!playing)return;t=now/1000-t0;if(t>12){t=12;stop();}draw();animId=requestAnimationFrame(anim);}requestAnimationFrame(anim);});
  box.querySelector('.sm').addEventListener('input',e=>{m=+e.target.value;e.target.nextElementSibling.textContent=m.toFixed(1);t=0;stop();draw();});
  box.querySelector('.sd').addEventListener('input',e=>{damp=+e.target.value;e.target.nextElementSibling.textContent=damp.toFixed(1);t=0;stop();draw();});
  box.querySelector('.sk').addEventListener('input',e=>{k=+e.target.value;e.target.nextElementSibling.textContent=k.toFixed(1);t=0;stop();draw();});
});})();

/* === Vector Field Model (Ch16) === */
(()=>{document.querySelectorAll('[data-vector-field-model]').forEach(box=>{
  const W=520,H=380,M={top:20,right:20,bottom:30,left:45},pW=W-M.left-M.right,pH=H-M.top-M.bottom;
  const fields=[{name:'F=(−y, x) (旋轉場)',fx:(x,y)=>-y,fy:(x,y)=>x},{name:'F=(x, y) (發散場)',fx:(x,y)=>x,fy:(x,y)=>y},{name:'F=(y, sin x)',fx:(x,y)=>y,fy:(x,y)=>Math.sin(x)}];let fi=0;
  const r=3,toX=x=>M.left+(x+r)/(2*r)*pW,toY=y=>M.top+pH-(y+r)/(2*r)*pH;

  box.innerHTML=`<div class="pnm-controls">
    <label>向量場：<select class="vf">${fields.map((f,i)=>`<option value="${i}" ${i===fi?'selected':''}>${f.name}</option>`).join('')}</select></label>
  </div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  const svg=box.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';

  function draw(){
    const f=fields[fi];svg.innerHTML='';
    const g=document.createElementNS(ns,'g');
    g.innerHTML=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888"/><line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888"/>`;
    svg.appendChild(g);
    const vg=document.createElementNS(ns,'g');
    for(let x=-2.5;x<=2.5;x+=0.5){for(let y=-2.5;y<=2.5;y+=0.5){
      const vx=f.fx(x,y),vy=f.fy(x,y),vm=Math.sqrt(vx*vx+vy*vy);
      if(vm<0.01)continue;const s=Math.min(18,12/vm),ex=vx*s,ey=vy*s;
      const sx=toX(x),sy=toY(y);
      const l=document.createElementNS(ns,'line');l.setAttribute('x1',sx);l.setAttribute('y1',sy);l.setAttribute('x2',sx+ex);l.setAttribute('y2',sy+ey);l.setAttribute('stroke','var(--ac)');l.setAttribute('stroke-width',Math.max(1,vm*1.5));
      vg.appendChild(l);
      // Arrowhead
      const ang=Math.atan2(ey,ex),ah=5;
      const ax1=sx+ex-ah*Math.cos(ang-0.5),ay1=sy+ey-ah*Math.sin(ang-0.5);
      const ax2=sx+ex-ah*Math.cos(ang+0.5),ay2=sy+ey-ah*Math.sin(ang+0.5);
      const a=document.createElementNS(ns,'polygon');a.setAttribute('points',`${sx+ex},${sy+ey} ${ax1},${ay1} ${ax2},${ay2}`);a.setAttribute('fill','var(--ac)');
      vg.appendChild(a);
    }}
    svg.appendChild(vg);
  }
  draw();
  box.querySelector('.vf').addEventListener('change',e=>{fi=+e.target.value;draw();});
});})();

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