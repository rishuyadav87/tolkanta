(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  TK.portalLayout('admin', 'admin.html', 'ULB control room', 'Ward-level impact, price engine, recycler registry and audit. SWM Rules 2026 · EPR evidence');
  var tab = TK.param('tab') || 'impact', chain = null;
  TK.$('#headRight').innerHTML = '<a class="btn btn-ghost btn-sm" href="../impact.html">' + TK.icon('globe') + ' Public impact page</a>';

  function tabs() {
    return '<div class="tabs" id="tabs">' + [['impact', 'Impact'], ['prices', 'Price engine'], ['recyclers', 'Recyclers'], ['disputes', 'Disputes'], ['audit', 'Audit & EPR']].map(function (t) { return '<button class="tab' + (tab === t[0] ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
  }

  function impact(box) {
    var o = TK.try(function () { return TK.api.adminOverview(); }, box); if (!o) return;
    var k = o.kpis, maxQ = Math.max.apply(null, [1].concat(o.byMaterial.filter(function (b) { return b.material.unit === 'kg'; }).map(function (b) { return b.qty; })));
    box.innerHTML = '<div class="grid g4">' +
      '<div class="kpi green"><div class="l">E-waste diverted to authorised recyclers</div><div class="v">' + k.kgDiverted + ' kg</div><div class="h">' + k.confirmed + ' verified handovers</div></div>' +
      '<div class="kpi"><div class="l">Paid to kabadiwalas</div><div class="v">' + inr(k.paid) + '</div><div class="h">' + (k.upliftPct != null ? '+' + k.upliftPct + '% vs local kabadi rate' : '') + '</div></div>' +
      '<div class="kpi"><div class="l">Kabadiwalas on-boarded</div><div class="v">' + k.kabadiwalas + '</div><div class="h">' + k.eshramLinked + ' linked to e-Shram</div></div>' +
      '<div class="kpi"><div class="l">Open · Disputed</div><div class="v">' + k.open + ' · <span style="color:' + (k.disputed ? 'var(--red)' : 'inherit') + '">' + k.disputed + '</span></div><div class="h">' + k.recyclers + ' authorised recyclers</div></div></div>' +
      (o.disputes.length ? '<div class="card" style="margin-top:20px;box-shadow:inset 0 0 0 2px var(--red),var(--shadow)"><h3>' + TK.icon('alert') + ' Weight disputes for review</h3>' + o.disputes.map(function (p) {
        var h = p.handover;
        return '<div class="list-item"><span class="ic" style="background:rgba(180,68,44,.1);color:var(--red)">' + TK.icon('alert') + '</span><span class="grow"><span class="t">#' + p.id + ' · ' + esc(p.material.nameEn) + ' · ' + esc(p.kabadiwala.name || '') + ' → ' + esc(p.recycler.name) + '</span><div class="s mono">handed over ' + TK.qty(h.weightKg, p.material.unit) + ' · received ' + TK.qty(h.receivedWeightKg, p.material.unit) + ' · <a href="../verify.html?hash=' + h.recordHash + '">record ' + h.recordHash.slice(0, 10) + '…</a></div></span><button class="btn btn-primary btn-sm" data-resolve="' + p.id + '">Settle on received weight</button></div>';
      }).join('') + '</div>' : '') +
      '<div class="grid g2" style="margin-top:20px;align-items:start"><div class="card"><h3>By material (confirmed)</h3>' + o.byMaterial.map(function (b) {
        return '<div class="small" style="margin-top:12px"><div class="row between"><span><b>' + esc(b.material.nameEn) + '</b> ' + (b.material.hazard ? '<span class="pill pill-hazard">Hazard</span>' : '') + '</span><span class="mono muted">' + TK.qty(b.qty, b.material.unit) + ' · ' + inr(b.paid) + '</span></div>' + (b.material.unit === 'kg' ? '<div class="bar" style="margin-top:4px"><i style="width:' + (b.qty / maxQ * 100) + '%"></i></div>' : '') + '</div>';
      }).join('') + '</div>' +
      '<div class="stack"><div class="card"><h3>By ward</h3><table class="table"><thead><tr><th>Ward</th><th>Kabadiwalas</th><th>Verified pickups</th></tr></thead><tbody>' + o.byWard.map(function (w) { return '<tr><td>' + esc(w.ward) + '</td><td class="mono">' + w.workers + '</td><td class="mono">' + w.pickups + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="card"><h3>Latest pickups</h3>' + o.recent.slice(0, 8).map(function (p) { return '<div class="list-item"><span class="grow"><span class="t">#' + p.id + ' · ' + esc(p.material.nameEn) + ' · ' + TK.qty(p.lot.weightKg, p.material.unit) + '</span><div class="s">' + esc(p.kabadiwala.name || '-') + ' → ' + esc(p.recycler.name) + ' · ' + TK.date(p.createdAt) + '</div></span>' + TK.statusPill(p.status, true) + '</div>'; }).join('') + '</div></div></div>';
  }

  function prices(box) {
    var d = TK.try(function () { return TK.api.adminMaterials(); }, box); if (!d) return;
    box.innerHTML = '<div class="card"><div class="row between"><div><h3 style="margin:0">Public board rates</h3><p class="small muted" style="margin:4px 0 0">Board rate = median of live bids from authorised recyclers. Kabadiwalas, the IVR line and the WhatsApp bot all read this board.</p></div><button class="btn btn-orange" id="recompute">' + TK.icon('refresh') + ' Recompute from bids</button></div>' +
      '<div class="table-wrap"><table class="table" style="margin-top:12px"><thead><tr><th>Material</th><th>Bids (min–max)</th><th>Board ₹</th><th>Local ₹</th><th></th></tr></thead><tbody>' + d.materials.map(function (m) {
        return '<tr><td><b>' + esc(m.nameEn) + '</b> <span class="muted">' + esc(m.nameHi) + '</span><div class="tiny muted mono">' + m.code + ' · per ' + m.unit + (m.delta ? ' · ' + (m.delta > 0 ? '▲' : '▼') + ' ₹' + Math.abs(m.delta) : '') + '</div></td><td class="mono small">' + (m.bidCount ? '₹' + m.bidMin + '–' + m.bidMax + ' <span class="muted">(' + m.bidCount + ')</span>' : '<span class="muted">no bids</span>') + '</td>' +
          '<td style="width:120px"><input class="input mono" type="number" min="0" step="1" value="' + m.boardRate + '" data-b="' + m.id + '"></td><td style="width:120px"><input class="input mono" type="number" min="0" step="1" value="' + m.localRate + '" data-l="' + m.id + '"></td><td><button class="btn btn-ghost btn-sm" data-save="' + m.id + '">Save</button></td></tr>';
      }).join('') + '</tbody></table></div><div id="prErr"></div></div>' +
      '<div class="card" style="margin-top:20px"><h3>Rate history (latest 30)</h3><div class="table-wrap"><table class="table"><thead><tr><th>When</th><th>Material</th><th>Rate</th><th>Source</th></tr></thead><tbody>' + d.history.map(function (h) { return '<tr><td class="small">' + TK.dateTime(h.at) + '</td><td class="mono">' + h.code + '</td><td class="mono">₹' + h.rate + '</td><td><span class="pill ' + (h.source === 'admin' ? 'pill-orange' : h.source === 'seed' ? 'pill-grey' : 'pill-green') + '">' + esc(h.source) + '</span></td></tr>'; }).join('') + '</tbody></table></div></div>';
    $('#recompute').onclick = function () { var n = TK.try(function () { return TK.api.recompute(); }, $('#prErr')); if (n !== undefined) { TK.toast(n ? n + ' board rate(s) updated from bids' : 'Board already matches the median of bids'); render(); } };
    box.querySelector('tbody').onclick = function (e) {
      var b = e.target.closest('[data-save]'); if (!b) return; var id = b.dataset.save;
      if (TK.try(function () { TK.api.setRates(Number(id), $('[data-b="' + id + '"]').value, $('[data-l="' + id + '"]').value); return true; }, $('#prErr'))) { TK.toast('Rates saved'); render(); }
    };
  }

  function recyclers(box) {
    var list = TK.try(function () { return TK.api.adminRecyclers(); }, box); if (!list) return;
    box.innerHTML = '<div class="grid" style="grid-template-columns:minmax(0,1fr) 340px;gap:20px;align-items:start" id="rg"><div class="card table-wrap"><h3>Recycler registry</h3><table class="table"><thead><tr><th>Facility</th><th>CPCB authorisation</th><th>Pickups</th><th>Status</th><th></th></tr></thead><tbody>' + list.map(function (r) {
      return '<tr><td><b>' + esc(r.name) + '</b><div class="tiny muted">' + esc(r.area) + ' · ★ ' + r.rating + '</div></td><td class="mono small">' + esc(r.cpcbAuthNo) + '</td><td class="small">' + (r.pickupAvailable ? 'Doorstep' : 'Drop-off') + '</td><td>' + (r.verified ? '<span class="pill pill-green">Authorised</span>' : '<span class="pill pill-grey">Not verified</span>') + '</td><td><button class="btn btn-sm ' + (r.verified ? 'btn-danger' : 'btn-primary') + '" data-toggle="' + r.id + '">' + (r.verified ? 'Suspend' : 'Verify') + '</button></td></tr>';
    }).join('') + '</tbody></table><p class="tiny muted" style="margin:10px 0 0">Only verified recyclers appear to kabadiwalas and count toward the board rate. In production this list syncs with the CPCB registry of 320+ registered recyclers.</p></div>' +
      '<form class="card" id="addRec" novalidate><h3>Add a recycler</h3>' + [['name', 'Facility name'], ['area', 'Area'], ['cpcbAuthNo', 'CPCB authorisation no.'], ['lat', 'Latitude'], ['lng', 'Longitude']].map(function (f) { return '<label class="field" style="margin-top:10px"><span>' + f[1] + '</span><input class="input' + (f[0] === 'lat' || f[0] === 'lng' || f[0] === 'cpcbAuthNo' ? ' mono' : '') + '" name="' + f[0] + '"' + (f[0] === 'lat' ? ' value="28.46"' : f[0] === 'lng' ? ' value="77.03"' : '') + '></label>'; }).join('') +
      '<div id="arErr" style="margin-top:10px"></div><button class="btn btn-primary btn-block" style="margin-top:10px">Add (unverified)</button></form></div>';
    if (window.innerWidth < 960) $('#rg').style.gridTemplateColumns = '1fr';
    box.querySelector('tbody').onclick = function (e) { var b = e.target.closest('[data-toggle]'); if (b && TK.try(function () { TK.api.toggleRecycler(b.dataset.toggle); return true; })) { TK.toast('Registry updated'); render(); } };
    $('#addRec').onsubmit = function (e) {
      e.preventDefault(); var f = {}; TK.$$('#addRec input').forEach(function (i) { f[i.name] = i.value.trim(); });
      if (TK.try(function () { TK.api.addRecycler(f); return true; }, $('#arErr'))) { TK.toast('Recycler added. Verify it to make it visible.'); render(); }
    };
  }

  function audit(box) {
    var csv = TK.api.eprCsv(), n = csv.trim().split('\n').length - 1;
    box.innerHTML = '<div class="grid g2" style="align-items:start"><div class="card"><h3>' + TK.icon('lock') + ' Hash-chain audit</h3><p class="small muted" style="margin-top:0">Recomputes the SHA-256 of every handover record and checks that each one points to the previous record. Any edit to a past weight, time, GPS or photo breaks the chain from that point on.</p>' +
      '<button class="btn btn-primary" id="runAudit">' + TK.icon('shield') + ' Run full audit</button><div id="auditOut" style="margin-top:14px"></div></div>' +
      '<div class="stack"><div class="card"><h3>EPR evidence (all recyclers)</h3><p class="small muted" style="margin-top:0">' + n + ' confirmed handovers with record and previous hashes, ready for producers and CPCB. EPR targets are 70% now, rising to 80% from 2027-28.</p><div class="row"><button class="btn btn-ghost" id="dl">' + TK.icon('download') + ' Download EPR CSV</button><button class="btn btn-primary" id="dlCpcb">' + TK.icon('download') + ' CPCB EPR निर्यात · CPCB EPR Export</button></div></div>' +
      '<div class="card" style="background:var(--cream)"><h3>Demo controls</h3><p class="small" style="margin-top:0">Restore the original demo data (3 recyclers, 5 months of verified history). Everyone is logged out.</p><button class="btn btn-danger" id="reset">' + TK.icon('refresh') + ' Reset demo data</button></div></div></div>';
    function showChain() {
      if (!chain) return;
      $('#auditOut').innerHTML = '<div class="alert ' + (chain.ok ? 'alert-ok' : 'alert-error') + '">' + TK.icon(chain.ok ? 'check' : 'alert') + '<span><b>' + (chain.ok ? 'Chain intact.' : 'Chain broken.') + '</b> ' + chain.count + ' records checked in ' + chain.ms + ' ms.</span></div>' +
        '<div class="table-wrap" style="max-height:320px;overflow:auto;margin-top:10px"><table class="table small"><thead><tr><th>#</th><th>Pickup</th><th>Record hash</th><th>Result</th></tr></thead><tbody>' + chain.results.slice().reverse().map(function (r) { return '<tr><td class="mono">' + r.id + '</td><td class="mono">' + r.pickupId + '</td><td class="mono"><a href="../verify.html?hash=' + r.recordHash + '">' + r.recordHash.slice(0, 16) + '…</a></td><td>' + (r.ok ? '<span class="pill pill-green">✓ ok</span>' : '<span class="pill pill-red">✗ ' + Object.keys(r.checks).filter(function (c) { return !r.checks[c]; }).join(', ') + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    $('#runAudit').onclick = function () { var t = performance.now(); chain = TK.api.verifyChain(); chain.ms = Math.max(1, Math.round(performance.now() - t)); showChain(); };
    showChain();
    $('#dl').onclick = function () { TK.downloadText(csv, 'tolkanta-epr-all-' + new Date().toISOString().slice(0, 10) + '.csv'); };
    $('#dlCpcb').onclick = function () { TK.downloadText(TK.api.cpcbEprCsv(), 'cpcb-epr-export-' + new Date().toISOString().slice(0, 10) + '.csv'); };
    $('#reset').onclick = function () {
      var b = this; if (!b.dataset.armed) { b.dataset.armed = 1; b.innerHTML = TK.icon('alert') + ' Click again to reset everything'; setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.innerHTML = TK.icon('refresh') + ' Reset demo data'; } }, 4000); return; }
      TK.api.resetDemo(); location.href = '../index.html';
    };
  }

  // Dispute resolution panel
  function disputes(box) {
    var o = TK.try(function () { return TK.api.adminOverview(); }, box); if (!o) return;
    var all = o.disputes || [], resolved = (o.recent || []).filter(function (p) { return p.status === 'confirmed' && p.handover && p.handover.receivedWeightKg && p.handover.receivedWeightKg !== p.handover.weightKg; });
    box.innerHTML = '<div class="card">' +
      '<h3>' + TK.icon('alert') + ' Active weight disputes (' + all.length + ')</h3>' +
      '<p class="small muted" style="margin-top:0">When a recycler\'s calibrated scale reads more than ±5% from the kabadiwala\'s declared weight, the system creates a dispute. The ULB officer reviews evidence from both parties and settles.</p>' +
      (all.length === 0 ? '<div class="alert alert-ok">' + TK.icon('check') + '<span>No active disputes. All handovers are within the ±5% tolerance band.</span></div>' : '') +
      all.map(function (p) {
        var h = p.handover, diff = h.receivedWeightKg - h.weightKg, pct = Math.round(diff / h.weightKg * 100);
        return '<div class="card" style="margin-top:12px;box-shadow:inset 0 0 0 2px var(--red),var(--shadow)">' +
          '<div class="row between"><h4 style="margin:0">Pickup #' + p.id + ' · ' + esc(p.material.nameEn) + '</h4><span class="pill pill-red">Disputed</span></div>' +
          '<div class="grid g2" style="margin-top:12px;gap:16px">' +
          '<div><div class="small muted">Seller (kabadiwala)</div><div class="mono" style="font-size:18px">' + TK.qty(h.weightKg, p.material.unit) + '</div><div class="small">' + esc(p.kabadiwala.name || 'Unknown') + '</div>' + (p.lot && p.lot.gps ? '<div class="tiny muted mono">GPS: ' + p.lot.gps.lat.toFixed(4) + ', ' + p.lot.gps.lon.toFixed(4) + '</div>' : '') + '</div>' +
          '<div><div class="small muted">Buyer (recycler calibrated scale)</div><div class="mono" style="font-size:18px;color:var(--red)">' + TK.qty(h.receivedWeightKg, p.material.unit) + '</div><div class="small">' + esc(p.recycler.name) + '</div><div class="tiny muted">CPCB: ' + esc(p.recycler.cpcbAuthNo || 'N/A') + '</div></div>' +
          '</div>' +
          '<div style="margin-top:12px;padding:10px;background:rgba(180,68,44,.06);border-radius:8px">' +
          '<div class="small"><b>Discrepancy:</b> <span style="color:var(--red)">' + (diff > 0 ? '+' : '') + diff.toFixed(1) + ' ' + p.material.unit + ' (' + (pct > 0 ? '+' : '') + pct + '%)</span></div>' +
          '<div class="small" style="margin-top:4px"><b>Tolerance band:</b> ±5% (' + (h.weightKg * 0.95).toFixed(1) + ' – ' + (h.weightKg * 1.05).toFixed(1) + ' ' + p.material.unit + ')</div>' +
          '<div class="small" style="margin-top:4px"><b>Record hash:</b> <a class="mono" href="../verify.html?hash=' + h.recordHash + '">' + h.recordHash.slice(0, 16) + '…</a></div>' +
          '</div>' +
          '<div class="row" style="margin-top:12px;gap:8px">' +
          '<button class="btn btn-primary btn-sm" data-resolve="' + p.id + '">Accept recycler weight (' + TK.qty(h.receivedWeightKg, p.material.unit) + ')</button>' +
          '<button class="btn btn-ghost btn-sm" data-resolve="' + p.id + '">Accept seller weight (' + TK.qty(h.weightKg, p.material.unit) + ')</button>' +
          '</div></div>';
      }).join('') +
      '</div>' +
      '<div class="card" style="margin-top:20px"><h3>Recently resolved disputes</h3>' +
      (resolved.length === 0 ? '<p class="muted small">No resolved disputes yet.</p>' : '<table class="table small"><thead><tr><th>Pickup</th><th>Material</th><th>Declared</th><th>Received</th><th>Settled</th><th>Hash</th></tr></thead><tbody>' +
      resolved.slice(0, 15).map(function (p) {
        var h = p.handover;
        return '<tr><td class="mono">#' + p.id + '</td><td>' + esc(p.material.nameEn) + '</td><td class="mono">' + TK.qty(h.weightKg, p.material.unit) + '</td><td class="mono">' + TK.qty(h.receivedWeightKg, p.material.unit) + '</td><td><span class="pill pill-green">Settled</span></td><td class="mono"><a href="../verify.html?hash=' + h.recordHash + '">' + h.recordHash.slice(0, 10) + '…</a></td></tr>';
      }).join('') + '</tbody></table>') +
      '</div>' +
      '<div class="card" style="margin-top:20px;background:var(--cream)">' +
      '<h3>Form 6 · Hazardous waste transport manifests</h3>' +
      '<p class="small muted" style="margin-top:0">Under E-Waste (Management) Rules 2022, transporting >100 kg of hazardous e-waste across municipal lines requires a Form 6 transport manifest. TolKanta auto-generates these for qualifying pickups.</p>' +
      '<button class="btn btn-ghost" id="dlForm6">' + TK.icon('download') + ' Download Form 6 manifest (CSV)</button>' +
      '</div>';
    // Wire resolve buttons
    var rs = TK.$$('[data-resolve]', box);
    rs.forEach(function (b) { b.onclick = function () { if (TK.try(function () { TK.api.resolveDispute(b.dataset.resolve); return true; })) { TK.toast('Dispute settled'); render(); } }; });
    // Form 6 download
    var f6 = box.querySelector('#dlForm6');
    if (f6) f6.onclick = function () {
      var haz = (o.recent || []).filter(function (p) { return p.material && p.material.hazard && p.handover; });
      var csv = 'Sl.No,Date,Material,CPCB_Code,Quantity_Kg,Origin_GPS,Destination_Facility,Recycler_CPCB_Reg,Hazard_Type,Transport_Mode,Record_Hash\n';
      haz.forEach(function (p, i) {
        var h = p.handover, gps = p.lot && p.lot.gps ? p.lot.gps.lat + '/' + p.lot.gps.lon : 'N/A';
        csv += (i + 1) + ',' + TK.date(h.at || p.createdAt) + ',"' + p.material.nameEn + '",' + (p.material.cpcbCode || p.material.code) + ',' + h.weightKg + ',' + gps + ',"' + p.recycler.name + '",' + (p.recycler.cpcbAuthNo || '') + ',' + (p.material.nameEn.match(/batter/i) ? 'Li-ion fire risk' : p.material.nameEn.match(/CRT/i) ? 'Lead/Mercury' : 'Heavy metals') + ',Authorised vehicle,' + h.recordHash + '\n';
      });
      TK.downloadText(csv, 'tolkanta-form6-' + new Date().toISOString().slice(0, 10) + '.csv');
    };
  }

  function render() {
    var main = $('#ad');
    main.innerHTML = tabs() + '<div id="tabBody"></div>';
    var box = $('#tabBody');
    ({ impact: impact, prices: prices, recyclers: recyclers, disputes: disputes, audit: audit }[tab] || impact)(box);
    $('#tabs').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { tab = b.dataset.t; history.replaceState(null, '', '?tab=' + tab); render(); } };
    box.onclick = box.onclick || null;
    var rs = TK.$$('[data-resolve]', box);
    rs.forEach(function (b) { b.onclick = function () { if (TK.try(function () { TK.api.resolveDispute(b.dataset.resolve); return true; })) { TK.toast('Dispute settled on the received weight'); render(); } }; });
  }
  render();
  TK.onDataChange(function () { var a = document.activeElement; if (a && a.tagName === 'INPUT') return; if (tab === 'impact') render(); });
})();
