// stories.js — story tile data, rendering, and modal
//
// ADDING A REVIEW — supported fields:
//   name, product, location, color, story  (required)
//   photo  — local path or URL, shown in tile and modal
//            e.g. '/assets/images/stories/jane_d.jpg'
//                 'https://example.com/jane.jpg'
//   video  — local path or URL, plays muted on hover; opens with controls in modal
//            e.g. '/assets/videos/jane_d.mp4'
//                 'https://example.com/jane.mp4'
//   photo + video — photo shows as static frame, video fades in on hover
//
// Examples:
//   { name: 'Jane D.', product: 'Pacagen', location: 'Austin, TX', color: '#044eb7',
//     story: '...' }
//
//   { name: 'Jane D.', product: 'Pacagen', location: 'Austin, TX', color: '#044eb7',
//     photo: '/assets/images/stories/jane_d.jpg', story: '...' }
//
//   { name: 'Jane D.', product: 'Pacagen', location: 'Austin, TX', color: '#044eb7',
//     photo: '/assets/images/stories/jane_d.jpg',
//     video: '/assets/videos/jane_d.mp4', story: '...' }

(function () {
  'use strict';

  var STORY_TILE_SVG = '<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="30" r="16" fill="rgba(255,255,255,0.25)"/><ellipse cx="40" cy="70" rx="26" ry="18" fill="rgba(255,255,255,0.2)"/></svg>';

  var PHOTO_TILES = {
    pacagen: { _photo: true, src: '/assets/images/PACAGEN%20LIFESTYLE%20PHOTO%202MB.png', label: 'Pacagen', productClass: 'pacagen' },
    reyou:   { _photo: true, src: '/assets/images/REYOU%20LIFESTYLE%20PHOTO%202MB.png',   label: 'RE:YOU',  productClass: 'reyou'   }
  };

  var STORY_TRACKS = [
    [
      PHOTO_TILES.pacagen,
      { name: 'Cassidy T.',    product: 'Pacagen', location: 'Cat Allergen Neutralizing Spray', color: '#044eb7', photo: '/assets/images/stories/cassidy_T.jpg', story: `Insanely noticeable results! YOU GUYS! Thank you for this. I woke up today after spraying last night and I could breathe through my nose when I woke up. Usually I'm blowing my nose and coughing up mucus (TMI but we all know it's what happens) for at least an hour in the morning. Today... blew my nose once or twice just to feel clean and that's all I needed. Like I can't believe I've noticed this much of a difference after one day.` },
      { name: 'Priya N.',    product: 'RE:YOU',  location: 'New York, NY',      color: '#5d2a2c', story: 'The science behind RE:YOU is unlike anything else on the market. My hormonal health had been a mystery to every doctor I saw. RE:YOU\'s technology identified what was going on and gave me a clear path forward. Six months later my labs look completely different.' },
      { name: 'Kathryn C.',    product: 'Pacagen',  location: 'Cat Allergen Neutralizing Spray',       color: '#8a4a20', photo:'/assets/images/stories/kathryn_c2.jpg', story: `Pacagen spray and powder work!
I’ve been using the Pacagen spray and powder, and it’s helped significantly reduce my cat allergies. Previously, I was using an inhaler and allergy meds. Now, I don’t use either and feel much better!` },
      { name: 'Nadia T.',    product: 'RE:YOU',  location: 'Houston, TX',       color: '#a06030', story: 'I never expected a supplement protocol to change my relationship with my own body. RE:YOU did exactly that. I feel in control again — of my energy, my focus, my mood. My husband says he has his wife back.' },
      { name: 'Amanda',     product: 'Pacagen', location: 'Cat Allergen Neutralizing Spray',     color: '#023a90', photo:'https://cdn.shopify.com/s/files/1/0814/8369/4394/files/amandas_story_thumbnail.png?v=1773863886&width=1000&crop=center', video:'https://cdn.shopify.com/videos/c/o/v/99ba052a68af4859933b6ee1f3d9d217.mp4', story: `Listen to Amanda's Pacagen Story.` },
      { name: 'Fatima R.',   product: 'RE:YOU',  location: 'Dallas, TX',        color: '#7c3540', story: 'RE:YOU gave me language for what was happening in my body. The personalized breakdown made me feel seen in a way that years of appointments never had. The results followed quickly after that.' }
    ],
    [
      { name: 'Edie M.',   product: 'Pacagen', location: 'Cat Allergen Reducing Supplement', color: '#032d70', photo: 'assets/images/stories/edie_m.jpg', story: `Adopting a second Kitty!
I was a bit skeptical that I would see any change and have had pretty severe cat allergies - hives, wheezing, even a swollen eye once, but I love cats and really wanted to adopt. It took about 3 weeks and then I knew I was seeing results. I went from taking allergy medicine daily and still having symptoms to no allergy medicine, constant cuddles, and no allergies!! Now we are getting ready to adopt a second Kitty! 🥳`},
      { name: 'Lena W.',     product: 'RE:YOU',  location: 'Seattle, WA',       color: '#b59156', story: 'I started RE:YOU after my second child. The postpartum fog was real and nothing conventional helped. RE:YOU\'s approach felt genuinely personalized — not a one-size-fits-all supplement stack. Three months in, the clarity came back. I finally feel like me again.' },
      { name: 'Nina K.',    product: 'Pacagen',  location: 'Cat Allergen Neutralizing Spray',   color: '#7a3a3c', photo:'/assets/images/stories/Nina_K.jpg', story: `No more sneezing!
This is a true miracle product! I am amazed at how I don't sneeze 50 times a day anymore. I don't even have to pop a daily Claritin anymore. It's a game changer and I highly recommend this spray to anyone who suffers from cat allergies. My baby Star and I are so happy!` },
      { name: 'Ben O.',      product: 'Pacagen', location: 'Nashville, TN',     color: '#012458', story: 'Both my kids are allergic to cats. We\'ve had to pass on adopting twice. After three months on Pacagen their reactions are almost completely gone. We\'re picking up a kitten next weekend and I genuinely cannot wait.' },
      { name: 'Simone K.',   product: 'RE:YOU',  location: 'Charlotte, NC',     color: '#9c5030', story: 'I was hesitant to try another wellness product. Everything else had overpromised and underdelivered. RE:YOU was different from week one. I sleep through the night now. I haven\'t done that consistently in seven years.' },
      { name: 'Tyler N.',    product: 'Pacagen', location: 'Columbus, OH',      color: '#053060', story: 'My daughter is allergic to everything — dust, pollen, and especially cats. We couldn\'t go to half our family\'s homes. Pacagen changed that. She went from full-blown reactions to barely noticing. It\'s hard to overstate how much that matters.' },
      { name: 'Elena V.',    product: 'RE:YOU',  location: 'San Jose, CA',      color: '#6a2a50', story: 'I\'d read about the science and was cautiously optimistic. After two months I was genuinely shocked. The brain fog lifted first. Then my energy evened out. I feel like I\'ve been upgraded.' }
    ],
    [
      PHOTO_TILES.reyou,
      { name: 'Sara R.',   product: 'Pacagen', location: 'Cat Allergen Reducing Supplement',        color: '#1a4a8a', photo: 'assets/images/stories/sara_r.jpg', story: `Skeptic to believer!
I have 3 cats and a husband who is allergic to cats. I saw a testimonial online and thought what do I have to lose? It started working with in a few days and my cats didn’t seem to mind or notice it in their food. I accidentally skipped a few days and my husbands symptoms resumed. I am a believer now! I am looking forward to my inlaws coming to see if it helps them too.` },
      { name: 'Tom H.',      product: 'Pacagen', location: 'Denver, CO',        color: '#033a8a', story: 'I adopted a rescue cat knowing full well I was allergic. I started Pacagen two weeks before she arrived. It genuinely worked — my reactions dropped by probably 80%. My girlfriend can\'t believe I have a cat now.' },
      { name: 'Rachel S.',   product: 'RE:YOU',  location: 'Miami, FL',         color: '#9a6a30', story: 'RE:YOU helped me understand my own body in a way no one ever had. My energy is stable, my mood is better, and I finally have the clarity I needed to feel like myself every single day.' },
      { name: 'Julia F.',    product: 'RE:YOU',  location: 'Atlanta, GA',       color: '#6b3040', story: 'RE:YOU is the first wellness product I\'ve ever used where I could actually feel the difference before the end of the first month. The formula feels bespoke because it genuinely is. Nothing else comes close.' },
      { name: 'Patrick M.',  product: 'Pacagen', location: 'Philadelphia, PA',  color: '#04286a', story: 'I\'d been on antihistamines for 12 years. My ENT basically told me this was just my life. Pacagen was the first thing that actually changed the underlying reaction. I don\'t carry allergy meds anymore. That still feels surreal.' },
      { name: 'Isabelle D.', product: 'RE:YOU',  location: 'Tampa, FL',         color: '#8c3050', story: 'My doctor was the one who recommended RE:YOU after my labs showed hormone irregularities. I was skeptical of any supplement. Three months later my follow-up labs had my doctor asking what I\'d been doing. RE:YOU was the only change.' },
      { name: 'Ryan C.',     product: 'Pacagen', location: 'Salt Lake City, UT',color: '#042268', story: 'Living with two allergic kids in a house where the neighbors have outdoor cats was a nightmare. Pacagen changed the calculus entirely. Both kids saw major improvement within six weeks. It bought us a lot of peace.' }
    ],
    [
      { name: 'Chris P.',    product: 'Pacagen', location: 'Minneapolis, MN',   color: '#063460', story: 'I work in a veterinary clinic. The irony of being allergic to cats was not lost on me. Pacagen let me do my job without suffering. My coworkers noticed before I even told them what I\'d started taking.' },
      { name: 'Wendy R.',    product: 'Pacagen',  location: 'Cat Allergen Neutralizing Spray',    color: '#7d3a20', photo:'/assets/images/stories/wendy_r.jpg', story: `54 y.o. & I finally have a cat again!
We’ve now had our little girl for two years, and as long as I stay consistent with Pacagen, I have no issues. If I forget to treat the furniture, bedding, pillows, or other areas where she spends time, I’ll notice that familiar “tight” feeling in my lungs. That’s my reminder to use my rescue inhaler and refresh our spraying routine, and things quickly settle down.

Having a cat in my life again after 46 years has been an absolute joy—and honestly, I don’t think it would have been possible without Pacagen.` },
      { name: 'Haruto S.',   product: 'Pacagen', location: 'San Francisco, CA', color: '#012c60', story: 'I grew up with cats and always assumed I\'d outgrow the allergy. I never did. Pacagen was the first real intervention that worked. I can sleep at my parents\' house again for the first time since college.' },
      { name: 'Claire B.',   product: 'RE:YOU',  location: 'Pittsburgh, PA',    color: '#a84028', story: 'After my second pregnancy, my hormones were completely off. Nothing my OB suggested made a real dent. RE:YOU got to the root of it. I feel like myself again — actually myself, not just functional.' },
      { name: 'Katherine K.',    product: 'Pacagen', location: 'Cat Allergen Neutralizing Spray', photo:'/assets/images/stories/katherine_k.jpg', color: '#031e58', story: `This was revolutionary for my home
I have 2 cats and i had recently found out that I am allergic! I was not giving my babies up! So I purchased this and this was such a great decision!` },
      { name: 'Yuki P.',     product: 'RE:YOU',  location: 'Oakland, CA',       color: '#6a4a20', story: 'I was running on fumes for two years and didn\'t realize how depleted I was until RE:YOU started working. The difference showed up first in my focus, then my sleep, then my energy. It compounded fast.' }
    ]
  ];

  function renderStoryTile(data, isDupe) {
    var productClass = data.product.toLowerCase().replace(':', '');
    var tabAttr      = isDupe ? ' tabindex="-1"' : '';
    var photoAttr    = data.photo ? ' data-photo="' + data.photo + '"' : '';
    var videoAttr    = data.video ? ' data-video="' + data.video + '"' : '';
    var imgHtml      = data.photo
      ? '<img class="story-tile-img story-tile-img--photo" src="' + data.photo + '" alt="" loading="lazy">'
      : '<div class="story-tile-img" style="background-color:' + data.color + ';" aria-hidden="true"></div>';
    var videoHtml    = data.video
      ? '<video class="story-tile-video" muted playsinline loop preload="none" src="' + data.video + '"'
        + (data.photo ? ' poster="' + data.photo + '"' : '') + '></video>'
      : '';
    return '<button class="story-tile" aria-label="Open story: ' + data.name + '"' + tabAttr +
      ' data-name="' + data.name + '"' +
      ' data-product="' + data.product + '"' +
      ' data-location="' + data.location + '"' +
      ' data-story="' + data.story.replace(/"/g, '&quot;') + '"' + photoAttr + videoAttr + '>' +
      imgHtml +
      videoHtml +
      '<div class="story-tile-info">' +
      '<span class="story-tile-name">' + data.name + '</span>' +
      '<span class="story-tile-product ' + productClass + '">' + data.product + '</span>' +
      '</div>' +
      '</button>';
  }

  function renderPhotoTile(cfg, isDupe) {
    var tabAttr = isDupe ? ' tabindex="-1"' : '';
    return '<div class="story-photo-tile"' + tabAttr + '>' +
      '<img class="story-photo-tile-img" src="' + cfg.src + '" alt="' + cfg.label + ' lifestyle photo" loading="lazy">' +
      '</div>';
  }

  function renderTile(d, isDupe) {
    return d._photo ? renderPhotoTile(d, isDupe) : renderStoryTile(d, isDupe);
  }

  function renderTrack(trackInnerEl, items) {
    var real  = items.map(function (d) { return renderTile(d, false); }).join('');
    var dupes = items.map(function (d) { return renderTile(d, true);  }).join('');
    trackInnerEl.innerHTML = dupes + real + dupes + dupes;
  }

  function initStories() {
    var trackInners = document.querySelectorAll('.stories-track-inner');
    STORY_TRACKS.forEach(function (items, i) {
      if (trackInners[i]) renderTrack(trackInners[i], items);
    });

    trackInners.forEach(function (inner) {
      inner.addEventListener('mouseenter', function (e) {
        var tile = e.target.closest('.story-tile');
        if (!tile) return;
        var v = tile.querySelector('.story-tile-video');
        if (v) v.play();
      }, true);
      inner.addEventListener('mouseleave', function (e) {
        var tile = e.target.closest('.story-tile');
        if (!tile) return;
        var v = tile.querySelector('.story-tile-video');
        if (v) { v.pause(); v.currentTime = 0; }
      }, true);
    });

    var modal = document.getElementById('story-modal');
    if (!modal) return;

    var backdrop    = modal.querySelector('.story-modal-backdrop');
    var closeBtn    = modal.querySelector('.story-modal-close');
    var badge       = document.getElementById('modal-badge');
    var nameEl      = document.getElementById('modal-name');
    var locEl       = document.getElementById('modal-location');
    var storyEl     = document.getElementById('modal-story');
    var modalPhoto  = document.getElementById('modal-photo');
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

      if (tile.dataset.photo && !videoSrc) {
        modalPhoto.src = tile.dataset.photo;
        modalPhoto.removeAttribute('hidden');
      } else {
        modalPhoto.src = '';
        modalPhoto.setAttribute('hidden', '');
      }

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
