// nav.js — floating circle nav button, drawer, and clip-circle hover

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
    var drawer  = document.querySelector('.mobile-drawer');
    if (!drawer) return;

    var fragment = document.createDocumentFragment();
    NAV_LINKS.forEach(function (n) {
      var a = document.createElement('a');
      a.href        = n.href;
      a.className   = n.cls;
      a.textContent = n.label;
      fragment.appendChild(a);
    });
    drawer.appendChild(fragment);
  }

  function initHoverEffect() {
    var toggle = document.querySelector('.nav-menu-toggle');
    if (!toggle) return;

    toggle.addEventListener('mousemove', function (e) {
      var rect = toggle.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      toggle.style.setProperty('--mx', x);
      toggle.style.setProperty('--my', y);
    });
  }

  function initMobileDrawer() {
    var toggle = document.querySelector('.nav-menu-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    if (!toggle || !drawer) return;

    function openDrawer() {
      drawer.style.display = 'flex';
      requestAnimationFrame(function () {
        drawer.classList.add('is-open');
        toggle.classList.add('is-open');
      });
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      toggle.classList.remove('is-open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      setTimeout(function () {
        if (!drawer.classList.contains('is-open')) {
          drawer.style.display = 'none';
        }
      }, 300);
    }

    toggle.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });

    // Close on backdrop click
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) closeDrawer();
    });

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
    initHoverEffect();
    initMobileDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
