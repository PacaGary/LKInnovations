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
      document.querySelectorAll('.visual-img, .visual-placeholder')
    );
    if (!items.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var container = el.closest('.visual');
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
      { el: document.querySelector('.stories-track--d .stories-track-inner'), speed: -0.45 }
    ].filter(function (t) { return t.el; });

    if (!tracks.length) return;

    var ticking = false;

    function update() {
      var rect     = section.getBoundingClientRect();
      var vh       = window.innerHeight;
      var total    = section.offsetHeight - vh;
      var progress = Math.max(0, Math.min(1, -rect.top / total));

      tracks.forEach(function (t) {
        var range  = 1800;
        var base   = -(t.el.scrollHeight / 2 - vh / 2);
        var offset = base + (progress - 0.5) * range * 2 * t.speed;
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

  // ─── Raise the Bar scroll-driven circle reveal ───────────────────────────
  function initRaiseBar() {
    var section  = document.querySelector('.raise-bar-section');
    var sticky   = document.querySelector('.raise-bar-sticky');
    var solution = document.querySelector('.raise-bar-layer--solution');
    if (!section || !sticky || !solution) return;

    // ── Card entrance (one-shot) ──────────────────────────────────────────
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var entranceObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              sticky.classList.add('cards-entered');
            });
          });
          entranceObserver.disconnect();
        }
      }, { threshold: 0.15 });
      entranceObserver.observe(section);
    } else {
      sticky.classList.add('cards-entered');
    }

    // ── Circle reveal (scroll-driven) ─────────────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      solution.style.clipPath = 'circle(260% at 50% 220%)';
      return;
    }

    var cardSpeeds = [75, 50, 25];
    var cards = Array.from(section.querySelectorAll('.raise-bar-card'));
    var ticking = false;

    function update() {
      var rect     = section.getBoundingClientRect();
      var vh       = window.innerHeight;
      var total    = section.offsetHeight - vh;
      var progress = Math.max(0, Math.min(1, -rect.top / total));

      // Phase 1 (progress 0→0.5): cards drift up from below
      var cardP = Math.min(progress / 0.5, 1);
      var eased = 1 - Math.pow(1 - cardP, 3);
      cards.forEach(function (card, i) {
        var speed  = cardSpeeds[i % cardSpeeds.length];
        var offset = (1 - eased) * speed;
        card.style.setProperty('--parallax-y', offset.toFixed(1) + 'px');
      });

      // Phase 2 (progress 0.40→1): circle reveals (10% overlap with card phase)
      var circleP = Math.max(0, (progress - 0.40) / 0.60);
      var vw   = window.innerWidth;
      var cx   = vw * 0.5;
      var cy   = vh * 1.15;
      var maxR = Math.sqrt(cx * cx + cy * cy) * 1.05;
      solution.style.clipPath = 'circle(' + (circleP * maxR).toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
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
    initRaiseBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
