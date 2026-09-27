(function () {
  var $ = TK.$;
  TK.portalLayout(null, 'notifications.html', 'सूचनाएँ · Notifications', 'Everything that happened on your account, newest first');
  var filter = 'all';
  var TYPES = [['all', 'All'], ['unread', 'Unread'], ['lot', 'New scrap'], ['booking', 'Bookings'], ['handover', 'Handovers'], ['purchase', 'Purchases'], ['paid', 'Payments'], ['rate', 'Price alerts'], ['dispute', 'Disputes']];
  function render() {
    var d = TK.try(function () { return TK.api.notifications(); }, $('#nt')); if (!d) return;
    var have = {}; d.items.forEach(function (n) { have[n.type] = 1; });
    var list = d.items.filter(function (n) { return filter === 'all' || (filter === 'unread' ? !n.read : n.type === filter); });
    TK.$('#headRight').innerHTML = d.unread ? '<button class="btn btn-ghost" id="all">' + TK.icon('check') + ' Mark all read (' + d.unread + ')</button>' : '';
    $('#nt').innerHTML = '<div class="tabs" id="ft">' + TYPES.filter(function (t) { return t[0] === 'all' || t[0] === 'unread' || have[t[0]]; }).map(function (t) { return '<button class="tab' + (filter === t[0] ? ' on' : '') + '" data-f="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="card" style="padding:0;overflow:hidden">' + (list.length ? list.map(TK.notifHtml).join('') : '<div class="center muted" style="padding:44px">Nothing here yet.</div>') + '</div>';
    $('#ft').onclick = function (e) { var b = e.target.closest('.tab'); if (b) { filter = b.dataset.f; render(); } };
    if ($('#all')) $('#all').onclick = function () { TK.api.markRead('all'); render(); };
    TK.$$('#nt [data-nid]').forEach(function (a) { a.addEventListener('click', function () { TK.api.markRead(a.dataset.nid); }); });
  }
  render(); TK.onDataChange(render);
})();
