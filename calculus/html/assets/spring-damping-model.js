/* === Damped Spring Model (Ch17) === */
(()=>{document.querySelectorAll('[data-spring-model]').forEach(container=>{
  const W=560,H=260,M={top:30,right:20,bottom:40,left:50},pW=W-M.left-M.right,pH=H-M.top-M.bottom;
  let m=1,damp=0.3,k=2,y0=2,v0=0,t=0,playing=false,animId;
  
  function solve(mass,damping,spring,yinit,vinit,time){
    const disc=damping*damping-4*mass*spring;
    if(disc>0){const r1=(-damping+Math.sqrt(disc))/(2*mass),r2=(-damping-Math.sqrt(disc))/(2*mass),A=(vinit-r2*yinit)/(r1-r2),B=yinit-A;return A*Math.exp(r1*time)+B*Math.exp(r2*time);}
    else if(Math.abs(disc)<0.001){const r=-damping/(2*mass),A=yinit,B=vinit-r*yinit;return (A+B*time)*Math.exp(r*time);}
    else {const alpha=damping/(2*mass),omega=Math.sqrt(4*mass*spring-damping*damping)/(2*mass),A=yinit,B=(vinit+alpha*yinit)/omega;return Math.exp(-alpha*time)*(A*Math.cos(omega*time)+B*Math.sin(omega*time));}
  }

  container.innerHTML=`<div class="pnm-controls">
    <label>m：<input type="range" class="pnm-m" min="0.5" max="3" step="0.1" value="${m}"><span class="pnm-val">${m.toFixed(1)}</span></label>
    <label>c (阻尼)：<input type="range" class="pnm-damp" min="0" max="4" step="0.1" value="${damp}"><span class="pnm-val">${damp.toFixed(1)}</span></label>
    <label>k (彈簧)：<input type="range" class="pnm-k" min="0.5" max="5" step="0.1" value="${k}"><span class="pnm-val">${k.toFixed(1)}</span></label>
    <button class="pnm-btn pnm-play">▶ 播放</button>
  </div>
  <div class="pnm-display">
    <div class="pnm-card">狀態：<strong class="pnm-damp-type">—</strong></div>
    <div class="pnm-card">t = <strong class="pnm-time">0.0</strong> s</div>
    <div class="pnm-card">y = <strong class="pnm-yval">${y0.toFixed(2)}</strong></div>
  </div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  const svg=container.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';

  function draw(){
    const disc=damp*damp-4*m*k;let dampType;
    if(damp===0)dampType='無阻尼（簡諧運動）';
    else if(disc>0)dampType='過阻尼';
    else if(Math.abs(disc)<0.001)dampType='臨界阻尼';
    else dampType='欠阻尼';
    container.querySelector('.pnm-damp-type').textContent=dampType;
    container.querySelector('.pnm-time').textContent=t.toFixed(1);
    
    const y=solve(m,damp,k,y0,v0,t);
    container.querySelector('.pnm-yval').textContent=y.toFixed(3);

    svg.innerHTML='';
    const toX=x=>M.left+(x+3)/6*pW,toY=y=>M.top+pH/2-y*30;
    svg.innerHTML+=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888"/>
      <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-dasharray="4,3"/>`;

    let cd='';for(let i=0;i<=200;i++){const tt=Math.max(0,t-6)+i*6/200;const yy=solve(m,damp,k,y0,v0,tt);const sx=toX(tt-Math.max(0,t-6)),sy=toY(yy);if(isFinite(sy))cd+=(i===0?'M':'L')+sx+','+sy;}
    const curve=document.createElementNS(ns,'path');
    curve.setAttribute('d',cd);curve.setAttribute('fill','none');
    curve.setAttribute('stroke','var(--ac)');curve.setAttribute('stroke-width','2');
    svg.appendChild(curve);

    const pt=document.createElementNS(ns,'circle');
    pt.setAttribute('cx',toX(Math.min(6,t)));pt.setAttribute('cy',toY(y));
    pt.setAttribute('r','5');pt.setAttribute('fill','#FF3B30');pt.setAttribute('stroke','#fff');pt.setAttribute('stroke-width','2');
    svg.appendChild(pt);
    svg.innerHTML+=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#34C759" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  draw();
  
  function stop(){playing=false;if(animId)cancelAnimationFrame(animId);container.querySelector('.pnm-play').textContent='▶ 播放';}
  container.querySelector('.pnm-play').addEventListener('click',()=>{
    if(playing){stop();return;}
    playing=true;container.querySelector('.pnm-play').textContent='⏸ 暫停';
    const t0=performance.now()/1000-t;
    function anim(now){if(!playing)return;t=now/1000-t0;if(t>12){t=12;stop();}draw();animId=requestAnimationFrame(anim);}
    requestAnimationFrame(anim);
  });
  ['m','damp','k'].forEach(p=>container.querySelector(`.pnm-${p}`).addEventListener('input',e=>{
    const v=+e.target.value;if(p==='m')m=v;else if(p==='damp')damp=v;else k=v;
    e.target.nextElementSibling.textContent=v.toFixed(1);t=0;stop();draw();
  }));
});})();
  
  function solve(m,c,k,y0,v0,t){
    const disc=c*c-4*m*k;
    if(disc>0){const r1=(-c+Math.sqrt(disc))/(2*m),r2=(-c-Math.sqrt(disc))/(2*m),A=(v0-r2*y0)/(r1-r2),B=y0-A;return A*Math.exp(r1*t)+B*Math.exp(r2*t);}
    else if(Math.abs(disc)<0.001){const r=-c/(2*m),A=y0,B=v0-r*y0;return (A+B*t)*Math.exp(r*t);}
    else {const alpha=c/(2*m),omega=Math.sqrt(4*m*k-c*c)/(2*m),A=y0,B=(v0+alpha*y0)/omega;return Math.exp(-alpha*t)*(A*Math.cos(omega*t)+B*Math.sin(omega*t));}
  }

  c.innerHTML=`<div class="pnm-controls">
    <label>m：<input type="range" class="pnm-m" min="0.5" max="3" step="0.1" value="${m}"><span class="pnm-val">${m.toFixed(1)}</span></label>
    <label>c (阻尼)：<input type="range" class="pnm-c" min="0" max="4" step="0.1" value="${c}"><span class="pnm-val">${c.toFixed(1)}</span></label>
    <label>k (彈簧)：<input type="range" class="pnm-k" min="0.5" max="5" step="0.1" value="${k}"><span class="pnm-val">${k.toFixed(1)}</span></label>
    <button class="pnm-btn pnm-play">▶ 播放</button>
  </div>
  <div class="pnm-display">
    <div class="pnm-card">狀態：<strong class="pnm-damp-type">—</strong></div>
    <div class="pnm-card">t = <strong class="pnm-time">0.0</strong> s</div>
    <div class="pnm-card">y = <strong class="pnm-yval">${y0.toFixed(2)}</strong></div>
  </div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  const svg=c.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';

  function draw(){
    const disc=c*c-4*m*k;let dampType;
    if(c===0)dampType='無阻尼（簡諧運動）';
    else if(disc>0)dampType='過阻尼';
    else if(Math.abs(disc)<0.001)dampType='臨界阻尼';
    else dampType='欠阻尼';
    c.querySelector('.pnm-damp-type').textContent=dampType;
    c.querySelector('.pnm-time').textContent=t.toFixed(1);
    
    const y=solve(m,c,k,y0,v0,t);
    c.querySelector('.pnm-yval').textContent=y.toFixed(3);

    svg.innerHTML='';
    // Axes
    const toX=x=>M.left+(x+3)/6*pW,toY=y=>M.top+pH/2-y*30;
    svg.innerHTML+=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888"/>
      <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-dasharray="4,3"/>`;

    // Solution curve (last 6 seconds)
    let cd='';for(let i=0;i<=200;i++){const tt=Math.max(0,t-6)+i*6/200;const yy=solve(m,c,k,y0,v0,tt);const sx=toX(tt-Math.max(0,t-6)),sy=toY(yy);if(isFinite(sy))cd+=(i===0?'M':'L')+sx+','+sy;}
    const curve=document.createElementNS(ns,'path');
    curve.setAttribute('d',cd);curve.setAttribute('fill','none');
    curve.setAttribute('stroke','var(--ac)');curve.setAttribute('stroke-width','2');
    svg.appendChild(curve);

    // Current point
    const pt=document.createElementNS(ns,'circle');
    pt.setAttribute('cx',toX(Math.min(6,t)));pt.setAttribute('cy',toY(y));
    pt.setAttribute('r','5');pt.setAttribute('fill','#FF3B30');pt.setAttribute('stroke','#fff');pt.setAttribute('stroke-width','2');
    svg.appendChild(pt);

    // Equilibrium line
    svg.innerHTML+=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#34C759" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  draw();
  
  function stop(){playing=false;if(animId)cancelAnimationFrame(animId);c.querySelector('.pnm-play').textContent='▶ 播放';}
  c.querySelector('.pnm-play').addEventListener('click',()=>{
    if(playing){stop();return;}
    playing=true;c.querySelector('.pnm-play').textContent='⏸ 暫停';
    const t0=performance.now()/1000-t;
    function anim(now){if(!playing)return;t=now/1000-t0;if(t>12){t=12;stop();}draw();animId=requestAnimationFrame(anim);}
    requestAnimationFrame(anim);
  });
  ['m','c','k'].forEach(p=>c.querySelector(`.pnm-${p}`).addEventListener('input',e=>{
    const v=+e.target.value;if(p==='m')m=v;else if(p==='c')c=v;else k=v;
    e.target.nextElementSibling.textContent=v.toFixed(1);t=0;stop();draw();
  }));
});})();
