(function () {
  var $ = TK.$, esc = TK.esc;
  TK.publicLayout('verify.html');
  function show(hash) {
    var out = $('#result');
    TK.try(function () {
      var r = TK.api.publicVerify(hash), h = r.handover, p = r.pickup;
      out.innerHTML = '<div class="card rise" style="background:' + (r.ok ? 'var(--green)' : 'var(--red)') + ';color:#fff"><div class="row">' + TK.icon(r.ok ? 'check' : 'x') +
        '<div><div style="font-size:20px;font-weight:700">' + (r.ok ? 'Record is authentic and intact' : 'Record failed verification') + '</div><div class="small" style="opacity:.9">Hash ' + (r.checks.hashMatches ? 'recomputes correctly' : 'does NOT match') + ' · ' +
        (r.checks.linksToPrevious ? 'linked to the previous record' : 'chain link broken') + ' · ledger of ' + r.chainLength + ' records ' + (r.chainOk ? 'intact' : 'BROKEN') + '</div></div></div></div>' +
        '<div class="grid g2" style="margin-top:16px">' + [
          ['Material', p.material.nameEn + ' · ' + p.material.nameHi], ['Weight handed / received', TK.qty(h.weightKg, p.material.unit) + ' / ' + (h.receivedWeightKg != null ? TK.qty(h.receivedWeightKg, p.material.unit) : 'pending')],
          ['Recycler', p.recycler.name + ' · ' + p.recycler.cpcbAuthNo], ['Ward', p.kabadiwala.ward || '-'], ['Captured', TK.dateTime(h.capturedAt)], ['Confirmed', h.confirmedAt ? TK.dateTime(h.confirmedAt) : 'awaiting recycler'],
          ['GPS (rounded)', h.lat != null ? h.lat.toFixed(3) + ', ' + h.lng.toFixed(3) : 'not captured'], ['Status', TK.status[p.status][1]],
        ].map(function (x) { return '<div class="card flat"><div class="tiny muted">' + x[0] + '</div><div style="font-weight:700">' + esc(x[1]) + '</div></div>'; }).join('') + '</div>' +
        '<div class="hash-box" style="margin-top:16px"><div><span style="color:var(--saffron)">record</span> ' + h.recordHash + '</div><div><span style="color:var(--saffron)">prev&nbsp;&nbsp;</span> ' + h.prevHash + '</div><div><span style="color:var(--saffron)">photo&nbsp;</span> ' + h.photoSha256 + '</div></div>' +
        '<p class="small muted" style="margin-top:12px">Personal details are not shown. The kabadiwala\'s identity stays with the platform under the DPDP Act.</p>';
    }, out);
  }
  $('#vf').addEventListener('submit', function (e) { e.preventDefault(); var v = $('#hash').value.trim(); history.replaceState(null, '', '?hash=' + v); show(v); });
  $('#sample').addEventListener('click', function (e) {
    e.preventDefault();
    var c = TK.api.verifyChain(); if (!c.count) return;
    $('#hash').value = c.results[c.results.length - 1].recordHash; $('#vf').requestSubmit();
  });
  var q = TK.param('hash'); if (q) { $('#hash').value = q; show(q); }
})();
