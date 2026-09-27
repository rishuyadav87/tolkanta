(function () {
  var $ = TK.$, esc = TK.esc;
  var u = TK.portalLayout('recycler', 'buyer-profile.html', 'प्रोफ़ाइल और अलर्ट · Profile & alerts', 'Your facility details and how you want to be notified');
  function render() {
    var d = TK.try(function () { return TK.api.buyerDashboard(); }, $('#bp')); if (!d) return;
    var r = d.recycler, me = TK.api.me(), pf = TK.prefs(me);
    var perm = window.Notification ? Notification.permission : 'unsupported';
    var opt = function (id, on, t, s) { return '<label class="option' + (on ? ' on' : '') + '"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '><span><b>' + t + '</b><div class="tiny muted">' + s + '</div></span></label>'; };
    $('#bp').innerHTML = '<div class="grid g2" style="align-items:start"><div class="stack">' +
      '<div class="card"><h3>' + TK.icon('factory') + ' Facility</h3><table class="table"><tbody>' +
      '<tr><td class="muted">Name</td><td><b>' + esc(r.name) + '</b></td></tr><tr><td class="muted">Area</td><td>' + esc(r.area) + '</td></tr>' +
      '<tr><td class="muted">CPCB authorisation</td><td class="mono">' + esc(r.cpcbAuthNo) + ' <span class="pill pill-green">Verified by ULB</span></td></tr>' +
      '<tr><td class="muted">Location</td><td class="mono">' + r.lat + ', ' + r.lng + '</td></tr><tr><td class="muted">Rating</td><td>★ ' + r.rating + '</td></tr>' +
      '<tr><td class="muted">Login mobile</td><td class="mono">+91 ' + esc(me.phone) + '</td></tr></tbody></table>' +
      '<p class="tiny muted" style="margin:8px 0 0">Facility details and CPCB status are managed by the ULB officer. Ask them to update anything here.</p></div>' +
      '<form class="card" id="bpf" novalidate><h3>Contact & buying</h3><label class="field"><span>Contact name on the buying desk</span><input class="input" id="cname" value="' + esc(me.name || '') + '"></label>' +
      '<div style="margin-top:12px">' + opt('avail', r.pickupAvailable, 'Doorstep pickups on', 'Off = sellers see “drop-off only” for your facility') + '</div>' +
      '<h3 style="margin-top:18px">' + TK.icon('bell') + ' सूचना · Notification settings</h3><div class="stack">' +
      opt('nLots', pf.newLots, 'New scrap listed near me', 'Alert when a seller lists scrap you have a bid for') +
      opt('nSound', pf.sound, 'Sound alert', 'A short chime for every new notification') +
      opt('nVoice', pf.voice, 'Read alerts aloud (Hindi)', 'Useful on the weighbridge when your hands are busy') +
      opt('nDesk', pf.desktop, 'Desktop notifications', perm === 'granted' ? 'Allowed in this browser' : perm === 'denied' ? 'Blocked in browser settings' : perm === 'unsupported' ? 'Not supported in this browser' : 'Your browser will ask for permission') + '</div>' +
      '<div id="bpErr" style="margin-top:10px"></div><div class="row" style="margin-top:10px"><button class="btn btn-primary">' + TK.icon('check') + ' Save</button><button type="button" class="btn btn-ghost" id="test">' + TK.icon('bell') + ' Send a test alert</button></div></form></div>' +
      '<div class="stack"><div class="card" style="background:var(--cream)"><h3>How buyers are notified</h3><ul class="small" style="margin:0;padding-left:18px;line-height:1.8"><li><b>New scrap listed</b> that matches your bids</li><li><b>Pickup booked</b> with you: seller, kg, slot, amount, payment mode</li><li><b>Handover recorded</b>: verify the hash and confirm the weight</li><li><b>Purchase complete</b> after you confirm; added to your EPR export</li><li><b>Cancellations and weight disputes</b></li></ul><p class="small muted" style="margin:10px 0 0">You see them in the bell at the top of every page, as a pop-up alert (with sound or voice), and on the Notifications page. In production these also go out as SMS and WhatsApp messages.</p></div>' +
      '<div class="card"><h3>Your numbers</h3><table class="table"><tbody><tr><td class="muted">Bought this month</td><td class="mono">' + d.month.kg + ' kg · ' + TK.inr(d.month.paid) + '</td></tr><tr><td class="muted">Bought all time</td><td class="mono">' + d.total.kg + ' kg · ' + d.total.pcs + ' pc</td></tr><tr><td class="muted">Verified purchases</td><td class="mono">' + d.total.n + '</td></tr></tbody></table></div>' +
      '<button class="btn btn-danger" id="out">' + TK.icon('logout') + ' Log out</button></div></div>';
    TK.$$('#bpf .option input').forEach(function (i) { i.onchange = function () { i.closest('.option').classList.toggle('on', i.checked); }; });
    $('#out').onclick = function () { TK.api.logout(); location.href = '../login.html?as=buyer'; };
    $('#test').onclick = function () { TK.liveAlert({ title: 'Test alert · टेस्ट', body: 'Notifications are working on this device.', link: null }, 1); if ($('#nVoice').checked) TK.speak('टेस्ट अलर्ट। सूचनाएँ चालू हैं।'); };
    $('#bpf').onsubmit = function (e) {
      e.preventDefault();
      var save = function () {
        var ok = TK.try(function () { TK.api.updateBuyer({ name: $('#cname').value, pickupAvailable: $('#avail').checked, newLots: $('#nLots').checked, sound: $('#nSound').checked, voice: $('#nVoice').checked, desktop: $('#nDesk').checked }); return true; }, $('#bpErr'));
        if (ok) { TK.toast('सेव हो गया · Saved'); render(); }
      };
      if ($('#nDesk').checked && window.Notification && Notification.permission === 'default') Notification.requestPermission().then(save, save); else save();
    };
  }
  render();
})();
