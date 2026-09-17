// nav.js — floating circle nav button, drawer, and clip-circle hover

(function () {
  'use strict';

  var NAV_LINKS = [
    { href: '/#about',   label: 'About',   cls: 'nav-link' },
    { href: '/#reyou',   label: 'RE:YOU',  cls: 'nav-link' },
    { href: '/#pacagen', label: 'Pacagen', cls: 'nav-link' },
    { href: '/#stories', label: 'Stories', cls: 'nav-link' },
    { href: '/#contact', label: 'Contact', cls: 'nav-cta'  }
  ];

  function renderNavLinks() {
    var drawer  = document.querySelector('.mobile-drawer');
    if (!drawer) return;

    var panel = document.createElement('div');
    panel.className = 'drawer-panel';

    NAV_LINKS.forEach(function (n) {
      var a = document.createElement('a');
      a.href        = n.href;
      a.className   = n.cls;
      a.textContent = n.label;
      panel.appendChild(a);
    });
    drawer.appendChild(panel);
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

  function initPillHover() {
    var pills = document.querySelectorAll('.btn-LKDH');
    pills.forEach(function (pill) {
      pill.addEventListener('mousemove', function (e) {
        var rect = pill.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
        var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
        pill.style.setProperty('--mx', x);
        pill.style.setProperty('--my', y);
      });
    });
  }

  function initMobileDrawer() {
    var toggle = document.querySelector('.nav-menu-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    if (!toggle || !drawer) return;

    function openDrawer() {
      var sb = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = sb + 'px';
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
      document.body.style.paddingRight = '';
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

    // Close on backdrop click (not on panel itself)
    drawer.addEventListener('click', function (e) {
      if (!e.target.closest('.drawer-panel')) closeDrawer();
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
    initPillHover();
    initMobileDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
