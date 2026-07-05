/* === Direction Field + Euler Model (Ch8) === */
(() => {
  document.querySelectorAll('[data-direction-field-model]').forEach(container => {
    const W = 560, H = 400, M = { top: 20, right: 20, bottom: 35, left: 45 };
    const plotW = W - M.left - M.right, plotH = H - M.top - M.bottom;
    let x0 = 0, y0 = 1, step = 0.2;
    
    const odes = [
      { name: "y' = y (指數增長)", fn: (x,y) => y, sol: x => Math.exp(x) },
      { name: "y' = x + y", fn: (x,y) => x + y, sol: x => 2*Math.exp(x) - x - 1 },
      { name: "y' = y(3-y) (logistic)", fn: (x,y) => y*(3-y), sol: x => 3/(1+2*Math.exp(-3*x)) }
    ];
    let odeIdx = 0;
    const xMin = -2, xMax = 4, yMin = -1, yMax = 5;

    const toX = x => M.left + (x - xMin)/(xMax - xMin)*plotW;
    const toY = y => M.top + plotH - (y - yMin)/(yMax - yMin)*plotH;

    container.innerHTML = `
      <div class="pnm-controls">
        <label>ODE：<select class="pnm-ode">${odes.map((o,i) => `<option value="${i}" ${i===odeIdx?'selected':''}>${o.name}</option>`).join('')}</select></label>
        <label>起點 x₀：<input type="range" class="pnm-x0" min="-1.5" max="3" step="0.1" value="${x0}"><span class="pnm-val">${x0.toFixed(1)}</span></label>
        <label>y₀：<input type="range" class="pnm-y0" min="0" max="4" step="0.1" value="${y0}"><span class="pnm-val">${y0.toFixed(1)}</span></label>
        <label>步長：<input type="range" class="pnm-step" min="0.05" max="0.5" step="0.05" value="${step}"><span class="pnm-val">${step.toFixed(2)}</span></label>
        <button class="pnm-btn">▶ 繪製 Euler 路徑</button>
      </div>
      <svg viewBox="0 0 ${W} ${H}" class="pnm-svg"></svg>
    `;

    const svg = container.querySelector('.pnm-svg'), ns = 'http://www.w3.org/2000/svg';
    
    function draw() {
      const ode = odes[odeIdx];
      svg.innerHTML = '';
      
      // Grid
      const g = document.createElementNS(ns, 'g');
      for (let i = 0; i <= 6; i++) {
        const x = xMin + i;
        g.innerHTML += `<line x1="${toX(x)}" y1="${M.top}" x2="${toX(x)}" y2="${H-M.bottom}" stroke="#e8e8e8" stroke-width="0.5"/>`;
      }
      for (let j = 0; j <= 6; j++) {
        const y = yMin + j;
        g.innerHTML += `<line x1="${M.left}" y1="${toY(y)}" x2="${W-M.right}" y2="${toY(y)}" stroke="#e8e8e8" stroke-width="0.5"/>`;
      }
      g.innerHTML += `<line x1="${M.left}" y1="${toY(0)}" x2="${W-M.right}" y2="${toY(0)}" stroke="#888" stroke-width="1"/>
        <line x1="${toX(0)}" y1="${M.top}" x2="${toX(0)}" y2="${H-M.bottom}" stroke="#888" stroke-width="1"/>`;
      svg.appendChild(g);

      // Direction field (small slope lines)
      const df = document.createElementNS(ns, 'g');
      df.setAttribute('stroke', '#94a3b8');
      df.setAttribute('stroke-width', '1');
      for (let xi = xMin + 0.25; xi <= xMax; xi += 0.5) {
        for (let yj = yMin + 0.25; yj <= yMax; yj += 0.5) {
          const m = ode.fn(xi, yj);
          const len = 8 / Math.sqrt(1 + m*m);
          const dx = len, dy = m * len;
          const cx = toX(xi), cy = toY(yj);
          df.innerHTML += `<line x1="${cx-dx}" y1="${cy-dy}" x2="${cx+dx}" y2="${cy+dy}"/>`;
        }
      }
      svg.appendChild(df);

      // Euler path
      const path = document.createElementNS(ns, 'polyline');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#FF3B30');
      path.setAttribute('stroke-width', '2');
      let pts = `${toX(x0)},${toY(y0)}`;
      let cx = x0, cy = y0;
      for (let t = 0; t < 50 && cx <= xMax && cy >= yMin && cy <= yMax; t++) {
        cy += ode.fn(cx, cy) * step;
        cx += step;
        if (cx > xMax) break;
        pts += ` ${toX(cx)},${toY(cy)}`;
      }
      // Backward
      cx = x0; cy = y0;
      let backPts = '';
      for (let t = 0; t < 30 && cx >= xMin && cy >= yMin && cy <= yMax; t++) {
        cy -= ode.fn(cx, cy) * step;
        cx -= step;
        if (cx < xMin) break;
        backPts = `${toX(cx)},${toY(cy)} ` + backPts;
      }
      path.setAttribute('points', backPts + pts);
      svg.appendChild(path);

      // Exact solution
      const exact = document.createElementNS(ns, 'polyline');
      exact.setAttribute('fill', 'none');
      exact.setAttribute('stroke', '#007AFF');
      exact.setAttribute('stroke-width', '1.5');
      exact.setAttribute('stroke-dasharray', '4,3');
      let ep = '';
      const adj = ode.sol(x0) - y0;
      for (let i = 0; i <= 120; i++) {
        const x = xMin + i*(xMax-xMin)/120;
        const y = ode.sol(x) - adj;
        if (y >= yMin && y <= yMax) ep += `${i===0||ep===''?'M':'L'}${toX(x)},${toY(y)} `;
      }
      exact.setAttribute('points', ep || '0,0');
      svg.appendChild(exact);

      // Start point
      const pt = document.createElementNS(ns, 'circle');
      pt.setAttribute('cx', toX(x0)); pt.setAttribute('cy', toY(y0));
      pt.setAttribute('r', '5'); pt.setAttribute('fill', '#FF3B30'); pt.setAttribute('stroke', '#fff'); pt.setAttribute('stroke-width', '2');
      svg.appendChild(pt);

      // Legend
      svg.innerHTML += `<text x="${W-130}" y="${M.top+14}" fill="#FF3B30" font-size="10">─ Euler 近似</text>
        <text x="${W-130}" y="${M.top+30}" fill="#007AFF" font-size="10">- - 精確解</text>`;
    }

    draw();
    container.querySelector('.pnm-ode').addEventListener('change', e => { odeIdx = +e.target.value; draw(); });
    container.querySelector('.pnm-x0').addEventListener('input', e => { x0 = +e.target.value; e.target.nextElementSibling.textContent = x0.toFixed(1); draw(); });
    container.querySelector('.pnm-y0').addEventListener('input', e => { y0 = +e.target.value; e.target.nextElementSibling.textContent = y0.toFixed(1); draw(); });
    container.querySelector('.pnm-step').addEventListener('input', e => { step = +e.target.value; e.target.nextElementSibling.textContent = step.toFixed(2); draw(); });
  });
})();
