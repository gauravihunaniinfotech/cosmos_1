/* COSMO'S homepage interactions — vanilla JS, no dependencies */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.remove('no-js');

  /* Upgrade local crops to the original full-resolution photos when online.
     Local files keep working offline; the swap only happens if the hi-res image loads. */
  $$('img[data-hires]').forEach(function (img) {
    var hi = new Image();
    hi.onload = function () { img.src = hi.src; };
    hi.src = img.dataset.hires; // silently ignored if blocked/offline
  });

  /* Scroll progress, sticky header shadow, scrollspy */
  var header = $('.header'), bar = $('.progress');
  var links = $$('.nav a[href^="#"]:not(.btn)');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY, h = d.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    var cur = 0;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mobile menu */
  var burger = $('.burger'), nav = $('#nav');
  function setNav(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setNav(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  window.matchMedia('(min-width:901px)').addEventListener('change', function () { setNav(false); });

  /* Smooth anchor scrolling (CSS handles offset) */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1), t = id ? d.getElementById(id) : root;
      if (!t) return;
      e.preventDefault();
      (id ? t : window).scrollTo ? window.scrollTo({ top: id ? t.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(root).getPropertyValue('--hdr')) || 78) : 0, behavior: reduce ? 'auto' : 'smooth' }) : 0;
      if (id) history.pushState(null, '', '#' + id);
    });
  });

  /* Reveal on scroll */
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('in'); }); }

  /* Animated counters */
  function count(el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end.toFixed(dec) + suf; return; }
    var t0 = null;
    (function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { count(x.target); cio.unobserve(x.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else { counters.forEach(count); }

  /* Parallax (transform only, rAF throttled) */
  var par = $$('.parallax');
  if (par.length && !reduce) {
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var s = parseFloat(el.dataset.speed) || 0.08;
        el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2 - vh / 2) * -s) | 0) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* Carousel arrows */
  var track = $('.track');
  if (track) {
    var step = function () { var li = $('li', track); return li ? li.getBoundingClientRect().width + 18 : 300; };
    $('.car-btn--prev').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    $('.car-btn--next').addEventListener('click', function () {
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step(), behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* Lightbox */
  var lb = $('#lightbox'), shots = $$('.shot'), idx = 0, lastFocus = null;
  if (lb && shots.length) {
    var lbImg = $('img', lb), lbCap = $('figcaption', lb);
    var show = function (n) {
      idx = (n + shots.length) % shots.length;
      var im = $('img', shots[idx]);
      lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = shots[idx].dataset.caption || im.alt;
    };
    var open = function (i) { lastFocus = d.activeElement; lb.hidden = false; show(i); $('.lb__x', lb).focus(); body.style.overflow = 'hidden'; };
    var close = function () { lb.hidden = true; body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    shots.forEach(function (s, i) { s.addEventListener('click', function () { open(i); }); });
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb__next', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'Tab') {
        var f = $$('button', lb), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
  }

  /* Contact form: validation + demo handling.
     To receive real leads, set data-endpoint="https://formspree.io/f/XXXX" on the <form>. */
  var form = $('#lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$('.field', form).forEach(function (f) {
        var i = $('input,select,textarea', f), v = (i.value || '').trim(), bad = false;
        if (i.required && !v) bad = true;
        if (i.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) bad = true;
        if (i.type === 'tel' && v && v.replace(/\D/g, '').length < 10) bad = true;
        f.classList.toggle('invalid', bad); i.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) { ok = false; if (!first) first = i; }
      });
      if (!ok) { first.focus(); return; }
      if ($('.hp input', form).value) return; // honeypot
      var data = {}; new FormData(form).forEach(function (v, k) { if (k !== 'website') data[k] = v; });
      data.sent = new Date().toISOString();
      var done = function () { form.hidden = true; var s = $('.success'); s.hidden = false; s.setAttribute('tabindex', '-1'); s.focus(); };
      var ep = form.dataset.endpoint;
      if (ep) {
        fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw 0; done(); })
          .catch(function () { alert('Sorry, something went wrong. Please call +1 (702) 960-5555.'); });
      } else {
        try { var q = JSON.parse(localStorage.getItem('cosmos-demo-leads') || '[]'); q.push(data); localStorage.setItem('cosmos-demo-leads', JSON.stringify(q)); } catch (x) { }
        done();
      }
    });
  }

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
