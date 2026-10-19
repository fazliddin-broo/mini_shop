/**
 * MENISCUS LIQUID NAVIGATION (Customer Panel)
 * Zero-dependency liquid bottom navigation bar based on the exact parametric SVG notch algorithm.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const ICONS = {
      home:  '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
      grid:  '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
      cart:  '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
      heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
      phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'
    };

    const TABS = [
      { id: 'bottomTabHome',     key: 'home',     label: 'Bosh sahifa',   icon: 'home',  color: '#c9f24a', action: (e) => { if (typeof window.goToHome === 'function') window.goToHome(e); } },
      { id: 'bottomTabCatalog',  key: 'catalog',  label: 'Katalog',       icon: 'grid',  color: '#4fe0c4', action: (e) => { if (typeof window.openCatalogView === 'function') window.openCatalogView(e); } },
      { id: 'bottomTabCart',     key: 'cart',     label: 'Savat',         icon: 'cart',  color: '#ff9f43', isCart: true, action: (e) => { if (typeof window.openCartView === 'function') window.openCartView(e); } },
      { id: 'bottomTabWishlist', key: 'wishlist', label: 'Sevimlilar',    icon: 'heart', color: '#7aa2ff', isWish: true, action: (e) => { if (typeof window.filterByWishlist === 'function') window.filterByWishlist(e); } },
      { id: 'bottomTabContact',  key: 'contact',  label: 'Aloqa',         icon: 'phone', color: '#ff5c8a', action: (e) => { if (typeof window.openContactModal === 'function') window.openContactModal(); } }
    ];

    const svgIcon = (n) => `<svg class="i" viewBox="0 0 24 24">${ICONS[n] || ICONS.home}</svg>`;
    const $ = (id) => document.getElementById(id);
    const dock = $('dock'), bead = $('bead'), tabsEl = $('tabs'), fill = $('skinFill');

    if (!dock || !bead || !tabsEl || !fill) return;

    /* geometry */
    const H = 82, CORNER = 18, BOWL = 36, SHOULDER = 14, BEAD = 58;
    let W = 0, PAD = 0, GAP = 0;

    /* state */
    let active = 0, x = 0, v = 0, q = 0, target = 0, dragging = false, raf = 0;
    const centerOf = (i) => PAD + GAP * i;
    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Clear old tabs container and generate fresh buttons
    tabsEl.innerHTML = '';

    TABS.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'tab nav-tab-item' + (i === 0 ? ' active' : '');
      b.role = 'tab';
      b.type = 'button';
      b.id = t.id;
      b.setAttribute('aria-label', t.label);
      b.setAttribute('aria-selected', String(i === 0));

      let badgeHtml = '';
      if (t.isCart) {
        badgeHtml = `<span class="nav-tab-badge cart-count-badge" style="display: none;">0</span>`;
      } else if (t.isWish) {
        badgeHtml = `<span class="nav-tab-badge wishlist-count-badge" style="display: none;">0</span>`;
      }

      b.innerHTML = `
        <span class="tab__ic">${svgIcon(t.icon)}</span>
        ${badgeHtml}
        <span class="tab__label">${t.label}</span>
      `;
      b.style.setProperty('--acc', t.color);

      b.addEventListener('click', (e) => {
        select(i);
        if (typeof t.action === 'function') {
          t.action(e);
        }
      });

      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') select(Math.min(i + 1, TABS.length - 1), true);
        if (e.key === 'ArrowLeft') select(Math.max(i - 1, 0), true);
      });

      tabsEl.appendChild(b);
    });

    const tabBtns = [...tabsEl.children];

    /* one path: the notch is a parametric socket, not a stack of curves.
       Shoulder circle is tangent to the top edge AND to the bowl. */
    function skinPath(cx, lean) {
      const rl = SHOULDER * (1 + 0.45 * lean);
      const rr = SHOULDER * (1 - 0.45 * lean);
      const side = (rs, s) => {
        const dx = Math.sqrt(Math.max((BOWL + rs) ** 2 - rs ** 2, 1));
        const fx = cx + s * dx;
        const k = BOWL / (BOWL + rs);
        return { tx: fx, px: cx + (fx - cx) * k, py: rs * k };
      };
      const L = side(rl, -1);
      const R = side(rr, 1);
      const r = CORNER;
      return `M${r} 0 H${L.tx} A${rl} ${rl} 0 0 1 ${L.px} ${L.py}
              A${BOWL} ${BOWL} 0 0 0 ${R.px} ${R.py}
              A${rr} ${rr} 0 0 1 ${R.tx} 0 H${W - r}
              A${r} ${r} 0 0 1 ${W} ${r} V${H - r} A${r} ${r} 0 0 1 ${W - r} ${H}
              H${r} A${r} ${r} 0 0 1 0 ${H - r} V${r} A${r} ${r} 0 0 1 ${r} 0Z`;
    }

    function render() {
      bead.style.transform = `translate(${x - BEAD / 2}px, ${-BEAD / 2}px)`;
      fill.setAttribute('d', skinPath(x, q));
    }

    function tick() {
      if (dragging) {
        const d = (target - x) * 0.5;
        v = d;
        x += d;
      } else {
        v = (v + (target - x) * 0.16) * 0.78;
        x += v;
      }
      x = clamp(x, PAD, W - PAD);
      q += (clamp(v / 9, -1, 1) - q) * 0.3; // velocity leans the surface
      render();
      const still = !dragging && Math.abs(v) < 0.02 && Math.abs(target - x) < 0.05 && Math.abs(q) < 0.01;
      if (still) {
        x = target;
        q = 0;
        v = 0;
        render();
        raf = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    }

    const kick = () => {
      if (reduce) {
        x = target;
        q = 0;
        render();
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    function paint(i, animate) {
      const t = TABS[i];
      if (!t) return;
      document.documentElement.style.setProperty('--acc', t.color);
      tabBtns.forEach((b, k) => {
        b.setAttribute('aria-selected', String(k === i));
        b.classList.toggle('active', k === i);
      });
      bead.innerHTML = svgIcon(t.icon);
      if (animate && bead.firstChild) {
        bead.firstChild.classList.add('pop');
      }
    }

    function select(i, focus) {
      if (i < 0 || i >= TABS.length) return;
      if (i !== active) {
        active = i;
        paint(i, true);
      }
      target = centerOf(i);
      kick();
      if (focus && tabBtns[i]) tabBtns[i].focus();
    }

    /* drag the bead */
    bead.addEventListener('pointerdown', (e) => {
      dragging = true;
      bead.setPointerCapture(e.pointerId);
      kick();
    });

    bead.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      target = clamp(e.clientX - dock.getBoundingClientRect().left, PAD, W - PAD);
      const near = clamp(Math.round((target - PAD) / GAP), 0, TABS.length - 1);
      if (near !== active) {
        active = near;
        paint(near, true);
      }
    });

    const drop = () => {
      if (!dragging) return;
      dragging = false;
      target = centerOf(active);
      kick();
      const t = TABS[active];
      if (t && typeof t.action === 'function') {
        t.action();
      }
    };

    bead.addEventListener('pointerup', drop);
    bead.addEventListener('pointercancel', drop);

    /* layout */
    function layout() {
      W = dock.clientWidth || 440;
      PAD = Math.max(50, W * 0.12);
      GAP = (W - 2 * PAD) / (TABS.length - 1);
      tabBtns.forEach((b, i) => {
        b.style.left = centerOf(i) + 'px';
      });
      const skinSvg = $('skin');
      if (skinSvg) skinSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      x = target = centerOf(active);
      q = v = 0;
      render();
    }

    new ResizeObserver(layout).observe(dock);
    window.addEventListener('resize', layout, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(layout, 150));

    layout();
    paint(0, false);

    // Global handle so app.js can trigger active tab
    window.__meniscus = {
      select,
      selectById: (id) => {
        const idx = TABS.findIndex((t) => t.id === id || t.key === id);
        if (idx !== -1) select(idx);
      },
      layout
    };
  });
})();
