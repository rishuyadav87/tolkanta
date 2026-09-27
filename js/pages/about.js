(function () {
  TK.publicLayout('about.html');
  TK.$('#contact').addEventListener('submit', function (e) {
    e.preventDefault();
    TK.$('#cDone').innerHTML = '<div class="alert alert-ok">Thank you, ' + TK.esc(TK.$('#cName').value) + '. This is a demo, so the message stays in your browser. Team Tenet will reply at the hackathon.</div>';
    e.target.reset();
  });
})();
