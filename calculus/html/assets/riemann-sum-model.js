/* === Riemann Sum Model === */
(() => {
  const containers = document.querySelectorAll('[data-riemann-model]');
  containers.forEach(container => {
    const W = 600, H = 350, M = { top: 20, right: 25, bottom: 40, left: 55 };
    const plotW = W - M.left - M.right, plotH = H - M.top - M.bottom;
    let a = 0, b = 2, n = 4, mode = 'right';
    
    const functions = [
      { name: 'f(x) = x²', fn: x => x*x, anti: x => x*x*x/3 },
      { name: 'f(x) = x³', fn: x => x*x*x, anti: x => x*x*x*x/4 },
      { name: 'f(x) = √x', fn: x => Math.sqrt(Math.max(0,x)), anti: x => 2/3*Math.pow(Math.max(0,x),1.5), domain: [0,4] }
    ];
    let funcIdx = 0;

    container.innerHTML = `
      <div class="pnm-controls">
        <label>函數：<select class="pnm-fs">${functions.map((f,i) => `<option value="${i}" ${i===funcIdx?'selected':''}>${f.name}</option>`).join('')}</select></label>
        <label>n：<input type="range" class="pnm-slider-n" min="1" max="50" value="${n}"><span class="pnm-val">${n}</span></label>
        <label>端點：<select class="pnm-mode"><option value="left" ${mode==='left'?'selected':''}>左端點</option><option value="right" selected>右端點</option><option value="mid">中點</option></select></label>
        <button class="pnm-btn pnm-btn-anim">▶ n → 50</button>
      </div>
      <div class="pnm-display">
        <div class="pnm-card">近似面積 ≈ <strong class="pnm-apx">—</strong></div>
        <div class="pnm-card">精確值 = <strong class="pnm-exact">—</strong></div>
        <div class="pnm-card">誤差 = <strong class="pnm-err">—</strong></div>
      </div>
      <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>
    `;

    const svg = container.querySelector('.pnm-svg');
    const ns = 'http://www.w3.org/2000/svg';

    function draw() {
      const f = functions[funcIdx];
      const dom = f.domain || [0, 2];
      if (funcIdx === 2) { a = dom[0]; b = dom[1]; }
      
      const yMin = 0, yMax = Math.max(f.fn(b) * 1.2, 1);
      const toX = x => M.left + (x - a) / (b - a) * plotW;
      const toY = y => M.top + plotH - (y - yMin) / (yMax - yMin) * plotH;

      svg.innerHTML = '';
      
      // Axes
      const ax = document.createElementNS(ns, 'g');
      ax.innerHTML = `
        <line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888" stroke-width="1"/>
        <line x1="${toX(a)}" y1="${M.top}" x2="${toX(a)}" y2="${H-M.bottom}" stroke="#888" stroke-width="1"/>
      `;
      svg.appendChild(ax);

      // Curve
      const dx = (b - a) / n;
      let curveD = '';
      for (let i = 0; i <= 300; i++) {
        const x = a + i * (b - a) / 300;
        const y = f.fn(x);
        const sx = toX(x), sy = toY(y);
        if (isFinite(sy)) curveD += (i === 0 ? 'M' : 'L') + sx + ',' + sy;
      }
      const curve = document.createElementNS(ns, 'path');
      curve.setAttribute('d', curveD);
      curve.setAttribute('fill', 'none');
      curve.setAttribute('stroke', 'var(--ac)');
      curve.setAttribute('stroke-width', '2.5');
      svg.appendChild(curve);

      // Rectangles
      let sum = 0;
      const rects = document.createElementNS(ns, 'g');
      for (let i = 0; i < n; i++) {
        const xi = a + i * dx;
        let sampleX;
        if (mode === 'left') sampleX = xi;
        else if (mode === 'right') sampleX = xi + dx;
        else sampleX = xi + dx / 2;
        
        const h = f.fn(sampleX);
        sum += h * dx;
        
        const rx = toX(xi), rw = toX(xi + dx) - rx;
        const ry = toY(h), rh = toY(0) - ry;
        
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', rx); rect.setAttribute('y', ry);
        rect.setAttribute('width', Math.max(1, rw)); rect.setAttribute('height', rh);
        rect.setAttribute('fill', mode === 'left' ? '#FF950044' : mode === 'right' ? '#007AFF44' : '#34C75944');
        rect.setAttribute('stroke', mode === 'left' ? '#FF9500' : mode === 'right' ? '#007AFF' : '#34C759');
        rect.setAttribute('stroke-width', '1');
        rects.appendChild(rect);
      }
      svg.appendChild(rects);

      // Exact area
      const exact = f.anti(b) - f.anti(a);
      
      container.querySelector('.pnm-apx').textContent = sum.toFixed(4);
      container.querySelector('.pnm-exact').textContent = exact.toFixed(4);
      container.querySelector('.pnm-err').textContent = Math.abs(sum - exact).toFixed(4);
      container.querySelector('.pnm-slider-n').nextElementSibling.textContent = n;
    }

    draw();

    container.querySelector('.pnm-fs').addEventListener('change', e => { funcIdx = +e.target.value; draw(); });
    container.querySelector('.pnm-slider-n').addEventListener('input', e => { n = +e.target.value; draw(); });
    container.querySelector('.pnm-mode').addEventListener('change', e => { mode = e.target.value; draw(); });
    container.querySelector('.pnm-btn-anim').addEventListener('click', () => {
      const startN = n, startTime = performance.now();
      const duration = 2000;
      function anim(now) {
        const t = Math.min(1, (now - startTime) / duration);
        n = Math.max(1, Math.round(startN + (50 - startN) * t));
        container.querySelector('.pnm-slider-n').value = n;
        draw();
        if (t < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
    });
  });
})();
