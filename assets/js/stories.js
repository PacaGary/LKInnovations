// stories.js — story tile data, rendering, and modal

(function () {
  'use strict';

  var STORY_TILE_SVG = '<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="30" r="16" fill="rgba(255,255,255,0.25)"/><ellipse cx="40" cy="70" rx="26" ry="18" fill="rgba(255,255,255,0.2)"/></svg>';

  var STORY_TRACKS = [
    [
      { name: 'Sarah M.',  product: 'RE:YOU',  location: 'Austin, TX',        color: '#c9a96e', story: 'After years of trying everything, RE:YOU\'s personalized approach finally gave me my energy back. Within three months I felt like myself again — the version of me I thought I\'d lost forever. I tell everyone I know about it.' },
      { name: 'James K.',  product: 'Pacagen', location: 'San Francisco, CA', color: '#044eb7', story: 'I\'ve had cat allergies my entire life. I\'d accepted that I\'d never be able to visit my sister\'s home. Pacagen changed that. After just six weeks of the protocol I sat on her couch for the first time in 15 years and didn\'t reach for my inhaler once.' },
      { name: 'Priya N.',  product: 'RE:YOU',  location: 'New York, NY',      color: '#5d2a2c', story: 'The science behind RE:YOU is unlike anything else on the market. My hormonal health had been a mystery to every doctor I saw. RE:YOU\'s technology identified what was going on and gave me a clear path forward. Six months later my labs look completely different.' },
      { name: 'Maria C.',  product: 'RE:YOU',  location: 'Phoenix, AZ',       color: '#8a4a20', story: 'I was exhausted all the time and couldn\'t figure out why. Doctors kept telling me my labs were \'normal.\' RE:YOU\'s technology found what they missed. I\'m not tired anymore. That sounds small but it changed everything.' }
    ],
    [
      { name: 'Marcus T.', product: 'Pacagen', location: 'Chicago, IL',       color: '#032d70', story: 'As someone who grew up with severe allergies, I was skeptical. But the clinical data behind Pacagen is real, and so are my results. My allergist is genuinely baffled by my improvement. I\'ve gone from daily antihistamines to nothing in four months.' },
      { name: 'Lena W.',   product: 'RE:YOU',  location: 'Seattle, WA',       color: '#b59156', story: 'I started RE:YOU after my second child. The postpartum fog was real and nothing conventional helped. RE:YOU\'s approach felt genuinely personalized — not a one-size-fits-all supplement stack. Three months in, the clarity came back. I finally feel like me again.' },
      { name: 'Aisha B.',  product: 'RE:YOU',  location: 'Los Angeles, CA',   color: '#7a3a3c', story: 'I\'d been dismissed by so many practitioners. RE:YOU was the first time I felt like the science was actually built around me. The improvement in my sleep quality alone was worth everything. I\'m recommending it to every woman I know.' },
      { name: 'Ben O.',    product: 'Pacagen', location: 'Nashville, TN',     color: '#012458', story: 'Both my kids are allergic to cats. We\'ve had to pass on adopting twice. After three months on Pacagen their reactions are almost completely gone. We\'re picking up a kitten next weekend and I genuinely cannot wait.' }
    ],
    [
      { name: 'Daniel R.', product: 'Pacagen', location: 'Boston, MA',        color: '#1a4a8a', story: 'My son is allergic to cats and my wife refused to give up hers. I found Pacagen and it felt like a long shot. Now my son plays with the cats every day. His pediatrician asked me what we\'d changed because his allergy panel scores dropped so dramatically.' },
      { name: 'Tom H.',    product: 'Pacagen', location: 'Denver, CO',        color: '#033a8a', story: 'I adopted a rescue cat knowing full well I was allergic. I started Pacagen two weeks before she arrived. It genuinely worked — my reactions dropped by probably 80%. My girlfriend can\'t believe I have a cat now.' },
      { name: 'Rachel S.', product: 'RE:YOU',  location: 'Miami, FL',         color: '#9a6a30', story: 'RE:YOU helped me understand my own body in a way no one ever had. My energy is stable, my mood is better, and I finally have the clarity I needed to feel like myself every single day.' },
      { name: 'Julia F.',  product: 'RE:YOU',  location: 'Atlanta, GA',       color: '#6b3040', story: 'RE:YOU is the first wellness product I\'ve ever used where I could actually feel the difference before the end of the first month. The formula feels bespoke because it genuinely is. Nothing else comes close.' }
    ],
    [
      { name: 'Kevin L.',  product: 'Pacagen', location: 'Portland, OR',      color: '#042050', story: 'My daughter wanted a cat more than anything. I told her my allergies made it impossible. Then I found Pacagen. We got a kitten in February. My daughter named her Miracle. I am not joking.' },
      { name: 'Chris P.',  product: 'Pacagen', location: 'Minneapolis, MN',   color: '#063460', story: 'I work in a veterinary clinic. The irony of being allergic to cats was not lost on me. Pacagen let me do my job without suffering. My coworkers noticed before I even told them what I\'d started taking.' },
      { name: 'Marcus T.', product: 'Pacagen', location: 'Chicago, IL',       color: '#032d70', story: 'As someone who grew up with severe allergies, I was skeptical. But the clinical data behind Pacagen is real, and so are my results. My allergist is genuinely baffled by my improvement. I\'ve gone from daily antihistamines to nothing in four months.' },
      { name: 'Sarah M.',  product: 'RE:YOU',  location: 'Austin, TX',        color: '#c9a96e', story: 'After years of trying everything, RE:YOU\'s personalized approach finally gave me my energy back. Within three months I felt like myself again — the version of me I thought I\'d lost forever. I tell everyone I know about it.' }
    ],
    [
      { name: 'Lena W.',   product: 'RE:YOU',  location: 'Seattle, WA',       color: '#b59156', story: 'I started RE:YOU after my second child. The postpartum fog was real and nothing conventional helped. RE:YOU\'s approach felt genuinely personalized — not a one-size-fits-all supplement stack. Three months in, the clarity came back. I finally feel like me again.' },
      { name: 'Tom H.',    product: 'Pacagen', location: 'Denver, CO',        color: '#033a8a', story: 'I adopted a rescue cat knowing full well I was allergic. I started Pacagen two weeks before she arrived. It genuinely worked — my reactions dropped by probably 80%. My girlfriend can\'t believe I have a cat now.' },
      { name: 'Julia F.',  product: 'RE:YOU',  location: 'Atlanta, GA',       color: '#6b3040', story: 'RE:YOU is the first wellness product I\'ve ever used where I could actually feel the difference before the end of the first month. The formula feels bespoke because it genuinely is. Nothing else comes close.' },
      { name: 'Daniel R.', product: 'Pacagen', location: 'Boston, MA',        color: '#1a4a8a', story: 'My son is allergic to cats and my wife refused to give up hers. I found Pacagen and it felt like a long shot. Now my son plays with the cats every day. His pediatrician asked me what we\'d changed because his allergy panel scores dropped so dramatically.' }
    ]
  ];

  function renderStoryTile(data, isDupe) {
    var productClass = data.product.toLowerCase().replace(':', '');
    var tabAttr      = isDupe ? ' tabindex="-1"' : '';
    return '<button class="story-tile" aria-label="Open story: ' + data.name + '"' + tabAttr +
      ' data-name="' + data.name + '"' +
      ' data-product="' + data.product + '"' +
      ' data-location="' + data.location + '"' +
      ' data-story="' + data.story.replace(/"/g, '&quot;') + '">' +
      '<div class="story-tile-img" style="background-color:' + data.color + ';" aria-hidden="true">' + STORY_TILE_SVG + '</div>' +
      '<div class="story-tile-info">' +
      '<span class="story-tile-name">' + data.name + '</span>' +
      '<span class="story-tile-product ' + productClass + '">' + data.product + '</span>' +
      '</div>' +
      '</button>';
  }

  function renderTrack(trackInnerEl, items) {
    trackInnerEl.innerHTML =
      items.map(function (d) { return renderStoryTile(d, false); }).join('') +
      items.map(function (d) { return renderStoryTile(d, true);  }).join('');
  }

  function initStories() {
    var trackInners = document.querySelectorAll('.stories-track-inner');
    STORY_TRACKS.forEach(function (items, i) {
      if (trackInners[i]) renderTrack(trackInners[i], items);
    });

    var modal = document.getElementById('story-modal');
    if (!modal) return;

    var backdrop    = modal.querySelector('.story-modal-backdrop');
    var closeBtn    = modal.querySelector('.story-modal-close');
    var badge       = document.getElementById('modal-badge');
    var nameEl      = document.getElementById('modal-name');
    var locEl       = document.getElementById('modal-location');
    var storyEl     = document.getElementById('modal-story');
    var lastFocused = null;

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
        modalVideo.src            = videoSrc;
        videoWrap.style.display   = '';
        closeBtn.style.background = 'rgba(0,0,0,0.5)';
        closeBtn.style.color      = '#fff';
      } else {
        modalVideo.src            = '';
        videoWrap.style.display   = 'none';
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
      if (modalVideo) { modalVideo.pause(); modalVideo.src = ''; }
      if (lastFocused) lastFocused.focus();
    }

    var tiles = document.querySelectorAll('.story-tile:not([tabindex="-1"])');
    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { openModal(tile); });
    });

    var dupeTiles = document.querySelectorAll('.story-tile[tabindex="-1"]');
    dupeTiles.forEach(function (tile) {
      tile.addEventListener('click', function () { openModal(tile); });
    });

    if (closeBtn) closeBtn.addEventListener('click',  closeModal);
    if (backdrop) backdrop.addEventListener('click',  closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStories);
  } else {
    initStories();
  }
})();
