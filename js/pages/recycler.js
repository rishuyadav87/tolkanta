(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  TK.portalLayout('recycler', 'recycler.html', 'पिकअप और तौल · Pickups & weighing', 'Incoming pickups, handover verification, weight confirmation, your live bids and EPR export');
  var tab = TK.param('tab') || 'incoming', verified = {}, drafts = {};

  function head(me) {
    var r = me.recycler;
    TK.$('#headRight').innerHTML = '<span class="status-strip' + (r.pickupAvailable ? '' : ' off') + '">' + (r.pickupAvailable ? '● Pickups on' : '○ Drop-off only') + '</span><button class="btn btn-ghost btn-sm" id="avail">' + (r.pickupAvailable ? 'Pause pickups' : 'Resume pickups') + '</button>';
    $('#avail').onclick = function () { if (TK.try(function () { TK.api.setAvailability(!r.pickupAvailable); return true; })) { TK.toast(r.pickupAvailable ? 'Pickups paused' : 'Pickups resumed'); render(); } };
  }

  function incomingCard(p) {
    var h = p.handover, m = p.material, v = verified[p.id];
    if (p.status === 'booked') {
      return '<div class="card"><div class="row between"><div><b>#' + p.id + ' · ' + esc(m.nameEn) + '</b> <span class="muted">' + esc(m.nameHi) + '</span><div class="small muted">' + esc(p.kabadiwala.name || 'Kabadiwala') + (p.kabadiwala.shopName ? ' · ' + esc(p.kabadiwala.shopName) : '') + ' · ' + esc(p.kabadiwala.ward || '') + '</div></div>' + TK.statusPill(p.status, true) + '</div>' +
        '<div class="row small" style="margin-top:10px;gap:18px"><span>🚚 ' + esc(TK.slot(p.slot).en) + '</span><span class="mono">' + TK.qty(p.lot.weightKg, m.unit) + ' × ₹' + p.rate + ' = ' + inr(p.amount) + '</span><span>' + esc(p.paymentMode) + '</span></div>' +
        '<p class="tiny muted" style="margin:8px 0 0">Waiting for the kabadiwala to record the handover (photo + GPS + weight) when your van arrives.</p></div>';
    }
    return '<div class="card" style="box-shadow:inset 0 0 0 2px var(--orange),var(--shadow)"><div class="row between"><div><b>#' + p.id + ' · ' + esc(m.nameEn) + '</b> <span class="muted">' + esc(m.nameHi) + '</span>' + (m.hazard ? ' <span class="pill pill-hazard">Hazard</span>' : '') + '<div class="small muted">From ' + esc(p.kabadiwala.name || 'Kabadiwala') + (p.kabadiwala.shopName ? ' · ' + esc(p.kabadiwala.shopName) : '') + ' · ' + esc(p.kabadiwala.ward || '') + '</div></div>' + TK.statusPill(p.status, true) + '</div>' +
      '<div class="grid g2" style="margin-top:14px;gap:16px;align-items:start"><div>' + (h.photoPath ? '<img src="' + TK.photoSrc(h.photoPath) + '" alt="Handover photo" style="width:100%;height:180px;object-fit:cover;border-radius:12px">' : '') +
      '<table class="table small" style="margin-top:8px"><tbody><tr><td class="muted">Handover weight</td><td class="mono"><b>' + TK.qty(h.weightKg, m.unit) + '</b></td></tr><tr><td class="muted">Captured</td><td>' + TK.dateTime(h.capturedAt) + '</td></tr><tr><td class="muted">GPS</td><td class="mono">' + (h.lat != null ? h.lat + ', ' + h.lng : '-') + ' <span class="tiny muted">' + esc(h.gpsSource) + '</span></td></tr><tr><td class="muted">Agreed</td><td class="mono">₹' + p.rate + '/' + m.unit + ' · ' + esc(p.paymentMode) + '</td></tr></tbody></table></div>' +
      '<div><div class="hash-box" style="font-size:13px"><div class="lbl">' + TK.icon('lock') + ' Record hash</div>' + esc(h.recordHash) + '</div>' +
      (v ? '<div class="alert ' + (v.ok ? 'alert-ok' : 'alert-error') + '" style="margin-top:10px">' + TK.icon(v.ok ? 'shield' : 'alert') + '<span>' + (v.ok ? '<b>Record verified.</b> Hash recomputed, chain link and photo hash match.' : '<b>Record failed verification.</b> Do not pay; raise a dispute.') + '</span></div>' : '<button class="btn btn-ghost btn-sm btn-block" style="margin-top:10px" data-verify="' + h.recordHash + '" data-id="' + p.id + '">' + TK.icon('shield') + ' Verify record</button>') +
      '<label class="field" style="margin-top:12px"><span>Weight received at facility (' + m.unit + ')</span><input class="input mono" type="number" step="0.1" min="0" inputmode="decimal" data-rw="' + p.id + '" value="' + esc(drafts[p.id] != null ? drafts[p.id] : h.weightKg) + '"></label>' +
      '<div class="tiny muted" style="margin-top:4px">More than 5% below the handover weight opens a dispute for the ULB officer.</div>' +
      '<div data-err="' + p.id + '" style="margin-top:8px"></div><button class="btn btn-primary btn-block" style="margin-top:8px" data-confirm="' + p.id + '">' + TK.icon('check') + ' Confirm and pay ' + inr(p.amount) + '</button></div></div></div>';
  }

  function render() {
    var me = TK.try(function () { return TK.api.recyclerMe(); }, $('#rc')); if (!me) return;
    var all = TK.api.pickups(); head(me);
    var inc = all.filter(function (p) { return p.status === 'awaiting_confirmation' || p.status === 'booked'; }).sort(function (a, b) { return (a.status === 'awaiting_confirmation' ? 0 : 1) - (b.status === 'awaiting_confirmation' ? 0 : 1) || b.id - a.id; });
    var waiting = inc.filter(function (p) { return p.status === 'awaiting_confirmation'; }).length;
    var html = '<div class="grid g4">' +
      '<div class="kpi green"><div class="l">' + esc(me.recycler.name) + '</div><div class="v" style="font-size:20px">CPCB ✓</div><div class="h mono">' + esc(me.recycler.cpcbAuthNo) + '</div></div>' +
      '<div class="kpi"><div class="l">Awaiting your confirmation</div><div class="v">' + waiting + '</div><div class="h">' + (inc.length - waiting) + ' more booked</div></div>' +
      '<div class="kpi"><div class="l">Received (verified)</div><div class="v">' + me.stats.kg + ' kg</div><div class="h">' + me.stats.confirmed + ' handovers</div></div>' +
      '<div class="kpi"><div class="l">Paid to kabadiwalas</div><div class="v">' + inr(me.stats.paid) + '</div></div></div>' +
      '<div class="tabs" id="tabs" style="margin-top:22px">' + [['incoming', 'Incoming (' + inc.length + ')'], ['history', 'History'], ['bids', 'My bids'], ['epr', 'EPR export']].map(function (t) { return '<button class="tab' + (tab === t[0] ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div id="tabBody"></div>';
    $('#rc').innerHTML = html;
    var body = $('#tabBody');

    if (tab === 'incoming') {
      body.innerHTML = inc.length ? '<div class="stack">' + inc.map(incomingCard).join('') + '</div>' : '<div class="card center muted" style="padding:44px">No incoming pickups right now. New bookings from kabadiwalas appear here instantly.</div>';
    } else if (tab === 'history') {
      var hist = all.filter(function (p) { return ['confirmed', 'disputed', 'cancelled'].indexOf(p.status) >= 0; });
      body.innerHTML = '<div class="card table-wrap"><table class="table"><thead><tr><th>#</th><th>Material</th><th>Kabadiwala</th><th>Handover → received</th><th style="text-align:right">Paid</th><th>Status</th><th>Record</th></tr></thead><tbody>' + hist.map(function (p) {
        var h = p.handover;
        return '<tr><td class="mono">' + p.id + '</td><td>' + esc(p.material.nameEn) + '</td><td>' + esc(p.kabadiwala.name || '-') + '<div class="tiny muted">' + esc(p.kabadiwala.ward || '') + '</div></td><td class="mono small">' + (h ? TK.qty(h.weightKg, p.material.unit) + ' → ' + (h.receivedWeightKg != null ? TK.qty(h.receivedWeightKg, p.material.unit) : '-') : '-') + '</td><td class="mono" style="text-align:right">' + (p.status === 'confirmed' ? inr(p.amount) : '-') + '</td><td>' + TK.statusPill(p.status, true) + '</td><td>' + (h ? '<a class="mono small" href="../verify.html?hash=' + h.recordHash + '">' + h.recordHash.slice(0, 10) + '…</a>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>' + (hist.length ? '' : '<div class="center muted" style="padding:30px">No history yet.</div>') + '</div>';
    } else if (tab === 'bids') {
      body.innerHTML = '<form class="card" id="bidForm"><div class="row between"><div><h3 style="margin:0">Live bids · ₹ per unit</h3><p class="small muted" style="margin:4px 0 0">Kabadiwalas see these instantly. The ULB price engine uses the median of all authorised bids for the public board rate.</p></div></div>' +
        '<table class="table" style="margin-top:12px"><thead><tr><th>Material</th><th>Board rate</th><th>Local (kabadi market)</th><th style="width:180px">Your bid</th></tr></thead><tbody>' + me.bids.map(function (b) {
          return '<tr><td><b>' + esc(b.material.nameEn) + '</b> <span class="muted">' + esc(b.material.nameHi) + '</span>' + (b.material.hazard ? ' <span class="pill pill-hazard">Hazard</span>' : '') + '</td><td class="mono">₹' + b.material.boardRate + '/' + b.material.unit + '</td><td class="mono muted">₹' + b.material.localRate + '</td><td><input class="input mono" type="number" min="0" step="1" data-mid="' + b.material.id + '" value="' + b.rate + '" placeholder="not buying"></td></tr>';
        }).join('') + '</tbody></table><div id="bidErr" style="margin-top:10px"></div><button class="btn btn-primary" style="margin-top:10px">' + TK.icon('check') + ' Publish bids</button></form>';
      $('#bidForm').onsubmit = function (e) {
        e.preventDefault();
        var list = TK.$$('[data-mid]').map(function (i) { return { materialId: Number(i.dataset.mid), rate: i.value === '' ? '' : Number(i.value) }; });
        if (TK.try(function () { TK.api.saveBids(list); return true; }, $('#bidErr'))) TK.toast('Bids published to kabadiwalas');
      };
    } else {
      var csv = TK.api.eprCsv(), n = csv.trim().split('\n').length - 1;
      body.innerHTML = '<div class="card"><h3>EPR evidence export</h3><p class="small muted" style="margin-top:0">One row per confirmed handover with its SHA-256 record hash and the previous hash, so a producer or CPCB auditor can re-check the chain. Only CPCB-registered recyclers can issue EPR certificates; this file is the traceable evidence behind them.</p>' +
        '<div class="row"><button class="btn btn-primary" id="dl">' + TK.icon('download') + ' Download CSV (' + n + ' rows)</button><a class="btn btn-ghost" href="../verify.html">' + TK.icon('shield') + ' Open public verifier</a></div>' +
        '<pre class="mono tiny" style="margin-top:14px;background:#F6F8F7;border-radius:12px;padding:12px;overflow:auto;max-height:260px">' + esc(csv.split('\n').slice(0, 8).join('\n')) + (n > 7 ? '\n…' : '') + '</pre></div>';
      $('#dl').onclick = function () { TK.downloadText(csv, 'tolkanta-epr-' + new Date().toISOString().slice(0, 10) + '.csv'); };
    }

    $('#tabs').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { tab = b.dataset.t; render(); } };
    body.oninput = function (e) { if (e.target.dataset.rw) drafts[e.target.dataset.rw] = e.target.value; };
    body.onclick = function (e) {
      var vb = e.target.closest('[data-verify]');
      if (vb) { var r = TK.try(function () { return TK.api.publicVerify(vb.dataset.verify); }); if (r) { verified[vb.dataset.id] = r; render(); } return; }
      var cb = e.target.closest('[data-confirm]');
      if (cb) {
        var id = cb.dataset.confirm, rw = $('[data-rw="' + id + '"]').value;
        var res = TK.try(function () { return TK.api.confirm(id, rw); }, $('[data-err="' + id + '"]'));
        if (res) { delete drafts[id]; TK.toast(res.mismatch ? 'Weight differs by more than 5%. Sent to the ULB officer as a dispute.' : 'Confirmed. ' + inr(res.amount) + ' paid to the kabadiwala.', res.mismatch); render(); }
      }
    };
  }
  render();
  TK.onDataChange(function () { if (tab === 'bids' && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.mid) return; render(); });
})();
