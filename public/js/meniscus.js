/**
 * MENISCUS LIQUID NAVIGATION (Customer Panel)
 * Zero-dependency liquid bottom navigation bar.
 * The active tab acts as a glowing bead that dips beneath the bar's liquid surface.
 * High-speed fluid spring physics with volume-preserving squash and dynamic meniscus trough.
 */

(function () {
  'use strict';

  function initMeniscus() {
    const dock = document.getElementById('dock');
    const svg = document.getElementById('skin');
    const fillP = document.getElementById('skinFill');
    const bead = document.getElementById('bead');
    if (!dock || !svg || !fillP || !bead) return null;

    const tabs = [...dock.querySelectorAll('.tab')];
    if (tabs.length === 0) return null;

    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const smooth = (t) => t * t * (3 - 2 * t);

    // Palettes per tab
    const hexToRgb = (s) => {
      const h = s.trim().replace('#', '');
      const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const ACC = tabs.map((t) => hexToRgb(getComputedStyle(t).getPropertyValue('--acc') || '#f59e0b'));
    const mixRGB = (a, b, t) =>
      `${Math.round(a[0] + (b[0] - a[0]) * t)} ${Math.round(a[1] + (b[1] - a[1]) * t)} ${Math.round(a[2] + (b[2] - a[2]) * t)}`;

    const G = { W: 0, H: 0, R: 18, D: 50, RB: 31, S: 14, CY: -2, slots: [], span: 70 };

    const reach = (s, rb, by) => Math.sqrt(Math.max((s + rb) ** 2 - (s - by) ** 2, 1));

    function measure() {
      const r = dock.getBoundingClientRect();
      const W = Math.round(r.width);
      const H = Math.round(r.height);
      if (W < 40 || H < 30) return false;

      G.slots = tabs.map((t) => {
        const b = t.getBoundingClientRect();
        return b.left - r.left + b.width / 2;
      });
      G.span = G.slots.length > 1 ? G.slots[1] - G.slots[0] : W;

      G.W = W;
      G.H = H;
      G.R = clamp(H * 0.28, 14, 22);
      G.CY = -2; // The bead sits slightly raised on the surface line

      let D = Math.min(H * 0.72, G.span * 0.74);
      const room = G.slots[0] - G.R - 4;
      for (let i = 0; i < 3; i++) {
        const hw = reach(D * 0.22, D / 2 + 5, G.CY);
        if (hw <= room) break;
        D *= room / hw;
      }
      G.D = Math.max(Math.round(D), 36);
      G.S = G.D * 0.22;
      G.RB = G.D / 2 + 5;

      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      dock.style.setProperty('--dock-r', `${G.R.toFixed(1)}px`);
      dock.style.setProperty('--bead-d', `${G.D}px`);
      dock.style.setProperty('--bead-cy', `${G.CY}px`);
      dock.style.setProperty('--rise', `${(H / 2 - G.CY).toFixed(1)}px`);
      return true;
    }

    function trough(bx, by, rb, sL, sR) {
      const { W, H, R } = G;

      const wing = (s, side) => {
        const L = s + rb;
        const half = reach(s, rb, by);
        const sx = bx + side * half;
        return { sx, s, tx: sx + ((bx - sx) / L) * s, ty: s + ((by - s) / L) * s };
      };
      const A = wing(sL, -1);
      const B = wing(sR, +1);

      const a0 = Math.atan2(A.ty - by, A.tx - bx);
      const a1 = Math.atan2(B.ty - by, B.tx - bx);
      let sweep = ((a0 - a1) * 180) / Math.PI;
      while (sweep < 0) sweep += 360;
      const large = sweep > 180 ? 1 : 0;

      const n = (v) => v.toFixed(2);
      return (
        `M0 ${n(R)}` +
        `A${n(R)} ${n(R)} 0 0 1 ${n(R)} 0` +
        `L${n(clamp(A.sx, R, W - R))} 0` +
        `A${n(sL)} ${n(sL)} 0 0 1 ${n(A.tx)} ${n(A.ty)}` +
        `A${n(rb)} ${n(rb)} 0 ${large} 0 ${n(B.tx)} ${n(B.ty)}` +
        `A${n(sR)} ${n(sR)} 0 0 1 ${n(clamp(B.sx, R, W - R))} 0` +
        `L${n(W - R)} 0` +
        `A${n(R)} ${n(R)} 0 0 1 ${n(W)} ${n(R)}` +
        `L${n(W)} ${n(H - R)}` +
        `A${n(R)} ${n(R)} 0 0 1 ${n(W - R)} ${n(H)}` +
        `L${n(R)} ${n(H)}` +
        `A${n(R)} ${n(R)} 0 0 1 0 ${n(H - R)}` +
        `Z`
      );
    }

    let x = 0;
    let v = 0;
    let target = 0;
    let dragging = false;
    let raf = 0;
    let last = 0;

    function paint() {
      const q = clamp(v / 1400, -1, 1) * (dragging ? 0.6 : 1);
      const mag = Math.abs(q);

      const sL = clamp(G.S * (1 + 0.08 * mag + 0.42 * q), G.S * 0.5, G.S * 2.2);
      const sR = clamp(G.S * (1 + 0.08 * mag - 0.42 * q), G.S * 0.5, G.S * 2.2);

      const d = trough(x, G.CY, G.RB, sL, sR);
      fillP.setAttribute('d', d);

      // Fast volume-preserving squash
      const sx = 1 + 0.12 * mag;
      bead.style.transform = `translate3d(${x.toFixed(2)}px,0,0) scale(${sx.toFixed(3)},${(1 / sx).toFixed(3)})`;

      let near = 0;
      let nd = Infinity;
      for (let i = 0; i < tabs.length; i++) {
        const dx = Math.abs(x - G.slots[i]);
        if (dx < nd) {
          nd = dx;
          near = i;
        }
        tabs[i].style.setProperty('--t', smooth(clamp(1 - dx / (G.span * 0.55), 0, 1)).toFixed(3));
      }

      const side = x >= G.slots[near] ? 1 : -1;
      const other = clamp(near + side, 0, tabs.length - 1);
      const t = other === near ? 0 : clamp(Math.abs(x - G.slots[near]) / G.span, 0, 1);
      dock.style.setProperty('--glow-rgb', mixRGB(ACC[near], ACC[other], t));
    }

    function loop(now) {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      // Snappy, rapid spring physics: K=360, C=30 (reaches destination cleanly in ~220ms, zero sluggishness!)
      const K = dragging ? 950 : 360;
      const C = dragging ? 56 : 30;
      let step = dt;
      while (step > 0) {
        const h = Math.min(step, 1 / 240);
        v += (-K * (x - target) - C * v) * h;
        x += v * h;
        step -= h;
      }

      paint();
      if (Math.abs(x - target) > 0.06 || Math.abs(v) > 0.8 || dragging) {
        run();
      } else {
        x = target;
        v = 0;
        paint();
      }
    }

    function run() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function jump(to) {
      target = to;
      if (reduced() && !dragging) {
        x = to;
        v = 0;
        paint();
        return;
      }
      run();
    }

    let current = Math.max(0, tabs.findIndex((t) => t.classList.contains('active') || t.getAttribute('aria-selected') === 'true'));

    function select(i, { animate = true, userClick = false } = {}) {
      if (i < 0 || i >= tabs.length) return;
      current = i;
      tabs.forEach((t, n) => {
        const isSel = n === current;
        t.setAttribute('aria-selected', String(isSel));
        t.classList.toggle('active', isSel);
      });
      if (animate) {
        jump(G.slots[current]);
      } else {
        x = target = G.slots[current];
        v = 0;
        paint();
      }
    }

    function selectById(tabId, animate = true) {
      const idx = tabs.findIndex((t) => t.id === tabId);
      if (idx !== -1) {
        select(idx, { animate });
      }
    }

    // Pointer Dragging on the bead
    let startX = 0;
    let pid = null;
    let suppressClick = false;

    dock.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      pid = e.pointerId;
      startX = e.clientX;
      suppressClick = false;
    });

    dock.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pid) return;
      if (!dragging && Math.abs(e.clientX - startX) < 8) return;
      if (!dragging) {
        dragging = true;
        suppressClick = true;
        dock.classList.add('is-dragging');
        dock.setPointerCapture(pid);
      }
      e.preventDefault();
      const left = dock.getBoundingClientRect().left;
      target = clamp(e.clientX - left, G.slots[0], G.slots[G.slots.length - 1]);
      run();
    });

    function release(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!dragging) return;
      dragging = false;
      dock.classList.remove('is-dragging');
      let near = 0;
      let nd = Infinity;
      G.slots.forEach((s, i) => {
        const d = Math.abs(target - s);
        if (d < nd) {
          nd = d;
          near = i;
        }
      });
      select(near);
      const tabEl = tabs[near];
      if (tabEl && typeof tabEl.click === 'function') {
        tabEl.click();
      }
      setTimeout(() => {
        suppressClick = false;
      }, 50);
    }

    dock.addEventListener('pointerup', release);
    dock.addEventListener('pointercancel', release);

    tabs.forEach((t, i) => {
      t.addEventListener('click', (e) => {
        if (suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        select(i, { animate: true, userClick: true });
      });
    });

    function layout(animate = false) {
      if (!measure()) return;
      if (animate) jump(G.slots[current]);
      else {
        x = target = G.slots[current];
        v = 0;
        paint();
      }
      dock.classList.add('is-ready');
    }

    layout(false);
    setTimeout(() => layout(false), 80);
    setTimeout(() => layout(false), 300);

    if (window.ResizeObserver) {
      new ResizeObserver(() => layout(false)).observe(dock);
    }
    window.addEventListener('resize', () => layout(false), { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(() => layout(false), 120));

    return {
      select,
      selectById,
      layout,
      slots: () => G.slots
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.__meniscus = initMeniscus();
  });
})();
