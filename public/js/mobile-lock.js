/* ==========================================================================
   MOBILE LOCK: zoom in/out ni o'chirish + suzuvchi AI tugmasini surish
   ========================================================================== */
(function () {
  'use strict';

  // --- 1. Zoom'ni butunlay o'chirish (iOS Safari viewport'dagi user-scalable=no ni inobatga olmaydi) ---
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (evt) {
    document.addEventListener(evt, function (e) { e.preventDefault(); }, { passive: false });
  });

  // Ikki barmoq bilan chimchilash (pinch)
  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Tez ketma-ket ikki marta bosish (double-tap zoom)
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  // Ctrl + g'ildirak / Ctrl +/- (desktop'da tasodifiy zoom)
  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  // --- 2. Suzuvchi AI tugmasini surib joylashtirish ---
  function initDraggableAiButton() {
    var btn = document.getElementById('floatingAiConsultantBtn');
    if (!btn) return;

    var STORAGE_KEY = 'blackstore_ai_btn_pos';
    var MARGIN = 10;
    var dragging = false;
    var moved = false;
    var startX = 0, startY = 0, originX = 0, originY = 0, pointerId = null;

    function size() {
      var r = btn.getBoundingClientRect();
      return { w: r.width || 46, h: r.height || 46 };
    }

    function getBottomNavLimit() {
      var bar = document.querySelector('.mobile-bottom-bar');
      if (bar && window.getComputedStyle(bar).display !== 'none') {
        var r = bar.getBoundingClientRect();
        return r.height || 66;
      }
      return 12;
    }

    function clamp(x, y) {
      var s = size();
      var bottomNavH = getBottomNavLimit();
      var minX = MARGIN;
      var maxX = window.innerWidth - s.w - MARGIN;
      var minY = 62; // Yuqoridagi asosiy header panelni to'sib qo'ymaslik uchun
      var maxY = window.innerHeight - s.h - bottomNavH - MARGIN; // Pastki boshqaruv paneliga aslo kirmaslik uchun
      if (maxY < minY) maxY = minY;
      return {
        x: Math.min(Math.max(minX, x), Math.max(minX, maxX)),
        y: Math.min(Math.max(minY, y), Math.max(minY, maxY))
      };
    }

    function apply(x, y) {
      var p = clamp(x, y);
      btn.style.left = p.x + 'px';
      btn.style.top = p.y + 'px';
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      return p;
    }

    function restore() {
      try {
        var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        var s = size();
        var bottomNavH = getBottomNavLimit();
        var defX = window.innerWidth - s.w - MARGIN;
        var defY = window.innerHeight - s.h - bottomNavH - 16;

        if (saved && typeof saved.xr === 'number' && typeof saved.yr === 'number') {
          var targetX = saved.xr * (window.innerWidth - s.w);
          var targetY = saved.yr * (window.innerHeight - s.h);
          // Har doim clamp orqali o'tkazamiz — pastki panel tagida qolib ketgan bo'lsa darhol tepaga chiqaradi
          var validPos = clamp(targetX, targetY);
          apply(validPos.x, validPos.y);
        } else {
          apply(defX, defY);
        }
      } catch (_) {
        var s = size();
        var bottomNavH = getBottomNavLimit();
        apply(window.innerWidth - s.w - MARGIN, window.innerHeight - s.h - bottomNavH - 16);
      }
    }

    function save(x, y) {
      try {
        var s = size();
        var wx = Math.max(1, window.innerWidth - s.w);
        var hy = Math.max(1, window.innerHeight - s.h);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ xr: x / wx, yr: y / hy }));
      } catch (_) { /* e'tiborsiz */ }
    }

    btn.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var r = btn.getBoundingClientRect();
      dragging = true;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      originX = r.left;
      originY = r.top;
      try { btn.setPointerCapture(pointerId); } catch (_) { /* e'tiborsiz */ }
    });

    btn.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return;
      if (!moved) {
        moved = true;
        btn.classList.add('is-dragging');
      }
      e.preventDefault();
      apply(originX + dx, originY + dy);
    });

    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      dragging = false;
      try { btn.releasePointerCapture(pointerId); } catch (_) { /* e'tiborsiz */ }
      btn.classList.remove('is-dragging');
      if (moved) {
        // Eng yaqin chetga "yopishtirish" (snap)
        var r = btn.getBoundingClientRect();
        var snapX = (r.left + r.width / 2 < window.innerWidth / 2) ? MARGIN : window.innerWidth - r.width - MARGIN;
        var p = apply(snapX, r.top);
        save(p.x, p.y);
        // Surish tugagach tasodifan chat ochilib ketmasligi uchun
        setTimeout(function () { moved = false; }, 0);
      }
    }

    btn.addEventListener('pointerup', endDrag);
    btn.addEventListener('pointercancel', endDrag);

    // Surilganda click ishlamasin
    btn.addEventListener('click', function (e) {
      if (moved) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);

    window.addEventListener('resize', restore);
    window.addEventListener('orientationchange', function () { setTimeout(restore, 150); });
    restore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDraggableAiButton);
  } else {
    initDraggableAiButton();
  }
})();
