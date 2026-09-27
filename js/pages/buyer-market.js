(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  TK.portalLayout('recycler', 'buyer-market.html', 'नया कबाड़ · Scrap available', 'Scrap listed by sellers that matches your bids. You get a notification the moment something new is listed.');
  var sort = 'new';
  function render() {
    var list = TK.try(function () { return TK.api.marketLots(); }, $('#mk')); if (!list) return;
    TK.$('#headRight').innerHTML = '<a class="btn btn-ghost" href="recycler.html?tab=bids">' + TK.icon('cash') + ' Update my bids</a>';
    if (sort === 'near') list.sort(function (a, b) { return (a.distanceKm || 99) - (b.distanceKm || 99); });
    else if (sort === 'value') list.sort(function (a, b) { return (b.value || 0) - (a.value || 0); });
    var best = list.filter(function (x) { return x.iAmBest; }).length;
    $('#mk').innerHTML = '<div class="alert alert-info" style="margin-bottom:16px">' + TK.icon('bell') + '<span>The seller chooses the buyer. Your live bid is shown to them next to other authorised buyers. <b>' + best + ' of ' + list.length + '</b> open lots currently show your bid as the best price.</span></div>' +
      '<div class="chips" id="sortC" style="margin-bottom:14px">' + [['new', 'सबसे नया · Newest'], ['near', 'सबसे पास · Nearest'], ['value', 'सबसे बड़ा · Highest value']].map(function (x) { return '<button type="button" class="chip' + (sort === x[0] ? ' on' : '') + '" data-s="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      (list.length ? '<div class="grid g3">' + list.map(function (x) {
        return '<div class="card" style="display:flex;flex-direction:column;gap:8px">' + (x.lot.photoPath ? '<img src="' + TK.photoSrc(x.lot.photoPath) + '" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:12px">' : '') +
          '<div class="row between" style="align-items:flex-start"><div><b style="font-size:18px">' + TK.qty(x.lot.weightKg, x.material.unit) + '</b> <span class="muted">' + esc(x.material.nameEn) + '</span>' + (x.material.hazard ? ' <span class="pill pill-hazard">Hazard</span>' : '') + '<div class="small muted">' + esc(x.seller.name) + ' · ' + esc(x.seller.ward || '') + (x.distanceKm != null ? ' · ' + x.distanceKm + ' km from you' : '') + '</div></div><span class="tiny muted nowrap">' + TK.ago(x.lot.createdAt) + '</span></div>' +
          '<table class="table small"><tbody><tr><td class="muted">Your bid</td><td class="mono" style="text-align:right"><b>₹' + x.myBid + '/' + x.material.unit + '</b></td></tr><tr><td class="muted">Best authorised bid</td><td class="mono" style="text-align:right">₹' + x.bestBid + '</td></tr><tr><td class="muted">Lot value at your bid</td><td class="mono" style="text-align:right;color:var(--green)"><b>' + inr(x.value) + '</b></td></tr></tbody></table>' +
          '<div class="row between" style="margin-top:auto"><span class="pill ' + (x.iAmBest ? 'pill-green' : 'pill-orange') + '">' + (x.iAmBest ? '✓ Your bid is best' : 'Outbid by ₹' + (x.bestBid - x.myBid)) + '</span>' + (x.iAmBest ? '' : '<a class="btn btn-orange btn-sm" href="recycler.html?tab=bids">Raise bid</a>') + '</div></div>';
      }).join('') + '</div>' : '<div class="card center muted" style="padding:44px">No open scrap matching your bids right now. You will be notified when a seller lists something.</div>');
    $('#sortC').onclick = function (e) { var b = e.target.closest('.chip'); if (b) { sort = b.dataset.s; render(); } };
  }
  render(); TK.onDataChange(render);
})();
