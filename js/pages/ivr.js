(function () {
  var $ = TK.$;
  TK.publicLayout('ivr.html');
  var menu = TK.api.ivrMenu(), inCall = false, log = [];
  $('#call').innerHTML = TK.icon('phone'); $('#hang').innerHTML = TK.icon('x');
  $('#menu tbody').innerHTML = menu.map(function (i) { return '<tr><td class="mono"><b>' + i.digit + '</b></td><td>' + TK.esc(i.m.nameHi) + '<div class="tiny muted">' + TK.esc(i.m.nameEn) + '</div></td><td class="mono">₹' + i.m.boardRate + '/' + i.m.unit + '</td></tr>'; }).join('') +
    '<tr><td class="mono"><b>9</b></td><td>सहायता अधिकारी · Talk to an officer</td><td></td></tr><tr><td class="mono"><b>0</b></td><td>मेनू दोबारा · Repeat menu</td><td></td></tr>';
  var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  $('#keypad').innerHTML = keys.map(function (k) { var it = menu.find(function (i) { return i.digit === k; }); return '<button type="button" data-k="' + k + '">' + k + '<small>' + (it ? TK.esc(it.m.nameEn.split(' ')[0]) : k === '9' ? 'help' : k === '0' ? 'menu' : '&nbsp;') + '</small></button>'; }).join('');
  function say(t, who) { log.push({ t: t, who: who || 'ivr' }); $('#lcdLog').innerHTML = log.slice(-5).map(function (l) { return '<div style="' + (l.who === 'me' ? 'text-align:right;font-weight:700' : '') + '">' + TK.esc(l.t) + '</div>'; }).join(''); if (who !== 'me') TK.speak(t); }
  var menuText = function () { return 'तोलकांटा में आपका स्वागत है। ' + menu.map(function (i) { return i.m.nameHi.split(' / ')[0] + ' के लिए ' + i.digit; }).join('। ') + '। सहायता के लिए 9। दोबारा सुनने के लिए 0।'; };
  $('#call').onclick = function () { if (inCall) return; inCall = true; log = []; $('#callState').textContent = '● कॉल जारी'; say(menuText()); };
  $('#hang').onclick = function () { if (!inCall) return; inCall = false; speechSynthesis && speechSynthesis.cancel(); $('#callState').textContent = 'तैयार · ready'; say('कॉल खत्म · Call ended', 'sys'); };
  $('#keypad').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (!inCall) { TK.toast('पहले हरा बटन दबाकर कॉल करें · Press the green button first'); return; }
    var k = b.dataset.k; say('दबाया: ' + k, 'me');
    if (k === '0') return say(menuText());
    if (k === '9') return say('आपको सहायता अधिकारी से जोड़ा जा रहा है। कृपया प्रतीक्षा करें। (डेमो)');
    var it = menu.find(function (i) { return i.digit === k; });
    say(it ? it.speech : 'गलत नंबर। दोबारा सुनने के लिए 0 दबाएँ।');
  });
  if (!TK.canSpeak) say('This browser cannot speak aloud; the transcript still works.', 'sys');
})();
