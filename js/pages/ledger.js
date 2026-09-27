(function () {
  var $ = TK.$, esc = TK.esc, inr = TK.inr;
  TK.portalLayout('kabadiwala', 'ledger.html', 'खाता · Ledger', 'Every rupee bought and sold. Sales to recyclers are added automatically and carry a hash-verified badge.');
  var days = 7, form = { type: 'purchase', mode: 'Cash' }, materials = TK.api.materials();

  function render() {
    var d = TK.try(function () { return TK.api.ledger(days); }, $('#led')); if (!d) return;
    var sold = 0, bought = 0, verified = 0;
    d.rows.forEach(function (l) { if (l.type === 'sale') { sold += l.amount; if (l.pickupId) verified += l.amount; } else bought -= l.amount; });
    TK.$('#headRight').innerHTML = TK.listenBtn('lsn') + '<button class="btn btn-ghost" id="csv">' + TK.icon('download') + ' Download CSV</button>';

    var html = '<div class="tabs" id="range">' + [[1, 'आज · Today'], [7, '7 दिन · 7 days'], [30, '30 दिन · 30 days'], [180, '6 महीने · 6 months']].map(function (r) { return '<button class="tab' + (days === r[0] ? ' on' : '') + '" data-d="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div>' +
      '<div class="grid g4">' +
      '<div class="kpi green"><div class="l">मुनाफ़ा · Net</div><div class="v">' + (sold - bought < 0 ? '−' : '') + inr(sold - bought) + '</div><div class="h">' + d.rows.length + ' entries</div></div>' +
      '<div class="kpi"><div class="l">बेचा · Sold</div><div class="v">' + inr(sold) + '</div></div>' +
      '<div class="kpi"><div class="l">खरीदा · Bought</div><div class="v">' + inr(bought) + '</div></div>' +
      '<div class="kpi"><div class="l">सत्यापित · Hash-verified sales</div><div class="v">' + inr(verified) + '</div><div class="h">' + (sold ? Math.round(verified / sold * 100) : 0) + '% of sales · counts for your Passport</div></div></div>';

    html += '<div class="grid" style="grid-template-columns:minmax(0,1fr) 340px;gap:20px;margin-top:20px;align-items:start" id="ledGrid">' +
      '<div class="card table-wrap">' + (d.rows.length ? '<table class="table"><thead><tr><th>When</th><th>Entry</th><th>Mode</th><th style="text-align:right">Amount</th></tr></thead><tbody>' + d.rows.map(function (l) {
        var parts = l.description.split(' · ');
        return '<tr><td class="small nowrap">' + TK.date(l.createdAt) + '<div class="tiny muted">' + TK.time(l.createdAt) + '</div></td><td><b>' + esc(parts[0]) + '</b>' + (l.pickupId ? ' <a class="pill pill-green" href="pickups.html?id=' + l.pickupId + '" title="Backed by a SHA-256 handover record">✓ verified</a>' : '') + '<div class="tiny muted">' + esc(parts.slice(1).join(' · ')) + '</div></td><td class="small">' + esc(l.mode) + '</td><td class="mono nowrap" style="text-align:right"><span class="amt' + (l.type === 'sale' ? ' plus' : '') + '">' + (l.type === 'sale' ? '+' : '−') + inr(l.amount) + '</span></td></tr>';
      }).join('') + '</tbody></table>' : '<div class="center muted" style="padding:40px">No entries in this period.</div>') + '</div>' +

      '<form class="card" id="addForm" novalidate><h3>नई एंट्री · Add an entry</h3><p class="small muted" style="margin-top:0">For cash deals outside TolKanta, e.g. buying from waste pickers.</p>' +
      '<div class="chips" id="typeChips"><button type="button" class="chip' + (form.type === 'purchase' ? ' on' : '') + '" data-t="purchase">खरीदा · Bought</button><button type="button" class="chip' + (form.type === 'sale' ? ' on' : '') + '" data-t="sale">बेचा · Sold</button></div>' +
      '<label class="field" style="margin-top:12px"><span>Material (optional)</span><select class="input" id="fMat"><option value="">-</option>' + materials.map(function (m) { return '<option value="' + m.id + '">' + esc(m.nameHi) + ' · ' + esc(m.nameEn) + '</option>'; }).join('') + '</select></label>' +
      '<div class="grid g2" style="margin-top:12px;gap:10px"><label class="field"><span>Weight / qty</span><input class="input mono" id="fW" type="number" min="0" step="0.1" inputmode="decimal"></label><label class="field"><span>Amount ₹</span><input class="input mono" id="fAmt" type="number" min="0" step="1" inputmode="numeric" required></label></div>' +
      '<label class="field" style="margin-top:12px"><span>Paid by</span><select class="input" id="fMode"><option>Cash</option><option>UPI</option><option>AePS</option></select></label>' +
      '<div id="fErr" style="margin-top:10px"></div><button class="btn btn-primary btn-block" style="margin-top:10px">' + TK.icon('check') + ' जोड़ें · Save entry</button></form></div>';
    $('#led').innerHTML = html;
    if (window.innerWidth < 960) $('#ledGrid').style.gridTemplateColumns = '1fr';

    $('#range').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { days = Number(b.dataset.d); render(); } };
    $('#typeChips').onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; form.type = b.dataset.t; TK.$$('#typeChips .chip').forEach(function (c) { c.classList.toggle('on', c === b); }); };
    $('#fMat').onchange = function () { var m = materials.find(function (x) { return String(x.id) === this.value; }, this); var w = Number($('#fW').value); if (m && w && !$('#fAmt').value) $('#fAmt').value = Math.round(w * (form.type === 'sale' ? m.boardRate : m.localRate)); };
    $('#addForm').onsubmit = function (e) {
      e.preventDefault();
      var ok = TK.try(function () { TK.api.addLedger({ type: form.type, amount: $('#fAmt').value, materialId: $('#fMat').value ? Number($('#fMat').value) : null, weightKg: $('#fW').value || null, mode: $('#fMode').value }); return true; }, $('#fErr'));
      if (ok) { TK.toast('एंट्री जुड़ गई · Entry saved'); render(); }
    };
    $('#csv').onclick = function () {
      var rows = [['date_ist', 'type', 'description', 'weight', 'amount_inr', 'mode', 'verified_pickup_id']].concat(d.rows.map(function (l) { return [TK.date(l.createdAt) + ' ' + TK.time(l.createdAt), l.type, l.description, l.weightKg || '', l.amount, l.mode, l.pickupId || '']; }));
      TK.downloadText(rows.map(function (r) { return r.map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n') + '\n', 'tolkanta-ledger-' + days + 'd.csv');
    };
    var l = $('#lsn'); if (l) l.onclick = function () { TK.speak('पिछले ' + days + ' दिन में बेचा ' + Math.round(sold) + ' रुपये, खरीदा ' + Math.round(bought) + ' रुपये। मुनाफ़ा ' + Math.round(sold - bought) + ' रुपये।'); };
  }
  render(); TK.onDataChange(render);
})();
