(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  var u = TK.portalLayout('recycler', 'buyer.html', 'खरीदार डैशबोर्ड · Buyer dashboard', 'Scrap you bought, pickups to handle and new scrap near you');

  function render() {
    var d = TK.try(function () { return TK.api.buyerDashboard(); }, $('#bd')); if (!d) return;
    var r = d.recycler, n = TK.api.notifications(6), market = TK.api.marketLots();
    TK.$('#headRight').innerHTML = '<span class="status-strip' + (r.pickupAvailable ? '' : ' off') + '">' + (r.pickupAvailable ? '● Buying · pickups on' : '○ Drop-off only') + '</span><a class="btn btn-primary" href="recycler.html">' + TK.icon('truck') + ' Pickups & weighing</a>';
    var maxKg = Math.max.apply(null, [1].concat(d.days.map(function (x) { return x.kg; })));
    var action = d.pending.awaiting + d.pending.disputed;

    var html = (action ? '<a class="alert alert-warn" href="recycler.html" style="margin-bottom:16px;text-decoration:none">' + TK.icon('alert') + '<span><b>' + d.pending.awaiting + ' handover' + (d.pending.awaiting === 1 ? '' : 's') + ' waiting for your weight confirmation</b>' + (d.pending.disputed ? ' · ' + d.pending.disputed + ' in dispute' : '') + '. Sellers are paid only after you confirm. <u>Confirm now →</u></span></a>' : '') +
      '<div class="grid g4">' +
      '<div class="kpi green"><div class="l">आज खरीदा · Bought today</div><div class="v">' + d.today.kg + ' kg</div><div class="h">' + (d.today.pcs ? d.today.pcs + ' pc · ' : '') + inr(d.today.paid) + ' paid · ' + d.today.n + ' purchases</div></div>' +
      '<div class="kpi"><div class="l">इस महीने · This month</div><div class="v">' + d.month.kg + ' kg</div><div class="h">' + (d.month.pcs ? d.month.pcs + ' pc · ' : '') + inr(d.month.paid) + ' paid</div></div>' +
      '<div class="kpi"><div class="l">कुल खरीद · All time</div><div class="v">' + d.total.kg + ' kg</div><div class="h">' + d.total.pcs + ' pc · ' + inr(d.total.paid) + ' · ' + d.total.n + ' verified</div></div>' +
      '<div class="kpi"><div class="l">काम बाकी · To do</div><div class="v">' + d.pending.booked + ' · ' + d.pending.awaiting + '</div><div class="h">booked · awaiting your confirmation</div></div></div>';

    html += '<div class="grid g2" style="margin-top:20px;align-items:start"><div class="stack">' +
      '<div class="card"><div class="row between"><h3 style="margin:0">रोज़ की खरीद · Kg bought, last 14 days</h3><span class="tiny muted">verified weight</span></div><div class="spark" style="margin-top:14px">' + d.days.map(function (x) { return '<i class="' + (x.kg ? '' : 'zero') + '" style="height:' + (x.kg ? Math.max(4, x.kg / maxKg * 100) : 2) + '%" title="' + x.day + ': ' + x.kg + ' kg"></i>'; }).join('') + '</div>' +
      '<div class="row between tiny muted mono" style="margin-top:6px"><span>' + TK.date(d.days[0].day) + '</span><span>today</span></div></div>' +
      '<div class="card"><div class="row between"><h3 style="margin:0">आने वाले पिकअप · Pickups to handle</h3><a class="small" href="recycler.html">Open →</a></div>' + (d.upcoming.length ? d.upcoming.map(function (p) {
        return '<a class="list-item" href="recycler.html" style="color:inherit;text-decoration:none"><span class="ic" style="background:rgba(47,76,111,.1);color:var(--navy)">' + TK.icon('truck') + '</span><span class="grow"><span class="t">' + esc(p.kabadiwala.shopName || p.kabadiwala.name) + ' · ' + TK.qty(p.lot.weightKg, p.material.unit) + ' ' + esc(p.material.nameEn) + '</span><div class="s">#' + p.id + ' · ' + esc(TK.slot(p.slot).en) + ' · ' + esc(p.kabadiwala.ward || '') + ' · ' + inr(p.amount) + ' ' + esc(p.paymentMode) + '</div></span>' + TK.statusPill(p.status, true) + '</a>';
      }).join('') : '<p class="muted small">No pickups waiting. New bookings appear here and in your notifications.</p>') + '</div>' +
      '<div class="card"><h3>सामान के हिसाब से · Bought by material</h3><div class="table-wrap"><table class="table"><thead><tr><th>Material</th><th style="text-align:right">Qty</th><th style="text-align:right">Paid</th><th style="text-align:right">Lots</th></tr></thead><tbody>' + d.byMaterial.map(function (b) {
        return '<tr><td><b>' + esc(b.material.nameEn) + '</b>' + (b.material.hazard ? ' <span class="pill pill-hazard">Hazard</span>' : '') + '</td><td class="mono" style="text-align:right">' + TK.qty(b.qty, b.material.unit) + '</td><td class="mono" style="text-align:right">' + inr(b.paid) + '</td><td class="mono" style="text-align:right">' + b.n + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="tiny muted" style="margin:8px 0 0">' + d.total.hazardKg + ' kg of hazardous material received through verified, hash-recorded handovers.</p></div></div>';

    html += '<div class="stack"><div class="card"><div class="row between"><h3 style="margin:0">' + TK.icon('bell') + ' सूचनाएँ · Notifications</h3><a class="small" href="notifications.html">See all →</a></div><div style="margin:8px -24px -8px">' + (n.items.length ? n.items.map(TK.notifHtml).join('') : '<p class="muted small" style="padding:0 24px">No notifications yet.</p>') + '</div></div>' +
      '<div class="card"><div class="row between"><h3 style="margin:0">' + TK.icon('search') + ' नया कबाड़ · Scrap available now</h3><a class="small" href="buyer-market.html">See all →</a></div>' + (market.length ? market.slice(0, 3).map(function (x) {
        return '<div class="list-item"><span class="ic" style="background:rgba(231,126,34,.12);color:var(--orange)">' + TK.icon('search') + '</span><span class="grow"><span class="t">' + TK.qty(x.lot.weightKg, x.material.unit) + ' ' + esc(x.material.nameEn) + '</span><div class="s">' + esc(x.seller.name) + ' · ' + esc(x.seller.ward || '') + (x.distanceKm != null ? ' · ' + x.distanceKm + ' km' : '') + ' · listed ' + TK.ago(x.lot.createdAt) + '</div></span><span class="pill ' + (x.iAmBest ? 'pill-green' : 'pill-orange') + '">' + (x.iAmBest ? 'Your bid is best' : 'Outbid: ₹' + x.bestBid) + '</span></div>';
      }).join('') : '<p class="muted small">No open scrap matching your bids right now.</p>') + '</div>' +
      '<div class="card"><h3>शीर्ष विक्रेता · Top sellers</h3>' + d.sellers.slice(0, 4).map(function (s) { return '<div class="list-item"><span class="grow"><span class="t">' + esc(s.name) + '</span><div class="s">' + esc(s.ward || '') + ' · ' + s.n + ' purchases · ' + s.kg + ' kg</div></span><span class="mono"><b>' + inr(s.paid) + '</b></span></div>'; }).join('') + '</div></div></div>';
    $('#bd').innerHTML = html;
    TK.$$('#bd [data-nid]').forEach(function (a) { a.addEventListener('click', function () { TK.api.markRead(a.dataset.nid); }); });
  }
  render(); TK.onDataChange(render);
})();
