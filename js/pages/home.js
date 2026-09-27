(function () {
  var $ = TK.$, esc = TK.esc;
  TK.publicLayout('index.html');
  var me = TK.api.me();
  $('#ctaSell').innerHTML = TK.icon('camera') + (me && me.role === 'kabadiwala' ? ' Sell your scrap now · अपना कबाड़ बेचें' : ' Sell your scrap · कबाड़ बेचें');
  if (me && me.role === 'kabadiwala') $('#ctaSell').href = 'portal/sell.html';

  function renderBoard() {
    var ms = TK.api.materials();
    $('#pbDate').textContent = TK.date(new Date().toISOString());
    $('#priceBoard tbody').innerHTML = ms.map(function (m) {
      var d = m.delta, arrow = d > 0 ? '<span style="color:var(--green)">▲' + d + '</span>' : d < 0 ? '<span style="color:var(--red)">▼' + Math.abs(d) + '</span>' : '<span class="muted">·</span>';
      return '<tr><td><b>' + esc(m.nameHi) + ' · ' + esc(m.nameEn) + '</b>' + (m.hazard ? '<div class="tiny muted" style="margin-top:2px"><span class="pill pill-hazard" style="padding:0 6px">खतरा · Hazard</span></div>' : '') + '</td>' +
        '<td class="nowrap">₹' + m.boardRate + '<span class="tiny muted">/' + m.unit + '</span> <span class="tiny">' + arrow + '</span></td></tr>';
    }).join('');
    $('#listenRates').innerHTML = TK.listenBtn('lr', true);
    var b = $('#lr'); if (b) b.onclick = function () { TK.speak('आज के दाम। ' + ms.map(function (m) { return m.nameHi + ' ' + m.boardRate + ' रुपये प्रति ' + (m.unit === 'kg' ? 'किलो' : 'पीस'); }).join('। ')); };
  }
  function renderStats() {
    var s = TK.api.publicStats();
    $('#liveStats').innerHTML = [
      [s.kg + ' kg', 'अधिकृत रिसाइकलरों तक पहुँचा ई-कचरा · e-waste diverted to authorised recyclers'], [s.handovers, 'हैश-सत्यापित हैंडओवर · hash-verified handovers'],
      [TK.inr(s.paid), 'कबाड़ीवालों को भुगतान · paid to kabadiwalas'], [s.workers + ' / ' + s.recyclers, 'पंजीकृत श्रमिक / अधिकृत रिसाइकलर · registered workers / authorised recyclers'],
    ].map(function (x) { return '<div><div class="stat" style="color:#fff">' + x[0] + '</div><div class="stat-label" style="color:rgba(255,255,255,.7)">' + x[1] + '</div></div>'; }).join('');
  }
  renderBoard(); renderStats();
  TK.onDataChange(function () { renderBoard(); renderStats(); });
})();
