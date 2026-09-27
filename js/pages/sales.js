(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  TK.portalLayout('kabadiwala', 'sales.html', 'मेरी बिक्री · My sales', 'Everything you sold to authorised buyers: kg, money received and the extra you earned over the local rate');
  var days = 30, matId = '', materials = TK.api.materials();
  function render() {
    var sum = TK.try(function () { return TK.api.sellerSummary(); }, $('#sa')); if (!sum) return;
    var rows = TK.api.sellerSales(days, matId);
    var kg = 0, pcs = 0, amt = 0, extra = 0;
    rows.forEach(function (p) { var q = p.handover.receivedWeightKg; if (p.material.unit === 'kg') kg += q; else pcs += q; amt += p.amount; extra += p.amount - q * p.material.localRate; });
    var r = function (n) { return Math.round(n * 100) / 100; };
    TK.$('#headRight').innerHTML = TK.listenBtn('lsn') + '<button class="btn btn-ghost" id="csv">' + TK.icon('download') + ' CSV</button><a class="btn btn-orange" href="sell.html">' + TK.icon('camera') + ' Sell scrap</a>';
    var p = sum.pending;
    $('#sa').innerHTML = (p.awaiting || p.booked || p.disputed ? '<a class="alert alert-info" href="pickups.html" style="margin-bottom:16px;text-decoration:none">' + TK.icon('truck') + '<span><b>' + p.booked + ' pickup' + (p.booked === 1 ? '' : 's') + ' booked, ' + p.awaiting + ' waiting for the buyer to weigh' + (p.disputed ? ', ' + p.disputed + ' in dispute' : '') + '.</b> Money arrives the moment the buyer confirms. <u>Open pickups →</u></span></a>' : '') +
      '<div class="grid g4">' +
      '<div class="kpi green"><div class="l">Sold today</div><div class="v">' + sum.today.kg + ' kg</div><div class="h">' + inr(sum.today.amount) + ' received · ' + sum.today.n + ' sale' + (sum.today.n === 1 ? '' : 's') + '</div></div>' +
      '<div class="kpi"><div class="l">This month</div><div class="v">' + sum.month.kg + ' kg</div><div class="h">' + (sum.month.pcs ? sum.month.pcs + ' pc · ' : '') + inr(sum.month.amount) + '</div></div>' +
      '<div class="kpi"><div class="l">All time</div><div class="v">' + sum.total.kg + ' kg</div><div class="h">' + sum.total.pcs + ' pc · ' + inr(sum.total.amount) + ' · ' + sum.total.n + ' verified</div></div>' +
      '<div class="kpi"><div class="l">Extra vs local market</div><div class="v" style="color:var(--green)">+' + inr(sum.total.extra) + '</div><div class="h">what TolKanta added over kabadi-market rates</div></div></div>' +
      '<div class="grid g2" style="margin-top:20px;align-items:start"><div class="card"><h3>Who bought from you</h3>' + (sum.byBuyer.length ? sum.byBuyer.map(function (b) { return '<div class="list-item"><span class="ic" style="background:rgba(32,132,90,.1);color:var(--green)">' + TK.icon('factory') + '</span><span class="grow"><span class="t">' + esc(b.name) + '</span><div class="s">' + esc(b.area) + ' · ' + b.n + ' sales · ' + b.kg + ' kg</div></span><span class="mono"><b>' + inr(b.amount) + '</b></span></div>'; }).join('') : '<p class="muted">No sales yet.</p>') + '<a class="small" href="buyers.html">Compare all buyers\' rates →</a></div>' +
      '<div class="card" style="background:var(--cream)"><h3>Why this matters</h3><p style="margin:0">Every sale here is backed by a sealed handover record. That is what raises your <a href="passport.html">Earnings Passport</a> score and makes your income visible to lenders.</p><p class="small muted" style="margin:10px 0 0">Cash deals outside TolKanta go in the <a href="ledger.html">Ledger</a>, but they do not count as verified.</p></div></div>' +
      '<div class="row between" style="margin:24px 0 12px;gap:12px"><div class="tabs" id="range" style="margin:0">' + [[1, 'Today'], [7, '7 days'], [30, '30 days'], [180, '6 months'], [0, 'All']].map(function (x) { return '<button class="tab' + (days === x[0] ? ' on' : '') + '" data-d="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<select class="input" id="mat" style="max-width:260px" aria-label="Material"><option value="">All materials</option>' + materials.map(function (m) { return '<option value="' + m.id + '"' + (String(m.id) === String(matId) ? ' selected' : '') + '>' + esc(m.nameEn) + '</option>'; }).join('') + '</select></div>' +
      '<div class="card table-wrap"><div class="row between" style="margin-bottom:6px"><b>' + rows.length + ' sales · ' + r(kg) + ' kg' + (pcs ? ' + ' + r(pcs) + ' pc' : '') + ' · ' + inr(amt) + '</b><span class="small" style="color:var(--green)">+' + inr(extra) + ' over local rate</span></div>' +
      (rows.length ? '<table class="table"><thead><tr><th>Paid on</th><th>#</th><th>Buyer</th><th>Material</th><th style="text-align:right">Handed → weighed</th><th style="text-align:right">Rate</th><th style="text-align:right">Received</th><th>Mode</th><th>Record</th></tr></thead><tbody>' + rows.map(function (x) {
        var h = x.handover;
        return '<tr><td class="small nowrap">' + TK.date(h.confirmedAt) + '<div class="tiny muted">' + TK.time(h.confirmedAt) + '</div></td><td class="mono"><a href="pickups.html?id=' + x.id + '">' + x.id + '</a></td><td>' + esc(x.recycler.name) + '</td><td>' + esc(x.material.nameEn) + '</td><td class="mono nowrap" style="text-align:right">' + h.weightKg + ' → <b>' + TK.qty(h.receivedWeightKg, x.material.unit) + '</b></td><td class="mono" style="text-align:right">₹' + x.rate + '</td><td class="mono" style="text-align:right;color:var(--green)"><b>' + inr(x.amount) + '</b></td><td class="small">' + esc(x.paymentMode) + '</td><td><a class="mono small" href="../verify.html?hash=' + h.recordHash + '">' + h.recordHash.slice(0, 10) + '…</a></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="center muted" style="padding:40px">No sales in this period.</div>') + '</div>';
    $('#range').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { days = Number(b.dataset.d); render(); } };
    $('#mat').onchange = function () { matId = this.value; render(); };
    $('#csv').onclick = function () {
      var out = [['paid_on', 'pickup_id', 'buyer', 'material', 'handed_qty', 'weighed_qty', 'unit', 'rate_inr', 'received_inr', 'mode', 'record_sha256']].concat(rows.map(function (x) { var h = x.handover; return [h.confirmedAt, x.id, x.recycler.name, x.material.nameEn, h.weightKg, h.receivedWeightKg, x.material.unit, x.rate, x.amount, x.paymentMode, h.recordHash]; }));
      TK.downloadText(out.map(function (row) { return row.map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n') + '\n', 'tolkanta-my-sales.csv');
    };
    var l = $('#lsn'); if (l) l.onclick = function () { TK.speak('इस महीने आपने ' + sum.month.kg + ' किलो बेचा, ' + Math.round(sum.month.amount) + ' रुपये मिले। कुल मिलाकर लोकल रेट से ' + Math.round(sum.total.extra) + ' रुपये ज़्यादा कमाए।'); };
  }
  render(); TK.onDataChange(render);
})();
