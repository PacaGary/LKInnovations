// nav.js — floating circle nav button, drawer, and clip-circle hover

(function () {
  'use strict';

  var NAV_LINKS = [
    { href: '/#about',   label: 'About',   cls: 'nav-link' },
    { href: '/#pacagen', label: 'Pacagen', cls: 'nav-link' },
    { href: '/#reyou',   label: 'RE:YOU',  cls: 'nav-link' },
    { href: '/#stories', label: 'Stories', cls: 'nav-link' },
    { href: '/#contact', label: 'Contact', cls: 'nav-cta'  }
  ];

  function renderNavLinks() {
    var drawer  = document.getElementById('mobile-drawer');
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

    var social = document.createElement('div');
    social.className = 'drawer-social';
    panel.appendChild(social);

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

  var INFO_CONTENT = {
    pacagen: {
      eyebrow: 'The Technology',
      headline: 'The Science Behind Pacagen',
      sections: [
        {
          tag: 'WhiskerBlock™ Alpha',
          body: "Breaks down Fel d 1, the primary allergen in cat saliva that causes 95% of cat allergies."
        },
        {
          tag: 'WhiskerBlock™ Beta',
          body: "Targets Can f 1 and Can f 2, two of the main allergens in dog dander that causes dog allergies."
        },
        {
          tag: 'EnviroBlock™',
          body: "Mutes the enzymatic activity of Der p 1 and the inflammatory activity of Der p 2, both of which are allergens released by dust mites."
        }

      ],
      manuscript: 'https://www.biorxiv.org/content/10.1101/2025.08.03.668213v1'
    },
    reyou: {
      eyebrow: 'The Technology',
      headline: 'The Science Behind RE:YOU',
      sections: [
        {
          tag: '20 Million+ Molecules Screened',
          body: "Our scientists used advanced biotechnology to identify three new molecules (NOVOGRO™) that support hair through complementary pathways."
        },
        {
          tag: 'NOVOGRO™-623/624',
          body: "Enhances cellular energy within dermal papilla cells, supporting the signaling activity that drives the growth phase"
        },
        {
          tag: 'NOVOGRO™-273',
          body: "Improves oxygen and nutrient availability around the follicle."
        }
        ,
        {
          tag: 'Clinical Trial',
          body: "In a 100+ person clinical study with female subjects with androgenetic alopecia, participants who "
        }
      ],
      manuscript: 'https://www.biorxiv.org/content/10.64898/2026.06.09.728282v1'
    }
  };

  function buildInfoContent(key) {
    var data = INFO_CONTENT[key];
    if (!data) return '';

    var html = '<span class="info-drawer-eyebrow">' + data.eyebrow + '</span>';
    html += '<h2 class="info-drawer-headline">' + data.headline + '</h2>';

    data.sections.forEach(function (s, i) {
      if (i > 0) html += '<hr class="info-drawer-divider">';
      html += '<div>';
      html += '<span class="info-drawer-product-tag">' + s.tag + '</span>';
      html += '<p class="info-drawer-body" style="margin-top:0.75rem">' + s.body + '</p>';
      html += '</div>';
    });

    if (data.manuscript) {
      html += '<a href="' + data.manuscript + '" class="info-drawer-manuscript-link" target="_blank" rel="noopener noreferrer">Read our manuscript</a>';
    }

    return html;
  }

  function initInfoDrawer() {
    var drawer  = document.getElementById('info-drawer');
    var content = drawer && drawer.querySelector('.info-drawer-content');
    var closeBtn = drawer && drawer.querySelector('.info-drawer-close');
    var btns    = document.querySelectorAll('.learn-more-btn');
    if (!drawer || !content || !btns.length) return;

    function openInfoDrawer(key) {
      content.innerHTML = buildInfoContent(key);
      var sb = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = sb + 'px';
      drawer.style.display = 'flex';
      requestAnimationFrame(function () {
        drawer.classList.add('is-open');
      });
      document.body.style.overflow = 'hidden';
      drawer.setAttribute('aria-hidden', 'false');
    }

    function closeInfoDrawer() {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      drawer.setAttribute('aria-hidden', 'true');
      setTimeout(function () {
        if (!drawer.classList.contains('is-open')) {
          drawer.style.display = 'none';
          content.innerHTML = '';
        }
      }, 300);
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openInfoDrawer(btn.getAttribute('data-panel'));
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeInfoDrawer);

    drawer.addEventListener('click', function (e) {
      if (!e.target.closest('.info-drawer-panel')) closeInfoDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeInfoDrawer();
      }
    });
  }

  function initMobileDrawer() {
    var toggle = document.querySelector('.nav-menu-toggle');
    var drawer = document.getElementById('mobile-drawer');
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
    initInfoDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
