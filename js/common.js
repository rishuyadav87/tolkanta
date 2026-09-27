/* =========================================================================
   Shared helpers, header/footer, sidebar, icons, speech, photos, GPS
   ========================================================================= */
(function () {
  'use strict';
  var TK = (window.TK = window.TK || {});

  /* ---------------- tiny helpers ---------------- */
  TK.$ = function (sel, root) { return (root || document).querySelector(sel); };
  TK.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  TK.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  TK.inr = function (n) { return '₹' + Math.round(Math.abs(Number(n) || 0)).toLocaleString('en-IN'); };
  TK.qty = function (n, unit) { return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' ' + (unit === 'pc' ? 'pc' : 'kg'); };
  TK.time = function (iso) { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }); };
  TK.date = function (iso) { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }); };
  TK.dateTime = function (iso) { return iso ? TK.date(iso) + ' · ' + TK.time(iso) : ''; };
  TK.slot = function (s) { var p = String(s || '').split('|'); return { en: p[0], hi: p[1] || p[0] }; };
  TK.param = function (k) { return new URLSearchParams(location.search).get(k); };
  TK.status = {
    booked: ['पिकअप बुक', 'Booked', 'pill-navy'], awaiting_confirmation: ['पुष्टि बाकी', 'Awaiting recycler', 'pill-orange'],
    confirmed: ['पुष्टि हो गई', 'Confirmed', 'pill-green'], disputed: ['वज़न में अंतर', 'Weight dispute', 'pill-red'], cancelled: ['रद्द', 'Cancelled', 'pill-grey'],
  };
  TK.statusPill = function (s, en) { var x = TK.status[s] || [s, s, 'pill-grey']; return '<span class="pill ' + x[2] + '">' + (en ? x[1] : x[0]) + '</span>'; };

  /* ---------------- language: English / हिंदी / both ---------------- */
  // Labels are written as "हिंदी · English". The switch shows one side (or both) so pages are not cluttered.
  var UI_KEY = 'tk_ui_lang';
  TK.uiLang = function () { try { var l = localStorage.getItem(UI_KEY); return (l === 'hi') ? 'hi' : 'en'; } catch (e) { return 'en'; } };
  document.documentElement.setAttribute('data-ui', TK.uiLang());
  
  /* ---------------- theme toggle ---------------- */
  TK.toggleTheme = function(btn) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('tk_theme', newTheme); } catch(e) {}
  };
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('tk_theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  TK.themeBtn = function() {
    return '<button class="theme-toggle" type="button" aria-label="Toggle dark mode" onclick="TK.toggleTheme(this)">' +
           '<svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>' +
           '<svg class="moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' +
           '</button>';
  };

    var DEV = /[\u0900-\u097F]/g, LAT = /[A-Za-z]/g;
  var count = function (s, re) { return (s.match(re) || []).length; };
  function splitNode(t) {
    var v = t.nodeValue, i = v.indexOf(' · '); if (i < 1) return;
    var L = v.slice(0, i), R = v.slice(i + 3);
    var lDev = count(L, DEV), lLat = count(L, LAT), rDev = count(R, DEV), rLat = count(R, LAT);
    var hiFirst = lDev >= 2 && lDev > lLat && rDev === 0 && rLat > 0, enFirst = lDev === 0 && lLat > 0 && rDev >= 2 && rDev > rLat;
    if (!hiFirst && !enFirst) return;
    var f = document.createDocumentFragment(), mk = function (cls, txt) { var sp = document.createElement('span'); sp.className = cls; sp.textContent = txt; f.appendChild(sp); };
    mk(hiFirst ? 'tk-hi' : 'tk-en', L); mk('tk-sep', ' · '); mk(hiFirst ? 'tk-en' : 'tk-hi', R);
    t.parentNode.replaceChild(f, t);
  }
  function splitIn(root) {
    if (!root || root.nodeType !== 1 && root.nodeType !== 3) return;
    if (root.nodeType === 3) { var p = root.parentNode; if (p && !skip(p)) splitNode(root); return; }
    if (skip(root)) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.nodeValue.indexOf(' · ') > 0 && !skip(n.parentNode) ? 1 : 3; } }), list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(splitNode);
  }
  function skip(el) { return !el || !el.closest || !!el.closest('script,style,textarea,input,option,select,#tkGuide,.tk-hi,.tk-en,[data-nosplit],title'); }
  TK.splitLang = splitIn;
  if (document.body) {
    splitIn(document.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, splitIn); if (m.type === 'characterData') splitIn(m.target); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  TK.langSwitch = function (dark) {
    return '<div class="lang-switch' + (dark ? ' dark' : '') + '" role="group" aria-label="Language">' + [['en', 'English'], ['hi', 'हिंदी']].map(function (x) { return '<button type="button" data-ui="' + x[0] + '" aria-pressed="' + (TK.uiLang() === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
  };
  TK.wireLangSwitch = function (root) {
    TK.$$('.lang-switch', root).forEach(function (g) {
      g.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ui]'); if (!b) return;
        try { localStorage.setItem(UI_KEY, b.dataset.ui); if (b.dataset.ui !== 'both') localStorage.setItem('tk_guide_lang', b.dataset.ui); } catch (x) { /* ignore */ }
        document.documentElement.setAttribute('data-ui', b.dataset.ui);
        TK.$$('.lang-switch [data-ui]').forEach(function (o) { o.setAttribute('aria-pressed', o.dataset.ui === b.dataset.ui); });
      });
    });
  };

  /* ---------------- icons (inline SVG) ---------------- */
  var P = {
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    speaker: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    up: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    down: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M5 18H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h11v13"/><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M9 18h6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chev: '<polyline points="9 18 15 12 9 6"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  };
  TK.icon = function (n, cls) { return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || '') + '</svg>'; };

  /* ---------------- toast ---------------- */
  TK.toast = function (msg, err) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show' + (err ? ' err' : '');
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = ''; }, 3200);
  };
  // Run a data call and show a readable message on error
  TK.try = function (fn, box) {
    try { return fn(); }
    catch (e) {
      if (e.status === 401) { location.href = TK.root + 'login.html?next=' + encodeURIComponent((/\/portal\//.test(location.pathname) ? 'portal/' : '') + location.pathname.split('/').pop() + location.search); return undefined; }
      if (box) { box.innerHTML = '<div class="alert alert-error" role="alert">' + TK.icon('alert') + '<span>' + TK.esc(e.message) + '</span></div>'; }
      else TK.toast(e.message, true);
      return undefined;
    }
  };

  /* ---------------- speech (Hindi) ---------------- */
  TK.canSpeak = 'speechSynthesis' in window;
  TK.speak = function (text) {
    if (!TK.canSpeak || !text) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = 'hi-IN'; u.rate = 0.95;
    var v = speechSynthesis.getVoices().find(function (x) { return /^hi/.test(x.lang); }); if (v) u.voice = v;
    speechSynthesis.speak(u);
  };
  TK.listenBtn = function (id, light) { return TK.canSpeak ? '<button type="button" class="listen' + (light ? ' light' : '') + '" id="' + id + '">' + TK.icon('speaker') + ' सुनें · Listen</button>' : ''; };

  // Speak the weight (Chrome / Edge)
  var NUM = { 'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10, 'ग्यारह': 11, 'बारह': 12, 'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'सौ': 100, 'आधा': 0.5, 'डेढ़': 1.5, 'ढाई': 2.5, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10 };
  TK.parseNumber = function (text) {
    var t = String(text || '').toLowerCase().replace(/,/g, '.'), d = /(\d+(?:\.\d+)?)/.exec(t);
    if (d) return Number(d[1]);
    var whole = null, frac = '', after = false;
    t.split(/\s+/).forEach(function (w) { if (/^(पॉइंट|प्वाइंट|point|दशमलव)$/.test(w)) after = true; else if (w in NUM) { if (after) frac += String(NUM[w]); else whole = (whole || 0) + NUM[w]; } });
    return whole === null && !frac ? null : Number((whole || 0) + (frac ? '.' + frac : ''));
  };
  TK.canHear = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  TK.hearNumber = function (cb) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return cb(new Error('Voice input needs Chrome or Edge'));
    var r = new SR(), done = false; r.lang = 'hi-IN'; r.maxAlternatives = 3;
    r.onresult = function (e) { done = true; var alts = Array.prototype.map.call(e.results[0], function (a) { return a.transcript; });
      for (var i = 0; i < alts.length; i++) { var n = TK.parseNumber(alts[i]); if (n) return cb(null, n, alts[i]); } cb(new Error('सुना: "' + alts[0] + '", संख्या समझ नहीं आई')); };
    r.onerror = function () { done = true; cb(new Error('आवाज़ साफ़ नहीं सुनाई दी। फिर से बोलें।')); };
    r.onend = function () { if (!done) cb(new Error('कुछ सुनाई नहीं दिया।')); };
    r.start();
  };

  /* ---------------- photos + GPS ---------------- */
  TK.perceptualHash = function (imgElement, callback) {
    var c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    var ctx = c.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, 8, 8);
    var data = ctx.getImageData(0, 0, 8, 8).data;
    var gray = [], sum = 0;
    for (var i = 0; i < data.length; i += 4) {
      var g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      gray.push(g);
      sum += g;
    }
    var avg = sum / 64;
    var hash = '';
    for (var i = 0; i < 64; i++) {
      hash += (gray[i] >= avg) ? '1' : '0';
    }
    callback(hash);
  };
  TK.isDuplicatePhoto = function (hash) {
    var db = JSON.parse(localStorage.getItem('tolkanta_db_v3') || '{}');
    var hashes = db.photoHashes || [];
    for (var i = 0; i < hashes.length; i++) {
      var diff = 0;
      for (var j = 0; j < 64; j++) {
        if (hash[j] !== hashes[i][j]) diff++;
      }
      if (diff < 5) return true;
    }
    return false;
  };
  TK.checkPhotoFreshness = function (file, callback) {
    var hasExif = false, fresh = false, warning = 'No EXIF data found.';
    var r = new FileReader();
    r.onload = function (e) {
      var buf = e.target.result;
      var view = new DataView(buf);
      if (view.byteLength < 2 || view.getUint16(0, false) !== 0xFFD8) {
        return callback({ fresh: false, hasExif: false, warning: 'Not a JPEG, cannot verify timestamp.' });
      }
      var offset = 2, length = view.byteLength, exifStr = null;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        if (marker === 0xFFE1) {
          if (offset + 4 < length && view.getUint32(offset + 4, false) === 0x45786966) { // "Exif"
            hasExif = true;
            var tiffOffset = offset + 10;
            var littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
            var ifd0Offset = view.getUint32(tiffOffset + 4, littleEndian);
            var exifIfdOffset = null;
            var numEntries = view.getUint16(tiffOffset + ifd0Offset, littleEndian);
            for (var i = 0; i < numEntries; i++) {
              var tag = view.getUint16(tiffOffset + ifd0Offset + 2 + i * 12, littleEndian);
              if (tag === 0x8769) {
                exifIfdOffset = view.getUint32(tiffOffset + ifd0Offset + 2 + i * 12 + 8, littleEndian);
                break;
              }
            }
            if (exifIfdOffset) {
              var numExif = view.getUint16(tiffOffset + exifIfdOffset, littleEndian);
              for (var j = 0; j < numExif; j++) {
                var tag2 = view.getUint16(tiffOffset + exifIfdOffset + 2 + j * 12, littleEndian);
                if (tag2 === 0x9003 || tag2 === 0x9004) {
                  var count = view.getUint32(tiffOffset + exifIfdOffset + 2 + j * 12 + 4, littleEndian);
                  var valOffset = view.getUint32(tiffOffset + exifIfdOffset + 2 + j * 12 + 8, littleEndian);
                  var str = '';
                  for (var k = 0; k < count - 1; k++) str += String.fromCharCode(view.getUint8(tiffOffset + valOffset + k));
                  exifStr = str;
                  break;
                }
              }
            }
          }
          break;
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        }
        offset += view.getUint16(offset + 2, false) + 2;
      }
      if (exifStr) {
        var p = exifStr.split(/[: ]/);
        var d = new Date(p[0], p[1] - 1, p[2], p[3], p[4], p[5]);
        var ageMs = Date.now() - d.getTime();
        if (ageMs > 30 * 60 * 1000 || ageMs < -60000) {
          warning = 'Photo is older than 30 minutes.';
        } else {
          fresh = true;
          warning = null;
        }
      } else if (hasExif) {
        warning = 'EXIF data found but no timestamp.';
      }
      callback({ fresh: fresh, hasExif: hasExif, warning: warning });
    };
    r.readAsArrayBuffer(file);
  };
  TK.readPhoto = function (file, cb) {
    if (!file || !/^image\//.test(file.type)) return cb(new Error('Please choose a photo (JPG or PNG)'));
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      cb(null, c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = function () { cb(new Error('Could not read this photo. Try another one')); };
    img.src = url;
  };
  TK.gps = function (cb) {
    if (!navigator.geolocation) return cb(null);
    var done = false, t = setTimeout(function () { if (!done) { done = true; cb(null); } }, 8500);
    navigator.geolocation.getCurrentPosition(function (p) { if (done) return; done = true; clearTimeout(t); cb({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, source: 'device' }); },
      function () { if (done) return; done = true; clearTimeout(t); cb(null); }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
  };
  TK.downloadText = function (text, name) {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  };

  /* ---------------- layout: public pages ---------------- */
  var script = document.currentScript;
  TK.root = (script && script.getAttribute('data-root')) || '';
  var brand = function (dark) {
    return '<a class="brand" href="' + TK.root + 'index.html"><span class="brand-mark">' + TK.icon('scale') + '</span><span class="brand-name">TolKanta<small>' + (dark ? 'तोलकांटा' : 'Team Tenet · SIH 2026') + '</small></span></a>';
  };
  var NAV = [['how-it-works.html', 'यह कैसे काम करता है · How it works'], ['impact.html', 'प्रभाव · Impact'], ['verify.html', 'सत्यापन करें · Verify'], ['guide.html', 'मदद · Help']];
  var MORE = [['ivr.html', 'IVR हेल्पलाइन डेमो · IVR helpline demo'], ['whatsapp.html', 'WhatsApp बॉट डेमो · WhatsApp bot demo'], ['architecture.html', 'आर्किटेक्चर · Architecture'], ['privacy.html', 'गोपनीयता · Privacy'], ['about.html', 'टीम के बारे में · About the team'], ['index.html', 'होम · Home']];
  TK.publicLayout = function (active) {
    var u = TK.api.me();
    var dash = u ? (u.role === 'recycler' ? 'portal/buyer.html' : u.role === 'admin' ? 'portal/admin.html' : 'portal/dashboard.html') : null;
    var header = document.createElement('header'); header.className = 'nav';
    header.innerHTML = '<div class="container">' + brand() +
      '<button class="nav-toggle" aria-label="Menu" aria-expanded="false">' + TK.icon('menu') + '</button>' +
      '<nav class="nav-links" aria-label="Main">' + NAV.map(function (n) { return '<a href="' + TK.root + n[0] + '"' + (n[0] === active ? ' class="active" aria-current="page"' : '') + '>' + n[1] + '</a>'; }).join('') +
      '<div class="nav-more"><button type="button" class="nav-more-btn' + (MORE.some(function (m) { return m[0] === active; }) ? ' active' : '') + '" aria-expanded="false"><span class="tk-hi">और</span><span class="tk-en" style="display:none"></span><span class="tk-sep" style="display:none"></span><span class="tk-en">More</span> ' + TK.icon('chev', 'rot') + '</button><div class="nav-menu">' + MORE.map(function (n) { return '<a href="' + TK.root + n[0] + '"' + (n[0] === active ? ' class="active" aria-current="page"' : '') + '>' + n[1] + '</a>'; }).join('') + '</div></div>' +
      TK.langSwitch() + TK.themeBtn() +
      (dash ? '<a class="btn btn-primary btn-sm nav-cta" href="' + TK.root + dash + '">मेरा डैशबोर्ड · My dashboard</a>' : '<a class="btn btn-primary btn-sm nav-cta" href="' + TK.root + 'login.html">लॉग इन · Log in</a>') + '</nav></div>';
    document.body.insertBefore(header, document.body.firstChild);
    var tog = header.querySelector('.nav-toggle'), links = header.querySelector('.nav-links');
    tog.addEventListener('click', function () { var o = links.classList.toggle('open'); tog.setAttribute('aria-expanded', o); });
    var more = header.querySelector('.nav-more'), mb = more.querySelector('.nav-more-btn');
    mb.addEventListener('click', function (e) { e.stopPropagation(); var o = more.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function (e) { if (!more.contains(e.target)) { more.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
    TK.wireLangSwitch(header);

    var footer = document.createElement('footer'); footer.className = 'footer';
    footer.innerHTML = '<div class="container"><div class="cols">' +
      '<div>' + brand(true).replace('class="brand"', 'class="brand" style="color:#fff"') + '<p style="margin-top:14px">सही तौल, सही दाम · Fair prices and verified records for India\'s informal e-waste chain.</p></div>' +
      '<div><h4>वेबसाइट · Website</h4><ul><li><a href="' + TK.root + 'how-it-works.html">यह कैसे काम करता है · How it works</a></li><li><a href="' + TK.root + 'impact.html">लाइव प्रभाव · Live impact</a></li><li><a href="' + TK.root + 'verify.html">सत्यापन करें · Verify a record</a></li><li><a href="' + TK.root + 'about.html">टीम के बारे में · About the team</a></li><li><a href="' + TK.root + 'guide.html">मदद · Help centre</a></li></ul></div>' +
      '<div><h4>लॉग इन · Log in</h4><ul><li><a href="' + TK.root + 'login.html?as=seller">विक्रेता (कबाड़ीवाला) · Seller login</a></li><li><a href="' + TK.root + 'login.html?as=buyer">खरीदार (रिसाइकलर) · Buyer login</a></li><li><a href="' + TK.root + 'login.html?as=admin">अधिकारी (ULB) · Officer login</a></li></ul></div>' +
      '<div><h4>चैनल · Channels</h4><ul><li><a href="' + TK.root + 'ivr.html">IVR हेल्पलाइन डेमो · IVR helpline demo</a></li><li><a href="' + TK.root + 'whatsapp.html">WhatsApp बॉट डेमो · WhatsApp bot demo</a></li><li><button id="resetDemo" class="btn btn-light btn-sm" type="button">डेमो डेटा रीसेट करें · Reset demo data</button></li></ul></div>' +
      '</div><div class="legal"><span>© 2026 स्मार्ट इंडिया हैकथॉन 2026 (टीम टेनेट)। यह कोई आधिकारिक सरकारी वेबसाइट नहीं है। · © 2026 Team Tenet. SIH 2026 prototype. Not an official Government of India website.</span><span>सभी नाम, दाम और आईडी डेमो डेटा हैं। · All names, prices and IDs are demo data.</span></div></div>';
    document.body.appendChild(footer);
    footer.querySelector('#resetDemo').addEventListener('click', function () { TK.api.resetDemo(); TK.toast('Demo data reset'); setTimeout(function () { location.href = TK.root + 'index.html'; }, 600); });
  };

  /* ---------------- layout: portal pages ---------------- */
  var SIDE = {
    kabadiwala: [['dashboard.html', 'home', 'Dashboard', 'होम'], ['sell.html', 'camera', 'Sell scrap', 'फोटो लें'], ['pickups.html', 'truck', 'Pickups', 'पिकअप'], ['sales.html', 'up', 'My sales', 'बिक्री'], ['buyers.html', 'factory', 'Buyers & rates', 'खरीदार'], ['ledger.html', 'book', 'Ledger', 'खाता'], ['passport.html', 'qr', 'Earnings Passport', 'पासपोर्ट'], ['notifications.html', 'bell', 'Notifications', 'सूचना'], ['profile.html', 'user', 'Profile', 'मैं']],
    recycler: [['buyer.html', 'chart', 'Buyer dashboard', 'खरीदार'], ['recycler.html', 'truck', 'Pickups & weighing', 'पिकअप'], ['buyer-market.html', 'search', 'Scrap available', 'बाज़ार'], ['buyer-purchases.html', 'list', 'Purchases · kg bought', 'खरीद'], ['notifications.html', 'bell', 'Notifications', 'सूचना'], ['buyer-profile.html', 'building', 'Profile & alerts', '']],
    admin: [['admin.html', 'chart', 'Control room', ''], ['notifications.html', 'bell', 'Notifications', '']],
  };
  // Portal pages stop their script with this marker while the browser redirects; keep it out of the console
  window.addEventListener('error', function (e) { if (e.message && e.message.indexOf('tk-redirect') >= 0) e.preventDefault(); });
  TK.portalLayout = function (role, active, title, sub) {
    var u = TK.api.me();
    if (!u) { location.href = '../login.html?next=' + encodeURIComponent('portal/' + location.pathname.split('/').pop() + location.search); document.documentElement.style.visibility = 'hidden'; throw new Error('tk-redirect'); }
    if (role && u.role !== role) { location.href = u.role === 'recycler' ? 'buyer.html' : u.role === 'admin' ? 'admin.html' : 'dashboard.html'; document.documentElement.style.visibility = 'hidden'; throw new Error('tk-redirect'); }
    document.body.classList.add('portal');
    var main = document.getElementById('main');
    var wrap = document.createElement('div'); wrap.className = 'portal-wrap';
    var roleLabel = { kabadiwala: 'Seller · Kabadiwala', recycler: 'Buyer · Authorised recycler', admin: 'ULB / Brand / Admin' }[u.role];
    wrap.innerHTML = '<aside class="sidebar" id="sidebar">' + brand(true) + TK.themeBtn() +
      '<div class="who"><b>' + TK.esc(u.name || 'New user') + '</b>' + roleLabel + ' · +91 ' + TK.esc(u.phone) + '</div>' + TK.langSwitch(true) +
      SIDE[u.role].map(function (s) { return '<a class="side-link' + (s[0] === active ? ' active' : '') + '" href="' + s[0] + '">' + TK.icon(s[1]) + s[2] + (s[3] ? '<small>' + s[3] + '</small>' : '') + '</a>'; }).join('') +
      '<div class="side-sep"></div>' +
      '<a class="side-link" href="../verify.html">' + TK.icon('shield') + 'Verify a record</a>' +
      '<a class="side-link" href="../guide.html">' + TK.icon('book') + 'Help centre<small>मदद</small></a>' +
      '<a class="side-link" href="../index.html">' + TK.icon('globe') + 'Website home</a>' +
      '<div class="grow"></div><button class="side-link" id="logout" style="background:none;border:0;cursor:pointer;width:100%">' + TK.icon('logout') + 'Log out</button></aside>' +
      '<div><div class="mobile-bar"><button id="openSide" aria-label="Menu">' + TK.icon('menu') + '</button>' + brand() + '</div>' +
      '<div class="main"><div class="main-head"><div><h1>' + title + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div><div class="row"><div class="row" id="headRight"></div><div class="bell-wrap" id="bellWrap"></div></div></div></div></div>';
    main.parentNode.insertBefore(wrap, main);
    wrap.querySelector('.main').appendChild(main);
    wrap.querySelector('#logout').addEventListener('click', function () { TK.api.logout(); location.href = '../index.html'; });
    var sb = wrap.querySelector('#sidebar');
    wrap.querySelector('#openSide').addEventListener('click', function (e) { e.stopPropagation(); sb.classList.add('open'); });
    document.addEventListener('click', function (e) { if (sb.classList.contains('open') && !sb.contains(e.target)) sb.classList.remove('open'); });
    TK.wireLangSwitch(wrap);
    TK.bell(wrap.querySelector('#bellWrap'), u);
    return u;
  };

  /* ---------------- notifications: bell + live alerts ---------------- */
  var N_ICON = { rate: 'up', lot: 'search', booking: 'truck', handover: 'lock', purchase: 'check', paid: 'cash', dispute: 'alert', cancel: 'x' };
  TK.ago = function (iso) {
    var m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : TK.date(iso);
  };
  TK.notifHtml = function (n) {
    return '<a class="notif' + (n.read ? '' : ' unread') + '" data-nid="' + n.id + '"' + (n.link ? ' href="' + TK.esc(n.link) + '"' : '') + '><span class="n-ic n-' + n.type + '">' + TK.icon(N_ICON[n.type] || 'bell') + '</span><span style="flex:1;min-width:0"><div class="n-t">' + TK.esc(n.title) + '</div><div class="n-b">' + TK.esc(n.body) + '</div><div class="n-time">' + TK.ago(n.createdAt) + '</div></span>' + (n.read ? '' : '<span class="dot"></span>') + '</a>';
  };
  function beep() {
    try { var A = window.AudioContext || window.webkitAudioContext, c = TK._ac || (TK._ac = new A()); [0, 0.18].forEach(function (t, i) { var o = c.createOscillator(), g = c.createGain(); o.frequency.value = i ? 1175 : 880; g.gain.setValueAtTime(0.0001, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.16); o.connect(g).connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.18); }); } catch (e) { /* ignore */ }
  }
  TK.prefs = function (u) { var p = (u && u.prefs) || {}; return { sound: p.sound !== false, voice: !!p.voice, desktop: !!p.desktop, newLots: p.newLots !== false }; };
  TK.bell = function (box, u) {
    if (!box) return;
    var seenKey = 'tk_seen_' + u.id, open = false;
    var maxId = function (items) { return items.reduce(function (a, n) { return Math.max(a, n.id); }, 0); };
    var first = TK.api.notifications(); try { if (!sessionStorage.getItem(seenKey)) sessionStorage.setItem(seenKey, String(maxId(first.items))); } catch (e) { /* ignore */ }
    function render(ring) {
      var d = TK.api.notifications(8);
      box.innerHTML = '<button type="button" class="bell-btn' + (ring ? ' ring' : '') + '" aria-label="Notifications, ' + d.unread + ' unread" aria-expanded="' + open + '">' + TK.icon('bell') + (d.unread ? '<span class="badge">' + (d.unread > 9 ? '9+' : d.unread) + '</span>' : '') + '</button>' +
        (open ? '<div class="bell-pop" role="dialog" aria-label="Notifications"><div class="bp-head"><b>सूचनाएँ · Notifications</b>' + (d.unread ? '<button type="button" class="btn btn-ghost btn-sm" data-all>Mark all read</button>' : '') + '</div><div class="bp-list">' +
          (d.items.length ? d.items.map(TK.notifHtml).join('') : '<div class="muted small center" style="padding:24px">No notifications yet.</div>') + '</div><div class="bp-foot"><a href="notifications.html">See all notifications →</a></div></div>' : '');
    }
    box.addEventListener('click', function (e) {
      if (e.target.closest('.bell-btn')) { open = !open; render(); return; }
      if (e.target.closest('[data-all]')) { TK.api.markRead('all'); render(); return; }
      var n = e.target.closest('[data-nid]'); if (n) TK.api.markRead(n.dataset.nid);
    });
    document.addEventListener('click', function (e) { if (open && !box.contains(e.target)) { open = false; render(); } });
    function check() {
      var d = TK.api.notifications(), seen = 0; try { seen = Number(sessionStorage.getItem(seenKey)) || 0; } catch (e) { /* ignore */ }
      var fresh = d.items.filter(function (n) { return n.id > seen && !n.read; }).reverse();
      if (fresh.length) {
        try { sessionStorage.setItem(seenKey, String(maxId(d.items))); } catch (e) { /* ignore */ }
        var me = TK.api.me(), pf = TK.prefs(me);
        fresh = fresh.filter(function (n) { return n.type !== 'lot' || pf.newLots; });
        if (fresh.length) {
          var n = fresh[fresh.length - 1];
          TK.liveAlert(n, fresh.length);
          if (pf.sound) beep();
          if (pf.voice) TK.speak(n.title.split(' · ')[0] + '। ' + n.body);
          if (pf.desktop && window.Notification && Notification.permission === 'granted') { try { new Notification('TolKanta · ' + n.title, { body: n.body, icon: TK.root + 'assets/img/favicon.svg' }); } catch (e) { /* ignore */ } }
        }
      }
      render(fresh.length > 0);
    }
    render(); TK.onDataChange(check);
  };
  TK.liveAlert = function (n, count) {
    var old = document.querySelector('.alert-live'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'alert-live'; el.setAttribute('role', 'alert');
    el.innerHTML = '<b>🔔 ' + TK.esc(n.title) + (count > 1 ? ' <small style="opacity:.7">+' + (count - 1) + ' more</small>' : '') + '</b><span>' + TK.esc(n.body) + '</span>' + (n.link ? '<div style="margin-top:8px"><a href="' + TK.esc(n.link) + '">Open →</a></div>' : '');
    document.body.appendChild(el); setTimeout(function () { if (el.isConnected) el.remove(); }, 7000);
    el.onclick = function (e) { if (!e.target.closest('a')) el.remove(); };
  };

  // Re-render a page when another tab changes the data (e.g. recycler confirms)
  TK.onDataChange = function (fn) { window.addEventListener('storage', function (e) { if (e.key === TK.DB_KEY) fn(); }); };
})();

/* ---------------- Earnings Passport card (portal + public view) ---------------- */
(function () {
  var TK = window.TK;
  TK.scoreRing = function (score) {
    var r = 52, c = 2 * Math.PI * r;
    return '<svg class="score-ring" viewBox="0 0 120 120" width="130" height="130" role="img" aria-label="Trust score ' + score + ' out of 100">' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#E6ECE8" stroke-width="12"/>' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#20845A" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (score / 100 * c) + ' ' + c + '" transform="rotate(-90 60 60)"/>' +
      '<text x="60" y="60" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="30" font-weight="600" fill="#23282F">' + score + '</text>' +
      '<text x="60" y="80" text-anchor="middle" font-family="Mukta, sans-serif" font-size="11" fill="#5B6B68">/ 100</text></svg>';
  };
  TK.renderPassport = function (p, qrHtml) {
    var esc = TK.esc, parts = [['verifiedSales', 'Verified sales', 40], ['consistency', 'Regular activity (90 days)', 20], ['tenure', 'Time on TolKanta', 15], ['noDisputes', 'No weight disputes', 15], ['identity', 'e-Shram linked', 10]];
    var max = Math.max.apply(null, [1].concat((p.monthly || []).map(function (m) { return m.sold; })));
    return '<div class="grid g2" style="align-items:start">' +
      '<div class="card" style="padding:0;overflow:hidden">' +
        '<div style="background:var(--green);color:#fff;padding:14px 18px" class="row between"><div><b class="hi" style="font-size:19px">कमाई पासपोर्ट · Earnings Passport</b><div class="mono tiny" style="opacity:.8">ID ' + esc(p.code) + '</div></div>' + (p.eshramLinked ? '<span class="pill" style="background:rgba(255,255,255,.2);color:#fff">e-Shram ✓</span>' : '') + '</div>' +
        '<div class="row" style="padding:18px;gap:18px;flex-wrap:nowrap">' + TK.scoreRing(p.score) +
          '<div><div class="muted small">TolKanta Trust Score</div><div class="hi" style="font-size:26px;font-weight:700;color:var(--green)">' + esc(p.band.hi) + '</div><div class="muted">' + esc(p.band.en) + '</div>' +
          '<div style="margin-top:8px;font-weight:700">' + esc(p.name) + (p.shopName ? ' · ' + esc(p.shopName) : '') + '</div><div class="muted small">' + esc(p.ward || '') + ' · member since ' + TK.date(p.memberSince) + '</div></div></div>' +
        '<div class="grid g3" style="border-top:1px solid var(--line);gap:0;text-align:center">' +
          [['Verified sales', p.verifiedCount], ['Verified income', TK.inr(p.verifiedIncome)], ['E-waste diverted', p.kgDiverted + ' kg']].map(function (x) { return '<div style="padding:14px 6px"><div class="mono" style="font-size:19px;font-weight:600">' + x[1] + '</div><div class="tiny muted">' + x[0] + '</div></div>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="stack">' +
        '<div class="card"><h3>How the score is built</h3>' + parts.map(function (x) { var v = (p.parts || {})[x[0]] || 0; return '<div class="small" style="margin-top:10px"><div class="row between"><span>' + x[1] + '</span><span class="mono muted">' + v + '/' + x[2] + '</span></div><div class="bar" style="margin-top:4px"><i style="width:' + (v / x[2] * 100) + '%"></i></div></div>'; }).join('') +
          '<p class="tiny muted" style="margin:12px 0 0">Built only from hash-verified handovers and the ledger. An indicator for lenders, not a credit bureau score.</p></div>' +
        ((p.monthly || []).length ? '<div class="card"><h3>Monthly sales</h3><div class="month-bars">' + p.monthly.map(function (m) {
          return '<div class="m"><div class="col"><i style="height:' + (m.sold / max * 100) + '%;background:rgba(32,132,90,.25)"></i><i style="height:' + (m.verified / max * 100) + '%;background:var(--green)"></i></div><span class="tiny mono muted">' + new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' }) + '</span></div>';
        }).join('') + '</div><p class="tiny muted" style="margin:8px 0 0">Dark: verified (hash-backed) · Light: all recorded sales</p></div>' : '') +
        (qrHtml || '') +
      '</div></div>';
  };
  // PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(TK.root + 'sw.js').catch(function () {});
  }
})();
