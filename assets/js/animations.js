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

    var cardSpeeds = [25, 75, 125, 175];
    var cards = Array.from(section.querySelectorAll('.raise-bar-card'));
    var solutionCards = Array.from(section.querySelectorAll('.raise-bar-layer--solution .raise-bar-card[data-brand]'));
    var logoStage = section.querySelector('.raise-bar-logo-stage');
    var logos = Array.from(section.querySelectorAll('.raise-bar-logo[data-brand]'));
    var ticking = false;

    function clamp01(value) { return Math.max(0, Math.min(1, value)); }
    function easeOut(value) { return 1 - Math.pow(1 - value, 3); }
    function lerp(a, b, t) { return a + ((b - a) * t); }

    function updateLogoPositions(progress, forceFinal) {
      if (!logoStage || !logos.length || !solutionCards.length) return;

      var stageRect = logoStage.getBoundingClientRect();
      var isMobile = getViewportMode() === 'mobile';
      var originY = isMobile ? 28 : 36;
      var clusterStart = isMobile ? 0.53 : 0.44;
      var travelStart = isMobile ? 0.61 : 0.54;
      var travelDuration = isMobile ? 0.36 : 0.42;

      logos.forEach(function (logo, index) {
        var brand = logo.getAttribute('data-brand');
        var card = solutionCards.find(function (candidate) {
          return candidate.getAttribute('data-brand') === brand;
        });
        if (!card) return;

        var cardRect = card.getBoundingClientRect();
        var originX = stageRect.width * 0.5;
        var targetX = cardRect.left - stageRect.left + (cardRect.width * 0.5);
        var targetY = cardRect.top - stageRect.top + (cardRect.height * (isMobile ? 0.32 : 0.36));
        var travelProgress = forceFinal ? 1 : clamp01((progress - travelStart) / travelDuration);
        var easedTravel = easeOut(travelProgress);
        var clusterProgress = forceFinal ? 1 : clamp01((progress - clusterStart) / 0.14);
        var clusterOpacity = easeOut(clusterProgress);
        var x = lerp(originX, targetX, easedTravel);
        var y = lerp(originY, targetY, easedTravel);
        var naturalWidth = logo.offsetWidth || 1;
        var targetWidth = cardRect.width * 0.70;
        var finalScale = targetWidth / naturalWidth;
        var scale = lerp(0.2, finalScale, easedTravel);
        var rotate = lerp([ -12, 7, 14 ][index] || 0, 0, easedTravel);

        logo.style.setProperty('--logo-x', x.toFixed(2) + 'px');
        logo.style.setProperty('--logo-y', y.toFixed(2) + 'px');
        logo.style.setProperty('--logo-scale', scale.toFixed(3));
        logo.style.setProperty('--logo-rotate', rotate.toFixed(2) + 'deg');
        logo.style.setProperty('--logo-opacity', forceFinal ? '1' : clusterOpacity.toFixed(3));

        var imageFade = forceFinal ? 0 : 1 - clamp01((travelProgress - 0.58) / 0.42);
        card.style.setProperty('--legacy-image-opacity', imageFade.toFixed(3));
      });
    }

    // ── Circle reveal (scroll-driven) ─────────────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      solution.style.clipPath = 'circle(260% at 50% -20%)';
      updateLogoPositions(1, true);
      return;
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

      // Phase 1 (progress 0→0.5): cards drift up on desktop only; mobile uses opacity fade only
      var cardP = Math.min(progress / 0.5, 1);
      var eased = 1 - Math.pow(1 - cardP, 3);
      var isMobile = getViewportMode() === 'mobile';
      if (!isMobile) {
        cards.forEach(function (card, i) {
          var speed  = cardSpeeds[i % cardSpeeds.length];
          var offset = (1 - eased) * speed;
          card.style.setProperty('--parallax-x', '0px');
          card.style.setProperty('--parallax-y', offset.toFixed(1) + 'px');
        });
      }

      // Phase 2: circle reveals — delayed on mobile so cards show first
      var circleStart = isMobile ? 0.50 : 0.40;
      var circleP = Math.max(0, (progress - circleStart) / (1 - circleStart));
      var vw   = window.innerWidth;
      var cx   = vw * 0.5;
      var cy   = vh * -0.15;
      var maxR = Math.sqrt(cx * cx + (vh - cy) * (vh - cy)) * 1.05;
      solution.style.clipPath = 'circle(' + (circleP * maxR).toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
      updateLogoPositions(progress, false);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      requestUpdate();
    }, { passive: true });

    window.addEventListener('resize', requestUpdate, { passive: true });

    update();

    // ── Card body smooth-reveal on click ────────────────────────────────────
    section.querySelectorAll('.raise-bar-layer--solution .raise-bar-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var isOpen = card.classList.toggle('is-open');
        card.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
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
