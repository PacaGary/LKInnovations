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
          tag: 'WhiskerBlock™',
          body: "Pacagen engineers specialized proteins that bind directly to Fel d 1 — the primary cat allergen — neutralizing it before it can trigger your immune response. Applied to surfaces and fabrics, WhiskerBlock™ works proactively, so you’re protected before exposure rather than reacting after."
        },
        {
          tag: 'EnviroBlock™',
          body: "EnviroBlock™ targets dust mite and environmental allergens at the molecular level. Its patent-protected barrier technology protects the epithelial skin layer while reducing your body’s inflammatory response to everyday environmental triggers — no antihistamines required."
        },
        {
          tag: 'Our Approach',
          body: "Unlike traditional allergy treatments that suppress symptoms after the fact, Pacagen’s proactive platform neutralizes allergens at the source. Every formula is engineered for efficacy first, shelf appeal second."
        }
      ]
    },
    reyou: {
      eyebrow: 'The Technology',
      headline: 'The Science Behind RE:YOU',
      sections: [
        {
          tag: 'NOVOGRO™',
          body: "NOVOGRO™ is a clinically tested complex of molecules discovered using AI-powered screening tools. Rather than targeting a single pathway, it works on the full hair follicle environment — supporting dermal papilla cell signaling, reducing scalp inflammation, and extending the anagen (growth) phase."
        },
        {
          tag: 'AI-Powered Discovery',
          body: "RE:YOU built proprietary discovery infrastructure to screen thousands of molecular candidates against hair biology models. This approach surfaces non-obvious actives that traditional formulation labs would never test — and validates them against real clinical endpoints before they reach a product."
        },
        {
          tag: 'Clinical Backing',
          body: "In controlled studies, NOVOGRO™ users saw measurable improvements in hair density and reductions in shedding within 90 days. Results are tracked against baseline photography and dermatologist assessment — not self-reported surveys."
        }
      ]
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
