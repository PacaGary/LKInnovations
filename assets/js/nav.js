// nav.js — navigation data, rendering, scroll state, and mobile drawer

(function () {
  'use strict';

  var NAV_LINKS = [
    { href: '#about',              label: 'About',   cls: 'nav-link' },
    { href: '#reyou',              label: 'RE:YOU',  cls: 'nav-link' },
    { href: '#pacagen',            label: 'Pacagen', cls: 'nav-link' },
    { href: '/orb-particles.html', label: 'Orb A',   cls: 'nav-link' },
    { href: '/orb-glass.html',     label: 'Orb B',   cls: 'nav-link' },
    { href: '#stories',            label: 'Stories', cls: 'nav-link' },
    { href: '#contact',            label: 'Contact', cls: 'nav-cta'  }
  ];

  function renderNavLinks() {
    var desktopList = document.querySelector('.nav-links');
    var drawer      = document.querySelector('.mobile-drawer');
    var closeBtn    = drawer && drawer.querySelector('.mobile-drawer-close');

    if (desktopList) {
      desktopList.innerHTML = NAV_LINKS.map(function (n) {
        return '<li><a href="' + n.href + '" class="' + n.cls + '">' + n.label + '</a></li>';
      }).join('');
    }

    if (drawer && closeBtn) {
      var fragment = document.createDocumentFragment();
      NAV_LINKS
        .filter(function (n) { return n.href !== '#stories'; })
        .forEach(function (n) {
          var a = document.createElement('a');
          a.href        = n.href;
          a.className   = n.cls;
          a.textContent = n.label;
          fragment.appendChild(a);
        });
      drawer.appendChild(fragment);
    }
  }

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

    var links = drawer.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  function init() {
    renderNavLinks();
    initNavScroll();
    initMobileDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
