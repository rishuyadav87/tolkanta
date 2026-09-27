(function () {
  var $ = TK.$, esc = TK.esc, G = TK.guide;
  TK.publicLayout('guide.html');
  var lang = G.lang();
  var GROUPS = [
    ['वेबसाइट · Website (no login needed)', ['index', 'how-it-works', 'impact', 'verify', 'ivr', 'whatsapp', 'about', 'login', 'guide']],
    ['विक्रेता पोर्टल · Seller portal (kabadiwalas, log in first)', ['dashboard', 'sell', 'pickups', 'ledger', 'passport', 'profile']],
    ['खरीदार पोर्टल · Buyer portal (authorised recyclers)', ['buyer', 'recycler', 'buyer-market', 'buyer-purchases', 'buyer-profile', 'notifications']],
    ['अधिकारी और लोन · City officer and lenders', ['admin', 'passport-view']],
  ];
  var ICON = { index: 'home', 'how-it-works': 'list', impact: 'leaf', verify: 'shield', ivr: 'phone', whatsapp: 'chat', about: 'users', login: 'lock', guide: 'book', dashboard: 'chart', sell: 'camera', pickups: 'truck', ledger: 'book', passport: 'qr', profile: 'user', recycler: 'truck', admin: 'building', buyer: 'chart', 'buyer-market': 'search', 'buyer-purchases': 'list', 'buyer-profile': 'factory', notifications: 'bell', 'passport-view': 'qr' };
  var PORTAL = ['dashboard', 'sell', 'pickups', 'ledger', 'passport', 'profile', 'recycler', 'admin', 'buyer', 'buyer-market', 'buyer-purchases', 'buyer-profile', 'notifications'];
  var pathOf = function (k) { return (PORTAL.indexOf(k) >= 0 ? 'portal/' : '') + k + '.html'; };

  $('#quickStart').innerHTML = [
    ['1', 'लॉग इन करें', 'Log in', 'मोबाइल नंबर डालें, ओटीपी 123456।', 'Enter a mobile number, OTP 123456.', 'login.html?tour=1'],
    ['2', 'फोटो लें और दाम देखें', 'Photo and price', 'सामान की फोटो, वज़न, और सबसे अच्छा अधिकृत दाम।', 'Photo, weight and the best authorised price.', 'portal/sell.html?tour=1'],
    ['3', 'पिकअप और भुगतान', 'Pickup and payment', 'हैंडओवर रिकॉर्ड करें, रीसाइक्लर पुष्टि करे, पैसा मिले।', 'Record the handover, recycler confirms, you get paid.', 'portal/pickups.html?tour=1'],
  ].map(function (s) {
    return '<a class="card" href="' + s[5] + '" style="text-decoration:none;color:inherit;display:flex;gap:14px;align-items:flex-start"><span class="card-icon" style="margin:0;font-family:var(--mono);font-weight:700;font-size:20px">' + s[0] + '</span><span><b class="hi" style="font-size:18px">' + s[1] + '</b> <span class="muted">· ' + s[2] + '</span><div class="small" style="margin-top:4px">' + s[3] + '</div><div class="tiny muted">' + s[4] + '</div></span></a>';
  }).join('');

  function render() {
    TK.$$('#gLang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === lang); });
    $('#guideList').innerHTML = GROUPS.map(function (g) {
      return '<h3 style="margin:28px 0 12px">' + g[0] + '</h3><div class="grid g3">' + g[1].map(function (k) {
        var p = G.PAGES[k];
        return '<div class="card guide-card" id="g-' + k + '"><h3>' + TK.icon(ICON[k]) + (lang === 'hi' ? p.hi : p.en) + '</h3><div class="tiny muted">' + (lang === 'hi' ? p.en : p.hi) + '</div>' +
          '<div class="hi">' + esc(lang === 'hi' ? p.sHi : p.sEn) + '</div><div class="en">' + esc(lang === 'hi' ? p.sEn : p.sHi) + '</div>' +
          (p.steps && p.steps.length ? '<ol>' + p.steps.map(function (s) { return '<li>' + esc(lang === 'hi' ? s[1] : s[2]) + '</li>'; }).join('') + '</ol>' : '') +
          '<div class="row"><button type="button" class="listen" data-say="' + k + '" data-l="hi">' + TK.icon('speaker') + ' हिंदी</button><button type="button" class="listen" data-say="' + k + '" data-l="en">' + TK.icon('speaker') + ' English</button>' +
          (k === 'guide' || k === 'passport-view' ? '' : '<a class="btn btn-ghost btn-sm" href="' + pathOf(k) + '?tour=1' + '" style="margin-left:auto">Open with tour →</a>') + '</div></div>';
      }).join('') + '</div>';
    }).join('');
    $('#cmdTable').innerHTML = '<thead><tr><th>' + (lang === 'hi' ? 'बोलें' : 'Say') + '</th><th>' + (lang === 'hi' ? 'खुलेगा' : 'Opens') + '</th></tr></thead><tbody>' + G.DEST.filter(function (d) { return d.id !== 'guide'; }).map(function (d) {
      var hiW = d.words.filter(function (w) { return /[ऀ-ॿ]/.test(w); }).slice(0, 2), enW = d.words.filter(function (w) { return !/[ऀ-ॿ]/.test(w); }).slice(0, 2);
      return '<tr><td>“' + hiW.concat(enW).map(esc).join('”, “') + '”</td><td><a href="' + d.path + '">' + (lang === 'hi' ? d.hi : d.en) + '</a></td></tr>';
    }).join('') + '</tbody>';
  }
  $('#guideList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-say]'); if (!b) return;
    var p = G.PAGES[b.dataset.say], hi = b.dataset.l === 'hi';
    G.speak((hi ? p.hi + '। ' + p.sHi + ' ' : p.en + '. ' + p.sEn + ' ') + (p.steps || []).map(function (s) { return hi ? s[1] : s[2]; }).join(' '), b.dataset.l);
  });
  $('#gLang').onclick = function (e) { var b = e.target.closest('button'); if (b) { lang = b.dataset.l; try { localStorage.setItem('tk_guide_lang', lang); } catch (x) { /* ignore */ } render(); } };

  // The search box on this page talks to the same assistant chatbot
  $('#guideSearch').onsubmit = function (e) { e.preventDefault(); var v = $('#gq').value.trim(); if (v) { G.ask(v, false); $('#gq').value = ''; } };
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) $('#gMic').remove();
  else $('#gMic').onclick = function () { G.listen(); };
  TK.$$('[data-ask]').forEach(function (b) { b.onclick = function () { G.ask(b.dataset.ask, false); }; });
  render();
})();
