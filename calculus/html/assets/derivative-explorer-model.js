/* === Derivative Explorer Model === */
(() => {
  const containers = document.querySelectorAll('[data-derivative-model]');
  containers.forEach(container => {
    const W = 580, H1 = 220, H2 = 180, M = { top: 15, right: 20, bottom: 30, left: 45 };
    const plotW = W - M.left - M.right;
    let x0 = 0.5;
    
    const functions = [
      { name: 'f(x) = x²', fn: x => x*x, deriv: x => 2*x, xRange: 2.5 },
      { name: 'f(x) = x³', fn: x => x*x*x, deriv: x => 3*x*x, xRange: 2 },
      { name: 'f(x) = sin x', fn: x => Math.sin(x), deriv: x => Math.cos(x), xRange: Math.PI + 0.5 }
    ];
    let funcIdx = 0;

    function plotH(i) { return i === 0 ? H1 : H2; }
    
    container.innerHTML = `
      <div class="pnm-controls">
        <label>函數：<select class="pnm-func-sel">${functions.map((f,i) => `<option value="${i}" ${i===funcIdx?'selected':''}>${f.name}</option>`).join('')}</select></label>
        <label>x：<input type="range" class="pnm-slider-x" min="-2" max="2" step="0.02" value="${x0}"><span class="pnm-val">${x0.toFixed(2)}</span></label>
        <button class="pnm-btn pnm-btn-anim">▶ 自動移動</button>
      </div>
      <div class="pnm-display">
        <div class="pnm-card">f(<span class="pnm-x0">${x0.toFixed(2)}</span>) = <strong class="pnm-fx">—</strong></div>
        <div class="pnm-card">f'(<span class="pnm-x0b">${x0.toFixed(2)}</span>) = <strong class="pnm-fpx">—</strong></div>
        <div class="pnm-card">切線斜率 = <strong class="pnm-tan-m">—</strong></div>
      </div>
      <svg viewBox="0 0 ${W} ${H1}" class="pnm-svg pnm-svg-top"></svg>
      <svg viewBox="0 0 ${W} ${H2}" class="pnm-svg pnm-svg-bot"></svg>
    `;

    const svgTop = container.querySelector('.pnm-svg-top');
    const svgBot = container.querySelector('.pnm-svg-bot');
    const ns = 'http://www.w3.org/2000/svg';

    function buildSVG(svg, H, xRange, yLabel) {
      const plotH = H - M.top - M.bottom;
      const toX = x => M.left + (x + xRange) / (2*xRange) * plotW;
      const toY = y => M.top + plotH - (y + xRange) / (2*xRange) * plotH;
      
      // Axes
      const g = document.createElementNS(ns, 'g');
      g.innerHTML = `
        <line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888" stroke-width="1"/>
        <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-width="1"/>
        <text x="${W-M.right-5}" y="${toY(0)-6}" fill="#888" font-size="10">x</text>
        <text x="${toX(0)+6}" y="${M.top+12}" fill="#888" font-size="10">${yLabel}</text>
      `;
      svg.appendChild(g);
      
      // Grid
      const grid = document.createElementNS(ns, 'g');
      grid.setAttribute('stroke', '#e8e8e8');
      grid.setAttribute('stroke-width', '0.5');
      for (let i = -xRange; i <= xRange; i += 0.5) {
        grid.innerHTML += `<line x1="${toX(i)}" y1="${M.top}" x2="${toX(i)}" y2="${H-M.bottom}"/>`;
        grid.innerHTML += `<line x1="${M.left}" y1="${toY(i)}" x2="${W-M.right}" y2="${toY(i)}"/>`;
      }
      svg.appendChild(grid);
      
      return { toX, toY, plotH };
    }

    const tTop = buildSVG(svgTop, H1, functions[0].xRange, 'f(x)');
    const tBot = buildSVG(svgBot, H2, functions[0].xRange, "f'(x)");

    // Curve paths
    const curveTop = document.createElementNS(ns, 'path');
    curveTop.setAttribute('fill', 'none'); curveTop.setAttribute('stroke', 'var(--ac)'); curveTop.setAttribute('stroke-width', '2');
    svgTop.appendChild(curveTop);
    
    const curveBot = document.createElementNS(ns, 'path');
    curveBot.setAttribute('fill', 'none'); curveBot.setAttribute('stroke', 'var(--ac)'); curveBot.setAttribute('stroke-width', '2');
    svgBot.appendChild(curveBot);

    // Point + tangent on top
    const ptTop = document.createElementNS(ns, 'circle');
    ptTop.setAttribute('r', '5'); ptTop.setAttribute('fill', '#FF3B30'); ptTop.setAttribute('stroke', '#fff'); ptTop.setAttribute('stroke-width', '2');
    svgTop.appendChild(ptTop);

    const tanLine = document.createElementNS(ns, 'line');
    tanLine.setAttribute('stroke', '#FF3B30'); tanLine.setAttribute('stroke-width', '1.5');
    svgTop.appendChild(tanLine);

    // Point on bottom
    const ptBot = document.createElementNS(ns, 'circle');
    ptBot.setAttribute('r', '5'); ptBot.setAttribute('fill', '#FF3B30'); ptBot.setAttribute('stroke', '#fff'); ptBot.setAttribute('stroke-width', '2');
    svgBot.appendChild(ptBot);

    // Vertical dashed guide
    const vGuide = document.createElementNS(ns, 'line');
    vGuide.setAttribute('stroke', '#ccc'); vGuide.setAttribute('stroke-width', '1'); vGuide.setAttribute('stroke-dasharray', '4,4');
    svgTop.appendChild(vGuide);
    const vGuideB = document.createElementNS(ns, 'line');
    vGuideB.setAttribute('stroke', '#ccc'); vGuideB.setAttribute('stroke-width', '1'); vGuideB.setAttribute('stroke-dasharray', '4,4');
    svgBot.appendChild(vGuideB);

    function draw() {
      const f = functions[funcIdx];
      const xr = f.xRange;
      
      // Rebuild transform functions with current range
      const topH = H1 - M.top - M.bottom, botH = H2 - M.top - M.bottom;
      const tX = x => M.left + (x + xr) / (2*xr) * plotW;
      const tY = (y, H, pH) => M.top + pH - (y + xr) / (2*xr) * pH;
      const toYTop = y => tY(y, H1, topH);
      const toYBot = y => tY(y, H2, botH);

      // Update axes Y range labels
      svgTop.querySelectorAll('text').forEach(t => { if (t.textContent === 'f(x)') t.setAttribute('y', M.top + 12); });
      svgBot.querySelectorAll('text').forEach(t => { if (t.textContent === "f'(x)") t.setAttribute('y', M.top + 12); });

      // Rebuild grid
      [svgTop, svgBot].forEach(s => {
        const grids = s.querySelectorAll('g[stroke="#e8e8e8"]');
        grids.forEach(g => g.remove());
      });
      
      // Redraw curves
      const drawCurve = (svg, fn, H, pH, color) => {
        let d = '';
        for (let i = 0; i <= 200; i++) {
          const x = -xr + i * 2*xr / 200;
          const y = fn(x);
          const sx = tX(x), sy = tY(y, H, pH);
          if (isFinite(sy) && Math.abs(sy - M.top) < pH + 100) d += (i === 0 ? 'M' : 'L') + sx + ',' + sy;
        }
        svg.querySelector('path[fill="none"]').setAttribute('d', d);
      };
      
      drawCurve(svgTop, f.fn, H1, topH);
      drawCurve(svgBot, f.deriv, H2, botH);

      // Points
      const fx = f.fn(x0), fpx = f.deriv(x0);
      ptTop.setAttribute('cx', tX(x0)); ptTop.setAttribute('cy', toYTop(fx));
      ptBot.setAttribute('cx', tX(x0)); ptBot.setAttribute('cy', toYBot(fpx));

      // Tangent line
      const tanLen = 1.5;
      tanLine.setAttribute('x1', tX(x0 - tanLen)); tanLine.setAttribute('y1', toYTop(fx - fpx * tanLen));
      tanLine.setAttribute('x2', tX(x0 + tanLen)); tanLine.setAttribute('y2', toYTop(fx + fpx * tanLen));

      // Vertical guides
      vGuide.setAttribute('x1', tX(x0)); vGuide.setAttribute('y1', M.top);
      vGuide.setAttribute('x2', tX(x0)); vGuide.setAttribute('y2', H1 - M.bottom);
      vGuideB.setAttribute('x1', tX(x0)); vGuideB.setAttribute('y1', M.top);
      vGuideB.setAttribute('x2', tX(x0)); vGuideB.setAttribute('y2', H2 - M.bottom);

      // Update displays
      container.querySelector('.pnm-x0').textContent = x0.toFixed(2);
      container.querySelector('.pnm-x0b').textContent = x0.toFixed(2);
      container.querySelector('.pnm-fx').textContent = fx.toFixed(3);
      container.querySelector('.pnm-fpx').textContent = fpx.toFixed(3);
      container.querySelector('.pnm-tan-m').textContent = fpx.toFixed(3);
      container.querySelector('.pnm-slider-x').nextElementSibling.textContent = x0.toFixed(2);
    }

    draw();

    container.querySelector('.pnm-func-sel').addEventListener('change', e => { funcIdx = +e.target.value; draw(); });
    container.querySelector('.pnm-slider-x').addEventListener('input', e => { x0 = +e.target.value; draw(); });
    container.querySelector('.pnm-btn-anim').addEventListener('click', () => {
      const startX = x0, startTime = performance.now();
      const duration = 4000;
      function anim(now) {
        const t = (now - startTime) / duration;
        x0 = functions[funcIdx].xRange * Math.sin(t * Math.PI * 2);
        container.querySelector('.pnm-slider-x').value = x0;
        draw();
        if (t < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
    });
  });
})();
