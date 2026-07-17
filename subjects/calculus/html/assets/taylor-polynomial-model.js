/* === Taylor Polynomial Model (Ch9-10) === */
(() => {
  document.querySelectorAll('[data-taylor-model]').forEach(container => {
    const W = 560, H = 340, M = { top: 15, right: 20, bottom: 30, left: 50 };
    const plotW = W - M.left - M.right, plotH = H - M.top - M.bottom;
    let degree = 2, center = 0;
    
    const funcs = [
      { name: 'f(x) = sin x', fn: x => Math.sin(x), taylor: (n,a) => {
        const coeffs = []; for (let k=0;k<=n;k++) { const d = k%4; if(d===0) coeffs.push(0); else if(d===1) coeffs.push(1); else if(d===2) coeffs.push(0); else coeffs.push(-1); }
        return x => { let s=0,f=1; for(let k=0;k<=n;k++){if(k>0)f*=k;if(coeffs[k]!==0)s+=coeffs[k]*Math.pow(x-a,k)/f;} return s; }; },
        xRange: 6 },
      { name: 'f(x) = eˣ', fn: x => Math.exp(x), taylor: (n,a) => { const ea = Math.exp(a); return x => { let s=0,f=1; for(let k=0;k<=n;k++){if(k>0)f*=k;s+=ea*Math.pow(x-a,k)/f;} return s; }; },
        xRange: 4 },
      { name: 'f(x) = cos x', fn: x => Math.cos(x), taylor: (n,a) => { const c = Math.cos(a), s = Math.sin(a); const signs = [[c,0],[-s,1],[-c,2],[s,3]]; return x => { let sum=0,f=1; for(let k=0;k<=n;k++){if(k>0)f*=k; const si = signs[k%4]; if(si[0]!==0)sum+=si[0]*Math.pow(x-a,k)/f;} return sum; }; },
        xRange: 6 }
    ];
    let fi = 0;
    
    const f = funcs[fi], xMin = center - f.xRange/2, xMax = center + f.xRange/2, yMin = -3, yMax = 3;
    const toX = x => M.left + (x-xMin)/(xMax-xMin)*plotW;
    const toY = y => M.top + plotH - (y-yMin)/(yMax-yMin)*plotH;

    container.innerHTML = `
      <div class="pnm-controls">
        <label>函數：<select class="pnm-fs">${funcs.map((f,i) => `<option value="${i}" ${i===fi?'selected':''}>${f.name}</option>`).join('')}</select></label>
        <label>展開中心 a：<input type="range" class="pnm-a" min="-2" max="2" step="0.1" value="${center}"><span class="pnm-val">${center.toFixed(1)}</span></label>
        <label>次數 n：<input type="range" class="pnm-n" min="1" max="12" step="1" value="${degree}"><span class="pnm-val">${degree}</span></label>
      </div>
      <div class="pnm-display">
        <div class="pnm-card">T<sub>${degree}</sub>(x) 在 x=${center.toFixed(1)} 的最大誤差 ≈ <strong class="pnm-err">—</strong></div>
      </div>
      <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>
    `;

    const svg = container.querySelector('.pnm-svg'), ns = 'http://www.w3.org/2000/svg';
    
    function draw() {
      const func = funcs[fi], t = func.taylor(degree, center);
      svg.innerHTML = '';
      
      // Axes + grid
      const g = document.createElementNS(ns, 'g');
      g.innerHTML = `<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888" stroke-width="1"/>
        <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-width="1"/>`;
      svg.appendChild(g);

      // Original function (thick blue)
      let d = '';
      for (let i = 0; i <= 300; i++) {
        const x = xMin + i*(xMax-xMin)/300;
        const y = func.fn(x);
        const sx = toX(x), sy = toY(y);
        if (isFinite(sy)) d += (i===0?'M':'L')+sx+','+sy;
      }
      const orig = document.createElementNS(ns, 'path');
      orig.setAttribute('d', d); orig.setAttribute('fill', 'none');
      orig.setAttribute('stroke', 'var(--ac)'); orig.setAttribute('stroke-width', '2.5');
      svg.appendChild(orig);

      // Taylor polynomial (red dashed)
      let td = '';
      let maxErr = 0;
      for (let i = 0; i <= 300; i++) {
        const x = xMin + i*(xMax-xMin)/300;
        const y = t(x);
        const realY = func.fn(x);
        maxErr = Math.max(maxErr, Math.abs(y - realY));
        const sx = toX(x), sy = toY(y);
        if (isFinite(sy)) td += (i===0?'M':'L')+sx+','+sy;
      }
      const tPath = document.createElementNS(ns, 'path');
      tPath.setAttribute('d', td); tPath.setAttribute('fill', 'none');
      tPath.setAttribute('stroke', '#FF3B30'); tPath.setAttribute('stroke-width', '2');
      tPath.setAttribute('stroke-dasharray', '6,3');
      svg.appendChild(tPath);

      // Center point
      const cp = document.createElementNS(ns, 'circle');
      cp.setAttribute('cx', toX(center)); cp.setAttribute('cy', toY(func.fn(center)));
      cp.setAttribute('r', '4'); cp.setAttribute('fill', '#34C759'); cp.setAttribute('stroke', '#fff'); cp.setAttribute('stroke-width', '1.5');
      svg.appendChild(cp);

      container.querySelector('.pnm-err').textContent = maxErr.toFixed(4);
      container.querySelector('.pnm-n').nextElementSibling.textContent = degree;
    }
    draw();
    container.querySelector('.pnm-fs').addEventListener('change', e => { fi = +e.target.value; draw(); });
    container.querySelector('.pnm-a').addEventListener('input', e => { center = +e.target.value; e.target.nextElementSibling.textContent = center.toFixed(1); draw(); });
    container.querySelector('.pnm-n').addEventListener('input', e => { degree = +e.target.value; draw(); });
  });
})();
