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
//   ratio  — optional CSS aspect-ratio override, default is 1/1 (square)
//            e.g. '4/5' for portrait, '16/9' for landscape
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
      { name: 'Deanna S.',      product: 'RE:YOU', location: 'RE:YOU Dual-Path Hair Revival Serum',   ratio: '4/5',  color: '#012458', photo: 'https://review-images.judgeme.com/re-you/1789599461__1789599457743-img_7216__original.jpeg?quality=80&width=1024', story: `RE:YOU really works! In my 68 years, and trying countless products, I have never before had one that truly added volume to my thinning hair and reduced some very thin spots on my scalp until RE:YOU! I never liked how my hair looked in photos until RE:YOU! I am so happy with my results! I recently had professional portraits taken with my infant grandson, and my hair looks absolutely stunning! Thank you for creating this outstanding product! Fan for life!` },
      { name: 'Kathryn C.',    product: 'Pacagen',  location: 'Cat Allergen Neutralizing Spray',       color: '#8a4a20', photo:'/assets/images/stories/kathryn_c2.jpg', story: `Pacagen spray and powder work!
I’ve been using the Pacagen spray and powder, and it’s helped significantly reduce my cat allergies. Previously, I was using an inhaler and allergy meds. Now, I don’t use either and feel much better!` },
      { name: 'Nadia T.',    product: 'RE:YOU',  location: 'Houston, TX',       color: '#a06030', story: 'I never expected a supplement protocol to change my relationship with my own body. RE:YOU did exactly that. I feel in control again — of my energy, my focus, my mood. My husband says he has his wife back.' },
      { name: 'Sasha',     product: 'Pacagen',  location: 'RE:YOU Dual-Path Hair Revival Serum',   video:  'https://cdn.shopify.com/videos/c/o/v/5c616d918c394c379ed9128afe306d0e.mp4', ratio: '9/16',   color: '#044BE7', photo: 'https://cdn.shopify.com/s/files/1/0814/8369/4394/files/sashas_story_thumbnail.png?v=1773863886', story: `Listen to Sasha's Pacagen Story.` },
      { name: 'Tess F.',   product: 'Pacagen', location: 'Cat Allergen Reducing Supplement', color: '#012c60', story: `If I could rate it with 6 stars, I would.
        This product saved me from having to rehome my cat! 
        I recently moved in with my boyfriend and he and his family are pretty allergic to cats. I had bought the anti allergen food, vacuumed twice a day, kept her separated, a special liquid to rub on her fur, but it didn't help. My poor boyfriend was suffering. 
        As a last ditch effort, I tried this and it was a COMPLETE game changer for our house. He no longer has any reactions or any issues with her since starting Pacagen. She even sits on his lap for snuggles now, and no sneezes, no itchy eyes. NOTHING. 
        If you feel like you're at the end of your rope. PLEASE, try these products. 
        I now get to keep my baby and my boyfriend gets to love her too! :heart:` },
      { name: 'Pete N.',     product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum',     video:'assets/images/stories/20260807_HAIR_TriedEverythingShelf_Video_UGC_PeteNikolovski.mov',  color: '#6a4a20', photo: 'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/Pete-Review.jpg?v=1786370349', story: `RE:YOU feels like a really high-quality product. It has a nice, premium feel to it. It definitely gives you that luxury experience right from the start.` }
    ],
    [
      { name: 'Edie M.',   product: 'Pacagen', location: 'Cat Allergen Reducing Supplement', color: '#032d70', photo: 'assets/images/stories/edie_m.jpg', story: `Adopting a second Kitty!
I was a bit skeptical that I would see any change and have had pretty severe cat allergies - hives, wheezing, even a swollen eye once, but I love cats and really wanted to adopt. It took about 3 weeks and then I knew I was seeing results. I went from taking allergy medicine daily and still having symptoms to no allergy medicine, constant cuddles, and no allergies!! Now we are getting ready to adopt a second Kitty! 🥳`},
      { name: 'Kristin K.',     product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum',       color: '#b59156', photo: 'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/Kristin_review.jpg?v=1788558144', story: `Noticing changes in my hair has affected me more than I expected, so I like having a simple step that makes me feel proactive. RE:YOU is lightweight, non-greasy, and easy to fit into my routine—and using it feels like I’m doing something positive for myself.` },

      { name: 'Nina K.',    product: 'Pacagen',  location: 'Cat Allergen Neutralizing Spray',   color: '#7a3a3c', photo:'/assets/images/stories/Nina_K.jpg', story: `No more sneezing!
This is a true miracle product! I am amazed at how I don't sneeze 50 times a day anymore. I don't even have to pop a daily Claritin anymore. It's a game changer and I highly recommend this spray to anyone who suffers from cat allergies. My baby Star and I are so happy!` },
      { name: 'Yulin Z.',   product: 'RE:YOU',  location: 'Charlotte, NC',   photo: 'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/lan-mom-hair.jpg?v=1784672897',  color: '#9c5030', story: `I’ve been dealing with thinning hair for years and had tried everything. After a few months with RE:YOU, I started noticing baby hairs along my part and my ponytail actually feels fuller. At 52, I honestly didn't expect to see results like this.` },
      { name: 'Tyler N.',    product: 'Pacagen', location: 'Columbus, OH',      color: '#053060', story: 'My daughter is allergic to everything — dust, pollen, and especially cats. We couldn\'t go to half our family\'s homes. Pacagen changed that. She went from full-blown reactions to barely noticing. It\'s hard to overstate how much that matters.' },
      { name: 'Leahna L.',   product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum',   photo: 'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/leahna_review.png?v=1785281633', video: '/assets/images/stories/20260724_Hair_MathOfHiding_Video_UGC_LeahnaLoomis.mov', color: '#9c5030', story: `I wasn't expecting to be this excited, but I'm actually noticing my thinning spots starting to fill in. It’s so easy to use that it’s become part of my daily routine and I’m thrilled with the progress I've seen` },
    ],
    [
      { name: 'Wendy R.',    product: 'Pacagen',  location: 'Cat Allergen Neutralizing Spray',    color: '#7d3a20', photo:'/assets/images/stories/wendy_r.jpg', story: `54 y.o. & I finally have a cat again!
        We've now had our little girl for two years, and as long as I stay consistent with Pacagen, I have no issues. If I forget to treat the furniture, bedding, pillows, or other areas where she spends time, I'll notice that familiar “tight” feeling in my lungs. That's my reminder to use my rescue inhaler and refresh our spraying routine, and things quickly settle down.
        
        Having a cat in my life again after 46 years has been an absolute joy—and honestly, I don't think it would have been possible without Pacagen.` },
      { name: 'Claire B.',   product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum',    color: '#a84028', photo:'https://review-images.judgeme.com/re-you/1789059627__1789059576737-img3__original.png?quality=80&width=1024', story: `3 months later… I'm shocked
  Just finished my 3 bottles and I had to share these photos because I'm kind of shocked. I've tried so many things since my hair started thinning during menopause and I've never actually been able to SEE a difference like this. My part was getting wider and wider and nothing seemed to help. Now I keep looking at these pictures because the difference is crazy to me. I'm seeing so much more hair along my part and my scalp is way less visible. This is the first thing I've tried where I actually feel like I’m getting my old hair back` },
      { name: 'Samantha B.',      product: 'Pacagen', location: 'Dust Allergen Neutralizing Spray',        color: '#033a8a', story: `Never knew that relief could be this simple
Even existing in a home with dust is hard as someone with severe asthma and allergies. I bought this on a whim fully expecting nothing to change and have been floored at the results. My asthma is more manageable, my allergies are minimized to nearly nothing when cleaning. Shouting from the rooftops the greatness of this product!` },
{ name: 'Amanda',     product: 'Pacagen', location: 'Cat Allergen Neutralizing Spray',     color: '#023a90', photo:'https://cdn.shopify.com/s/files/1/0814/8369/4394/files/amandas_story_thumbnail.png?v=1773863886&width=1000&crop=center', video:'https://cdn.shopify.com/videos/c/o/v/99ba052a68af4859933b6ee1f3d9d217.mp4', ratio: '9/16', story: `Listen to Amanda's Pacagen Story.` },

      { name: 'Coralie L.',   product: 'RE:YOU',  location: 'RE:YOU Dual Path Hair Revival Serum',   photo:'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/Coralie_review.png?v=1785357231',      color: '#9a6a30', story: `I've tried a lot of hair thickening products over the past few years, so I wasn't expecting much from RE:YOU. I really like how it feels on my scalp, it absorbs quickly and doesn't leave any residue or make my hair greasy. After just a few weeks, I'm already noticing a difference around my temples, and I'm looking forward to seeing how it continues to work.` },
      { name: 'Cheyenne A.',    product: 'RE:YOU',  location: 'RE:YOU Dual Path Hair Revival Serum',  photo:'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/Cheyenne-Arnold_review.jpg?v=1785769766', color: '#6b3040', story: `I have naturally fine, thin hair, and I’ve always been insecure about wearing it down because I feel like so much of my part and scalp shows. I’ve tried supplements and other serums, but re:you has been incredible! Two months in, I’m feeling really confident and wearing my hair down so much more!` },
      { name: 'Patrick M.',  product: 'Pacagen', location: 'Philadelphia, PA',  color: '#04286a', story: 'I\'d been on antihistamines for 12 years. My ENT basically told me this was just my life. Pacagen was the first thing that actually changed the underlying reaction. I don\'t carry allergy meds anymore. That still feels surreal.' },
      { name: 'Jennifer B.', product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum', photo:'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/Jennifer_beattie.png?v=1784662522',     color: '#8c3050', story: `I was skeptical at first because I’ve tried so many hair products with little success. RE:YOU has been different. My hair looks noticeably thicker, my scalp feels healthier, and I’ve received several compliments on how full my hair looks lately.` },
      { name: 'Devin K',     product: 'Pacagen', location: 'Dust Allergen Neutralizing Spray',color: '#042268', photo: 'assets/images/stories/devin-cover.png', video:'/assets/images/stories/20260828_DUANS_Social_Video_UGC_DevinK.mov', story: 'Pacagen makes living with dust allergies livable.' },
      { name: 'Jacqueline W.',    product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum',      color: '#6a2a50', photo: 'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/Jacqueline-w-review.png?v=1785967863', story: `The Hair Revival Serum is lightweight and never leaves my hair feeling greasy or weighed down. I can apply it, style my hair, and go, which I love. It gives me a simple way to care for my hair without adding extra effort to my day. I also appreciate that it's unscented, non-hormonal, and drug-free.` }
    ],
    [
      { name: 'Jocelyn R.',    product: 'Pacagen', location: 'Cat Allergen Reducing Supplement',   color: '#063460', story: `My Husband isn't dead! 🥰
My husband is severely allergic to cats. And when we got our two beautiful fur babies a few months ago he was struggling. I did some searching online and found Pacagen. These supplements work as advertised and have been a key part on keeping everyone in our family comfortable.` },
{ name: 'Sara R.',   product: 'Pacagen', location: 'Cat Allergen Reducing Supplement',        color: '#1a4a8a', photo: 'assets/images/stories/sara_r.jpg', story: `Skeptic to believer!
  I have 3 cats and a husband who is allergic to cats. I saw a testimonial online and thought what do I have to lose? It started working with in a few days and my cats didn't seem to mind or notice it in their food. I accidentally skipped a few days and my husbands symptoms resumed. I am a believer now! I am looking forward to my inlaws coming to see if it helps them too.` },
PHOTO_TILES.reyou,
      { name: 'Katherine K.',    product: 'Pacagen', location: 'Cat Allergen Neutralizing Spray', photo:'/assets/images/stories/katherine_k.jpg', color: '#031e58', story: `This was revolutionary for my home
I have 2 cats and i had recently found out that I am allergic! I was not giving my babies up! So I purchased this and this was such a great decision!` },
      { name: 'Mike L.',     product: 'RE:YOU',  location: 'RE:YOU Dual-Path Hair Revival Serum',       color: '#6a4a20', photo: 'https://cdn.shopify.com/s/files/1/0807/8262/2943/files/deeba_dad.jpg?v=1785252099', story: `I started noticing my hair thinning around the crown and wasn’t sure anything would help at my age. A few months in with RE:YOU, my hair feels thicker and looks fuller than it has in years. Friends keep asking what I've been doing differently.` }
    ]
  ];

  function renderStoryTile(data, isDupe) {
    var productClass = data.product.toLowerCase().replace(':', '');
    var tabAttr      = isDupe ? ' tabindex="-1"' : '';
    var photoAttr    = data.photo ? ' data-photo="' + data.photo + '"' : '';
    var videoAttr    = data.video ? ' data-video="' + data.video + '"' : '';
    var ratioStyle   = data.ratio ? ' style="aspect-ratio:' + data.ratio + '"' : '';
    // For text-only tiles (no photo), extract a subject line to display on the tile.
    // Prefer a newline-delimited headline (e.g. "Adopting a second Kitty!\n..."),
    // then fall back to the first sentence, then the first 60 chars.
    var storyText    = data.story ? data.story.trim() : '';
    var firstNewline = storyText.indexOf('\n');
    var firstSentEnd = storyText.search(/[.!?]/);
    var subjectEnd   = firstNewline > 0 && (firstSentEnd < 0 || firstNewline <= firstSentEnd + 1)
                         ? firstNewline                  // newline headline wins when it comes first
                         : (firstSentEnd >= 0 ? firstSentEnd + 1 : 0);
    var subject      = subjectEnd > 0 ? storyText.slice(0, subjectEnd).trim() : storyText.slice(0, 60).trim();
    var imgHtml      = data.photo
      ? '<img class="story-tile-img story-tile-img--photo" src="' + data.photo + '" alt="" loading="lazy">'
      // Text tile: solid color background with subject line overlaid at the bottom
      : '<div class="story-tile-img story-tile-img--text" style="background-color:' + data.color + ';" aria-hidden="true">'
        + (subject ? '<span class="story-tile-subject">' + subject + '</span>' : '')
        + '</div>';
    var videoHtml    = data.video
      ? '<video class="story-tile-video" muted playsinline loop preload="none" src="' + data.video + '"'
        + (data.photo ? ' poster="' + data.photo + '"' : '') + '></video>'
      : '';
    return '<button class="story-tile" aria-label="Open story: ' + data.name + '"' + tabAttr + ratioStyle +
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
    var tabAttr    = isDupe ? ' tabindex="-1"' : '';
    var ratioStyle = cfg.ratio ? ' style="aspect-ratio:' + cfg.ratio + '"' : '';
    return '<div class="story-photo-tile"' + tabAttr + ratioStyle + '>' +
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
