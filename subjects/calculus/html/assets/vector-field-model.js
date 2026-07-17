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
