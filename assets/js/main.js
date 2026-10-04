// main.js — lkinnovations.org
// Stylesheet loader, social links, contact form.

(function () {
  'use strict';

  // ─── Social links data ───────────────────────────────────────────────────
  var SOCIAL_LINKS = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/lkdhinnovations',
      svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
    },
    {
      name: 'Substack',
      href: 'https://substack.com/@lkdh',
      svgPath: 'M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z'
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
      var nameVal = name ? name.value.trim() : '';
      var subject = encodeURIComponent(
        'interested in doing hard things' + (nameVal ? ' - ' + nameVal : '')
      );
      var body    = encodeURIComponent(message ? message.value : '');
      window.location.href = 'mailto:support@lkdhinnovations.com?subject=' + subject + '&body=' + body;

      if (btn) btn.textContent = 'Sent';
    });
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────
  function init() {
    renderSocialLinks();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
