(function () {
  var $ = TK.$, esc = TK.esc;
  TK.portalLayout('kabadiwala', 'buyers.html', 'खरीदार और दाम · Buyers & rates', 'Every authorised buyer near you and what each one pays today. The best rate for each item is highlighted.');
  function render() {
    var d = TK.try(function () { return TK.api.buyerBoard(); }, $('#br')); if (!d) return;
    TK.$('#headRight').innerHTML = TK.listenBtn('lsn') + '<a class="btn btn-orange" href="sell.html">' + TK.icon('camera') + ' Sell at the best rate</a>';
    $('#br').innerHTML = '<div class="grid g3">' + d.buyers.map(function (b) {
      var r = b.recycler, wins = b.bids.filter(function (x, i) { return x && x === d.best[i]; }).length;
      return '<div class="card" style="display:flex;flex-direction:column;gap:8px"><div class="row between" style="align-items:flex-start"><div><h3 style="margin:0">' + esc(r.name) + '</h3><div class="small muted">📍 ' + esc(r.area) + ' · <span class="mono">' + b.distanceKm + ' km</span> · ★ ' + r.rating + '</div></div><span class="pill pill-green">CPCB ✓</span></div>' +
        '<div class="small">🚚 ' + (r.pickupAvailable ? 'Doorstep pickup · next: ' + esc(b.slot.en) : 'Drop-off only right now') + '</div>' +
        '<div class="small">' + (b.soldToThem ? 'You sold to them ' + b.soldToThem + ' times · ' + TK.inr(b.earnedFromThem) : 'You have not sold to them yet') + '</div>' +
        '<div class="small" style="margin-top:auto"><b style="color:var(--green)">Best rate on ' + wins + ' of ' + d.materials.length + ' items</b></div></div>';
    }).join('') + '</div>' +
      '<div class="card table-wrap" style="margin-top:20px"><h3>आज के दाम, हर खरीदार · Today\'s rate from each buyer</h3><table class="table"><thead><tr><th>Material</th><th style="text-align:right">Local market</th>' + d.buyers.map(function (b) { return '<th style="text-align:right">' + esc(b.recycler.name.split(' ')[0]) + '</th>'; }).join('') + '<th style="text-align:right">You gain</th></tr></thead><tbody>' + d.materials.map(function (m, i) {
        var best = d.best[i];
        return '<tr><td><b>' + esc(m.nameEn) + '</b>' + (m.hazard ? ' <span class="pill pill-hazard">Hazard</span>' : '') + '<div class="tiny muted">per ' + m.unit + '</div></td><td class="mono muted" style="text-align:right">₹' + m.localRate + '</td>' +
          d.buyers.map(function (b) { var v = b.bids[i]; return '<td class="mono" style="text-align:right">' + (v == null ? '<span class="muted">-</span>' : v === best ? '<b style="color:var(--green);background:rgba(32,132,90,.1);padding:3px 8px;border-radius:8px">₹' + v + '</b>' : '₹' + v) + '</td>'; }).join('') +
          '<td class="mono" style="text-align:right;color:var(--green)"><b>+' + (m.localRate ? Math.round((best - m.localRate) / m.localRate * 100) : 0) + '%</b></td></tr>';
      }).join('') + '</tbody></table><p class="tiny muted" style="margin:8px 0 0">Buyers change their bids live. You get a notification when a board rate goes up.</p></div>';
    var l = $('#lsn'); if (l) l.onclick = function () { TK.speak('आज के सबसे अच्छे दाम: ' + d.materials.slice(0, 4).map(function (m, i) { return m.nameHi + ' ' + d.best[i] + ' रुपये'; }).join('। ')); };
  }
  render(); TK.onDataChange(render);
})();
