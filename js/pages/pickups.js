(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  var id = TK.param('id');
  TK.portalLayout('kabadiwala', 'pickups.html', id ? 'पिकअप #' + esc(id) + ' · Pickup' : 'पिकअप · Pickups', id ? 'Handover, verification and payment for this pickup' : 'Every pickup you booked with an authorised recycler');
  var box = $('#pk'), H = { photo: null, gps: null, weight: '' }, shownStatus = null, filter = 'active';

  /* ---------------- list ---------------- */
  function renderList() {
    var all = TK.try(function () { return TK.api.pickups(); }, box); if (!all) return;
    TK.$('#headRight').innerHTML = '<a class="btn btn-orange" href="sell.html">' + TK.icon('camera') + ' New sale</a>';
    var act = all.filter(function (p) { return ['booked', 'awaiting_confirmation', 'disputed'].indexOf(p.status) >= 0; });
    var rows = filter === 'active' ? act : all;
    box.innerHTML = '<div class="tabs" id="tabs"><button class="tab' + (filter === 'active' ? ' on' : '') + '" data-f="active">चालू · Active (' + act.length + ')</button><button class="tab' + (filter === 'all' ? ' on' : '') + '" data-f="all">सभी · All (' + all.length + ')</button></div>' +
      (rows.length ? '<div class="card table-wrap"><table class="table"><thead><tr><th>#</th><th>Material</th><th>Recycler</th><th>Slot</th><th style="text-align:right">Amount</th><th>Status</th><th></th></tr></thead><tbody>' + rows.map(function (p) {
        return '<tr><td class="mono">' + p.id + '</td><td><b>' + esc(p.material.nameHi) + '</b><div class="tiny muted">' + TK.qty(p.lot.weightKg, p.material.unit) + '</div></td><td>' + esc(p.recycler.name) + '<div class="tiny muted">' + esc(p.recycler.area) + '</div></td><td class="small">' + esc(TK.slot(p.slot).en) + '<div class="tiny muted">' + TK.date(p.createdAt) + '</div></td><td class="mono" style="text-align:right"><b>' + inr(p.amount) + '</b></td><td>' + TK.statusPill(p.status, true) + '</td><td><a class="btn btn-ghost btn-sm" href="pickups.html?id=' + p.id + '">Open ' + TK.icon('chev') + '</a></td></tr>';
      }).join('') + '</tbody></table></div>'
        : '<div class="card center" style="padding:48px 20px"><div style="font-size:40px">🚚</div><h3>' + (filter === 'active' ? 'कोई चालू पिकअप नहीं · No active pickups' : 'No pickups yet') + '</h3><p class="muted">Take a photo of your scrap to get the best authorised price and book a pickup.</p><a class="btn btn-orange" href="sell.html">' + TK.icon('camera') + ' Sell scrap</a></div>');
    $('#tabs').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { filter = b.dataset.f; renderList(); } };
  }

  /* ---------------- detail ---------------- */
  function timeline(p) {
    var st = p.status, steps = [['बुक', 'Booked', true], ['सौंपा', 'Handover recorded', st !== 'booked' && st !== 'cancelled'], ['पुष्टि', 'Recycler confirmed', st === 'confirmed' || st === 'disputed'], ['भुगतान', 'Paid', st === 'confirmed']];
    return '<div class="timeline">' + steps.map(function (s, i) { return (i ? '<span class="ln' + (s[2] ? ' done' : '') + '"></span>' : '') + '<span class="st' + (s[2] ? ' done' : '') + '"><b>' + (s[2] ? '✓' : i + 1) + '</b><span>' + s[0] + ' <span class="tiny" style="font-weight:500">· ' + s[1] + '</span></span></span>'; }).join('') + '</div>';
  }
  function hashBox(h) {
    return '<div class="hash-box"><div class="lbl">' + TK.icon('lock') + ' SHA-256 handover record</div>' + esc(h.recordHash) +
      '<div style="margin-top:10px;color:rgba(255,255,255,.55);font-size:13px">prev ' + esc(h.prevHash.slice(0, 24)) + '… · ' + TK.dateTime(h.capturedAt) + ' · ' + (h.lat != null ? h.lat + ', ' + h.lng : 'no GPS') + '</div></div>' +
      '<div class="row" style="margin-top:10px"><a class="btn btn-ghost btn-sm" href="../verify.html?hash=' + h.recordHash + '">' + TK.icon('shield') + ' Verify publicly</a><button class="btn btn-ghost btn-sm" data-copy="' + h.recordHash + '">Copy hash</button></div>';
  }
  function renderDetail() {
    var p = TK.try(function () { return TK.api.pickup(id); }, box); if (!p) return;
    shownStatus = p.status;
    var m = p.material, h = p.handover, lot = p.lot, s = TK.slot(p.slot);
    TK.$('#headRight').innerHTML = '<a class="btn btn-ghost" href="pickups.html">← All pickups</a>';
    var left = '<div class="card"><div class="row between" style="align-items:flex-start"><div><div class="muted small">Pickup #' + p.id + ' · booked ' + TK.dateTime(p.createdAt) + '</div><h2 style="margin:4px 0 0">' + esc(m.nameHi) + ' <span class="muted" style="font-weight:500;font-size:18px">' + esc(m.nameEn) + '</span></h2></div>' + TK.statusPill(p.status, true) + '</div>' +
      '<table class="table" style="margin-top:12px"><tbody>' +
      '<tr><td class="muted">Recycler</td><td><b>' + esc(p.recycler.name) + '</b><div class="tiny muted">' + esc(p.recycler.area) + ' · CPCB ' + esc(p.recycler.cpcbAuthNo) + '</div></td></tr>' +
      '<tr><td class="muted">Slot · समय</td><td>' + esc(s.hi) + ' · ' + esc(s.en) + '</td></tr>' +
      '<tr><td class="muted">Quantity</td><td class="mono">' + TK.qty(lot.weightKg, m.unit) + ' × ₹' + p.rate + '</td></tr>' +
      '<tr><td class="muted">Payment</td><td>' + esc(p.paymentMode) + '</td></tr>' +
      '<tr><td><b>' + (p.status === 'confirmed' ? 'Paid · मिला' : 'Amount · रकम') + '</b></td><td class="mono" style="color:var(--green);font-size:20px"><b>' + inr(p.amount) + '</b></td></tr></tbody></table>' +
      (lot.photoPath ? '<img src="' + TK.photoSrc(lot.photoPath) + '" alt="Lot photo" style="width:100%;max-height:220px;object-fit:cover;border-radius:14px;margin-top:10px">' : '') + '</div>' +
      (m.hazard ? '<div class="safety"><div class="hazard-stripe"></div><div class="body"><span style="font-size:22px">⚠️</span><div class="small"><b>सावधान: ' + esc(m.safetyHi) + '</b><div class="muted">' + esc(m.safetyEn) + '</div></div></div></div>' : '');

    var right = '';
    if (p.status === 'booked') {
      right = '<div class="card"><h3>सौंपने का रिकॉर्ड · Record the handover</h3><p class="small muted" style="margin-top:0">When the recycler\'s van arrives: take a photo of the goods on the scale. TolKanta hashes photo + GPS + time + weight into a tamper-proof record.</p>' +
        '<label class="dropzone" id="hDrop" style="min-height:200px"><input type="file" accept="image/*" capture="environment" id="hPhoto" class="hidden"><img id="hPrev" class="hidden" alt="Handover photo"><span id="hDropText"><span style="font-size:34px">📷</span><br><b>Handover photo · फोटो लें</b><br><span class="small muted">Click or drop a photo</span></span></label>' +
        (lot.photoPath ? '<button type="button" class="btn btn-ghost btn-sm" id="useLot" style="margin-top:8px">' + TK.icon('image') + ' Demo: reuse the lot photo</button>' : '') +
        '<div class="grid g2" style="margin-top:14px"><label class="field"><span>Handover weight (' + (m.unit === 'pc' ? 'pieces' : 'kg') + ')</span><input class="input mono" id="hW" type="number" step="0.1" min="0" inputmode="decimal" value="' + lot.weightKg + '"></label>' +
        '<div class="field"><span class="small muted" style="display:block;font-weight:600;margin-bottom:6px">Location · GPS</span><div id="hGps" class="small">Finding location…</div></div></div>' +
        '<div id="hErr" style="margin-top:10px"></div><button class="btn btn-primary btn-block" id="hSave" style="margin-top:10px">' + TK.icon('lock') + ' सौंपें और रिकॉर्ड करें · Record handover</button></div>' +
        '<button class="btn btn-danger btn-block" id="cancel">' + TK.icon('x') + ' Cancel pickup</button>';
    } else if (p.status === 'awaiting_confirmation') {
      right = '<div class="alert alert-info">' + TK.icon('truck') + '<span><b>रीसाइक्लर की पुष्टि बाकी · Waiting for the recycler.</b> They will weigh it at the facility and confirm. This page updates by itself.</span></div>' + hashBox(h) + handoverPhoto(h);
    } else if (p.status === 'confirmed') {
      right = '<div class="alert alert-ok">' + TK.icon('check') + '<span><b>भुगतान हो गया · Paid ' + inr(p.amount) + '</b> via ' + esc(p.paymentMode) + '. Recycler confirmed ' + TK.qty(h.receivedWeightKg, m.unit) + ' on ' + TK.dateTime(h.confirmedAt) + '. Added to your ledger and Earnings Passport.</span></div>' + hashBox(h) + handoverPhoto(h);
    } else if (p.status === 'disputed') {
      right = '<div class="alert alert-error">' + TK.icon('alert') + '<span><b>वज़न में अंतर · Weight dispute.</b> You recorded ' + TK.qty(h.weightKg, m.unit) + ', recycler received ' + TK.qty(h.receivedWeightKg, m.unit) + ' (more than 5% apart). The ULB officer will review the photo and hash record.</span></div>' + hashBox(h) + handoverPhoto(h);
    } else {
      right = '<div class="alert alert-warn">' + TK.icon('x') + '<span>This pickup was cancelled. The lot is open again. <a href="sell.html">Sell again →</a></span></div>';
    }
    box.innerHTML = timeline(p) + '<div class="grid g2" style="margin-top:20px;align-items:start"><div class="stack">' + left + '</div><div class="stack">' + right + '</div></div>';
    box.onclick = function (e) { var c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy); } };
    if (p.status === 'booked') wireHandover(p);
  }
  function handoverPhoto(h) { return h.photoPath ? '<div class="card"><h3>Handover photo</h3><img src="' + TK.photoSrc(h.photoPath) + '" alt="Handover photo" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px"><div class="tiny mono muted" style="margin-top:8px;word-break:break-all">photo sha256 ' + esc(h.photoSha256) + '</div></div>' : ''; }
  function copy(t) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { TK.toast('Hash copied'); }, function () { prompt('Copy this hash', t); });
    else { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); TK.toast('Hash copied'); } catch (e) { /* ignore */ } a.remove(); }
  }
  function setPhoto(dataUrl) { H.photo = dataUrl; var img = $('#hPrev'); img.src = dataUrl; img.classList.remove('hidden'); $('#hDropText').classList.add('hidden'); }
  function wireHandover(p) {
    var drop = $('#hDrop'), input = $('#hPhoto');
    if (H.photo) setPhoto(H.photo);
    input.onchange = function () { TK.readPhoto(input.files[0], function (err, d) { if (err) $('#hErr').innerHTML = '<div class="alert alert-error">' + esc(err.message) + '</div>'; else { $('#hErr').innerHTML = ''; setPhoto(d); } }); };
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('drag'); TK.readPhoto(e.dataTransfer.files[0], function (err, d) { if (!err) setPhoto(d); }); });
    if ($('#useLot')) $('#useLot').onclick = function () { setPhoto(TK.photoSrc(p.lot.photoPath)); };
    var g = $('#hGps');
    function showGps() { g.innerHTML = H.gps ? '<span class="mono">' + H.gps.lat.toFixed(5) + ', ' + H.gps.lng.toFixed(5) + '</span><div class="tiny muted">' + (H.gps.source === 'device' ? 'Device GPS' + (H.gps.accuracy ? ' · ±' + Math.round(H.gps.accuracy) + ' m' : '') : 'Registered shop location (GPS unavailable)') + '</div>' : 'Not available'; }
    if (H.gps) showGps();
    else TK.gps(function (pos) { var u = TK.api.me(); H.gps = pos || (u && u.lat != null ? { lat: u.lat, lng: u.lng, source: 'shop' } : null); if ($('#hGps')) showGps(); });
    $('#hSave').onclick = function () {
      var btn = this; btn.disabled = true;
      var hash = TK.try(function () { return TK.api.handover(p.id, { photo: H.photo, weightKg: $('#hW').value, lat: H.gps ? H.gps.lat : null, lng: H.gps ? H.gps.lng : null, gpsSource: H.gps ? H.gps.source : 'none' }); }, $('#hErr'));
      btn.disabled = false;
      if (hash) { TK.toast('हैंडओवर रिकॉर्ड हो गया · Handover recorded'); TK.speak('हैंडओवर रिकॉर्ड हो गया। रीसाइक्लर की पुष्टि का इंतज़ार है।'); renderDetail(); }
    };
    $('#cancel').onclick = function () {
      if (!confirmInline(this)) return;
      if (TK.try(function () { TK.api.cancel(p.id); return true; })) { TK.toast('Pickup cancelled'); renderDetail(); }
    };
  }
  // Two-click confirm without a browser dialog
  function confirmInline(btn) {
    if (btn.dataset.armed) return true;
    btn.dataset.armed = '1'; btn.innerHTML = TK.icon('alert') + ' Click again to cancel this pickup';
    setTimeout(function () { if (btn.isConnected) { delete btn.dataset.armed; btn.innerHTML = TK.icon('x') + ' Cancel pickup'; } }, 4000);
    return false;
  }

  if (id) {
    renderDetail();
    // Another tab (recycler) confirmed? Update without wiping a half-filled handover form
    TK.onDataChange(function () { var p = TK.try(function () { return TK.api.pickup(id); }); if (p && p.status !== shownStatus) { renderDetail(); if (p.status === 'confirmed') { TK.toast('रीसाइक्लर ने पुष्टि की · Recycler confirmed. Paid ' + inr(p.amount)); TK.speak('भुगतान हो गया। ' + Math.round(p.amount) + ' रुपये।'); } } });
  } else { renderList(); TK.onDataChange(renderList); }
})();
