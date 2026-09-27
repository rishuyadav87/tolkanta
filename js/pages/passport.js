(function () {
  var $ = TK.$, esc = TK.esc;
  TK.portalLayout('kabadiwala', 'passport.html', 'कमाई पासपोर्ट · Earnings Passport', 'A verified income record you can show a bank, NBFC or MUDRA lender. Only hash-verified sales count.');

  function b64url(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function shareLink(p) {
    // The QR carries a small read-only snapshot so it opens on any phone, even without this browser's data
    var snap = { code: p.code, name: p.name, shopName: p.shopName, ward: p.ward, eshramLinked: p.eshramLinked, memberSince: p.memberSince, verifiedCount: p.verifiedCount,
      verifiedIncome: p.verifiedIncome, kgDiverted: p.kgDiverted, score: p.score, parts: p.parts, band: p.band, monthly: (p.monthly || []).slice(-6) };
    return new URL('../passport-view.html?code=' + encodeURIComponent(p.code) + '&d=' + b64url(JSON.stringify(snap)), location.href).href;
  }
  function qrSvg(text) {
    if (typeof window.qrcode !== 'function') return '<div class="muted small center" style="padding:30px">QR needs an internet connection to load. Use the link button instead.</div>';
    var q = window.qrcode(0, 'L'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 3, margin: 2, scalable: true }).replace('<svg ', '<svg style="width:100%;max-width:240px;height:auto;display:block;margin:0 auto" role="img" aria-label="QR code for the Earnings Passport" ');
  }
  function render() {
    var p = TK.try(function () { return TK.api.passport(); }, $('#pp')); if (!p) return;
    var link = shareLink(p);
    TK.$('#headRight').innerHTML = TK.listenBtn('lsn') + '<button class="btn btn-ghost" id="print">' + TK.icon('download') + ' Print / PDF</button>';
    var qr = '<div class="card center"><h3>लोन के लिए दिखाएँ · Show to a lender</h3><p class="small muted" style="margin-top:0">The lender scans this to open a read-only copy. Your phone number is never shown.</p>' + qrSvg(link) +
      '<div class="row" style="justify-content:center;margin-top:12px"><button class="btn btn-primary btn-sm" id="copyLink">' + TK.icon('send') + ' Copy link</button><a class="btn btn-ghost btn-sm" href="' + esc(link) + '" target="_blank" rel="noopener">Open lender view</a></div></div>';
    var tips = [];
    if (!p.eshramLinked) tips.push('<a href="profile.html">e-Shram UAN जोड़ें</a> · Link your e-Shram UAN (+10 points)');
    if (p.verifiedCount < 20) tips.push('हर बिक्री TolKanta से करें · Sell through TolKanta so each sale is hash-verified (' + p.verifiedCount + '/20)');
    if (p.parts.consistency < 20) tips.push('हर हफ़्ते खाता भरें · Record activity every week');
    $('#pp').innerHTML = TK.renderPassport(p, qr) + (tips.length ? '<div class="card" style="margin-top:20px;background:var(--cream)"><h3>स्कोर बढ़ाएँ · Improve your score</h3><ul class="small" style="margin:0;padding-left:18px">' + tips.map(function (t) { return '<li style="margin:6px 0">' + t + '</li>'; }).join('') + '</ul></div>' : '');
    $('#copyLink').onclick = function () {
      var done = function () { TK.toast('Link copied · लिंक कॉपी हो गया'); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(link).then(done, function () { window.prompt('Copy this link', link); });
      else { var a = document.createElement('textarea'); a.value = link; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ } a.remove(); }
    };
    $('#print').onclick = function () { window.print(); };
    var l = $('#lsn'); if (l) l.onclick = function () { TK.speak('आपका भरोसा स्कोर ' + p.score + ' है, सौ में से। ' + p.band.hi + '। ' + p.verifiedCount + ' सत्यापित बिक्री, कुल ' + Math.round(p.verifiedIncome) + ' रुपये।'); };
  }
  render(); TK.onDataChange(render);
})();
