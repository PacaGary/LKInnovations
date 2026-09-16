// main.js — lkinnovations.org
// Stylesheet loader, scroll animations, social links, contact form.

(function () {
  'use strict';

  var assetPath = '/assets';

  // ─── Social links data ───────────────────────────────────────────────────
  var SOCIAL_LINKS = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/lkdhinnovations',
      svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/lkdhinnovations',
      svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
    },
    {
      name: 'X',
      href: 'https://x.com/lkdhinnovations',
      svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
    }
  ];

  function renderSocialLinks() {
    var container = document.querySelector('.contact-social');
    if (!container) return;
    container.innerHTML = SOCIAL_LINKS.map(function (s) {
      return '<a class="contact-social-link" href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.name + '">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="' + s.svgPath + '"/>' +
        '</svg>' +
        '</a>';
    }).join('');
  }

  // ─── Stylesheet loader ───────────────────────────────────────────────────
  function loadStylesheet() {
    if (document.querySelector('link[data-lk-css]')) return;

    var link = document.createElement('link');
    link.rel           = 'stylesheet';
    link.dataset.lkCss = '1';
    link.href          = assetPath + '/css/style.css';

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

  // ─── Scroll animations ───────────────────────────────────────────────────
  var scrollObserver = null;

  function initScrollAnimations() {
    if (!window.IntersectionObserver) return;

    var fadeUpSelectors = ['.about-inner', '.brand-inner', '.contact-inner', '.about-brands'];
    var fadeInSelectors = ['.brand-visual', '.about-visual'];

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

    observe(Array.from(document.querySelectorAll(fadeUpSelectors.join(','))), 'fade-up');
    observe(Array.from(document.querySelectorAll(fadeInSelectors.join(','))), 'fade-in');
  }

  // ─── Contact form handler ────────────────────────────────────────────────
  function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn     = form.querySelector('.form-submit');
      var name    = form.querySelector('[name="name"]');
      var email   = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');

      if (!email || !email.value.trim()) {
        if (email) email.focus();
        return;
      }

      // Mailto fallback — replace with real form endpoint when available
      var subject = encodeURIComponent('Enquiry from lkinnovations.org');
      var body    = encodeURIComponent(
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
    renderSocialLinks();
    initScrollAnimations();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
