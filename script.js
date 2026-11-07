(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var subs = Array.prototype.slice.call(document.querySelectorAll('.has-sub'));

  function closeSubs(except) {
    subs.forEach(function (li) {
      if (li !== except) {
        li.classList.remove('open');
        li.querySelector('button').setAttribute('aria-expanded', 'false');
      }
    });
  }
  subs.forEach(function (li) {
    var btn = li.querySelector('button');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !li.classList.contains('open');
      closeSubs(li);
      li.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest && t.closest('.sub a, .nav a.top')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      closeSubs(null);
    } else if (!t.closest || !t.closest('.nav')) {
      closeSubs(null);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSubs(null);
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* Book showcase: eight covers, one after another. */
  (function () {
    var root = document.getElementById('showcase');
    if (!root) { return; }
    var books = Array.prototype.slice.call(root.querySelectorAll('.bk'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('.thumb'));
    var label = document.getElementById('gradeNow');
    var pp = document.getElementById('pp');
    var deck = document.getElementById('deck');
    var n = books.length, cur = 0, timer = null;
    var playing = true, inView = false, hovering = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { playing = false; }

    function render() {
      books.forEach(function (b, i) {
        var d = (i - cur + n) % n;
        var s = d === 0 ? 'active' : d === 1 ? 'n1' : d === 2 ? 'n2' : d === n - 1 ? 'prev' : 'far';
        b.setAttribute('data-s', s);
        b.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      thumbs.forEach(function (t, i) { t.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
      label.textContent = 'Book ' + (cur + 1);
      label.classList.remove('pop');
      void label.offsetWidth;
      label.classList.add('pop');
    }
    function syncButton() {
      pp.textContent = playing ? 'Pause' : 'Play';
      pp.setAttribute('aria-label', playing ? 'Pause the book slideshow' : 'Play the book slideshow');
    }
    function schedule() {
      clearTimeout(timer);
      if (!playing || !inView || hovering || document.hidden) { return; }
      timer = setTimeout(function () { go(cur + 1); }, 3400);
    }
    function go(i) { cur = (i + n) % n; render(); schedule(); }
    function userPick(i) { playing = false; syncButton(); go(i); }

    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { userPick(parseInt(t.getAttribute('data-i'), 10)); });
    });
    pp.addEventListener('click', function () { playing = !playing; syncButton(); schedule(); });
    root.addEventListener('mouseenter', function () { hovering = true; clearTimeout(timer); });
    root.addEventListener('mouseleave', function () { hovering = false; schedule(); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { userPick(cur + 1); } else if (e.key === 'ArrowLeft') { userPick(cur - 1); }
    });
    var x0 = null;
    deck.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { userPick(cur + (dx < 0 ? 1 : -1)); }
    }, { passive: true });
    document.addEventListener('visibilitychange', schedule);

    syncButton();
    if ('IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView && !seen) { seen = true; if (!reduce) { root.classList.add('intro'); } }
        schedule();
      }, { threshold: 0.3 }).observe(root);
    } else { inView = true; schedule(); }
  })();

  /* Hero video: hide the player and its button if the file is missing; offer pause/play. */
  var hero = document.getElementById('videoHero');
  var vid = document.getElementById('heroVideo');
  var ctl = document.getElementById('vctl');
  if (vid && hero && ctl) {
    var source = vid.querySelector('source');
    var noVideo = function () { hero.classList.add('no-video'); vid.hidden = true; };
    if (source) { source.addEventListener('error', noVideo); }
    vid.addEventListener('error', noVideo);
    var sync = function () {
      ctl.classList.toggle('paused', vid.paused);
      ctl.setAttribute('aria-label', vid.paused ? 'Play background video' : 'Pause background video');
    };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); }
    ctl.addEventListener('click', function () {
      if (vid.paused) { var p = vid.play(); if (p && p.catch) { p.catch(function () {}); } } else { vid.pause(); }
    });
    vid.addEventListener('play', sync);
    vid.addEventListener('pause', sync);
    var check = function () { if (vid.error || vid.networkState === 3) { noVideo(); } };
    check();
    window.addEventListener('load', check);
    setTimeout(check, 1500);
    sync();
  }
})();