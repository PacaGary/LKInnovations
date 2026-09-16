// animations.js — lkinnovations.org
// Hero entrance, scroll reveals, image parallax, stories pinned parallax.

(function () {
  'use strict';

  // ─── Hero entrance ───────────────────────────────────────────────────────
  function triggerHeroEntrance() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('hero-loaded');
      });
    });
  }

  // ─── Scroll entrance reveals ─────────────────────────────────────────────
  function initReveal() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.reveal, .reveal-group').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-group').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─── Image panel parallax ────────────────────────────────────────────────
  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var items = Array.from(
      document.querySelectorAll('.about-visual-img, .about-visual-placeholder, .brand-visual-placeholder')
    );
    if (!items.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var container = el.closest('.about-visual, .brand-visual');
        if (!container) return;
        var rect = container.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var centerY = rect.top + rect.height / 2;
        var offsetY = (centerY - vh / 2) * 0.25;
        el.style.setProperty('--parallax-y', offsetY.toFixed(1) + 'px');
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ─── Stories pinned-scroll vertical parallax ─────────────────────────────
  function initStoriesParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var section = document.querySelector('.stories-section');
    var sticky  = document.querySelector('.stories-sticky');
    if (!section || !sticky) return;

    var tracks = [
      { el: document.querySelector('.stories-track--a .stories-track-inner'), speed:  0.5  },
      { el: document.querySelector('.stories-track--b .stories-track-inner'), speed: -0.35 },
      { el: document.querySelector('.stories-track--c .stories-track-inner'), speed:  0.2  },
      { el: document.querySelector('.stories-track--d .stories-track-inner'), speed: -0.45 },
      { el: document.querySelector('.stories-track--e .stories-track-inner'), speed:  0.32 }
    ].filter(function (t) { return t.el; });

    if (!tracks.length) return;

    var ticking = false;

    function update() {
      var rect     = section.getBoundingClientRect();
      var vh       = window.innerHeight;
      var total    = section.offsetHeight - vh;
      var progress = Math.max(0, Math.min(1, -rect.top / total));

      tracks.forEach(function (t) {
        var range  = 1200;
        var offset = (progress - 0.5) * range * 2 * t.speed;
        t.el.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
      });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────
  function init() {
    triggerHeroEntrance();
    initReveal();
    initParallax();
    initStoriesParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
