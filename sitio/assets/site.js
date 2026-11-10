(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Cabecera y menú ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('solid', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var drawer = $('.drawer'), openBtn = $('.menu-btn'), closeBtn = $('.drawer-close');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
  }
  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });
  $$('.drawer a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---------- Aparición al desplazar (solo lo que queda bajo el pliegue) ---------- */
  var pending = $$('.reveal');
  function reveal() {
    var lim = window.innerHeight * 0.92;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < lim) { el.classList.add('in'); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener('scroll', reveal); window.removeEventListener('resize', reveal); }
  }
  if (reduce) { pending.forEach(function (el) { el.classList.add('in'); }); pending = []; }
  else { reveal(); window.addEventListener('scroll', reveal, { passive: true }); window.addEventListener('resize', reveal); }

  /* ---------- Teléfono del héroe: el código se escribe solo ---------- */
  var scr = $('.screen[data-demo]');
  if (scr) {
    var boxes = $$('.code-boxes i', scr), digits = ['4', '8', '2', '1'], timers = [];
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    var clearAll = function () { timers.forEach(clearTimeout); timers = []; };
    var cycle = function () {
      clearAll();
      scr.classList.remove('show-sheet', 'done');
      boxes.forEach(function (b) { b.textContent = ''; b.classList.remove('fill'); });
      later(function () { scr.classList.add('show-sheet'); }, 1500);
      digits.forEach(function (d, i) { later(function () { boxes[i].textContent = d; boxes[i].classList.add('fill'); }, 2700 + i * 520); });
      later(function () { scr.classList.add('done'); $('.release', scr).textContent = '✓ Pago liberado'; }, 2700 + 4 * 520 + 500);
      later(function () { $('.release', scr).textContent = 'Liberar pago'; cycle(); }, 2700 + 4 * 520 + 3800);
    };
    if (reduce) {
      scr.classList.add('show-sheet', 'done');
      boxes.forEach(function (b, i) { b.textContent = digits[i]; b.classList.add('fill'); });
      $('.release', scr).textContent = '✓ Pago liberado';
    } else cycle();
  }

  /* ---------- Teclado del código de cierre ---------- */
  var pad = $('#pad');
  if (pad) {
    var cells = $$('.pad-display i', pad), status = $('.pad-status', pad), value = '', CODE = '4821';
    var msg = 'Escribe el código de 4 dígitos que te da el técnico.';
    var draw = function () { cells.forEach(function (c, i) { c.textContent = value[i] || ''; c.classList.toggle('fill', i < value.length); }); };
    var reset = function () { value = ''; pad.classList.remove('ok', 'err'); status.textContent = msg; draw(); };
    var check = function () {
      if (value === CODE) { pad.classList.add('ok'); pad.classList.remove('err'); status.textContent = ''; return; }
      pad.classList.add('err'); status.textContent = 'Ese código no coincide. Prueba con 4 · 8 · 2 · 1.';
      setTimeout(function () { value = ''; pad.classList.remove('err'); draw(); }, 900);
    };
    $$('.keys button', pad).forEach(function (b) {
      b.addEventListener('click', function () {
        if (pad.classList.contains('ok') || pad.classList.contains('err')) return;
        var k = b.dataset.k;
        if (k === 'del') value = value.slice(0, -1);
        else if (k === 'auto') { value = CODE; }
        else if (value.length < 4) value += k;
        draw(); status.textContent = msg;
        if (value.length === 4) setTimeout(check, 220);
      });
    });
    var again = $('[data-again]', pad); if (again) again.addEventListener('click', reset);
    reset();
  }

  /* ---------- Conversor con la tasa BCV en vivo ---------- */
  var cvUsd = $('#cv-usd'), bsEls = $$('[data-bs-of]'), pillEls = $$('[data-bcv]');
  if (cvUsd || bsEls.length || pillEls.length) {
    var cvBs = $('#cv-bs'), cvRate = $('#cv-rate'), rate = 888.89, live = false;
    var fmt = function (n, d) { var s = (Math.round(n * 100) / 100).toFixed(2).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return d === 0 ? s[0] : s[0] + ',' + s[1]; };
    var paint = function () {
      if (cvUsd) { var v = parseFloat(String(cvUsd.value).replace(',', '.')); cvBs.textContent = 'Bs. ' + (isNaN(v) ? '0,00' : fmt(v * rate)); cvRate.textContent = (live ? 'Tasa oficial BCV: ' : 'Tasa de referencia: ') + 'Bs. ' + fmt(rate); }
      bsEls.forEach(function (el) { el.textContent = '≈ Bs. ' + fmt(Number(el.dataset.bsOf) * rate, 0); });
      pillEls.forEach(function (el) { el.textContent = 'BCV Bs. ' + fmt(rate); });
    };
    if (cvUsd) cvUsd.addEventListener('input', paint);
    paint();
    try {
      fetch('https://ve.dolarapi.com/v1/dolares/oficial').then(function (r) { return r.json(); }).then(function (j) {
        var v = Number(j.promedio); if (v > 0) { rate = v; live = true; paint(); }
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- Pestañas (descarga) ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var show = function (t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t); }); });
    var ua = navigator.userAgent || '', pick = /android/i.test(ua) ? 'android' : /iphone|ipad|ipod/i.test(ua) ? 'iphone' : null;
    var first = (pick && tabs.filter(function (t) { return t.dataset.os === pick; })[0]) || tabs[0];
    if (first) show(first);
  });

  /* ---------- Código QR con la dirección de la app ---------- */
  var qrs = $$('[data-qr]');
  if (qrs.length && window.qrcode) {
    var appUrl = new URL('../', location.href).href;
    qrs.forEach(function (box) {
      try {
        var q = window.qrcode(0, 'M'); q.addData(appUrl); q.make();
        var n = q.getModuleCount(), d = '';
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
        box.innerHTML = '<svg viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img" aria-label="Código QR para abrir Fixer"><path d="' + d + '" fill="#0c2744"/></svg>';
      } catch (e) {}
    });
    $$('[data-app-url]').forEach(function (el) { el.textContent = appUrl.replace(/^https?:\/\//, ''); });
  }

  /* ---------- Formulario de contacto (se guarda en Firebase) ---------- */
  var form = $('#contact-form');
  if (form) {
    var out = $('.form-msg', form), btn = $('button[type=submit]', form), db = null;
    var cfg = window.FIREBASE_CONFIG;
    if (window.firebase && cfg && cfg.apiKey && cfg.apiKey.indexOf('TU_') !== 0) {
      try { firebase.initializeApp(cfg); db = firebase.firestore(); } catch (e) { db = null; }
    }
    var say = function (cls, t) { out.hidden = false; out.className = 'form-msg ' + cls; out.textContent = t; };
    var msgArea = $('textarea', form), count = $('.hint', form);
    msgArea.addEventListener('input', function () { count.textContent = msgArea.value.length + ' / 1000'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form);
      if (f.get('empresa')) return; /* campo trampa para robots */
      var nombre = String(f.get('nombre') || '').trim(), correo = String(f.get('correo') || '').trim(), tema = String(f.get('tema') || ''), mensaje = String(f.get('mensaje') || '').trim();
      if (!nombre || !/^\S+@\S+\.\S+$/.test(correo) || mensaje.length < 10) return say('err', 'Revisa tu nombre, tu correo y escribe un mensaje de al menos 10 caracteres.');
      var last = 0; try { last = Number(localStorage.getItem('fixer_contacto_ts') || 0); } catch (x) {}
      if (Date.now() - last < 45000) return say('err', 'Acabas de enviar un mensaje. Espera unos segundos antes de enviar otro.');
      if (!db) return say('err', 'No pudimos enviar el mensaje en este momento. Escríbenos desde el chat de soporte dentro de la app.');
      btn.disabled = true; btn.textContent = 'Enviando…';
      db.collection('contactos').add({ nombre: nombre.slice(0, 80), correo: correo.slice(0, 120), tema: tema, mensaje: mensaje.slice(0, 1000), ts: Date.now() }).then(function () {
        try { localStorage.setItem('fixer_contacto_ts', String(Date.now())); } catch (x) {}
        form.reset(); count.textContent = '0 / 1000'; say('ok', '¡Mensaje enviado! Gracias por escribirnos: te responderemos al correo que dejaste.');
      }).catch(function () {
        say('err', 'No pudimos enviar el mensaje. Inténtalo de nuevo en unos minutos.');
      }).then(function () { btn.disabled = false; btn.textContent = 'Enviar mensaje'; });
    });
  }

  /* ---------- Canales de contacto opcionales ---------- */
  var site = window.FIXER_SITE || {}, box = $('#channels');
  if (box) {
    var items = [];
    if (site.whatsapp) items.push(['https://wa.me/' + site.whatsapp.replace(/\D/g, ''), 'WhatsApp', site.whatsappLabel || 'Escríbenos por WhatsApp', 'phone']);
    if (site.email) items.push(['mailto:' + site.email, 'Correo', site.email, 'mail']);
    if (site.instagram) items.push(['https://instagram.com/' + site.instagram.replace(/^@/, ''), 'Instagram', '@' + site.instagram.replace(/^@/, ''), 'camera']);
    items.forEach(function (it) {
      var a = document.createElement('a'); a.className = 'channel'; a.href = it[0]; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = '<span class="ico">' + (window.FIXER_ICONS[it[3]] || '') + '</span><div><b>' + it[1] + '</b><span>' + it[2] + '</span></div>';
      box.appendChild(a);
    });
    if (!items.length) box.hidden = true;
  }

  /* ---------- Textos legales ---------- */
  var legal = $('#legal-doc');
  if (legal && window.FIXER_LEGAL) {
    var L = window.FIXER_LEGAL, cfgL = L.cfg, esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var fx = function (t) { return esc(t).replace(/\{(\w+)\}/g, function (m, k) { return '<span class="ph">' + esc(cfgL[k] || m) + '</span>'; }); };
    var render = function (key) {
      var d = L.docs[key];
      legal.innerHTML = '<h2>' + d.t + '</h2><p class="ver">Versión del ' + L.version + '</p><div class="aviso">' + fx(d.aviso) + '</div>' +
        d.s.map(function (s, i) { return '<h3>' + (i + 1) + '. ' + s[0] + '</h3>' + s[1].map(function (p) { return p.charAt(0) === '-' ? '<p class="li">' + fx(p.slice(2)) + '</p>' : '<p>' + fx(p) + '</p>'; }).join(''); }).join('');
    };
    var tabs2 = $$('.legal-nav button');
    var go = function (key) { tabs2.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.doc === key)); }); render(key); };
    tabs2.forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.doc); history.replaceState(null, '', '#' + b.dataset.doc); }); });
    go(location.hash === '#priv' ? 'priv' : 'terms');
  }

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
