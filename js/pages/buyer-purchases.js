(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  TK.portalLayout('recycler', 'buyer-purchases.html', 'खरीद · Purchases', 'Every lot you bought: kg received, amount paid and the verified handover record');
  var days = 30, matId = '', materials = TK.api.materials();
  function render() {
    var rows = TK.try(function () { return TK.api.buyerPurchases(days, matId); }, $('#pu')); if (!rows) return;
    var kg = 0, pcs = 0, paid = 0, hz = 0;
    rows.forEach(function (p) { var q = p.handover.receivedWeightKg; if (p.material.unit === 'kg') { kg += q; if (p.material.hazard) hz += q; } else pcs += q; paid += p.amount; });
    var r = function (n) { return Math.round(n * 100) / 100; };
    TK.$('#headRight').innerHTML = '<button class="btn btn-ghost" id="csv">' + TK.icon('download') + ' Download CSV</button>';
    $('#pu').innerHTML = '<div class="row between" style="margin-bottom:16px;gap:12px"><div class="tabs" id="range" style="margin:0">' + [[1, 'Today'], [7, '7 days'], [30, '30 days'], [180, '6 months'], [0, 'All']].map(function (x) { return '<button class="tab' + (days === x[0] ? ' on' : '') + '" data-d="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<select class="input" id="mat" style="max-width:260px" aria-label="Material"><option value="">All materials</option>' + materials.map(function (m) { return '<option value="' + m.id + '"' + (String(m.id) === String(matId) ? ' selected' : '') + '>' + esc(m.nameEn) + '</option>'; }).join('') + '</select></div>' +
      '<div class="grid g4"><div class="kpi green"><div class="l">Kg bought</div><div class="v">' + r(kg) + ' kg</div><div class="h">' + (pcs ? r(pcs) + ' pieces too' : 'verified weight') + '</div></div><div class="kpi"><div class="l">Paid to sellers</div><div class="v">' + inr(paid) + '</div></div><div class="kpi"><div class="l">Purchases</div><div class="v">' + rows.length + '</div><div class="h">all hash-verified</div></div><div class="kpi"><div class="l">Hazardous handled</div><div class="v">' + r(hz) + ' kg</div></div></div>' +
      '<div class="card table-wrap" style="margin-top:20px">' + (rows.length ? '<table class="table"><thead><tr><th>Confirmed</th><th>#</th><th>Seller</th><th>Material</th><th style="text-align:right">Handed → received</th><th style="text-align:right">Rate</th><th style="text-align:right">Paid</th><th>Mode</th><th>Record</th></tr></thead><tbody>' + rows.map(function (p) {
        var h = p.handover;
        return '<tr><td class="small nowrap">' + TK.date(h.confirmedAt) + '<div class="tiny muted">' + TK.time(h.confirmedAt) + '</div></td><td class="mono">' + p.id + '</td><td>' + esc(p.kabadiwala.shopName || p.kabadiwala.name) + '<div class="tiny muted">' + esc(p.kabadiwala.ward || '') + '</div></td><td>' + esc(p.material.nameEn) + (p.material.hazard ? ' <span class="pill pill-hazard">Hazard</span>' : '') + '</td><td class="mono nowrap" style="text-align:right">' + h.weightKg + ' → <b>' + TK.qty(h.receivedWeightKg, p.material.unit) + '</b></td><td class="mono" style="text-align:right">₹' + p.rate + '</td><td class="mono" style="text-align:right"><b>' + inr(p.amount) + '</b></td><td class="small">' + esc(p.paymentMode) + '</td><td><a class="mono small" href="../verify.html?hash=' + h.recordHash + '">' + h.recordHash.slice(0, 10) + '…</a></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="center muted" style="padding:40px">No purchases in this period.</div>') + '</div>';
    $('#range').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { days = Number(b.dataset.d); render(); } };
    $('#mat').onchange = function () { matId = this.value; render(); };
    $('#csv').onclick = function () {
      var out = [['confirmed_at', 'pickup_id', 'seller', 'ward', 'material', 'handover_qty', 'received_qty', 'unit', 'rate_inr', 'paid_inr', 'mode', 'record_sha256']].concat(rows.map(function (p) { var h = p.handover; return [h.confirmedAt, p.id, p.kabadiwala.shopName || p.kabadiwala.name, p.kabadiwala.ward || '', p.material.nameEn, h.weightKg, h.receivedWeightKg, p.material.unit, p.rate, p.amount, p.paymentMode, h.recordHash]; }));
      TK.downloadText(out.map(function (x) { return x.map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n') + '\n', 'tolkanta-purchases.csv');
    };
  }
  render(); TK.onDataChange(render);
})();
