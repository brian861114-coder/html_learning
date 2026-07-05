/* === Gradient Field + Contour Model (Ch14) === */
(()=>{document.querySelectorAll('[data-gradient-model]').forEach(c=>{
  const W=520,H=380,M={top:20,right:20,bottom:30,left:45},pW=W-M.left-M.right,pH=H-M.top-M.bottom;
  let px=1,py=1;
  const funcs=[
    {name:'f(x,y)=x²+y²',f:(x,y)=>x*x+y*y,fx:(x,y)=>2*x,fy:(x,y)=>2*y,xR:2.5},
    {name:'f(x,y)=x²−y² (鞍點)',f:(x,y)=>x*x-y*y,fx:(x,y)=>2*x,fy:(x,y)=>-2*y,xR:2.5},
    {name:'f(x,y)=sin x·cos y',f:(x,y)=>Math.sin(x)*Math.cos(y),fx:(x,y)=>Math.cos(x)*Math.cos(y),fy:(x,y)=>-Math.sin(x)*Math.sin(y),xR:3}
  ];let fi=0;
  const f=funcs[fi],r=f.xR,toX=x=>M.left+(x+r)/(2*r)*pW,toY=y=>M.top+pH-(y+r)/(2*r)*pH;

  c.innerHTML=`<div class="pnm-controls">
    <label>函數：<select class="pnm-fs">${funcs.map((f,i)=>`<option value="${i}" ${i===fi?'selected':''}>${f.name}</option>`).join('')}</select></label>
    <label>x：<input type="range" class="pnm-px" min="-2" max="2" step="0.1" value="${px}"><span class="pnm-val">${px.toFixed(1)}</span></label>
    <label>y：<input type="range" class="pnm-py" min="-2" max="2" step="0.1" value="${py}"><span class="pnm-val">${py.toFixed(1)}</span></label>
  </div>
  <div class="pnm-display">
    <div class="pnm-card">∇f = (<strong class="pnm-gx">—</strong>, <strong class="pnm-gy">—</strong>)</div>
    <div class="pnm-card">|∇f| = <strong class="pnm-gm">—</strong></div>
    <div class="pnm-card">f = <strong class="pnm-fv">—</strong></div>
  </div>
  <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>`;
  const svg=c.querySelector('.pnm-svg'),ns='http://www.w3.org/2000/svg';
  
  function draw(){
    const fn=funcs[fi];svg.innerHTML='';
    // Axes
    const g=document.createElementNS(ns,'g');
    g.innerHTML=`<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888"/>
      <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888"/>`;
    svg.appendChild(g);

    // Contour lines
    const levels=[0.5,1,2,3,4,6];
    levels.forEach(lv=>{
      let d='';let first=true;
      for(let i=0;i<=360;i+=3){
        const ang=i*Math.PI/180;
        // Simple contour tracing: find r such that f(r*cos,r*sin)=level
        let lo=0,hi=3;
        for(let s=0;s<20;s++){const mid=(lo+hi)/2;const v=fn.f(mid*Math.cos(ang),mid*Math.sin(ang));if(v<lv)lo=mid;else hi=mid;}
        const rr=(lo+hi)/2;
        const sx=toX(rr*Math.cos(ang)),sy=toY(rr*Math.sin(ang));
        if(rr>0.1&&rr<2.8&&isFinite(sy)){d+=(first?'M':'L')+sx+','+sy;first=false;}else first=true;
      }
      if(d){
        const p=document.createElementNS(ns,'path');p.setAttribute('d',d);
        p.setAttribute('fill','none');p.setAttribute('stroke','#94a3b8');p.setAttribute('stroke-width','0.8');
        svg.appendChild(p);
      }
    });

    // Gradient vectors (sparse grid)
    const gradG=document.createElementNS(ns,'g');
    gradG.setAttribute('stroke','#007AFF');gradG.setAttribute('stroke-width','1.5');
    for(let x=-2;x<=2;x+=0.8){for(let y=-2;y<=2;y+=0.8){
      const gx=fn.fx(x,y),gy=fn.fy(x,y),gm=Math.sqrt(gx*gx+gy*gy);
      if(gm<0.01)continue;const s=15/gm;
      gradG.innerHTML+=`<line x1="${toX(x)}" y1="${toY(y)}" x2="${toX(x+gx*s/40)}" y2="${toY(y+gy*s/40)}"/>`;
    }}
    svg.appendChild(gradG);

    // Selected point + gradient
    const gx0=fn.fx(px,py),gy0=fn.fy(px,py),gm0=Math.sqrt(gx0*gx0+gy0*gy0);
    const s=gm0>0?25/gm0:0;
    const ag=document.createElementNS(ns,'line');
    ag.setAttribute('x1',toX(px));ag.setAttribute('y1',toY(py));
    ag.setAttribute('x2',toX(px+gx0*s/50));ag.setAttribute('y2',toY(py+gy0*s/50));
    ag.setAttribute('stroke','#FF3B30');ag.setAttribute('stroke-width','3');
    svg.appendChild(ag);
    const pt=document.createElementNS(ns,'circle');
    pt.setAttribute('cx',toX(px));pt.setAttribute('cy',toY(py));
    pt.setAttribute('r','5');pt.setAttribute('fill','#FF3B30');pt.setAttribute('stroke','#fff');pt.setAttribute('stroke-width','2');
    svg.appendChild(pt);

    c.querySelector('.pnm-gx').textContent=gx0.toFixed(2);
    c.querySelector('.pnm-gy').textContent=gy0.toFixed(2);
    c.querySelector('.pnm-gm').textContent=gm0.toFixed(2);
    c.querySelector('.pnm-fv').textContent=fn.f(px,py).toFixed(2);
  }
  draw();
  c.querySelector('.pnm-fs').addEventListener('change',e=>{fi=+e.target.value;draw();});
  c.querySelector('.pnm-px').addEventListener('input',e=>{px=+e.target.value;e.target.nextElementSibling.textContent=px.toFixed(1);draw();});
  c.querySelector('.pnm-py').addEventListener('input',e=>{py=+e.target.value;e.target.nextElementSibling.textContent=py.toFixed(1);draw();});
});})();
