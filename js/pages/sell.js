(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  var u = TK.portalLayout('kabadiwala', 'sell.html', 'कबाड़ बेचें · Sell scrap', 'Photo → category → weight → best price → authorised recycler → pickup');
  var S = { step: 1, photo: null, ai: null, code: null, weight: '', lotId: null, data: null, sort: 'rate', from: null };
  var materials = TK.api.materials();
  var STEPS = ['Photo & category', 'Weight', 'Best price', 'Recycler', 'Book pickup'];

  function go(n) {
    S.step = n;
    $('#steps').innerHTML = STEPS.map(function (s, i) { return '<span class="' + (i + 1 === n ? 'on' : i + 1 < n ? 'done' : '') + '"><b>' + (i + 1 < n ? '✓' : i + 1) + '</b>' + s + '</span>'; }).join('');
    for (var i = 1; i <= 5; i++) $('#s' + i).classList.toggle('hidden', i !== n);
    $('#wizErr').innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === 3) renderQuote();
    if (n === 4) renderRecyclers();
  }
  var mat = function () { return materials.find(function (m) { return m.code === S.code; }); };

  /* ---------- Step 1: photo + AI suggestion + category ---------- */
  function renderChips() {
    $('#matChips').innerHTML = materials.map(function (m) { return '<button type="button" class="chip' + (S.code === m.code ? ' on' : '') + '" data-code="' + m.code + '">' + esc(m.nameHi.split(' / ')[0]) + (m.hazard ? ' ⚠' : '') + '</button>'; }).join('');
    var m = mat();
    $('#hazardBox').innerHTML = m ? '<div class="safety"><div class="hazard-stripe"></div><div class="body"><span style="font-size:22px">' + (m.hazard ? '⚠️' : '💡') + '</span><div class="small"><b>' + (m.hazard ? 'सावधान: ' : 'सुझाव: ') + esc(m.safetyHi) + '</b><div class="muted">' + esc(m.safetyEn) + '</div></div></div></div>' : '';
    $('#toStep2').disabled = !m;
  }
  $('#matChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) { S.code = b.dataset.code; renderChips(); } });
  $('#listen1').innerHTML = TK.listenBtn('l1');
  $('#l1') && ($('#l1').onclick = function () { var m = mat(); TK.speak(m ? m.nameHi + '। आज का दाम ' + m.boardRate + ' रुपये। ' + m.safetyHi : 'फोटो लें या सामान चुनें।'); });

  // On-device model (TensorFlow.js MobileNet), loaded only when a photo is added
  var RULES = [[/cellular telephone|dial telephone|ipod|hand-held computer/i, 'PHONE'], [/laptop|notebook/i, 'LAPTOP'], [/television|monitor|screen|desktop computer/i, 'CRT'],
    [/hard disc|modem|oscilloscope|cd player|tape player|radio|amplifier/i, 'PCB'], [/coil|spiral/i, 'CU_WIRE'], [/keyboard|space bar|mouse|remote control|joystick|printer|loudspeaker|switch|plug|electric fan|iron/i, 'MIXED']];
  var modelP = null;
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function loadModel() {
    if (!modelP) modelP = loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js')
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'); })
      .then(function () { return window.mobilenet.load({ version: 2, alpha: 0.5 }); });
    modelP.catch(function () { modelP = null; });
    return modelP;
  }
  function classify(img) {
    var timeout = new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 15000); });
    return Promise.race([loadModel(), timeout]).then(function (model) { return model.classify(img, 5); }).then(function (preds) {
      for (var i = 0; i < preds.length; i++) { var r = RULES.find(function (x) { return x[0].test(preds[i].className); }); if (r && preds[i].probability >= 0.05) return { code: r[1], confidence: preds[i].probability, label: preds[i].className.split(',')[0] }; }
      return { code: null, label: preds[0] ? preds[0].className.split(',')[0] : null };
    }).catch(function () { return null; });
  }
  function onFile(file) {
    TK.readPhoto(file, function (err, dataUrl) {
      if (err) { $('#wizErr').innerHTML = '<div class="alert alert-error">' + esc(err.message) + '</div>'; return; }
      S.photo = dataUrl; var img = $('#preview');
      img.src = dataUrl; img.classList.remove('hidden'); $('#dropText').classList.add('hidden');
      $('#scan').classList.remove('hidden'); $('#aiTag').classList.add('hidden');
      $('#aiMsg').textContent = 'पहचान रहे हैं… Identifying on this device';
      img.onload = function () {
        TK.perceptualHash(img, function (hash) {
          S.photoHash = hash;
          var isDup = TK.isDuplicatePhoto(hash);
          TK.checkPhotoFreshness(file, function (info) {
            var box = $('#fraudWarning');
            if (!box) {
              box = document.createElement('div');
              box.id = 'fraudWarning';
              box.style.marginTop = '12px';
              $('#scan').parentNode.insertBefore(box, $('#scan').nextSibling);
            }
            if (isDup) {
              box.innerHTML = '<div class="alert alert-error" style="background:#FFEBEB;color:#D32F2F;border:none">🔴 चेतावनी: यह फोटो पहले उपयोग की जा चुकी है · Warning: This photo may have been used before</div>';
              S.fraudWarning = 'Duplicate photo detected';
            } else if (!info.fresh) {
              box.innerHTML = '<div class="alert alert-warning" style="background:#FFF9C4;color:#F57F17;border:none">🟡 चेतावनी: फोटो पुरानी लगती है · Warning: Photo appears old</div>';
              S.fraudWarning = 'Photo missing EXIF or old timestamp';
            } else {
              box.innerHTML = '<div class="alert alert-success" style="background:#E8F5E9;color:#388E3C;border:none">🟢 फोटो सत्यापित · Photo verified</div>';
              S.fraudWarning = null;
            }
          });
        });
        classify(img).then(function (r) {
          $('#scan').classList.add('hidden'); S.ai = r;
          if (r && r.code) {
            S.code = r.code; var m = mat();
            $('#aiTag').textContent = m.nameHi.split(' / ')[0] + ' · ' + Math.round(r.confidence * 100) + '%'; $('#aiTag').classList.remove('hidden');
            $('#aiMsg').textContent = 'AI सुझाव: ' + m.nameEn + '. सही नहीं? नीचे से बदलें। · AI suggests, you decide.';
          } else if (r) $('#aiMsg').textContent = 'AI पहचान नहीं पाया' + (r.label ? ' ("' + r.label + '")' : '') + '। नीचे से खुद चुनें। · Choose manually.';
          else $('#aiMsg').textContent = 'AI मॉडल लोड नहीं हुआ (नेटवर्क?)। नीचे से खुद चुनें। · Model unavailable, choose manually.';
          renderChips();
        });
      };
    });
  }
  $('#photoInput').setAttribute('capture', 'environment');
  $('#photoInput').addEventListener('change', function (e) { var f = e.target.files[0]; e.target.value = ''; if (f) onFile(f); });
  var drop = $('#drop');
  ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
  drop.addEventListener('drop', function (e) { var f = e.dataTransfer.files[0]; if (f) onFile(f); });
  $('#toStep2').addEventListener('click', function () { go(2); updateEstimate(); $('#weight').focus(); });

  /* ---------- Step 2: weight ---------- */
  function updateEstimate() {
    var m = mat(), w = Number($('#weight').value) || 0;
    $('#unitHint').textContent = m.unit === 'pc' ? 'How many pieces? · कितने पीस?' : 'Weight in kg on your kanta · किलो में वज़न';
    $('#estimate').textContent = inr(m.boardRate * w);
    $('#estRate').textContent = m.nameEn + ' @ ₹' + m.boardRate + '/' + m.unit;
    $('#toStep3').disabled = !(w > 0);
  }
  $('#weight').addEventListener('input', function (e) { e.target.value = e.target.value.replace(/[^\d.]/g, ''); updateEstimate(); });
  var stepBy = function (d) { var m = mat(), s = m.unit === 'pc' ? 1 : 0.1, v = Math.max(0, Math.round(((Number($('#weight').value) || 0) + d * s) * 10) / 10); $('#weight').value = v; updateEstimate(); };
  $('#minus').onclick = function () { stepBy(-1); }; $('#plus').onclick = function () { stepBy(1); };
  $('#mic').innerHTML = TK.icon('mic');
  if (!TK.canHear) $('#mic').classList.add('hidden');
  $('#mic').onclick = function () {
    var b = $('#mic'); b.classList.add('listening'); $('#micMsg').textContent = 'बोलिए… (e.g. "चार पॉइंट दो")';
    TK.hearNumber(function (err, n, heard) { b.classList.remove('listening'); if (err) { $('#micMsg').textContent = err.message; return; } $('#weight').value = n; $('#micMsg').textContent = 'सुना: "' + heard + '"'; updateEstimate(); });
  };
  $('#back1').onclick = function () { go(1); };
  $('#toStep3').onclick = function () {
    var id = TK.try(function () { return TK.api.createLot({ materialId: mat().id, weightKg: Number($('#weight').value), photo: S.photo, aiLabel: S.ai && S.ai.label, aiConfidence: S.ai && S.ai.code === S.code ? S.ai.confidence : null, photoHash: S.photoHash, fraudWarning: S.fraudWarning }); }, $('#wizErr'));
    if (id) { S.lotId = id; go(3); }
  };

  /* ---------- Step 3: quote ---------- */
  function renderQuote() {
    var d = TK.try(function () { return TK.api.lot(S.lotId, S.from); }, $('#quote')); if (!d) return;
    S.data = d;
    var q = d.quote, m = d.material, w = d.lot.weightKg, max = Math.max(q.bestAmount, q.localAmount, 1);
    $('#quote').innerHTML = '<div class="grid g2" style="align-items:start"><div class="stack">' +
      '<div class="estimate rise" style="display:flex;gap:16px;align-items:center"><div style="flex:1"><div class="small" style="opacity:.8">सबसे अच्छी अधिकृत बोली · Best authorised bid</div><div class="v">' + inr(q.bestAmount) + '</div><div class="small" style="opacity:.8">₹' + q.bestRate + '/' + m.unit + (q.bestRecycler ? ' · ' + esc(q.bestRecycler.name) + (q.bestRecycler.distanceKm != null ? ' · ' + q.bestRecycler.distanceKm + ' km' : '') : '') + '</div></div>' +
        (d.lot.photoPath ? '<img src="' + TK.photoSrc(d.lot.photoPath) + '" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:12px">' : '') + '</div>' +
      '<div class="card"><div class="row between"><h3 style="margin:0">तुलना · Compare</h3>' + TK.listenBtn('lq') + '</div>' +
        [['लोकल बिचौलिया · Typical local rate', q.localAmount, q.localRate, 'grey'], ['TolKanta (authorised)', q.bestAmount, q.bestRate, 'orange']].map(function (x) {
          return '<div style="margin-top:14px"><div class="row between small muted"><span>' + x[0] + '</span><span class="mono">₹' + x[2] + '/' + m.unit + '</span></div><div class="row" style="flex-wrap:nowrap;margin-top:4px"><div class="bar ' + x[3] + '" style="flex:1;height:14px"><i style="width:' + (x[1] / max * 100) + '%"></i></div><b class="mono" style="min-width:80px;text-align:right">' + inr(x[1]) + '</b></div></div>';
        }).join('') +
        (q.upliftAmount > 0 ? '<p style="margin:14px 0 0"><span class="pill pill-green" style="font-size:14px">▲ +' + inr(q.upliftAmount) + ' (+' + q.upliftPct + '%) more than the local rate</span></p>' : '') +
        '<p class="tiny muted" style="margin:10px 0 0">Board rate today: ₹' + q.boardRate + '/' + m.unit + ' → ' + inr(q.boardAmount) + ' for ' + TK.qty(w, m.unit) + '</p></div></div>' +
      '<div class="stack"><div class="safety"><div class="hazard-stripe"></div><div class="body"><span style="font-size:22px">⚠️</span><div><b>' + esc(m.safetyHi) + '</b><div class="small muted">' + esc(m.safetyEn) + '</div></div></div></div>' +
        (d.recyclers.length ? '<button class="btn btn-orange btn-block" id="toStep4">रीसाइक्लर देखें · See authorised recyclers →</button>' : '<div class="alert alert-info">No authorised recycler is buying this material right now.</div>') +
        '<button class="btn btn-ghost btn-block" id="back2">← Change weight</button></div></div>';
    $('#toStep4') && ($('#toStep4').onclick = function () { go(4); });
    $('#back2').onclick = function () { go(2); };
    $('#lq') && ($('#lq').onclick = function () { TK.speak(m.nameHi + '। सबसे अच्छी अधिकृत बोली ' + Math.round(q.bestAmount) + ' रुपये। लोकल रेट पर लगभग ' + Math.round(q.localAmount) + ' रुपये मिलते। ' + m.safetyHi); });
  }

  /* ---------- Step 4: recyclers (map + list) ---------- */
  var map = null, layer = null;
  function renderRecyclers() {
    var d = TK.try(function () { return TK.api.lot(S.lotId, S.from); }, $('#recList')); if (!d) return;
    S.data = d;
    var list = d.recyclers.slice(), best = list.slice().sort(function (a, b) { return b.bid - a.bid; })[0];
    if (S.sort === 'near') list.sort(function (a, b) { return (a.distanceKm || 999) - (b.distanceKm || 999); });
    else if (S.sort === 'today') list.sort(function (a, b) { return (/^Today/.test(b.slots[0].en) ? 1 : 0) - (/^Today/.test(a.slots[0].en) ? 1 : 0) || b.bid - a.bid; });
    else list.sort(function (a, b) { return b.bid - a.bid; });
    $('#sortChips').innerHTML = [['rate', 'सबसे अच्छा दाम · Best rate'], ['near', 'सबसे पास · Nearest'], ['today', 'आज पिकअप · Pickup today']].map(function (x) { return '<button type="button" class="chip' + (S.sort === x[0] ? ' on' : '') + '" data-s="' + x[0] + '">' + x[1] + '</button>'; }).join('');
    var m = d.material, w = d.lot.weightKg;
    $('#recList').innerHTML = list.map(function (r) {
      return '<div class="recycler-card' + (r.id === best.id ? ' best' : '') + '" id="rc' + r.id + '"><div class="row between" style="align-items:flex-start"><div><h3 style="margin:0">' + esc(r.name) + '</h3><div class="small muted">📍 ' + esc(r.area) + (r.distanceKm != null ? ' · <span class="mono">' + r.distanceKm + ' km</span>' : '') + ' · ★ ' + r.rating + '</div></div><div style="text-align:right"><div class="rate">₹' + r.bid + '</div><div class="tiny muted">/' + m.unit + '</div></div></div>' +
        '<div class="row small" style="margin-top:8px"><span class="pill pill-green">✓ CPCB authorised</span><span class="mono tiny muted">' + esc(r.cpcbAuthNo) + '</span><span class="muted">🚚 ' + esc(r.slots[0].hi) + '</span></div>' +
        '<div class="row between" style="margin-top:10px;border-top:1px solid var(--line);padding-top:10px"><b style="color:var(--orange)">' + inr(r.bid * w) + ' for ' + TK.qty(w, m.unit) + (r.id === best.id ? ' <span class="tiny muted" style="font-weight:400">· best rate</span>' : '') + '</b><button class="btn btn-orange btn-sm" data-book="' + r.id + '">पिकअप बुक करें · Book</button></div></div>';
    }).join('');
    // Map (Leaflet from CDN). Without internet, the list still works.
    if (typeof L === 'undefined') { $('#map').innerHTML = '<div class="center muted small" style="padding:40px">Map needs an internet connection. The list on the right works without it.</div>'; return; }
    if (!map) { map = L.map('map', { scrollWheelZoom: false }); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map); }
    if (layer) layer.remove();
    layer = L.layerGroup().addTo(map);
    var pts = [];
    if (d.from) { L.marker([d.from.lat, d.from.lng], { icon: L.divIcon({ className: 'tk-pin', html: '<div style="background:#2f6fd6;color:#fff">You</div>' }) }).addTo(layer); pts.push([d.from.lat, d.from.lng]); }
    d.recyclers.forEach(function (r) {
      L.marker([r.lat, r.lng], { icon: L.divIcon({ className: 'tk-pin', html: '<div style="background:' + (r.id === best.id ? '#20845A;color:#fff' : '#fff;color:#23282F') + '">₹' + r.bid + '</div>' }) })
        .on('click', function () { var el = $('#rc' + r.id); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.boxShadow = '0 0 0 3px var(--saffron)'; setTimeout(function () { el.style.boxShadow = ''; }, 1500); })
        .addTo(layer); pts.push([r.lat, r.lng]);
    });
    setTimeout(function () { map.invalidateSize(); if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 14 }); }, 50);
  }
  $('#sortChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) { S.sort = b.dataset.s; renderRecyclers(); } });
  $('#recList').addEventListener('click', function (e) { var b = e.target.closest('[data-book]'); if (b) { S.recyclerId = Number(b.dataset.book); go(5); renderBook(); } });
  $('#myLoc').onclick = function () {
    $('#locMsg').textContent = 'Finding you…';
    TK.gps(function (p) { if (p) { S.from = p; $('#locMsg').textContent = 'Using your current location'; renderRecyclers(); } else $('#locMsg').textContent = 'GPS unavailable. Using your shop location.'; });
  };

  /* ---------- Step 5: book ---------- */
  function renderBook() {
    var d = S.data, r = d.recyclers.find(function (x) { return x.id === S.recyclerId; }), m = d.material, w = d.lot.weightKg;
    S.slot = r.slots[0].id; S.pay = 'Cash';
    var pays = [['Cash', '💵', 'नकद · Cash', 'पिकअप पर हाथ में · Paid at pickup (default)'], ['UPI', '⚡', 'UPI', 'वैकल्पिक · Optional'], ['AePS', '🪪', 'AePS (आधार)', 'वैकल्पिक · Optional']];
    $('#book').innerHTML = '<div class="grid g2" style="align-items:start"><div class="stack">' +
      '<div class="card"><div class="row"><span class="card-icon" style="margin:0">' + TK.icon('shield') + '</span><div><h3 style="margin:0">' + esc(r.name) + '</h3><div class="small muted">CPCB authorised · ' + esc(r.cpcbAuthNo) + (r.distanceKm != null ? ' · ' + r.distanceKm + ' km' : '') + '</div></div></div>' +
        '<table class="table" style="margin-top:12px"><tbody><tr><td>' + esc(m.nameHi) + '</td><td class="mono" style="text-align:right">' + TK.qty(w, m.unit) + ' × ₹' + r.bid + '</td></tr><tr><td><b>कुल · Total</b></td><td class="mono" style="text-align:right;color:var(--green)"><b>' + inr(r.bid * w) + '</b></td></tr></tbody></table>' +
        '<p class="tiny muted" style="margin:6px 0 0">Final amount is settled on the weight the recycler confirms.</p></div>' +
      '<div class="card"><h3>समय · Pickup slot</h3><div class="chips" id="slots">' + r.slots.map(function (s, i) { return '<button type="button" class="chip' + (i === 0 ? ' on' : '') + '" data-slot="' + s.id + '">' + esc(s.hi) + ' · ' + esc(s.en) + '</button>'; }).join('') + '</div></div></div>' +
      '<div class="stack"><div class="card"><h3>भुगतान · Payment</h3><div class="stack" id="pays">' + pays.map(function (p, i) { return '<label class="option' + (i === 0 ? ' on' : '') + '"><input type="radio" name="pay" value="' + p[0] + '"' + (i === 0 ? ' checked' : '') + '><span style="font-size:20px">' + p[1] + '</span><span><b>' + p[2] + '</b><div class="tiny muted">' + p[3] + '</div></span></label>'; }).join('') + '</div></div>' +
        '<div id="bookErr"></div><button class="btn btn-orange btn-block" id="confirmBook">पक्का करें · Confirm pickup</button><button class="btn btn-ghost btn-block" id="back4">← Choose another recycler</button></div></div>';
    $('#slots').onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; S.slot = b.dataset.slot; TK.$$('#slots .chip').forEach(function (c) { c.classList.toggle('on', c === b); }); };
    $('#pays').onchange = function (e) { S.pay = e.target.value; TK.$$('#pays .option').forEach(function (o) { o.classList.toggle('on', o.querySelector('input').checked); }); };
    $('#back4').onclick = function () { go(4); };
    $('#confirmBook').onclick = function () {
      var id = TK.try(function () { return TK.api.book({ lotId: S.lotId, recyclerId: r.id, slotId: S.slot, paymentMode: S.pay }); }, $('#bookErr'));
      if (id) { TK.toast('पिकअप बुक हो गया · Pickup booked'); setTimeout(function () { location.href = 'pickups.html?id=' + id; }, 500); }
    };
  }

  renderChips(); go(1);
  loadModel(); // warm up the model in the background
})();
