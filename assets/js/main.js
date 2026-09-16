// main.js — lkinnovations.org
// Injects stylesheet, handles nav scroll state, mobile drawer,
// smooth scroll, and scroll-entrance animations.

(function () {
  'use strict';

  var assetPath = '/assets';

  // ─── Stylesheet loader ───────────────────────────────────────────────────
  function loadStylesheet() {
    if (document.querySelector('link[data-lk-css]')) return;

    var link = document.createElement('link');
    link.rel          = 'stylesheet';
    link.dataset.lkCss = '1';
    link.href         = assetPath + '/css/style.css';

    link.onload = link.onerror = function () {
      document.body.classList.remove('fouc-guard');
      document.body.style.visibility = 'visible';
      document.body.style.opacity    = '1';
    };

    // Hard fallback — never leave page invisible
    setTimeout(function () {
      document.body.classList.remove('fouc-guard');
      document.body.style.visibility = 'visible';
      document.body.style.opacity    = '1';
    }, 1500);

    document.head.appendChild(link);
  }

  // ─── Sticky nav scroll state ─────────────────────────────────────────────
  function initNavScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function update() {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ─── Mobile drawer ───────────────────────────────────────────────────────
  function initMobileDrawer() {
    var toggle  = document.querySelector('.nav-menu-toggle');
    var drawer  = document.querySelector('.mobile-drawer');
    var close   = document.querySelector('.mobile-drawer-close');
    if (!toggle || !drawer) return;

    function openDrawer() {
      drawer.style.display = 'flex';
      requestAnimationFrame(function () {
        drawer.classList.add('is-open');
      });
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      setTimeout(function () {
        if (!drawer.classList.contains('is-open')) {
          drawer.style.display = 'none';
        }
      }, 300);
    }

    toggle.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });

    if (close) {
      close.addEventListener('click', closeDrawer);
    }

    // Close when a link is clicked
    var links = drawer.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  // ─── Scroll animations ───────────────────────────────────────────────────
  var scrollObserver = null;

  function initScrollAnimations() {
    if (!window.IntersectionObserver) return;

    var fadeUpSelectors  = ['.about-inner', '.brand-inner', '.contact-inner', '.about-brands'];
    var fadeInSelectors  = ['.brand-visual', '.about-visual'];

    if (!scrollObserver) {
      scrollObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            scrollObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
    }

    function observe(els, type) {
      els.forEach(function (el) {
        if (el.classList.contains('will-animate')) return;
        el.classList.add('will-animate', type);
        scrollObserver.observe(el);
      });
    }

    observe(
      Array.from(document.querySelectorAll(fadeUpSelectors.join(','))),
      'fade-up'
    );
    observe(
      Array.from(document.querySelectorAll(fadeInSelectors.join(','))),
      'fade-in'
    );
  }

  // ─── Stories modal ───────────────────────────────────────────────────────
  function initStories() {
    var modal    = document.getElementById('story-modal');
    if (!modal) return;

    var backdrop  = modal.querySelector('.story-modal-backdrop');
    var closeBtn  = modal.querySelector('.story-modal-close');
    var badge     = document.getElementById('modal-badge');
    var nameEl    = document.getElementById('modal-name');
    var locEl     = document.getElementById('modal-location');
    var storyEl   = document.getElementById('modal-story');
    var lastFocused = null;

    // Build video container in modal if not already present
    var videoWrap = modal.querySelector('.story-modal-video-wrap');
    if (!videoWrap) {
      videoWrap = document.createElement('div');
      videoWrap.className = 'story-modal-video-wrap';
      videoWrap.style.display = 'none';
      var vid = document.createElement('video');
      vid.controls = true;
      vid.playsInline = true;
      videoWrap.appendChild(vid);
      modal.querySelector('.story-modal-panel').insertBefore(
        videoWrap,
        modal.querySelector('.story-modal-body')
      );
    }
    var modalVideo = videoWrap.querySelector('video');

    function openModal(tile) {
      var product  = tile.dataset.product || '';
      var videoSrc = tile.dataset.video   || '';

      badge.textContent   = product;
      badge.className     = 'story-modal-product-badge ' + product.toLowerCase().replace(':', '');
      nameEl.textContent  = tile.dataset.name     || '';
      locEl.textContent   = tile.dataset.location || '';
      storyEl.textContent = tile.dataset.story    || '';

      if (videoSrc) {
        modalVideo.src          = videoSrc;
        videoWrap.style.display = '';
        // Close btn floats over video — keep white
        closeBtn.style.background = 'rgba(0,0,0,0.5)';
        closeBtn.style.color      = '#fff';
      } else {
        modalVideo.src          = '';
        videoWrap.style.display = 'none';
        closeBtn.style.background = '';
        closeBtn.style.color      = '';
      }

      lastFocused = tile;
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
      // Pause video on close
      if (modalVideo) { modalVideo.pause(); modalVideo.src = ''; }
      if (lastFocused) lastFocused.focus();
    }

    // Attach to all real tiles (not tabindex="-1" dupes)
    var tiles = document.querySelectorAll('.story-tile:not([tabindex="-1"])');
    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { openModal(tile); });
    });

    // Dupe tiles also open modal (they're interactive, just hidden from tab order)
    var dupeTiles = document.querySelectorAll('.story-tile[tabindex="-1"]');
    dupeTiles.forEach(function (tile) {
      tile.addEventListener('click', function () { openModal(tile); });
    });

    if (closeBtn)  closeBtn.addEventListener('click',  closeModal);
    if (backdrop)  backdrop.addEventListener('click',  closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });

    // Focus trap
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(
        modal.querySelectorAll('button, a, input, video, [tabindex]:not([tabindex="-1"])')
      );
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // ─── Contact form handler ────────────────────────────────────────────────
  function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.form-submit');
      var name    = form.querySelector('[name="name"]');
      var email   = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');

      // Basic validation
      if (!email || !email.value.trim()) {
        if (email) email.focus();
        return;
      }

      // Mailto fallback — replace with real form endpoint when available
      var subject  = encodeURIComponent('Enquiry from lkinnovations.org');
      var body     = encodeURIComponent(
        (name && name.value ? 'Name: ' + name.value + '\n\n' : '') +
        (message && message.value ? message.value : '')
      );
      window.location.href = 'mailto:info@lkdhinnovations.com?subject=' + subject + '&body=' + body;

      if (btn) btn.textContent = 'Sent';
    });
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────
  loadStylesheet();

  function init() {
    initNavScroll();
    initMobileDrawer();
    initScrollAnimations();
    initStories();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
