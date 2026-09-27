(function () {
  TK.publicLayout('impact.html');
  function render() {
    var s = TK.api.publicStats();
    TK.$('#kpis').innerHTML = [
      [s.kg + ' kg', 'E-waste diverted', 'to CPCB-authorised recyclers'], [s.handovers, 'Verified handovers', 'each with a SHA-256 record'],
      [TK.inr(s.paid), 'Paid to kabadiwalas', 'cash, UPI or AePS'], [s.workers, 'Registered workers', s.recyclers + ' authorised recyclers'],
    ].map(function (x, i) { return '<div class="card"' + (i === 0 ? ' style="background:var(--green);color:#fff"' : '') + '><div class="stat">' + x[0] + '</div><div style="font-weight:700">' + x[1] + '</div><div class="small"' + (i === 0 ? ' style="opacity:.8"' : ' class="muted"') + '>' + x[2] + '</div></div>'; }).join('');
    var max = Math.max.apply(null, [1].concat(s.byMaterial.map(function (b) { return b.qty; })));
    TK.$('#byMat').innerHTML = s.byMaterial.map(function (b) {
      return '<div class="small"><div class="row between"><span>' + TK.esc(b.material.nameEn) + ' <span class="muted">' + TK.esc(b.material.nameHi) + '</span></span><span class="mono">' + TK.qty(b.qty, b.material.unit) + '</span></div><div class="bar' + (b.material.hazard ? ' orange' : '') + '" style="margin-top:4px"><i style="width:' + (b.qty / max * 100) + '%"></i></div></div>';
    }).join('');
  }
  render(); TK.onDataChange(render);
})();
