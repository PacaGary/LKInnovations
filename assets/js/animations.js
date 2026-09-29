// animations.js — lkinnovations.org
// Hero entrance, scroll reveals, image parallax, stories pinned parallax.

(function () {
  'use strict';

  function getViewportMode() {
    if (window.innerWidth < 768) return 'mobile';
    if (window.innerWidth < 1024) return 'tablet';
    return 'desktop';
  }

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
        var rate = el.classList.contains('visual-img--overlay') ? 0.12 : 0.25;
        var offsetY = (centerY - vh / 2) * rate;
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
      { el: document.querySelector('.stories-track--a .stories-track-inner'), speed: -0.50 },
      { el: document.querySelector('.stories-track--b .stories-track-inner'), speed: -0.25 },
      { el: document.querySelector('.stories-track--c .stories-track-inner'), speed: -0.40 },
      { el: document.querySelector('.stories-track--d .stories-track-inner'), speed: -0.15 }
    ].filter(function (t) { return t.el; });

    if (!tracks.length) return;

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;
      requestAnimationFrame(update);
      ticking = true;
    }

    function update() {
      var rect     = section.getBoundingClientRect();
      var vh       = window.innerHeight;
      var total    = section.offsetHeight - vh;
      var progress = Math.max(0, Math.min(1, -rect.top / total));

      var mode = getViewportMode();
      var depth = mode === 'mobile' ? 1500 : mode === 'tablet' ? 4000 : 6000;

      tracks.forEach(function (t) {
        var offset = progress * depth * t.speed;
        t.el.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
      });

      ticking = false;
    }

    var active = false;
    var io = new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
    }, { rootMargin: '200px 0px 200px 0px' });
    io.observe(section);

    window.addEventListener('scroll', function () {
      if (active) requestUpdate();
    }, { passive: true });

    window.addEventListener('resize', requestUpdate, { passive: true });

    update();
  }

  // ─── Solutions center-to-columns scroll stage ────────────────────────────
  function initRaiseBar() {
    var section = document.querySelector('.solutions-section');
    var stage = section && section.querySelector('.solutions-stage');
    var products = section ? Array.from(section.querySelectorAll('.solution-product')) : [];
    if (!section || !stage || !products.length) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ticking = false;
    var active = false;

    function clamp01(value) { return Math.max(0, Math.min(1, value)); }
    function easeOut(value) { return 1 - Math.pow(1 - value, 3); }
    function lerp(a, b, t) { return a + ((b - a) * t); }

    function getTargets(isMobile, isShort, stageWidth, stageHeight) {
      if (isShort) {
        return [
          { x: -stageWidth * 0.28, y: -stageHeight * 0.32 },
          { x: stageWidth * 0.28, y: -stageHeight * 0.32 },
          { x: 0, y: stageHeight * 0.32 }
        ];
      }
      if (isMobile) {
        return [{ x: 0, y: -stageHeight * 0.33 }, { x: 0, y: 0 }, { x: 0, y: stageHeight * 0.33 }];
      }
      return [{ x: -stageWidth * 0.32, y: 0 }, { x: 0, y: 0 }, { x: stageWidth * 0.32, y: 0 }];
    }

    function requestUpdate() {
      if (ticking) return;
      requestAnimationFrame(update);
      ticking = true;
    }

    function update() {
      var rect     = section.getBoundingClientRect();
      var vh       = window.innerHeight;
      var total    = section.offsetHeight - vh;
      var progress = Math.max(0, Math.min(1, -rect.top / total));
      var isMobile = getViewportMode() === 'mobile';

      // Leave the intro settled briefly, then separate the product marks.
      var travel = easeOut(clamp01((progress - 0.18) / 0.68));
      var stageWidth = stage.clientWidth;
      var stageHeight = stage.clientHeight;
      var isPortraitTablet = !isMobile && window.innerWidth <= 1024 && window.innerHeight > window.innerWidth;
      var useTriangle = (isMobile && window.innerHeight < 700) || isPortraitTablet;
      var targets = getTargets(isMobile, useTriangle, stageWidth, stageHeight);

      products.forEach(function (product, index) {
        var target = targets[index];
        product.style.setProperty('--solution-x', lerp(0, target.x, travel).toFixed(2) + 'px');
        product.style.setProperty('--solution-y', lerp(0, target.y, travel).toFixed(2) + 'px');
        product.style.setProperty('--solution-scale', lerp(0.42, 1, travel).toFixed(3));
      });

      section.classList.toggle('is-settled', travel > 0.72);
      ticking = false;
    }

    var observer = new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active) requestUpdate();
    }, { rootMargin: '120px 0px 120px 0px' });
    observer.observe(section);

    window.addEventListener('scroll', function () {
      if (active && !reducedMotion) requestUpdate();
    }, { passive: true });

    window.addEventListener('resize', requestUpdate, { passive: true });

    if (reducedMotion) {
      section.classList.add('is-settled');
      var finalMobile = getViewportMode() === 'mobile';
      var finalPortraitTablet = !finalMobile && window.innerWidth <= 1024 && window.innerHeight > window.innerWidth;
      var finalTriangle = (finalMobile && window.innerHeight < 700) || finalPortraitTablet;
      var finalStageWidth = stage.clientWidth;
      var finalStageHeight = stage.clientHeight;
      var finalTargets = getTargets(finalMobile, finalTriangle, finalStageWidth, finalStageHeight);
      products.forEach(function (product, index) {
        product.style.setProperty('--solution-x', finalTargets[index].x.toFixed(2) + 'px');
        product.style.setProperty('--solution-y', finalTargets[index].y.toFixed(2) + 'px');
        product.style.setProperty('--solution-scale', '1');
      });
      return;
    }

    update();
  }

  // ─── Expandable problem cards ───────────────────────────────────────────
  function initProblemCards() {
    document.querySelectorAll('.raise-bar-card').forEach(function (card) {
      var toggle = card.querySelector('.raise-bar-card-toggle');
      var body = card.querySelector('.raise-bar-card-body');
      if (!toggle || !body) return;

      toggle.addEventListener('click', function () {
        var open = card.classList.toggle('is-open');
        toggle.textContent = open ? '−' : '+';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', (open ? 'Hide' : 'Show more about') + ' ' + card.querySelector('.raise-bar-card-title').textContent.toLowerCase());
      });
    });
  }

  // ─── Droplets scroll section ─────────────────────────────────────────────
  function initDroplets() {
    var section  = document.querySelector('.droplets-section');
    if (!section) return;

    var video       = section.querySelector('.droplets-video');
    var headline    = section.querySelector('.droplets-headline');
    var body        = section.querySelector('.droplets-body');
    var tagline     = section.querySelector('.droplets-tagline');
    var orgWrap     = section.querySelector('.droplets-orgglass-wrap');
    var orgLogo     = section.querySelector('.droplets-orgglass-logo');
    var orgHeading  = section.querySelector('.droplets-orgglass-heading');
    var orgBody     = section.querySelector('.droplets-orgglass-body');
    var orgCue      = section.querySelector('.droplets-scroll-cue');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Video zooms from 0.75 → 1.45 over the full section
    var MIN_SCALE = 0.75;
    var MAX_SCALE = 1.45;
    var ticking   = false;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

    // t=0→1: fade in; t=1→2: hold; t=2→3: fade out
    function applyBeat(el, t) {
      var opacity, ty;
      if (t <= 0) {
        opacity = 0; ty = 24;
      } else if (t <= 1) {
        var e = easeOut(t);
        opacity = e; ty = (1 - e) * 24;
      } else if (t <= 2) {
        opacity = 1; ty = 0;
      } else if (t <= 3) {
        var e2 = easeOut(clamp01(t - 2));
        opacity = 1 - e2; ty = 0;
      } else {
        opacity = 0; ty = 0;
      }
      el.style.opacity   = opacity;
      el.style.transform = 'translateY(' + ty.toFixed(2) + 'px)';
    }

    function applyFadeIn(el, t) {
      var e = easeOut(clamp01(t));
      el.style.opacity   = e;
      el.style.transform = 'translateY(' + ((1 - e) * 20).toFixed(2) + 'px)';
    }

    function update() {
      var rect     = section.getBoundingClientRect();
      var vh       = window.innerHeight;
      var total    = section.offsetHeight - vh;
      var progress = clamp01(-rect.top / total);

      // Video zoom: 0.75 → 1.45
      video.style.transform = 'scale(' + lerp(MIN_SCALE, MAX_SCALE, progress).toFixed(4) + ')';

      // Text beats — each occupies a 0.18-wide window with 0.04 gaps between
      // headline: in 0.00→0.06, hold 0.06→0.12, out 0.12→0.18
      // body:     in 0.22→0.28, hold 0.28→0.34, out 0.34→0.40
      // tagline:  in 0.44→0.50, hold 0.50→0.56, out 0.56→0.62
      function beatT(p, start) {
        var t = (p - start) / 0.06;
        if (t <= 0) return 0;
        if (t <= 1) return t;           // fade in
        if (t <= 2) return 1 + (t - 1); // hold (maps 1→2)
        return 2 + (t - 2);             // fade out (2→3)
      }
      applyBeat(headline, beatT(progress, 0.00));
      applyBeat(body,     beatT(progress, 0.22));
      applyBeat(tagline,  beatT(progress, 0.44));

      // ── Orgglass circle wipe ──────────────────────────────────────────────
      // WHEN does the wipe start/end?
      //   0.68 = scroll progress where circle begins expanding (0–1 range)
      //   0.20 = how much scroll travel the expansion takes (larger = slower)
      //   → to start earlier: lower 0.68 (e.g. 0.60)
      //   → to make it slower: raise 0.20 (e.g. 0.30)
      var circleStart    = 0.68;
      var circleDuration = 0.20;
      var circleP = clamp01((progress - circleStart) / circleDuration);

      var vw = window.innerWidth;
      // WHERE is the circle center?
      //   cx: 0.5 = horizontal center. 0.0 = left edge, 1.0 = right edge
      //   cy: 0.5 = vertical center.   0.0 = top,       1.0 = bottom
      var cx = vw * 0.5;
      var cy = vh * 0.5;

      // HOW BIG does the circle get?
      //   stopR = final radius in px. Currently 40% of the smaller viewport dimension (40vmin).
      //   → to fill the full screen: Math.sqrt(cx*cx + cy*cy) * 1.05
      //   → to make it bigger: raise the multiplier, e.g. 0.55 or 0.70
      //   → to make it smaller (tighter porthole): lower it, e.g. 0.28
      var stopR = Math.min(vw, vh) * 0.50;

      orgWrap.style.clipPath = 'circle(' + (easeInOut(circleP) * stopR).toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';

      // ── Orgglass content fades ────────────────────────────────────────────
      // Each line: (progress - START) / SPEED
      //   START = scroll progress where fade begins
      //   SPEED = how fast it fades in (smaller = faster)
      //   → to delay a fade: raise its START value
      //   → to make it faster: lower its SPEED value
      applyFadeIn(orgLogo,    (progress - 0.76) / 0.06);
      applyFadeIn(orgHeading, (progress - 0.83) / 0.06);
      applyFadeIn(orgBody,    (progress - 0.89) / 0.06);
      applyFadeIn(orgCue,     (progress - 0.93) / 0.05);

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
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
    initProblemCards();
    initInstitutionsSpotlight();
  }

  // ─── Institutions marquee spotlight ─────────────────────────────────────
  function initInstitutionsSpotlight() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var schools = ['harvard', 'northwestern', 'caltech', 'princeton', 'duke', 'purdue'];
    var index   = 0;

    function advance() {
      document.querySelectorAll('.institutions-name.is-active').forEach(function (el) {
        el.classList.remove('is-active');
      });
      var school = schools[index];
      document.querySelectorAll('.institutions-name[data-school="' + school + '"]').forEach(function (el) {
        el.classList.add('is-active');
      });
      index = (index + 1) % schools.length;
    }

    advance();
    setInterval(advance, 1500); //Change to modify the color change timing
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
