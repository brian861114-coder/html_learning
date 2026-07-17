/* === Secant-Tangent Model === */
(() => {
  const containers = document.querySelectorAll('[data-secant-tangent-model]');
  containers.forEach(container => {
    const W = 600, H = 380, M = { top: 20, right: 30, bottom: 40, left: 50 };
    const plotW = W - M.left - M.right, plotH = H - M.top - M.bottom;
    let a = 1, h = 1.5, funcIdx = 0;
    
    const functions = [
      { name: 'f(x) = x²', fn: x => x * x, deriv: x => 2 * x },
      { name: 'f(x) = x³', fn: x => x * x * x, deriv: x => 3 * x * x },
      { name: 'f(x) = sin x', fn: x => Math.sin(x), deriv: x => Math.cos(x) }
    ];

    // Build UI
    container.innerHTML = `
      <div class="pnm-controls">
        <label>函數：<select class="pnm-func-select">${functions.map((f,i) => `<option value="${i}" ${i===funcIdx?'selected':''}>${f.name}</option>`).join('')}</select></label>
        <label>a (固定點)：<input type="range" class="pnm-slider-a" min="-2" max="2" step="0.1" value="${a}"><span class="pnm-val">${a.toFixed(1)}</span></label>
        <label>h：<input type="range" class="pnm-slider-h" min="-2" max="2" step="0.02" value="${h}"><span class="pnm-val">${h.toFixed(2)}</span></label>
        <button class="pnm-btn pnm-btn-animate">▶ h → 0</button>
      </div>
      <div class="pnm-display">
        <div class="pnm-card">割線斜率 m<sub>sec</sub> = <strong class="pnm-secant-slope">—</strong></div>
        <div class="pnm-card">切線斜率 m<sub>tan</sub> = <strong class="pnm-tangent-slope">—</strong></div>
        <div class="pnm-card">h = <strong class="pnm-h-val">${h.toFixed(2)}</strong></div>
      </div>
      <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>
    `;

    const svg = container.querySelector('.pnm-svg');
    const ns = 'http://www.w3.org/2000/svg';

    // Coordinate transform
    const xRange = 4; // [-2, 2]
    const toX = x => M.left + (x + 2) / xRange * plotW;
    const toY = y => M.top + plotH - (y + 2) / xRange * plotH;

    // Draw axes
    const axes = document.createElementNS(ns, 'g');
    axes.innerHTML = `
      <line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888" stroke-width="1"/>
      <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-width="1"/>
      <text x="${W-M.right-5}" y="${toY(0)-8}" fill="#888" font-size="11" text-anchor="end">x</text>
      <text x="${toX(0)+8}" y="${M.top+15}" fill="#888" font-size="11">y</text>
    `;
    svg.appendChild(axes);

    // Grid lines
    const grid = document.createElementNS(ns, 'g');
    grid.setAttribute('stroke', '#e0e0e0');
    grid.setAttribute('stroke-width', '0.5');
    for (let i = -2; i <= 2; i += 0.5) {
      grid.innerHTML += `<line x1="${toX(i)}" y1="${M.top}" x2="${toX(i)}" y2="${H-M.bottom}"/>`;
      grid.innerHTML += `<line x1="${M.left}" y1="${toY(i)}" x2="${W-M.right}" y2="${toY(i)}"/>`;
    }
    svg.appendChild(grid);

    // Curve, points, lines (will be redrawn)
    const curvePath = document.createElementNS(ns, 'path');
    curvePath.setAttribute('fill', 'none');
    curvePath.setAttribute('stroke', 'var(--ac, #007AFF)');
    curvePath.setAttribute('stroke-width', '2');
    svg.appendChild(curvePath);

    const pointP = document.createElementNS(ns, 'circle');
    pointP.setAttribute('r', '6');
    pointP.setAttribute('fill', '#FF3B30');
    pointP.setAttribute('stroke', '#fff');
    pointP.setAttribute('stroke-width', '2');
    svg.appendChild(pointP);

    const pointQ = document.createElementNS(ns, 'circle');
    pointQ.setAttribute('r', '6');
    pointQ.setAttribute('fill', '#FF9500');
    pointQ.setAttribute('stroke', '#fff');
    pointQ.setAttribute('stroke-width', '2');
    svg.appendChild(pointQ);

    const secantLine = document.createElementNS(ns, 'line');
    secantLine.setAttribute('stroke', '#FF9500');
    secantLine.setAttribute('stroke-width', '2');
    secantLine.setAttribute('stroke-dasharray', '6,3');
    svg.appendChild(secantLine);

    const tangentLine = document.createElementNS(ns, 'line');
    tangentLine.setAttribute('stroke', '#FF3B30');
    tangentLine.setAttribute('stroke-width', '2');
    svg.appendChild(tangentLine);

    // Labels
    const labelP = document.createElementNS(ns, 'text');
    labelP.setAttribute('fill', '#FF3B30');
    labelP.setAttribute('font-size', '13');
    labelP.setAttribute('font-weight', 'bold');
    labelP.textContent = 'P';
    svg.appendChild(labelP);

    const labelQ = document.createElementNS(ns, 'text');
    labelQ.setAttribute('fill', '#FF9500');
    labelQ.setAttribute('font-size', '13');
    labelQ.setAttribute('font-weight', 'bold');
    labelQ.textContent = 'Q';
    svg.appendChild(labelQ);

    // Legend
    const legend = document.createElementNS(ns, 'g');
    legend.innerHTML = `
      <line x1="${W-120}" y1="${M.top+10}" x2="${W-90}" y2="${M.top+10}" stroke="#FF3B30" stroke-width="2"/>
      <text x="${W-85}" y1="${M.top+14}" fill="#888" font-size="11">切線</text>
      <line x1="${W-120}" y1="${M.top+28}" x2="${W-90}" y2="${M.top+28}" stroke="#FF9500" stroke-width="2" stroke-dasharray="6,3"/>
      <text x="${W-85}" y1="${M.top+32}" fill="#888" font-size="11">割線</text>
    `;
    svg.appendChild(legend);

    function draw() {
      const f = functions[funcIdx];
      
      // Draw curve
      let d = '';
      for (let i = 0; i <= 200; i++) {
        const x = -2 + i * 4 / 200;
        const y = f.fn(x);
        const sx = toX(x), sy = toY(y);
        if (isFinite(sy)) d += (i === 0 ? 'M' : 'L') + sx + ',' + sy;
      }
      curvePath.setAttribute('d', d);

      const fa = f.fn(a), fah = f.fn(a + h);
      const px = toX(a), py = toY(fa);
      const qx = toX(a + h), qy = toY(fah);

      // Points
      pointP.setAttribute('cx', px); pointP.setAttribute('cy', py);
      pointQ.setAttribute('cx', qx); pointQ.setAttribute('cy', qy);

      // Secant
      const secSlope = (fah - fa) / h;
      const secX1 = -2, secY1 = fa + secSlope * (-2 - a);
      const secX2 = 2, secY2 = fa + secSlope * (2 - a);
      secantLine.setAttribute('x1', toX(secX1)); secantLine.setAttribute('y1', toY(secY1));
      secantLine.setAttribute('x2', toX(secX2)); secantLine.setAttribute('y2', toY(secY2));

      // Tangent
      const tanSlope = f.deriv(a);
      const tanX1 = -2, tanY1 = fa + tanSlope * (-2 - a);
      const tanX2 = 2, tanY2 = fa + tanSlope * (2 - a);
      tangentLine.setAttribute('x1', toX(tanX1)); tangentLine.setAttribute('y1', toY(tanY1));
      tangentLine.setAttribute('x2', toX(tanX2)); tangentLine.setAttribute('y2', toY(tanY2));

      // Labels
      labelP.setAttribute('x', px + 10); labelP.setAttribute('y', py - 10);
      labelQ.setAttribute('x', qx + 10); labelQ.setAttribute('y', qy - 10);

      // Update display
      container.querySelector('.pnm-secant-slope').textContent = isFinite(secSlope) ? secSlope.toFixed(3) : '—';
      container.querySelector('.pnm-tangent-slope').textContent = tanSlope.toFixed(3);
      container.querySelector('.pnm-h-val').textContent = h.toFixed(3);
      container.querySelector('.pnm-slider-h').nextElementSibling.textContent = h.toFixed(2);
    }

    draw();

    // Events
    container.querySelector('.pnm-func-select').addEventListener('change', e => {
      funcIdx = +e.target.value; draw();
    });
    container.querySelector('.pnm-slider-a').addEventListener('input', e => {
      a = +e.target.value; e.target.nextElementSibling.textContent = a.toFixed(1); draw();
    });
    container.querySelector('.pnm-slider-h').addEventListener('input', e => {
      h = +e.target.value; draw();
    });
    container.querySelector('.pnm-btn-animate').addEventListener('click', () => {
      const startH = h, startTime = performance.now();
      const duration = 2000;
      function anim(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        h = startH * (1 - eased);
        container.querySelector('.pnm-slider-h').value = h;
        draw();
        if (t < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
    });
  });
})();
