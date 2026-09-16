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
    var backdrop = modal && modal.querySelector('.story-modal-backdrop');
    var closeBtn = modal && modal.querySelector('.story-modal-close');
    var badge    = document.getElementById('modal-badge');
    var nameEl   = document.getElementById('modal-name');
    var locEl    = document.getElementById('modal-location');
    var storyEl  = document.getElementById('modal-story');
    if (!modal) return;

    var tiles = document.querySelectorAll('.story-tile');
    var lastFocused = null;

    function openModal(tile) {
      var product = tile.dataset.product || '';
      badge.textContent    = product;
      badge.className      = 'story-modal-product-badge ' + product.toLowerCase();
      nameEl.textContent   = tile.dataset.name || '';
      locEl.textContent    = tile.dataset.location || '';
      storyEl.textContent  = tile.dataset.story || '';
      lastFocused = tile;
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { openModal(tile); });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });

    // Trap focus inside modal
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(modal.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])'));
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
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
