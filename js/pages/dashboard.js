(function () {
  var esc = TK.esc, inr = TK.inr;
  var u = TK.portalLayout('kabadiwala', 'dashboard.html', 'नमस्ते, ' + esc(TK.api.me().name || 'कबाड़ीवाला') + ' जी', 'Kabadiwala dashboard · ' + esc(TK.api.me().shopName || '') + (TK.api.me().ward ? ' · ' + esc(TK.api.me().ward) : ''));
  TK.$('#headRight').innerHTML = TK.listenBtn('lsn') + '<a class="btn btn-orange" href="sell.html">' + TK.icon('camera') + ' Sell scrap · फोटो लें</a>';

  function render() {
    var d = TK.try(function () { return TK.api.dashboard(); }, TK.$('#dash')); if (!d) return;
    var t = d.today;
    var html = '<div class="grid g4">' +
      '<div class="kpi green"><div class="l">आज की कमाई · Today\'s net</div><div class="v">' + (t.net < 0 ? '−' : '') + inr(t.net) + '</div><div class="h">' + TK.date(new Date().toISOString()) + '</div></div>' +
      '<div class="kpi"><div class="l">बेचा · Sold today</div><div class="v">' + inr(t.sold) + '</div></div>' +
      '<div class="kpi"><div class="l">खरीदा · Bought today</div><div class="v">' + inr(t.bought) + '</div></div>' +
      '<div class="kpi"><div class="l">ई-कचरा पहुँचाया · Diverted</div><div class="v">' + d.impact.kg + ' kg</div><div class="h">' + d.impact.handovers + ' verified handovers</div></div></div>';

    html += '<div class="grid g2" style="margin-top:20px;align-items:start"><div class="stack">';
    if (d.active.length) {
      html += '<div class="card"><h3>चल रहे पिकअप · Active pickups</h3>' + d.active.map(function (p) {
        return '<a class="list-item" href="pickups.html?id=' + p.id + '" style="color:inherit;text-decoration:none"><span class="ic" style="background:rgba(47,76,111,.1);color:var(--navy)">' + TK.icon('truck') + '</span><span class="grow"><span class="t">' + esc(p.recycler.name) + '</span><div class="s">' + esc(p.material.nameHi) + ' · ' + TK.qty(p.lot.weightKg, p.material.unit) + ' · ' + inr(p.amount) + '</div></span>' + TK.statusPill(p.status) + '</a>';
      }).join('') + '</div>';
    }
    html += '<div class="card"><div class="row between"><h3 style="margin:0">आज के दाम · Today\'s rates</h3><span class="tiny muted">per kg / piece</span></div><table class="table" style="margin-top:8px"><tbody>' + d.materials.map(function (m) {
      var arrow = m.delta > 0 ? '<span style="color:var(--green)">▲ ₹' + m.delta + '</span>' : m.delta < 0 ? '<span style="color:var(--red)">▼ ₹' + Math.abs(m.delta) + '</span>' : '<span class="muted">no change</span>';
      return '<tr><td><b>' + esc(m.nameHi) + '</b> ' + (m.hazard ? '<span class="pill pill-hazard">Hazard</span>' : '') + '<div class="tiny muted">' + esc(m.nameEn) + '</div></td><td class="mono nowrap" style="text-align:right"><b>₹' + m.boardRate + '</b>/' + m.unit + '<div class="tiny">' + arrow + '</div></td></tr>';
    }).join('') + '</tbody></table></div></div>';

    var nt = TK.api.notifications(4), ss = TK.api.sellerSummary();
    html += '<div class="stack"><div class="card"><div class="row between"><h3 style="margin:0">' + TK.icon('bell') + ' सूचनाएँ · Notifications</h3><a class="small" href="notifications.html">See all →</a></div><div style="margin:8px -24px -8px">' + (nt.items.length ? nt.items.map(TK.notifHtml).join('') : '<p class="muted small" style="padding:0 24px">No notifications yet.</p>') + '</div></div>' +
      '<a class="card" href="sales.html" style="text-decoration:none;color:inherit"><div class="row between"><h3 style="margin:0">मेरी बिक्री · My sales</h3><span class="small" style="color:var(--green);font-weight:700">Open →</span></div><div class="grid g3" style="margin-top:10px;gap:10px;text-align:center">' +
        [['This month', ss.month.kg + ' kg'], ['Received', inr(ss.month.amount)], ['Extra vs local', '+' + inr(ss.total.extra)]].map(function (x) { return '<div><div class="mono" style="font-size:20px;font-weight:600">' + x[1] + '</div><div class="small muted">' + x[0] + '</div></div>'; }).join('') + '</div></a>';
    html += '<div class="card"><div class="row between"><h3 style="margin:0">खाता · Recent ledger</h3><a href="ledger.html" class="small">See all →</a></div>' + d.recent.map(function (l) {
      return '<div class="list-item"><span class="ic" style="background:' + (l.pickupId ? 'rgba(32,132,90,.1);color:var(--green)' : 'rgba(231,126,34,.12);color:var(--orange)') + '">' + TK.icon(l.pickupId ? 'shield' : 'cash') + '</span><span class="grow"><span class="t">' + esc(l.description.split(' · ')[0]) + '</span><div class="s">' + TK.dateTime(l.createdAt) + ' · ' + esc(l.description.split(' · ')[1] || '') + ' · ' + l.mode + '</div></span><span class="amt' + (l.type === 'sale' ? ' plus' : '') + '">' + (l.type === 'sale' ? '+' : '−') + inr(l.amount) + '</span></div>';
    }).join('') + '</div>' +
      '<a class="card" href="passport.html" style="background:var(--ink);color:#fff;text-decoration:none;display:flex;gap:14px;align-items:center"><span style="font-size:30px">🪪</span><span><b>कमाई पासपोर्ट · Earnings Passport</b><div class="small" style="opacity:.75">Your verified income record and trust score, with a QR for lenders</div></span></a>' +
      (d.impact.kg ? '<div class="card" style="background:var(--cream)"><b>🌿 ' + d.impact.kg + ' kg</b> ई-कचरा आपने अधिकृत रीसाइक्लर तक पहुँचाया, जलने से बचाया।<div class="small muted">' + d.impact.hazardKg + ' kg of hazardous material handled safely</div></div>' : '') +
      '</div></div>';
    TK.$('#dash').innerHTML = html;
    TK.$$('#dash [data-nid]').forEach(function (a) { a.addEventListener('click', function () { TK.api.markRead(a.dataset.nid); }); });
    var b = TK.$('#lsn'); if (b) b.onclick = function () { TK.speak('नमस्ते ' + (u.name || '') + ' जी। आज की कमाई ' + Math.round(t.net) + ' रुपये। आज के दाम: ' + d.materials.slice(0, 4).map(function (m) { return m.nameHi + ' ' + m.boardRate + ' रुपये'; }).join('। ')); };
  }
  render(); TK.onDataChange(render);
})();
