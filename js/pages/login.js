(function () {
  var $ = TK.$, esc = TK.esc;
  TK.publicLayout('login.html');
  var homeOf = function (u) { return u.role === 'recycler' ? 'portal/buyer.html' : u.role === 'admin' ? 'portal/admin.html' : 'portal/dashboard.html'; };
  var next = TK.param('next');
  var me = TK.api.me();
  if (me) { location.replace(next && next.indexOf('portal/') === 0 ? next : homeOf(me)); return; }

  // One controller per section: seller, buyer, officer. Each only accepts its own account type.
  function panel(root) {
    var role = root.dataset.role, phoneF = $('.lp-phone', root), otpF = $('.lp-otp', root), phone = '';
    var phoneIn = $('input', phoneF), otpIn = $('input', otpF);
    var err = function (f, msg) { $('.lp-err', f).innerHTML = msg ? '<div class="alert alert-error small">' + TK.icon('alert') + '<span>' + esc(msg) + '</span></div>' : ''; };
    function request(p) {
      err(phoneF);
      var r = TK.try(function () { return TK.api.requestOtp(p, role); }, $('.lp-err', phoneF)); if (!r) return;
      phone = r.phone; $('.lp-to', otpF).textContent = '+91 ' + r.phone + (r.name ? ' (' + r.name + ')' : r.isNew ? ' (new seller)' : '');
      otpIn.value = '123456'; phoneF.classList.add('hidden'); otpF.classList.remove('hidden'); otpIn.focus();
    }
    phoneIn.addEventListener('input', function () { phoneIn.value = phoneIn.value.replace(/\D/g, ''); });
    phoneF.addEventListener('submit', function (e) { e.preventDefault(); request(phoneIn.value); });
    $('.lp-change', otpF).addEventListener('click', function (e) { e.preventDefault(); otpF.classList.add('hidden'); phoneF.classList.remove('hidden'); err(otpF); phoneIn.focus(); });
    otpF.addEventListener('submit', function (e) {
      e.preventDefault(); err(otpF);
      TK.try(function () {
        var r = TK.api.verifyOtp(phone, otpIn.value, role);
        if (r.isNew) {
          var m = document.createElement('div');
          m.className = 'modal-backdrop';
          m.innerHTML = '<div class="modal"><div class="modal-body">' +
            '<h3 style="margin-top:0">डेटा सुरक्षा सहमति · Data Protection Consent</h3>' +
            '<p class="small">We collect photos, GPS, phone number, and transaction records for fair pricing, tamper-evident records, and your earnings passport.<br>हम उचित मूल्य, सुरक्षित रिकॉर्ड और आपके आय पासपोर्ट के लिए फोटो, जीपीएस, फोन नंबर और लेन-देन का रिकॉर्ड एकत्र करते हैं।</p>' +
            '<p class="small">Legal basis: DPDP Act 2023, Section 6</p>' +
            '<label style="display:flex;align-items:start;gap:8px;margin:16px 0" class="small"><input type="checkbox" id="dpdpAgree"> <span>मैं सहमत हूँ · I agree to the data processing terms</span></label>' +
            '<button class="btn btn-primary btn-block" id="dpdpBtn" disabled>सहमत · Accept</button>' +
            '</div></div>';
          document.body.appendChild(m);
          $('#dpdpAgree').onchange = function () { $('#dpdpBtn').disabled = !this.checked; };
          $('#dpdpBtn').onclick = function () {
            TK.api.acceptConsent();
            location.href = 'portal/profile.html?welcome=1';
          };
        }
        else { var want = next ? roleOfPage(next) : undefined; location.href = next && next.indexOf('portal/') === 0 && (want === null || want === r.user.role) ? next : homeOf(r.user); }
      }, $('.lp-err', otpF));
    });
    TK.$$('.demo-accounts button', root).forEach(function (b) { b.addEventListener('click', function () { phoneIn.value = b.dataset.phone; request(b.dataset.phone); }); });
    return { root: root, phoneIn: phoneIn };
  }
  function roleOfPage(path) {
    var f = path.split('?')[0].split('/').pop();
    if (/^(buyer|recycler)/.test(f)) return 'recycler';
    if (/^admin/.test(f)) return 'admin';
    if (/^notifications/.test(f)) return null;
    return 'kabadiwala';
  }
  var P = { kabadiwala: panel($('#sellerPanel')), recycler: panel($('#buyerPanel')), admin: panel($('#officerPanel')) };

  var offBody = $('#officerPanel .officer-body');
  $('#oToggle').onclick = function () { offBody.classList.toggle('hidden'); if (!offBody.classList.contains('hidden')) $('#oPhone').focus(); };

  // ?as=seller|kabadiwala|buyer|recycler|admin (or the page you came from) highlights the right section
  var as = TK.param('as') || (next ? roleOfPage(next) : null);
  var key = { seller: 'kabadiwala', kabadiwala: 'kabadiwala', buyer: 'recycler', recycler: 'recycler', admin: 'admin', officer: 'admin' }[as];
  var demo = { kabadiwala: '9000000001', recycler: '9000000002', admin: '9000000003' };
  if (key) {
    var pn = P[key];
    if (key === 'admin') offBody.classList.remove('hidden');
    if (TK.param('as')) pn.phoneIn.value = demo[key];
    pn.root.classList.add('focus'); setTimeout(function () { pn.root.scrollIntoView({ behavior: 'smooth', block: 'center' }); pn.phoneIn.focus({ preventScroll: true }); }, 150);
    setTimeout(function () { pn.root.classList.remove('focus'); }, 2600);
  }
})();
