(function () {
  TK.publicLayout('');
  var code = TK.param('code'), d = TK.param('d'), p = null, snap = false;
  try { p = TK.api.publicPassport(code); } catch (e) { p = null; }
  if (!p && d) {
    try { p = JSON.parse(decodeURIComponent(escape(atob(d.replace(/-/g, '+').replace(/_/g, '/'))))); snap = true; } catch (e) { p = null; }
  }
  if (!p) { TK.$('#pvNote').className = 'alert alert-error'; TK.$('#pvNote').textContent = 'Passport not found. Check the link or ask the kabadiwala to share it again.'; return; }
  var parts = String(p.name || 'Kabadiwala').split(' '); p.name = parts[0] + (parts.length > 1 ? ' ' + parts[parts.length - 1][0] + '.' : '');
  TK.$('#pvNote').innerHTML = TK.icon('shield') + '<span>' + (snap ? 'Read-only snapshot shared from the kabadiwala\'s phone.' : 'Live, read-only view for lenders.') + ' Figures come from hash-verified handovers. Phone number is never shown.</span>';
  TK.$('#pv').innerHTML = TK.renderPassport(p);
})();
