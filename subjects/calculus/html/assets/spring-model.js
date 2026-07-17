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
