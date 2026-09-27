(function () {
  var $ = TK.$, esc = TK.esc;
  var welcome = TK.param('welcome') === '1';
  var u = TK.portalLayout('kabadiwala', 'profile.html', welcome ? 'स्वागत है! · Welcome to TolKanta' : 'प्रोफ़ाइल · Profile', welcome ? 'Tell us your name and shop. It takes one minute.' : 'Your details, location and e-Shram link');
  var WARDS = ['Gurugram', 'Sikanderpur', 'Sector 29', 'DLF Phase 3', 'Sohna Road', 'Seelampur (Delhi)', 'Mustafabad (Delhi)', 'Other'];
  var loc = u.lat != null ? { lat: u.lat, lng: u.lng } : null;

  $('#prof').innerHTML = (welcome ? '<div class="alert alert-ok" style="margin-bottom:16px">' + TK.icon('check') + '<span><b>नमस्ते! आपका नंबर +91 ' + esc(u.phone) + ' जुड़ गया।</b> Fill in your name to start selling at fair prices.</span></div>' : '') +
    '<div class="grid g2" style="align-items:start"><form class="card" id="pf" novalidate><h3>आपकी जानकारी · Your details</h3>' +
    '<label class="field"><span>नाम · Name *</span><input class="input" id="name" autocomplete="name" value="' + esc(u.name || '') + '" required></label>' +
    '<label class="field" style="margin-top:12px"><span>दुकान का नाम · Shop name</span><input class="input" id="shop" value="' + esc(u.shopName || '') + '" placeholder="e.g. Sharma Kabadi Store"></label>' +
    '<label class="field" style="margin-top:12px"><span>इलाका · Ward / area</span><select class="input" id="ward">' + WARDS.map(function (w) { return '<option' + (w === u.ward ? ' selected' : '') + '>' + w + '</option>'; }).join('') + (u.ward && WARDS.indexOf(u.ward) < 0 ? '<option selected>' + esc(u.ward) + '</option>' : '') + '</select></label>' +
    '<div class="field" style="margin-top:12px"><span class="small muted" style="display:block;font-weight:600;margin-bottom:6px">दुकान की जगह · Shop location</span><div class="row"><span id="locTxt" class="mono small">' + (loc ? loc.lat.toFixed(5) + ', ' + loc.lng.toFixed(5) : 'Not set') + '</span><button type="button" class="btn btn-ghost btn-sm" id="gps">' + TK.icon('pin') + ' Use my current location</button></div><div class="tiny muted" style="margin-top:4px">Used to show the nearest authorised recyclers.</div></div>' +
    '<label class="field" style="margin-top:12px"><span>e-Shram UAN (12 digits, optional)</span><input class="input mono" id="uan" inputmode="numeric" maxlength="14" value="' + esc(u.eshramUan || '') + '" placeholder="XXXX XXXX XXXX"></label>' +
    '<label class="option' + (u.consentAt ? ' on' : '') + '" style="margin-top:14px"><input type="checkbox" id="consent"' + (u.consentAt ? ' checked disabled' : '') + '><span class="small">मैं सहमत हूँ कि मेरी बिक्री का रिकॉर्ड (बिना फ़ोन नंबर) ULB और रीसाइक्लर EPR रिपोर्ट में इस्तेमाल हो। · I agree my sale records (without my phone number) may be used in ULB and EPR reports.' + (u.consentAt ? '<div class="tiny muted">Given on ' + TK.date(u.consentAt) + '</div>' : '') + '</span></label>' +
    '<div id="pErr" style="margin-top:10px"></div><button class="btn btn-primary btn-block" style="margin-top:10px">' + TK.icon('check') + ' ' + (welcome ? 'शुरू करें · Save and start' : 'सेव करें · Save') + '</button></form>' +
    '<div class="stack"><div class="card"><h3>खाता · Account</h3><table class="table"><tbody><tr><td class="muted">Mobile</td><td class="mono">+91 ' + esc(u.phone) + '</td></tr><tr><td class="muted">Role</td><td>Kabadiwala (aggregator)</td></tr><tr><td class="muted">Member since</td><td>' + TK.date(u.createdAt) + '</td></tr><tr><td class="muted">e-Shram</td><td>' + (u.eshramUan ? '<span class="pill pill-green">Linked</span>' : '<span class="pill pill-grey">Not linked</span>') + '</td></tr></tbody></table></div>' +
    '<div class="card" style="background:var(--cream)"><h3>e-Shram क्यों? · Why link e-Shram?</h3><p class="small" style="margin:0">e-Shram is the national database of unorganised workers. Linking it adds 10 points to your Trust Score and makes you visible for welfare schemes. In this demo the number is only format-checked; the real system would verify it with the e-Shram API.</p></div>' +
    '<div class="card"><h3>मदद · Help</h3><div class="row"><a class="btn btn-ghost btn-sm" href="../ivr.html">' + TK.icon('phone') + ' IVR helpline</a><a class="btn btn-ghost btn-sm" href="../whatsapp.html">' + TK.icon('chat') + ' WhatsApp bot</a><button class="btn btn-danger btn-sm" id="out">' + TK.icon('logout') + ' Log out</button></div></div>' +
    '<div class="card"><h3>डेटा अधिकार · Data Rights (DPDP Act 2023)</h3><p class="small muted" style="margin:0 0 12px 0">Consent recorded: ' + (u.consentAt ? TK.dateTime(u.consentAt) : 'No consent') + '</p><div class="row"><button type="button" class="btn btn-ghost btn-sm" id="dlData">' + TK.icon('download') + ' मेरा डेटा डाउनलोड करें · Download my data</button><button type="button" class="btn btn-danger btn-sm" id="delAcc">' + TK.icon('alert') + ' मेरा खाता हटाएं · Delete my account</button></div></div></div></div>';

  $('#gps').onclick = function () {
    $('#locTxt').textContent = 'Finding you…';
    TK.gps(function (p) { if (p) { loc = p; $('#locTxt').textContent = p.lat.toFixed(5) + ', ' + p.lng.toFixed(5); } else $('#locTxt').textContent = (loc ? loc.lat.toFixed(5) + ', ' + loc.lng.toFixed(5) : 'Not set') + ' (GPS unavailable)'; });
  };
  $('#uan').oninput = function () { var v = this.value.replace(/\D/g, '').slice(0, 12); this.value = v.replace(/(\d{4})(?=\d)/g, '$1 '); };
  $('#uan').dispatchEvent(new Event('input'));
  $('#out').onclick = function () { TK.api.logout(); location.href = '../index.html'; };
  $('#dlData').onclick = function () { TK.downloadText(TK.api.downloadMyData(), 'tolkanta-my-data.json'); };
  $('#delAcc').onclick = function () { 
    if (confirm('क्या आप वाकई अपना खाता हटाना चाहते हैं? यह वापस नहीं किया जा सकता।\nAre you sure you want to delete your account? This cannot be undone.')) {
      TK.api.deleteMyAccount();
      location.href = '../index.html';
    }
  };
  $('#pf').onsubmit = function (e) {
    e.preventDefault();
    var ok = TK.try(function () { TK.api.updateMe({ name: $('#name').value, shopName: $('#shop').value.trim() || null, ward: $('#ward').value, lat: loc ? loc.lat : null, lng: loc ? loc.lng : null, eshramUan: $('#uan').value, consent: $('#consent').checked }); return true; }, $('#pErr'));
    if (ok) { TK.toast('सेव हो गया · Saved'); setTimeout(function () { location.href = welcome ? 'dashboard.html' : 'profile.html'; }, 500); }
  };
})();
