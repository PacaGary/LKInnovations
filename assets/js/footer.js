// footer.js — renders the site footer into .site-footer placeholders

(function () {
  'use strict';

  var COMPANY = [
    { label: 'About',   href: '/#about'   },
    { label: 'Stories', href: '/#stories' },
    { label: 'Contact', href: '/#contact' },
  ];

  var PACAGEN = [
    { label: 'Shop',    href: 'https://pacagen.com/collections', external: true },
    { label: 'Science', href: 'https://pacagen.com/science',     external: true },
    { label: 'Learn',   href: 'https://pacagen.com/learn',       external: true },
  ];

  var REYOU = [
    { label: 'Shop',           href: 'https://reyou.com/collections',   external: true },
    { label: 'Science',        href: 'https://reyou.com/science',        external: true },
    { label: 'Clinical Trial', href: 'https://reyou.com/clinical-trial', external: true },
  ];

  var CONNECT = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/lkdhinnovations',
      external: true,
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/lkdhinnovations',
      external: true,
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'
    },
    {
      label: 'X / Twitter',
      href: 'https://x.com/lkdhinnovations',
      external: true,
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    },
  ];

  function buildLinks(links) {
    return links.map(function (l) {
      var rel = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a href="' + l.href + '"' + rel + ' class="footer-col-link">' + l.label + '</a>';
    }).join('');
  }

  function buildSocialIcons(links) {
    var icons = links.map(function (l) {
      return (
        '<a href="' + l.href + '" target="_blank" rel="noopener noreferrer"' +
        ' class="footer-social-icon" aria-label="' + l.label + '">' +
        l.icon +
        '</a>'
      );
    }).join('');
    return '<div class="footer-social-icons">' + icons + '</div>';
  }

  function buildCol(heading, links, social) {
    return (
      '<div class="footer-col">' +
        '<p class="footer-col-heading">' + heading + '</p>' +
        (social ? buildSocialIcons(links) : buildLinks(links)) +
      '</div>'
    );
  }

  function renderFooter() {
    var el = document.querySelector('.site-footer');
    if (!el) return;

    var year = new Date().getFullYear();

    el.innerHTML =
      '<div class="footer-inner">' +
        '<div class="footer-columns">' +
          buildCol('Company', COMPANY) +
          buildCol('Pacagen', PACAGEN) +
          buildCol('RE:YOU',  REYOU)   +
          buildCol('Connect', CONNECT, true) +
        '</div>' +
        '<div class="footer-bottom">' +
          '<div class="footer-bottom-left">' +
            '<p class="footer-copy">&copy; ' + year + ' LKDH Innovations. All rights reserved.</p>' +
            '<nav class="footer-legal" aria-label="Legal navigation">' +
              '<a href="/privacy-policy">Privacy Policy</a>' +
              '<a href="/terms">Terms of Use</a>' +
            '</nav>' +
          '</div>' +
          '<a href="/" aria-label="LKDH Innovations — Home" class="footer-logo-link">' +
            '<img src="/assets/images/LKDH_horizontal.svg" alt="LKDH Innovations" class="footer-logo">' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
  } else {
    renderFooter();
  }
})();
