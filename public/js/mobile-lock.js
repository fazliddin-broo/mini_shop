/* ==========================================================================
   MOBILE LOCK: zoom in/out ni o'chirish (iOS Safari & Android uchun silliq lock)
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

  // Eski saqlanib qolgan noto'g'ri AI tugmasi koordinatalarini tozalash (joylashuv buzilmasligi uchun)
  try {
    localStorage.removeItem('blackstore_ai_btn_pos');
  } catch (_) {}
})();
