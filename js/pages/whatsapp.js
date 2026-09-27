(function () {
  var $ = TK.$;
  TK.publicLayout('whatsapp.html');
  $('#botIcon').innerHTML = TK.icon('scale'); $('#sendBtn').innerHTML = TK.icon('send');
  var body = $('#chatBody');
  function add(text, me) {
    var d = document.createElement('div'); d.className = 'msg ' + (me ? 'me' : 'bot');
    d.textContent = text; var t = document.createElement('time'); t.textContent = TK.time(new Date().toISOString()); d.appendChild(t);
    body.appendChild(d); body.scrollTop = body.scrollHeight;
  }
  function send(text) {
    text = String(text || '').trim(); if (!text) return;
    add(text, true); $('#botState').textContent = 'typing…';
    setTimeout(function () { add(TK.api.bot(text)); $('#botState').textContent = 'WhatsApp simulator · business account'; }, 450);
  }
  ['नमस्ते', 'तार', 'मदरबोर्ड', 'बैटरी', 'recycler', 'शिकायत'].forEach(function (q) { var b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = function () { send(q); }; $('#quick').appendChild(b); });
  $('#chatForm').addEventListener('submit', function (e) { e.preventDefault(); send($('#chatText').value); $('#chatText').value = ''; });
  add(TK.api.bot('नमस्ते'));
})();
