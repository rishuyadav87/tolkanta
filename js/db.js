/* =========================================================================
   TolKanta data layer + business logic (runs in the browser)
   ---------------------------------------------------------------
   Data is stored as JSON in localStorage, so the website needs no server
   and works when deployed on any static host (Vercel, Netlify, GitHub Pages)
   or opened directly from the folder. Tabs of the same browser share the
   data; each tab keeps its own login (sessionStorage).
   ========================================================================= */
(function () {
  'use strict';
  var TK = (window.TK = window.TK || {});
  var KEY = 'tolkanta_db_v3';
  TK.DB_KEY = KEY;
  var SEED_PHOTO = 'assets/img/lot-pcb.jpg';
  var SEED_PHOTO_SHA = '264c4f9a69d4ea7aa30f02fc93c3151189639dad891e77c15606cc2d77c9b9da';
  var GENESIS = '0000000000000000000000000000000000000000000000000000000000000000';
  var DEMO_OTP = '123456';

  function Err(message, status) { var e = new Error(message); e.status = status || 400; return e; }
  TK.Err = Err;
  function need(cond, msg, status) { if (!cond) throw Err(msg, status); }

  /* ---------------- storage ---------------- */
  function read() {
    try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function write(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { throw Err('Browser storage is full or blocked. Use Admin → Reset demo, or a normal (non-private) window.', 507); }
  }
  function load() {
    var db = read();
    if (!db || !db.materials) { db = seed(); write(db); }
    return db;
  }
  // Run a change against a fresh copy and save it (all tabs see it immediately)
  function change(fn) { var db = load(); var r = fn(db); write(db); return r; }
  function nextId(db, table) { db.seq[table] = (db.seq[table] || 0) + 1; return db.seq[table]; }
  function nowIso(offsetMs) { return new Date(Date.now() + (offsetMs || 0)).toISOString(); }
  var DAY = 86400000;
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var istDay = function (iso) { return new Date(new Date(iso).getTime() + 330 * 60000).toISOString().slice(0, 10); };
  TK.istDay = istDay;

  function canonical(o) {
    if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + canonical(o[k]); }).join(',') + '}';
    return JSON.stringify(o);
  }
  function randHex(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }
  function haversine(a, b) {
    var R = 6371, t = function (d) { return d * Math.PI / 180; };
    var dLat = t(b.lat - a.lat), dLng = t(b.lng - a.lng);
    var h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.pow(Math.sin(dLng / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function dataUrlBytes(dataUrl) {
    var m = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/.exec(dataUrl || '');
    need(m, 'Photo must be a JPEG, PNG or WebP image');
    var bin = atob(m[2]); var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function savePhoto(db, dataUrl, prefix) {
    var bytes = dataUrlBytes(dataUrl);
    need(bytes.length < 1.5 * 1024 * 1024, 'Photo is too large');
    var hash = sha256(bytes);
    var name = prefix + '-' + Date.now() + '-' + hash.slice(0, 10);
    db.photos[name] = dataUrl;
    return { path: name, sha256: hash };
  }
  TK.photoSrc = function (name) {
    if (!name) return '';
    if (name === 'seed') return (TK.root || '') + SEED_PHOTO;
    var db = load(); return db.photos[name] || '';
  };

  /* ---------------- demo data ---------------- */
  var MATERIALS = [
    ['PCB', 'मदरबोर्ड / सर्किट बोर्ड', 'Motherboard / PCB', 'kg', 250, 240, 210, 0, 'बोर्ड को कभी न जलाएँ। धुआँ ज़हरीला है। पूरा बोर्ड बेचें, दाम ज़्यादा मिलेगा।', 'Never burn circuit boards. The fumes are toxic. Sell whole boards for a better rate.', 'ITEW15', '85340090'],
    ['CU_WIRE', 'तांबे का तार', 'Copper wire (insulated)', 'kg', 310, 315, 260, 0, 'तार की प्लास्टिक खोल जलाकर न उतारें। मशीन या ब्लेड से छीलें।', 'Do not burn off the insulation. Strip it with a tool instead.', 'CEEW1', '74040000'],
    ['PHONE', 'पुराने मोबाइल', 'Old phones (whole)', 'pc', 90, 86, 70, 0, 'फूली हुई बैटरी वाले फोन अलग रखें।', 'Keep phones with swollen batteries separate.', 'ITEW3', '85171290'],
    ['LAPTOP', 'पुराने लैपटॉप', 'Old laptops (whole)', 'pc', 650, 640, 520, 0, 'बैटरी निकालकर अलग पैक करें।', 'Remove the battery and pack it separately.', 'ITEW2', '84713010'],
    ['LI_BATT', 'लिथियम बैटरी', 'Li-ion batteries', 'kg', 65, 65, 45, 1, 'बैटरी को न तोड़ें, न छेदें, न धूप में रखें। आग लग सकती है। रेत वाले डिब्बे में रखें।', 'Never crush, puncture or heat batteries. They can catch fire. Store them in a sand-lined box.', 'ITEW16', '85076000'],
    ['CRT', 'CRT टीवी / मॉनिटर', 'CRT TV / monitor', 'kg', 12, 13, 8, 1, 'CRT शीशा न तोड़ें। इसमें सीसा (lead) होता है। पूरा सामान ही दें।', 'Do not break CRT glass. It contains lead. Hand it over whole.', 'ITEW9', '85401100'],
    ['MIXED', 'मिक्स ई-कचरा', 'Mixed e-waste (keyboards, mice, cables)', 'kg', 28, 27, 20, 0, 'सामान सूखी जगह पर रखें।', 'Keep the lot dry.', 'ITEW21', '85369090'],
  ];
  var RECYCLERS = [
    ['Harit E-Recyclers', 'Sector 18, Gurugram', 28.4935, 77.0690, 'CPCB-AUTH-XXXX-01', 4.6, { PCB: 262, CU_WIRE: 318, PHONE: 95, LAPTOP: 670, LI_BATT: 70, CRT: 14, MIXED: 30 }],
    ['Circuit Recovery Works', 'Udyog Vihar Ph 4, Gurugram', 28.5030, 77.0830, 'CPCB-AUTH-XXXX-02', 4.4, { PCB: 255, CU_WIRE: 322, PHONE: 92, LAPTOP: 660, LI_BATT: 68, CRT: 12, MIXED: 29 }],
    ['Metro E-Waste Processors', 'Sector 37, Gurugram', 28.4380, 77.0050, 'CPCB-AUTH-XXXX-03', 4.2, { PCB: 258, CU_WIRE: 312, PHONE: 94, LAPTOP: 655, LI_BATT: 72, CRT: 15, MIXED: 31 }],
  ];

  function seed() {
    var db = { v: 3, seq: {}, users: [], materials: [], priceHistory: [], recyclers: [], bids: [], lots: [], pickups: [], handovers: [], ledger: [], notifications: [], sessions: {}, photos: {} };
    MATERIALS.forEach(function (m, i) {
      var id = nextId(db, 'materials');
      db.materials.push({ id: id, code: m[0], nameHi: m[1], nameEn: m[2], unit: m[3], boardRate: m[4], prevRate: m[5], localRate: m[6], hazard: !!m[7], safetyHi: m[8], safetyEn: m[9], cpcbCode: m[10], hsnCode: m[11], sort: i, updatedAt: nowIso() });
      db.priceHistory.push({ materialId: id, rate: m[4], source: 'seed', at: nowIso() });
    });
    function addUser(u) { u.id = nextId(db, 'users'); db.users.push(u); return u; }
    var ramesh = addUser({ phone: '9000000001', name: 'Ramesh', role: 'kabadiwala', shopName: 'Ramesh Scrap Traders', ward: 'Sector 14', lat: 28.4722, lng: 77.0459, eshramUan: null, consentAt: nowIso(), createdAt: nowIso(-160 * DAY) });
    var recUser = addUser({ phone: '9000000002', name: 'Harit E-Recyclers (ops)', role: 'recycler', shopName: 'Harit E-Recyclers', ward: 'Sector 18', createdAt: nowIso(-300 * DAY), consentAt: nowIso() });
    addUser({ phone: '9000000003', name: 'ULB / Admin', role: 'admin', ward: 'Gurugram MC', createdAt: nowIso(-300 * DAY), consentAt: nowIso() });
    var salma = addUser({ phone: '9000000004', name: 'Salma', role: 'kabadiwala', shopName: 'Salma Kabadi Store', ward: 'Sector 22', lat: 28.5010, lng: 77.0610, eshramUan: '100000000000', consentAt: nowIso(), createdAt: nowIso(-90 * DAY) });
    // Buyer logins for the other two authorised recyclers
    var buyer2 = addUser({ phone: '9000000005', name: 'Circuit Recovery (buying desk)', role: 'recycler', shopName: 'Circuit Recovery Works', ward: 'Udyog Vihar', createdAt: nowIso(-240 * DAY), consentAt: nowIso() });
    var buyer3 = addUser({ phone: '9000000006', name: 'Metro E-Waste (buying desk)', role: 'recycler', shopName: 'Metro E-Waste Processors', ward: 'Sector 37', createdAt: nowIso(-200 * DAY), consentAt: nowIso() });
    var buyerUsers = [recUser, buyer2, buyer3];
    RECYCLERS.forEach(function (r, i) {
      var id = nextId(db, 'recyclers');
      db.recyclers.push({ id: id, userId: buyerUsers[i].id, name: r[0], area: r[1], lat: r[2], lng: r[3], cpcbAuthNo: r[4], rating: r[5], verified: true, pickupAvailable: true });
      Object.keys(r[6]).forEach(function (code) { db.bids.push({ recyclerId: id, materialId: mat(db, code).id, rate: r[6][code], updatedAt: nowIso() }); });
    });
    // five months of verified, hash-chained history
    var events = [];
    [{ u: ramesh, n: 16, every: 9 }, { u: salma, n: 6, every: 12 }].forEach(function (p) {
      for (var i = 0; i < p.n; i++) events.push({ p: p, i: i, daysAgo: p.n * p.every - i * p.every + 3 + (p.u.id % 3) });
    });
    events.sort(function (a, b) { return b.daysAgo - a.daysAgo; });
    var codes = ['PCB', 'CU_WIRE', 'PHONE', 'MIXED', 'LI_BATT', 'CRT', 'LAPTOP'];
    var ranges = { PCB: [3, 9], CU_WIRE: [4, 14], PHONE: [6, 20], MIXED: [10, 35], LI_BATT: [3, 10], CRT: [15, 40], LAPTOP: [1, 4] };
    var s = 7; var rand = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
    var prev = GENESIS;
    events.forEach(function (ev) {
      var u = ev.p.u, code = codes[(ev.i + u.id) % codes.length], m = mat(db, code), rg = ranges[code];
      var w = m.unit === 'pc' ? Math.round(rg[0] + rand() * (rg[1] - rg[0])) : Math.round((rg[0] + rand() * (rg[1] - rg[0])) * 10) / 10;
      var rec = db.recyclers[(ev.i + u.id) % 3];
      var rate = bidOf(db, rec.id, m.id).rate;
      var when = nowIso(-ev.daysAgo * DAY);
      var lotId = nextId(db, 'lots');
      db.lots.push({ id: lotId, userId: u.id, materialId: m.id, weightKg: w, photoPath: 'seed', photoSha256: SEED_PHOTO_SHA, boardRate: m.boardRate, estimate: r2(m.boardRate * w), status: 'sold', createdAt: when });
      var amount = r2(rate * w), mode = ev.i % 4 === 0 ? 'UPI' : 'Cash';
      var pid = nextId(db, 'pickups');
      db.pickups.push({ id: pid, lotId: lotId, recyclerId: rec.id, kabadiwalaId: u.id, slot: 'Tomorrow 10–12 AM|कल 10–12 AM', paymentMode: mode, rate: rate, amount: amount, status: 'confirmed', createdAt: when });
      var capturedAt = nowIso(-ev.daysAgo * DAY + 0.8 * DAY);
      var payload = { v: 1, pickupId: pid, lotId: lotId, kabadiwalaId: u.id, recyclerId: rec.id, material: code, weightKg: w,
        lat: Math.round((rec.lat + (rand() - 0.5) * 0.002) * 1e6) / 1e6, lng: Math.round((rec.lng + (rand() - 0.5) * 0.002) * 1e6) / 1e6,
        gpsSource: 'device', capturedAt: capturedAt, photoSha256: SEED_PHOTO_SHA, prevHash: prev };
      var hash = sha256(canonical(payload));
      db.handovers.push({ id: nextId(db, 'handovers'), pickupId: pid, photoPath: 'seed', photoSha256: SEED_PHOTO_SHA, lat: payload.lat, lng: payload.lng, gpsSource: 'device',
        weightKg: w, capturedAt: capturedAt, payload: canonical(payload), prevHash: prev, recordHash: hash, receivedWeightKg: w, confirmedAt: nowIso(-(ev.daysAgo - 1) * DAY), confirmedBy: rec.userId, mismatch: false });
      prev = hash;
      db.ledger.push({ id: nextId(db, 'ledger'), userId: u.id, type: 'sale', materialId: m.id, description: 'रीसाइक्लर को बेचा · Sold ' + m.nameEn + ' ' + w + ' ' + m.unit + ' to ' + rec.name, weightKg: w, amount: amount, mode: mode, pickupId: pid, createdAt: nowIso(-(ev.daysAgo - 1) * DAY) });
      db.ledger.push({ id: nextId(db, 'ledger'), userId: u.id, type: 'purchase', materialId: m.id, description: 'बीनने वाले से खरीदा · Bought ' + m.nameEn + ' ' + w + ' ' + m.unit, weightKg: w, amount: -Math.round(m.localRate * 0.85 * w), mode: 'Cash', createdAt: nowIso(-(ev.daysAgo + 2) * DAY) });
    });
    [['purchase', 'PHONE', 'बीनने वाले से खरीदा · Bought 9 phones', 9, -630, -150], ['sale', 'CU_WIRE', 'रीसाइक्लर को बेचा · Sold copper 8 kg', 8, 2480, -110], ['purchase', 'CU_WIRE', 'बीनने वाले से खरीदा · Bought wire 4.5 kg', 4.5, -1080, -70]]
      .forEach(function (x) { db.ledger.push({ id: nextId(db, 'ledger'), userId: ramesh.id, type: x[0], materialId: mat(db, x[1]).id, description: x[2], weightKg: x[3], amount: x[4], mode: 'Cash', createdAt: nowIso(x[5] * 60000) }); });

    // Live items so the buyer portal has something to act on
    var harit = db.recyclers[0], mixed = mat(db, 'MIXED'), wire = mat(db, 'CU_WIRE');
    var bookedLot = nextId(db, 'lots');
    db.lots.push({ id: bookedLot, userId: salma.id, materialId: mixed.id, weightKg: 22, photoPath: 'seed', photoSha256: SEED_PHOTO_SHA, boardRate: mixed.boardRate, estimate: r2(mixed.boardRate * 22), status: 'booked', createdAt: nowIso(-3 * 3600000) });
    var bookedPid = nextId(db, 'pickups'), bRate = bidOf(db, harit.id, mixed.id).rate;
    db.pickups.push({ id: bookedPid, lotId: bookedLot, recyclerId: harit.id, kabadiwalaId: salma.id, slot: 'Tomorrow 10–12 AM|कल 10–12 AM', paymentMode: 'UPI', rate: bRate, amount: r2(bRate * 22), status: 'booked', createdAt: nowIso(-3 * 3600000 + 600000) });
    var openLot = nextId(db, 'lots');
    db.lots.push({ id: openLot, userId: salma.id, materialId: wire.id, weightKg: 6.5, photoPath: 'seed', photoSha256: SEED_PHOTO_SHA, boardRate: wire.boardRate, estimate: r2(wire.boardRate * 6.5), status: 'open', createdAt: nowIso(-40 * 60000) });
    var N = function (uid, type, title, body, link, ago, read) { db.notifications.push({ id: nextId(db, 'notifications'), userId: uid, type: type, title: title, body: body, link: link, read: !!read, createdAt: nowIso(-ago) }); };
    buyerUsers.forEach(function (bu, i) {
      var rec = db.recyclers[i];
      N(bu.id, 'lot', 'नया कबाड़ उपलब्ध · New scrap listed', 'Salma Kabadi Store, Sector 22 · 6.5 kg Copper wire (insulated) · your bid ₹' + bidOf(db, rec.id, wire.id).rate + '/kg', 'buyer-market.html', 40 * 60000, false);
    });
    N(recUser.id, 'booking', 'नया पिकअप बुक · New pickup booked', 'Salma Kabadi Store · 22 kg Mixed e-waste · Tomorrow 10–12 AM · ₹' + r2(bRate * 22) + ' by UPI', 'recycler.html', 3 * 3600000 - 600000, false);
    N(recUser.id, 'purchase', 'खरीद पूरी · Purchase complete', 'Weight confirmed and paid. Record added to your EPR export.', 'buyer-purchases.html', 2 * DAY, true);
    N(ramesh.id, 'rate', 'दाम बढ़ा · Rate up', 'Motherboard / PCB: ₹250/kg (+₹10). A good time to sell.', 'sell.html', 5 * 3600000, false);
    N(ramesh.id, 'paid', 'भुगतान मिला · Payment received', 'Your last sale was confirmed and paid. See it in My sales.', 'sales.html', 2 * DAY, true);
    N(salma.id, 'booking', 'पिकअप बुक हो गया · Pickup booked', 'Harit E-Recyclers · Tomorrow 10–12 AM · 22 kg Mixed e-waste', 'pickups.html?id=' + bookedPid, 3 * 3600000 - 600000, false);
    return db;
  }

  /* ---------------- lookups ---------------- */
  function mat(db, codeOrId) { return db.materials.find(function (m) { return m.code === codeOrId || m.id === Number(codeOrId); }); }
  function bidOf(db, recyclerId, materialId) { return db.bids.find(function (b) { return b.recyclerId === recyclerId && b.materialId === materialId; }); }
  function userById(db, id) { return db.users.find(function (u) { return u.id === id; }); }
  // In-app notifications (shown in the bell, the Notifications page, and as live alerts in other tabs)
  function notify(db, userIds, type, title, body, link) {
    if (!db.notifications) db.notifications = [];
    [].concat(userIds).filter(Boolean).forEach(function (uid) { db.notifications.push({ id: nextId(db, 'notifications'), userId: uid, type: type, title: title, body: body, link: link || null, read: false, createdAt: nowIso() }); });
  }
  function buyerUserOf(db, recyclerId) { var r = db.recyclers.find(function (x) { return x.id === recyclerId; }); return r ? r.userId : null; }
  function adminIds(db) { return db.users.filter(function (u) { return u.role === 'admin'; }).map(function (u) { return u.id; }); }
  function fmtQty(w, m) { return w + ' ' + (m.unit === 'pc' ? 'pc' : 'kg') + ' ' + m.nameEn; }
  function recyclerById(db, id) { return db.recyclers.find(function (r) { return r.id === id; }); }
  function materialView(m) { return Object.assign({}, m, { delta: r2(m.boardRate - m.prevRate) }); }
  function nextSlots(avail) {
    if (!avail) return [{ id: 'dropoff', hi: 'सिर्फ ड्रॉप-ऑफ', en: 'Drop-off only' }];
    var ist = new Date(Date.now() + 330 * 60000), d = function (o) { var x = new Date(ist); x.setUTCDate(x.getUTCDate() + o); return x.toISOString().slice(0, 10); };
    var slots = [];
    if (ist.getUTCHours() < 15) slots.push({ id: d(0) + 'T16', hi: 'आज 4–6 PM', en: 'Today 4–6 PM' });
    slots.push({ id: d(1) + 'T10', hi: 'कल 10–12 AM', en: 'Tomorrow 10–12 AM' });
    slots.push({ id: d(1) + 'T16', hi: 'कल 4–6 PM', en: 'Tomorrow 4–6 PM' });
    return slots;
  }
  function recyclersFor(db, materialId, from) {
    return db.recyclers.filter(function (r) { return r.verified && bidOf(db, r.id, materialId); }).map(function (r) {
      return Object.assign({}, r, { bid: bidOf(db, r.id, materialId).rate, distanceKm: from && from.lat != null ? r2(haversine(from, r)) : null, slots: nextSlots(r.pickupAvailable) });
    });
  }
  function quote(db, m, weight, from) {
    var recs = recyclersFor(db, m.id, from);
    var best = recs.reduce(function (a, b) { return !a || b.bid > a.bid ? b : a; }, null);
    var bestRate = best ? best.bid : m.boardRate, bestAmount = r2(bestRate * weight), localAmount = r2(m.localRate * weight);
    return { boardRate: m.boardRate, boardAmount: r2(m.boardRate * weight), bestRate: bestRate, bestAmount: bestAmount, bestRecycler: best,
      localRate: m.localRate, localAmount: localAmount, upliftAmount: r2(bestAmount - localAmount), upliftPct: localAmount > 0 ? Math.round((bestAmount - localAmount) / localAmount * 100) : 0 };
  }
  function pickupView(db, p) {
    var lot = db.lots.find(function (l) { return l.id === p.lotId; }), m = mat(db, lot.materialId);
    var rec = recyclerById(db, p.recyclerId), k = userById(db, p.kabadiwalaId);
    var h = db.handovers.find(function (x) { return x.pickupId === p.id; }) || null;
    return Object.assign({}, p, { lot: lot, material: m, recycler: rec, kabadiwala: { id: k.id, name: k.name, shopName: k.shopName, phone: k.phone, ward: k.ward }, handover: h });
  }

  /* ---------------- sessions ---------------- */
  var SESSION = 'tk_token';
  function token() { try { return sessionStorage.getItem(SESSION); } catch (e) { return null; } }
  function currentUser(db) {
    var t = token(); if (!t) return null;
    var uid = (db || load()).sessions[t];
    return uid ? userById(db || load(), uid) : null;
  }
  function requireUser(db, role) {
    var u = currentUser(db);
    need(u, 'Please log in', 401);
    need(!role || u.role === role, 'This page is not available for your account type', 403);
    return u;
  }
  function recyclerOf(db, u) { return db.recyclers.find(function (r) { return r.userId === u.id; }); }

  /* =====================================================================
     Public API used by the pages
     ===================================================================== */
  var api = (TK.api = {});

  var ROLE_NAME = { kabadiwala: 'seller (kabadiwala)', recycler: 'buyer (recycler)', admin: 'city officer (ULB)' };
  var ROLE_LOGIN = { kabadiwala: 'Seller login', recycler: 'Buyer login', admin: 'Officer login' };
  // Each login section only accepts its own kind of account
  function checkRole(db, phone, as) {
    if (!as) return;
    var u = db.users.find(function (x) { return x.phone === phone; });
    if (u) need(u.role === as, 'This number is registered as a ' + ROLE_NAME[u.role] + '. Please use the ' + ROLE_LOGIN[u.role] + ' section.', 403);
    else if (as === 'recycler') throw Err('This number is not a registered buyer. Buyers are added by the ULB after their CPCB authorisation is checked. Demo buyers: 9000000002, 9000000005, 9000000006.', 403);
    else if (as === 'admin') throw Err('This number is not an officer account. Demo officer: 9000000003.', 403);
  }
  api.requestOtp = function (phone, as) {
    phone = String(phone || '').replace(/\D/g, '').slice(-10);
    need(/^[6-9]\d{9}$/.test(phone), 'Enter a valid 10-digit mobile number');
    checkRole(load(), phone, as);
    var u = load().users.find(function (x) { return x.phone === phone; });
    return { phone: phone, demoCode: DEMO_OTP, isNew: !u, name: u ? u.name : null };
  };
  api.verifyOtp = function (phone, code, as) {
    phone = String(phone || '').replace(/\D/g, '').slice(-10);
    need(String(code).trim() === DEMO_OTP, 'Wrong OTP. Please check and try again');
    return change(function (db) {
      checkRole(db, phone, as);
      var u = db.users.find(function (x) { return x.phone === phone; }), isNew = false;
      if (!u) { u = { id: nextId(db, 'users'), phone: phone, name: null, role: 'kabadiwala', ward: 'Gurugram', lat: 28.4722, lng: 77.0459, createdAt: nowIso() }; db.users.push(u); isNew = true; }
      var t = randHex(24); db.sessions[t] = u.id;
      try { sessionStorage.setItem(SESSION, t); } catch (e) { /* ignore */ }
      return { user: u, isNew: isNew };
    });
  };
  api.me = function () { return currentUser(); };
  api.logout = function () { try { sessionStorage.removeItem(SESSION); } catch (e) { /* ignore */ } };
  api.updateMe = function (f) {
    return change(function (db) {
      var u = requireUser(db);
      var uan = f.eshramUan ? String(f.eshramUan).replace(/\D/g, '') : '';
      need(!uan || uan.length === 12, 'e-Shram UAN has 12 digits');
      need(f.name && String(f.name).trim(), 'Enter your name');
      u.name = String(f.name).trim().slice(0, 60); u.shopName = f.shopName || null; u.ward = f.ward || u.ward;
      if (f.lat != null) { u.lat = Number(f.lat); u.lng = Number(f.lng); }
      u.eshramUan = uan || null;
      if (f.consent && !u.consentAt) u.consentAt = nowIso();
      return u;
    });
  };
  api.acceptConsent = function () {
    return change(function (db) {
      var u = requireUser(db);
      if (!u.consentAt) u.consentAt = nowIso();
      return u;
    });
  };
  api.downloadMyData = function () {
    var db = load(), u = requireUser(db);
    var data = {
      profile: u,
      lots: db.lots.filter(function (l) { return l.userId === u.id; }),
      pickups: db.pickups.filter(function (p) { return p.kabadiwalaId === u.id; }),
      ledger: db.ledger.filter(function (l) { return l.userId === u.id; })
    };
    return JSON.stringify(data, null, 2);
  };
  api.deleteMyAccount = function () {
    return change(function (db) {
      var u = requireUser(db);
      u.phone = 'DELETED_' + u.id;
      u.name = 'Deleted User';
      u.shopName = null;
      u.eshramUan = null;
      u.lat = null;
      u.lng = null;
      u.consentAt = null;
      api.logout();
    });
  };

  api.materials = function () { return load().materials.slice().sort(function (a, b) { return a.sort - b.sort; }).map(materialView); };

  function todaySummary(db, uid) {
    var today = istDay(nowIso()), sold = 0, bought = 0;
    db.ledger.forEach(function (l) { if (l.userId === uid && istDay(l.createdAt) === today) { if (l.type === 'sale') sold += l.amount; else bought -= l.amount; } });
    return { sold: r2(sold), bought: r2(bought), net: r2(sold - bought) };
  }
  api.dashboard = function () {
    var db = load(), u = requireUser(db, 'kabadiwala');
    var recent = db.ledger.filter(function (l) { return l.userId === u.id; }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 6);
    var active = db.pickups.filter(function (p) { return p.kabadiwalaId === u.id && ['booked', 'awaiting_confirmation', 'disputed'].indexOf(p.status) >= 0; }).map(function (p) { return pickupView(db, p); });
    return { today: todaySummary(db, u.id), materials: api.materials(), recent: recent, active: active, impact: api.impactMe() };
  };
  api.impactMe = function () {
    var db = load(), u = requireUser(db, 'kabadiwala'), kg = 0, hz = 0, n = 0;
    db.pickups.forEach(function (p) {
      if (p.kabadiwalaId !== u.id || p.status !== 'confirmed') return;
      var v = pickupView(db, p); n++;
      if (v.material.unit === 'kg') { kg += v.handover.receivedWeightKg; if (v.material.hazard) hz += v.handover.receivedWeightKg; }
    });
    return { kg: r2(kg), hazardKg: r2(hz), handovers: n };
  };

  api.createLot = function (b) {
    return change(function (db) {
      var u = requireUser(db, 'kabadiwala'), m = mat(db, b.materialId);
      need(m, 'Choose what the scrap is');
      var w = Number(b.weightKg);
      need(isFinite(w) && w > 0 && w <= 5000, m.unit === 'pc' ? 'Enter how many pieces (1 or more)' : 'Enter the weight in kg (more than 0)');
      var photo = b.photo ? savePhoto(db, b.photo, 'lot') : { path: null, sha256: null };
      var id = nextId(db, 'lots');
      db.lots.push({ id: id, userId: u.id, materialId: m.id, weightKg: w, photoPath: photo.path, photoSha256: photo.sha256, aiLabel: b.aiLabel || null, aiConfidence: b.aiConfidence || null, boardRate: m.boardRate, estimate: r2(m.boardRate * w), status: 'open', createdAt: nowIso() });
      db.recyclers.forEach(function (r) {
        var bid = bidOf(db, r.id, m.id); if (!r.verified || !bid || !r.userId) return;
        notify(db, r.userId, 'lot', 'नया कबाड़ उपलब्ध · New scrap listed', (u.shopName || u.name || 'Kabadiwala') + ', ' + (u.ward || '') + ' · ' + fmtQty(w, m) + ' · your bid ₹' + bid.rate + '/' + m.unit, 'buyer-market.html');
      });
      return id;
    });
  };
  api.lot = function (id, from) {
    var db = load(), u = requireUser(db, 'kabadiwala');
    var lot = db.lots.find(function (l) { return l.id === Number(id); });
    need(lot, 'Lot not found', 404); need(lot.userId === u.id, 'This lot belongs to another account', 403);
    var m = mat(db, lot.materialId);
    from = from || (u.lat != null ? { lat: u.lat, lng: u.lng } : null);
    var pickup = db.pickups.find(function (p) { return p.lotId === lot.id && p.status !== 'cancelled'; });
    return { lot: lot, material: materialView(m), quote: quote(db, m, lot.weightKg, from), recyclers: recyclersFor(db, m.id, from).sort(function (a, b) { return b.bid - a.bid; }), from: from, pickupId: pickup ? pickup.id : null };
  };
  api.book = function (b) {
    return change(function (db) {
      var u = requireUser(db, 'kabadiwala');
      var lot = db.lots.find(function (l) { return l.id === Number(b.lotId) && l.userId === u.id; });
      need(lot, 'Lot not found', 404);
      need(!db.pickups.some(function (p) { return p.lotId === lot.id && p.status !== 'cancelled'; }), 'A pickup is already booked for this lot', 409);
      var rec = recyclerById(db, Number(b.recyclerId)); need(rec && rec.verified, 'Choose an authorised recycler');
      var bid = bidOf(db, rec.id, lot.materialId); need(bid, 'This recycler is not buying this material right now');
      var slots = nextSlots(rec.pickupAvailable), slot = slots.find(function (s) { return s.id === b.slotId; }) || slots[0];
      var id = nextId(db, 'pickups');
      db.pickups.push({ id: id, lotId: lot.id, recyclerId: rec.id, kabadiwalaId: u.id, slot: slot.en + '|' + slot.hi, paymentMode: ['Cash', 'UPI', 'AePS'].indexOf(b.paymentMode) >= 0 ? b.paymentMode : 'Cash', rate: bid.rate, amount: r2(bid.rate * lot.weightKg), status: 'booked', createdAt: nowIso() });
      lot.status = 'booked';
      notify(db, rec.userId, 'booking', 'नया पिकअप बुक · New pickup booked', (u.shopName || u.name || 'Kabadiwala') + ' · ' + fmtQty(lot.weightKg, mat(db, lot.materialId)) + ' · ' + slot.en + ' · ₹' + r2(bid.rate * lot.weightKg) + ' by ' + (['Cash', 'UPI', 'AePS'].indexOf(b.paymentMode) >= 0 ? b.paymentMode : 'Cash'), 'recycler.html');
      notify(db, u.id, 'booking', 'पिकअप बुक हो गया · Pickup booked', rec.name + ' · ' + slot.en + ' · ' + fmtQty(lot.weightKg, mat(db, lot.materialId)), 'pickups.html?id=' + id);
      return id;
    });
  };
  function canSee(db, u, p) { return u.role === 'admin' || (u.role === 'kabadiwala' && p.kabadiwalaId === u.id) || (u.role === 'recycler' && recyclerOf(db, u) && recyclerOf(db, u).id === p.recyclerId); }
  api.pickups = function () {
    var db = load(), u = requireUser(db);
    return db.pickups.filter(function (p) { return canSee(db, u, p); }).sort(function (a, b) { return b.id - a.id; }).map(function (p) { return pickupView(db, p); });
  };
  api.pickup = function (id) {
    var db = load(), u = requireUser(db), p = db.pickups.find(function (x) { return x.id === Number(id); });
    need(p, 'Pickup not found', 404); need(canSee(db, u, p), 'This pickup belongs to another account', 403);
    return pickupView(db, p);
  };
  api.cancel = function (id) {
    return change(function (db) {
      var u = requireUser(db, 'kabadiwala'), p = db.pickups.find(function (x) { return x.id === Number(id) && x.kabadiwalaId === u.id; });
      need(p, 'Pickup not found', 404); need(p.status === 'booked', 'Only a booked pickup can be cancelled', 409);
      p.status = 'cancelled'; var cl = db.lots.find(function (l) { return l.id === p.lotId; }); cl.status = 'open';
      notify(db, buyerUserOf(db, p.recyclerId), 'cancel', 'पिकअप रद्द · Pickup cancelled', (u.shopName || u.name) + ' cancelled pickup #' + p.id + ' (' + fmtQty(cl.weightKg, mat(db, cl.materialId)) + ')', 'recycler.html');
    });
  };
  // Photo + GPS + time + weight → SHA-256 record chained to the previous record (append-only)
  api.handover = function (id, b) {
    return change(function (db) {
      var u = requireUser(db, 'kabadiwala'), p = db.pickups.find(function (x) { return x.id === Number(id) && x.kabadiwalaId === u.id; });
      need(p, 'Pickup not found', 404); need(p.status === 'booked', 'Handover is already recorded for this pickup', 409);
      need(b.photo, 'Take a handover photo first');
      var w = Number(b.weightKg); need(isFinite(w) && w > 0, 'Enter the handover weight');
      var photo = savePhoto(db, b.photo, 'handover');
      var lat = b.lat != null && isFinite(b.lat) ? Math.round(b.lat * 1e6) / 1e6 : null, lng = b.lng != null && isFinite(b.lng) ? Math.round(b.lng * 1e6) / 1e6 : null;
      var last = db.handovers[db.handovers.length - 1];
      var lot = db.lots.find(function (l) { return l.id === p.lotId; });
      var payload = { v: 1, pickupId: p.id, lotId: p.lotId, kabadiwalaId: p.kabadiwalaId, recyclerId: p.recyclerId, material: mat(db, lot.materialId).code, weightKg: w,
        lat: lat, lng: lng, gpsSource: b.gpsSource || (lat != null ? 'device' : 'none'), capturedAt: nowIso(), photoSha256: photo.sha256, prevHash: last ? last.recordHash : GENESIS };
      var hash = sha256(canonical(payload));
      db.handovers.push({ id: nextId(db, 'handovers'), pickupId: p.id, photoPath: photo.path, photoSha256: photo.sha256, lat: lat, lng: lng, gpsSource: payload.gpsSource,
        weightKg: w, capturedAt: payload.capturedAt, payload: canonical(payload), prevHash: payload.prevHash, recordHash: hash, receivedWeightKg: null, confirmedAt: null, mismatch: false });
      p.status = 'awaiting_confirmation'; lot.status = 'handed_over';
      notify(db, u.id, 'handover', 'रिकॉर्ड बन गया · Handover recorded', fmtQty(w, mat(db, lot.materialId)) + ' handed to ' + recyclerById(db, p.recyclerId).name + '. Record sealed; you are paid as soon as they confirm the weight.', 'pickups.html?id=' + p.id);
      notify(db, buyerUserOf(db, p.recyclerId), 'handover', 'हैंडओवर हुआ · Handover recorded', (u.shopName || u.name) + ' handed over ' + fmtQty(w, mat(db, lot.materialId)) + ' · pickup #' + p.id + '. Verify the record and confirm the weight.', 'recycler.html');
      return hash;
    });
  };
  function settle(db, p, weight) {
    var lot = db.lots.find(function (l) { return l.id === p.lotId; }), m = mat(db, lot.materialId), rec = recyclerById(db, p.recyclerId);
    p.amount = r2(p.rate * weight); p.status = 'confirmed'; lot.status = 'sold';
    db.ledger.push({ id: nextId(db, 'ledger'), userId: p.kabadiwalaId, type: 'sale', materialId: m.id, description: 'रीसाइक्लर को बेचा · Sold ' + m.nameEn + ' ' + weight + ' ' + m.unit + ' to ' + rec.name, weightKg: weight, amount: p.amount, mode: p.paymentMode, pickupId: p.id, createdAt: nowIso() });
  }
  api.confirm = function (id, receivedWeightKg) {
    return change(function (db) {
      var u = requireUser(db, 'recycler'), rec = recyclerOf(db, u), p = db.pickups.find(function (x) { return x.id === Number(id); });
      need(p && rec && p.recyclerId === rec.id, 'Pickup not found', 404);
      need(p.status === 'awaiting_confirmation', p.status === 'booked' ? 'The kabadiwala has not recorded the handover yet' : 'This pickup is already closed', 409);
      var h = db.handovers.find(function (x) { return x.pickupId === p.id; }), rw = Number(receivedWeightKg);
      need(isFinite(rw) && rw > 0, 'Enter the weight you received');
      var mismatch = Math.abs(rw - h.weightKg) / h.weightKg > 0.05;
      h.receivedWeightKg = rw; h.confirmedAt = nowIso(); h.confirmedBy = u.id; h.mismatch = mismatch;
      if (mismatch) p.status = 'disputed'; else settle(db, p, Math.min(rw, h.weightKg));
      var lm = mat(db, db.lots.find(function (l) { return l.id === p.lotId; }).materialId);
      if (mismatch) {
        notify(db, [p.kabadiwalaId, u.id].concat(adminIds(db)), 'dispute', 'वज़न विवाद · Weight dispute', 'Pickup #' + p.id + ': handed over ' + h.weightKg + ', received ' + rw + ' ' + lm.unit + '. The ULB officer will review the record.', null);
      } else {
        notify(db, p.kabadiwalaId, 'paid', 'भुगतान मिला · Payment received', rec.name + ' confirmed ' + Math.min(rw, h.weightKg) + ' ' + lm.unit + ' and paid ₹' + p.amount + ' (' + p.paymentMode + ')', 'pickups.html?id=' + p.id);
        notify(db, u.id, 'purchase', 'खरीद पूरी · Purchase complete', 'Bought ' + fmtQty(Math.min(rw, h.weightKg), lm) + ' for ₹' + p.amount + ' · pickup #' + p.id, 'buyer-purchases.html');
      }
      return { mismatch: mismatch, amount: p.amount };
    });
  };

  // Recompute every record and check the chain
  api.verifyChain = function () {
    var db = load(), prev = GENESIS;
    var results = db.handovers.map(function (h) {
      var payload = JSON.parse(h.payload);
      var checks = { hashMatches: sha256(canonical(payload)) === h.recordHash, linksToPrevious: payload.prevHash === prev && h.prevHash === prev,
        columnsMatch: payload.photoSha256 === h.photoSha256 && payload.weightKg === h.weightKg && payload.capturedAt === h.capturedAt };
      prev = h.recordHash;
      return { id: h.id, pickupId: h.pickupId, recordHash: h.recordHash, checks: checks, ok: checks.hashMatches && checks.linksToPrevious && checks.columnsMatch };
    });
    return { ok: results.every(function (r) { return r.ok; }), count: results.length, results: results };
  };
  api.publicVerify = function (hash) {
    hash = String(hash || '').trim().toLowerCase();
    need(/^[0-9a-f]{64}$/.test(hash), 'A record hash has 64 characters (0-9, a-f)');
    var db = load(), h = db.handovers.find(function (x) { return x.recordHash === hash; });
    need(h, 'No handover record with this hash in this demo. It may be mistyped.', 404);
    var chain = api.verifyChain(), mine = chain.results.find(function (r) { return r.id === h.id; });
    var v = pickupView(db, db.pickups.find(function (p) { return p.id === h.pickupId; }));
    return { ok: mine.ok && chain.ok, checks: mine.checks, chainOk: chain.ok, chainLength: chain.count, handover: h, pickup: v };
  };

  api.ledger = function (days) {
    var db = load(), u = requireUser(db, 'kabadiwala'), since = Date.now() - (days || 30) * DAY;
    return { rows: db.ledger.filter(function (l) { return l.userId === u.id && new Date(l.createdAt).getTime() >= since; }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }), today: todaySummary(db, u.id) };
  };
  api.addLedger = function (b) {
    return change(function (db) {
      var u = requireUser(db, 'kabadiwala');
      need(['sale', 'purchase'].indexOf(b.type) >= 0, 'Choose bought or sold');
      var amt = Math.abs(Number(b.amount)); need(isFinite(amt) && amt > 0, 'Enter an amount in rupees');
      var m = b.materialId ? mat(db, b.materialId) : null, w = b.weightKg ? Number(b.weightKg) : null;
      db.ledger.push({ id: nextId(db, 'ledger'), userId: u.id, type: b.type, materialId: m ? m.id : null,
        description: (b.type === 'sale' ? 'बेचा · Sold' : 'बीनने वाले से खरीदा · Bought') + (m ? ' ' + m.nameEn : '') + (w ? ' ' + w + ' ' + (m ? m.unit : 'kg') : ''),
        weightKg: w, amount: b.type === 'sale' ? amt : -amt, mode: ['Cash', 'UPI', 'AePS'].indexOf(b.mode) >= 0 ? b.mode : 'Cash', createdAt: nowIso() });
    });
  };

  /* ---------------- Earnings Passport + Trust Score ---------------- */
  function passportFor(db, u) {
    if (!u.passportCode) u.passportCode = randHex(5).toUpperCase();
    var sales = db.pickups.filter(function (p) { return p.kabadiwalaId === u.id && p.status === 'confirmed'; }).map(function (p) { return pickupView(db, p); });
    var mism = db.handovers.filter(function (h) { var p = db.pickups.find(function (x) { return x.id === h.pickupId; }); return h.mismatch && p.kabadiwalaId === u.id; }).length;
    var since90 = Date.now() - 90 * DAY, weeks = {}, sold90 = 0;
    db.ledger.forEach(function (l) {
      if (l.userId !== u.id) return;
      var t = new Date(l.createdAt).getTime();
      if (t >= since90) { weeks[Math.floor(t / (7 * DAY))] = 1; if (l.type === 'sale') sold90 += l.amount; }
    });
    var months = {};
    db.ledger.forEach(function (l) {
      if (l.userId !== u.id || l.type !== 'sale' || new Date(l.createdAt).getTime() < Date.now() - 180 * DAY) return;
      var k = istDay(l.createdAt).slice(0, 7); months[k] = months[k] || { month: k, sold: 0, verified: 0 };
      months[k].sold += l.amount; if (l.pickupId) months[k].verified += l.amount;
    });
    var tenure = Math.max(1, Math.round((Date.now() - new Date(u.createdAt).getTime()) / DAY));
    var n = sales.length, activeWeeks = Object.keys(weeks).length;
    var parts = { verifiedSales: Math.round(40 * Math.min(n / 20, 1)), consistency: Math.round(20 * Math.min(activeWeeks / 12, 1)), tenure: Math.round(15 * Math.min(tenure / 180, 1)),
      noDisputes: Math.round(15 * (1 - (n + mism ? mism / (n + mism) : 0))), identity: u.eshramUan ? 10 : 0 };
    var score = parts.verifiedSales + parts.consistency + parts.tenure + parts.noDisputes + parts.identity;
    var band = score >= 75 ? ['बहुत भरोसेमंद', 'Highly reliable'] : score >= 50 ? ['भरोसेमंद', 'Reliable'] : score >= 25 ? ['बढ़ रहा है', 'Building'] : ['नया', 'New'];
    return { code: u.passportCode, name: u.name || 'Kabadiwala', shopName: u.shopName, ward: u.ward, eshramLinked: !!u.eshramUan, memberSince: u.createdAt, tenureDays: tenure,
      verifiedCount: n, verifiedIncome: r2(sales.reduce(function (a, s) { return a + s.amount; }, 0)),
      kgDiverted: r2(sales.filter(function (s) { return s.material.unit === 'kg'; }).reduce(function (a, s) { return a + s.handover.receivedWeightKg; }, 0)),
      sold90: r2(sold90), activeWeeks: activeWeeks, monthly: Object.keys(months).sort().map(function (k) { return { month: k, sold: r2(months[k].sold), verified: r2(months[k].verified) }; }),
      score: score, parts: parts, band: { hi: band[0], en: band[1] }, generatedAt: nowIso() };
  }
  api.passport = function () { return change(function (db) { return passportFor(db, requireUser(db, 'kabadiwala')); }); };
  api.publicPassport = function (code) {
    var db = load(), u = db.users.find(function (x) { return x.passportCode === String(code).toUpperCase() && x.role === 'kabadiwala'; });
    need(u, 'Passport not found', 404);
    return passportFor(db, u);
  };

  /* ---------------- Recycler ---------------- */
  api.recyclerMe = function () {
    var db = load(), u = requireUser(db, 'recycler'), rec = recyclerOf(db, u);
    need(rec, 'No recycler facility is linked to this account', 404);
    var confirmed = db.pickups.filter(function (p) { return p.recyclerId === rec.id && p.status === 'confirmed'; }).map(function (p) { return pickupView(db, p); });
    return { recycler: rec, bids: db.materials.map(function (m) { var b = bidOf(db, rec.id, m.id); return { material: m, rate: b ? b.rate : '' }; }),
      stats: { confirmed: confirmed.length, kg: r2(confirmed.filter(function (p) { return p.material.unit === 'kg'; }).reduce(function (a, p) { return a + p.handover.receivedWeightKg; }, 0)), paid: r2(confirmed.reduce(function (a, p) { return a + p.amount; }, 0)) } };
  };
  api.saveBids = function (list) {
    return change(function (db) {
      var rec = recyclerOf(db, requireUser(db, 'recycler'));
      list.forEach(function (x) {
        var i = db.bids.findIndex(function (b) { return b.recyclerId === rec.id && b.materialId === Number(x.materialId); });
        if (x.rate === '' || x.rate == null) { if (i >= 0) db.bids.splice(i, 1); return; }
        var rate = Number(x.rate); need(isFinite(rate) && rate >= 0, 'Bids must be positive rupee amounts');
        if (i >= 0) { db.bids[i].rate = rate; db.bids[i].updatedAt = nowIso(); } else db.bids.push({ recyclerId: rec.id, materialId: Number(x.materialId), rate: rate, updatedAt: nowIso() });
      });
    });
  };
  api.setAvailability = function (on) { return change(function (db) { recyclerOf(db, requireUser(db, 'recycler')).pickupAvailable = !!on; }); };

  /* ---------------- Admin / ULB ---------------- */
  api.adminOverview = function () {
    var db = load(); requireUser(db, 'admin');
    var all = db.pickups.map(function (p) { return pickupView(db, p); }), conf = all.filter(function (p) { return p.status === 'confirmed'; });
    var paid = conf.reduce(function (a, p) { return a + p.amount; }, 0), local = conf.reduce(function (a, p) { return a + p.handover.receivedWeightKg * p.material.localRate; }, 0);
    var byMaterial = db.materials.map(function (m) {
      var ps = conf.filter(function (p) { return p.material.id === m.id; });
      return { material: m, qty: r2(ps.reduce(function (a, p) { return a + p.handover.receivedWeightKg; }, 0)), paid: r2(ps.reduce(function (a, p) { return a + p.amount; }, 0)), n: ps.length };
    });
    var wards = {};
    db.users.filter(function (u) { return u.role === 'kabadiwala'; }).forEach(function (u) {
      var w = u.ward || '-'; wards[w] = wards[w] || { ward: w, workers: 0, pickups: 0 }; wards[w].workers++;
      wards[w].pickups += conf.filter(function (p) { return p.kabadiwalaId === u.id; }).length;
    });
    return {
      kpis: { kgDiverted: r2(conf.filter(function (p) { return p.material.unit === 'kg'; }).reduce(function (a, p) { return a + p.handover.receivedWeightKg; }, 0)), confirmed: conf.length,
        open: all.filter(function (p) { return p.status === 'booked' || p.status === 'awaiting_confirmation'; }).length, disputed: all.filter(function (p) { return p.status === 'disputed'; }).length,
        paid: r2(paid), upliftPct: local > 0 ? Math.round((paid - local) / local * 100) : null,
        kabadiwalas: db.users.filter(function (u) { return u.role === 'kabadiwala'; }).length, eshramLinked: db.users.filter(function (u) { return u.role === 'kabadiwala' && u.eshramUan; }).length,
        recyclers: db.recyclers.filter(function (r) { return r.verified; }).length },
      byMaterial: byMaterial, byWard: Object.keys(wards).map(function (k) { return wards[k]; }),
      disputes: all.filter(function (p) { return p.status === 'disputed'; }), recent: all.sort(function (a, b) { return b.id - a.id; }).slice(0, 15),
    };
  };
  api.adminMaterials = function () {
    var db = load(); requireUser(db, 'admin');
    return { materials: api.materials().map(function (m) {
      var rs = db.bids.filter(function (b) { return b.materialId === m.id && recyclerById(db, b.recyclerId).verified; }).map(function (b) { return b.rate; });
      return Object.assign(m, { bidMin: rs.length ? Math.min.apply(null, rs) : null, bidMax: rs.length ? Math.max.apply(null, rs) : null, bidCount: rs.length });
    }), history: db.priceHistory.slice(-30).reverse().map(function (h) { return Object.assign({ code: mat(db, h.materialId).code }, h); }) };
  };
  function setBoard(db, m, rate, source) {
    if (rate === m.boardRate) return false;
    var up = rate > m.boardRate, diff = r2(Math.abs(rate - m.boardRate));
    m.prevRate = m.boardRate; m.boardRate = rate; m.updatedAt = nowIso(); db.priceHistory.push({ materialId: m.id, rate: rate, source: source, at: nowIso() });
    notify(db, db.users.filter(function (x) { return x.role === 'kabadiwala'; }).map(function (x) { return x.id; }), 'rate', up ? 'दाम बढ़ा · Rate up' : 'दाम घटा · Rate down', m.nameEn + ': ₹' + rate + '/' + m.unit + ' (' + (up ? '+' : '−') + '₹' + diff + ')' + (up ? '. A good time to sell.' : ''), 'sell.html');
    return true;
  }
  api.setRates = function (id, board, local) {
    return change(function (db) {
      requireUser(db, 'admin'); var m = mat(db, id);
      var b = Number(board), l = Number(local); need(isFinite(b) && b >= 0 && isFinite(l) && l >= 0, 'Rates must be positive numbers');
      setBoard(db, m, r2(b), 'admin'); m.localRate = r2(l);
    });
  };
  api.recompute = function () {
    return change(function (db) {
      requireUser(db, 'admin'); var changed = 0;
      db.materials.forEach(function (m) {
        var rs = db.bids.filter(function (b) { return b.materialId === m.id && recyclerById(db, b.recyclerId).verified; }).map(function (b) { return b.rate; }).sort(function (a, b) { return a - b; });
        if (!rs.length) return;
        var mid = rs.length % 2 ? rs[(rs.length - 1) / 2] : (rs[rs.length / 2 - 1] + rs[rs.length / 2]) / 2;
        if (setBoard(db, m, Math.round(mid), 'median-of-bids')) changed++;
      });
      return changed;
    });
  };
  api.adminRecyclers = function () { var db = load(); requireUser(db, 'admin'); return db.recyclers; };
  api.toggleRecycler = function (id) { return change(function (db) { requireUser(db, 'admin'); var r = recyclerById(db, Number(id)); r.verified = !r.verified; }); };
  api.addRecycler = function (f) {
    return change(function (db) {
      requireUser(db, 'admin');
      need(f.name && f.area && f.cpcbAuthNo, 'Name, area and CPCB authorisation number are required');
      var lat = Number(f.lat), lng = Number(f.lng); need(isFinite(lat) && isFinite(lng) && f.lat !== '' && f.lng !== '', 'Enter latitude and longitude');
      db.recyclers.push({ id: nextId(db, 'recyclers'), userId: null, name: f.name, area: f.area, lat: lat, lng: lng, cpcbAuthNo: f.cpcbAuthNo, rating: 4.0, verified: false, pickupAvailable: true });
    });
  };
  api.resolveDispute = function (id) {
    return change(function (db) {
      requireUser(db, 'admin'); var p = db.pickups.find(function (x) { return x.id === Number(id); });
      need(p && p.status === 'disputed', 'Only disputed pickups can be resolved', 409);
      settle(db, p, db.handovers.find(function (h) { return h.pickupId === p.id; }).receivedWeightKg);
      notify(db, [p.kabadiwalaId, buyerUserOf(db, p.recyclerId)], 'paid', 'विवाद सुलझा · Dispute settled', 'Pickup #' + p.id + ' settled on the received weight: ₹' + p.amount, null);
    });
  };
  api.eprCsv = function () {
    var db = load(), u = requireUser(db), rec = u.role === 'recycler' ? recyclerOf(db, u) : null;
    need(u.role === 'admin' || rec, 'Not allowed', 403);
    var rows = db.pickups.filter(function (p) { return p.status === 'confirmed' && (!rec || p.recyclerId === rec.id); }).map(function (p) { return pickupView(db, p); });
    var esc = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var head = ['pickup_id', 'material_code', 'material', 'handover_kg', 'received_kg', 'recycler', 'cpcb_auth_no', 'ward', 'lat', 'lng', 'captured_at_utc', 'confirmed_at_utc', 'amount_inr', 'payment_mode', 'record_sha256', 'prev_sha256'];
    return [head.join(',')].concat(rows.map(function (p) {
      var h = p.handover;
      return [p.id, p.material.code, p.material.nameEn, h.weightKg, h.receivedWeightKg, p.recycler.name, p.recycler.cpcbAuthNo, p.kabadiwala.ward, h.lat, h.lng, h.capturedAt, h.confirmedAt, p.amount, p.paymentMode, h.recordHash, h.prevHash].map(esc).join(',');
    })).join('\n') + '\n';
  };
  api.cpcbEprCsv = function () {
    var db = load(), u = requireUser(db), rec = u.role === 'recycler' ? recyclerOf(db, u) : null;
    need(u.role === 'admin' || rec, 'Not allowed', 403);
    var rows = db.pickups.filter(function (p) { return p.status === 'confirmed' && (!rec || p.recyclerId === rec.id); }).map(function (p) { return pickupView(db, p); });
    var esc = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var head = ['Sl.No', 'Date', 'CPCB_Waste_Code', 'Material_Category', 'Quantity_Kg', 'Unit', 'Seller_Name', 'Seller_Phone_Masked', 'Seller_Ward', 'Buyer_CPCB_Reg_No', 'Buyer_Name', 'Buyer_Facility', 'GPS_Lat', 'GPS_Lon', 'Transaction_Hash', 'Prev_Hash', 'Handover_Status', 'HSN_Code', 'Hazardous_Flag'];
    return [head.join(',')].concat(rows.map(function (p, i) {
      var h = p.handover;
      var maskedPhone = p.kabadiwala.phone ? p.kabadiwala.phone.slice(0, 2) + '******' + p.kabadiwala.phone.slice(-2) : '';
      return [
        i + 1,
        istDay(h.confirmedAt),
        p.material.cpcbCode || '',
        p.material.nameEn,
        h.receivedWeightKg,
        p.material.unit,
        p.kabadiwala.name,
        maskedPhone,
        p.kabadiwala.ward,
        p.recycler.cpcbAuthNo,
        p.recycler.name,
        p.recycler.area,
        h.lat,
        h.lng,
        h.recordHash,
        h.prevHash,
        'VERIFIED',
        p.material.hsnCode || '',
        p.material.hazard ? 'YES' : 'NO'
      ].map(esc).join(',');
    })).join('\n') + '\n';
  };

  /* ---------------- Public channels ---------------- */
  api.ivrMenu = function () {
    return api.materials().map(function (m, i) {
      return { digit: String(i + 1), m: m, speech: m.nameHi + '। आज का दाम ' + m.boardRate + ' रुपये प्रति ' + (m.unit === 'kg' ? 'किलो' : 'पीस') + '।' + (m.hazard ? ' सावधान: ' + m.safetyHi : '') };
    });
  };
  var WORDS = { PCB: ['pcb', 'board', 'motherboard', 'circuit', 'मदरबोर्ड', 'बोर्ड'], CU_WIRE: ['copper', 'wire', 'taar', 'तार', 'तांबा'], PHONE: ['phone', 'mobile', 'मोबाइल', 'फोन'],
    LAPTOP: ['laptop', 'लैपटॉप'], LI_BATT: ['battery', 'lithium', 'बैटरी'], CRT: ['crt', 'tv', 'monitor', 'टीवी', 'मॉनिटर'], MIXED: ['keyboard', 'mouse', 'cable', 'mixed', 'कीबोर्ड', 'माउस'] };
  api.bot = function (text) {
    var t = String(text || '').toLowerCase().trim(), ms = api.materials(), db = load(), from = { lat: 28.4722, lng: 77.0459 };
    var menu = ms.map(function (m, i) { return (i + 1) + '. ' + m.nameHi + ' (' + m.nameEn + ')'; }).join('\n');
    var m = null, n = /^(\d)$/.exec(t);
    if (n) m = ms[Number(n[1]) - 1] || null;
    if (!m) Object.keys(WORDS).some(function (c) { if (WORDS[c].some(function (w) { return t.indexOf(w) >= 0; })) { m = ms.find(function (x) { return x.code === c; }); return true; } return false; });
    if (!t || /^(hi|hello|namaste|नमस्ते|menu|help|मदद)/.test(t)) return 'नमस्ते! मैं TolKanta बॉट हूँ। 🙏\nसामान का नाम या नंबर भेजें, आज का दाम बताऊँगा:\n' + menu + '\n\n"recycler" लिखें: नज़दीकी अधिकृत रीसाइक्लर।';
    if (/recycler|रीसाइक्लर|near|paas|पास|buyer/.test(t)) {
      var mm = m || ms[0];
      return mm.nameHi + ' के लिए नज़दीकी अधिकृत रीसाइक्लर:\n' + recyclersFor(db, mm.id, from).sort(function (a, b) { return a.distanceKm - b.distanceKm; }).slice(0, 3)
        .map(function (r, i) { return (i + 1) + '. ' + r.name + ', ' + r.area + '\n   ' + r.distanceKm + ' km · ₹' + r.bid + '/' + mm.unit; }).join('\n') + '\n\nपिकअप बुक करने के लिए TolKanta वेबसाइट पर लॉग इन करें।';
    }
    if (/human|agent|dispute|शिकायत|problem/.test(t)) return 'आपकी बात सहायता अधिकारी तक पहुँचा दी गई है। वे जल्द संपर्क करेंगे। (डेमो)';
    if (m) {
      var best = recyclersFor(db, m.id, from).reduce(function (a, b) { return !a || b.bid > a.bid ? b : a; }, null);
      return m.nameHi + ' (' + m.nameEn + ')\nआज का बोर्ड रेट: ₹' + m.boardRate + '/' + (m.unit === 'kg' ? 'किलो' : 'पीस') + (best ? '\nसबसे अच्छी अधिकृत बोली: ₹' + best.bid + ' · ' + best.name : '') +
        '\nलोकल रेट (लगभग): ₹' + m.localRate + '\n' + (m.hazard ? '⚠️ ' : '💡 ') + m.safetyHi + '\n\n"recycler" लिखें: पास के खरीदार।';
    }
    return 'माफ़ कीजिए, समझ नहीं आया। इनमें से कोई नाम या नंबर भेजें:\n' + menu;
  };
  // Authorised recyclers buying a material, best bid first (used by the chat assistant)
  api.bestBids = function (materialId, from) {
    var db = load(); from = from || { lat: 28.4722, lng: 77.0459 };
    return recyclersFor(db, Number(materialId), from).sort(function (a, b) { return b.bid - a.bid; });
  };
  /* ---------------- Seller (kabadiwala): what I sold ---------------- */
  function saleRows(db, u) {
    return db.pickups.filter(function (p) { return p.kabadiwalaId === u.id && p.status === 'confirmed'; }).map(function (p) { return pickupView(db, p); })
      .sort(function (a, b) { return (b.handover.confirmedAt || '').localeCompare(a.handover.confirmedAt || ''); });
  }
  api.sellerSales = function (days, materialId) {
    var db = load(), u = requireUser(db, 'kabadiwala'), since = days ? Date.now() - days * DAY : 0;
    return saleRows(db, u).filter(function (p) { return new Date(p.handover.confirmedAt).getTime() >= since && (!materialId || p.material.id === Number(materialId)); });
  };
  api.sellerSummary = function () {
    var db = load(), u = requireUser(db, 'kabadiwala'), rows = saleRows(db, u), today = istDay(nowIso()), month = today.slice(0, 7);
    var agg = function (list) { var o = { kg: 0, pcs: 0, amount: 0, n: list.length, extra: 0 }; list.forEach(function (p) { var q = p.handover.receivedWeightKg; if (p.material.unit === 'kg') o.kg += q; else o.pcs += q; o.amount += p.amount; o.extra += p.amount - q * p.material.localRate; }); o.kg = r2(o.kg); o.pcs = r2(o.pcs); o.amount = r2(o.amount); o.extra = r2(o.extra); return o; };
    var buyers = {}; rows.forEach(function (p) { var k = p.recycler.id; buyers[k] = buyers[k] || { name: p.recycler.name, area: p.recycler.area, n: 0, kg: 0, amount: 0 }; buyers[k].n++; if (p.material.unit === 'kg') buyers[k].kg = r2(buyers[k].kg + p.handover.receivedWeightKg); buyers[k].amount = r2(buyers[k].amount + p.amount); });
    var mine = db.pickups.filter(function (p) { return p.kabadiwalaId === u.id; });
    return { today: agg(rows.filter(function (p) { return istDay(p.handover.confirmedAt) === today; })), month: agg(rows.filter(function (p) { return istDay(p.handover.confirmedAt).slice(0, 7) === month; })), total: agg(rows),
      byBuyer: Object.keys(buyers).map(function (k) { return buyers[k]; }).sort(function (a, b) { return b.amount - a.amount; }),
      pending: { booked: mine.filter(function (p) { return p.status === 'booked'; }).length, awaiting: mine.filter(function (p) { return p.status === 'awaiting_confirmation'; }).length, disputed: mine.filter(function (p) { return p.status === 'disputed'; }).length } };
  };

  // Every authorised buyer's live rate for each material, seen from the seller's shop
  api.buyerBoard = function () {
    var db = load(), u = requireUser(db, 'kabadiwala'), from = u.lat != null ? { lat: u.lat, lng: u.lng } : { lat: 28.4722, lng: 77.0459 };
    var ms = db.materials.slice().sort(function (a, b) { return a.sort - b.sort; });
    var buyers = db.recyclers.filter(function (r) { return r.verified; }).map(function (r) {
      var mine = db.pickups.filter(function (p) { return p.recyclerId === r.id && p.kabadiwalaId === u.id && p.status === 'confirmed'; });
      return { recycler: r, distanceKm: r2(haversine(from, r)), slot: nextSlots(r.pickupAvailable)[0], soldToThem: mine.length, earnedFromThem: r2(mine.reduce(function (a, p) { return a + p.amount; }, 0)),
        bids: ms.map(function (m) { var b = bidOf(db, r.id, m.id); return b ? b.rate : null; }) };
    }).sort(function (a, b) { return a.distanceKm - b.distanceKm; });
    return { materials: ms.map(materialView), buyers: buyers, best: ms.map(function (m, i) { return Math.max.apply(null, buyers.map(function (x) { return x.bids[i] || 0; })); }) };
  };

  /* ---------------- Notifications (all roles) ---------------- */
  api.notifications = function (limit) {
    var db = load(), u = requireUser(db), list = (db.notifications || []).filter(function (n) { return n.userId === u.id; }).sort(function (a, b) { return b.id - a.id; });
    return { unread: list.filter(function (n) { return !n.read; }).length, items: limit ? list.slice(0, limit) : list };
  };
  api.markRead = function (id) {
    return change(function (db) { var u = requireUser(db); (db.notifications || []).forEach(function (n) { if (n.userId === u.id && (id === 'all' || n.id === Number(id))) n.read = true; }); });
  };

  /* ---------------- Buyer (authorised recycler) portal ---------------- */
  function buyerCtx(db) { var u = requireUser(db, 'recycler'), rec = recyclerOf(db, u); need(rec, 'No buyer facility is linked to this account', 404); return { u: u, rec: rec }; }
  function purchaseRows(db, rec) {
    return db.pickups.filter(function (p) { return p.recyclerId === rec.id && p.status === 'confirmed'; }).map(function (p) { return pickupView(db, p); })
      .sort(function (a, b) { return (b.handover.confirmedAt || '').localeCompare(a.handover.confirmedAt || ''); });
  }
  api.buyerDashboard = function () {
    var db = load(), c = buyerCtx(db), rows = purchaseRows(db, c.rec), today = istDay(nowIso()), month = today.slice(0, 7);
    var sum = function (list, f) { return r2(list.reduce(function (a, p) { return a + f(p); }, 0)); };
    var kg = function (p) { return p.material.unit === 'kg' ? p.handover.receivedWeightKg : 0; }, pcs = function (p) { return p.material.unit === 'pc' ? p.handover.receivedWeightKg : 0; }, amt = function (p) { return p.amount; };
    var tRows = rows.filter(function (p) { return istDay(p.handover.confirmedAt) === today; }), mRows = rows.filter(function (p) { return istDay(p.handover.confirmedAt).slice(0, 7) === month; });
    var mine = db.pickups.filter(function (p) { return p.recyclerId === c.rec.id; });
    var days = []; for (var i = 13; i >= 0; i--) { var d = istDay(nowIso(-i * DAY)); days.push({ day: d, kg: sum(rows.filter(function (p) { return istDay(p.handover.confirmedAt) === d; }), kg) }); }
    var byMat = db.materials.map(function (m) { var ps = rows.filter(function (p) { return p.material.id === m.id; }); return { material: m, qty: sum(ps, function (p) { return p.handover.receivedWeightKg; }), paid: sum(ps, amt), n: ps.length }; }).filter(function (x) { return x.n; });
    var sellers = {}; rows.forEach(function (p) { var k = p.kabadiwala.id; sellers[k] = sellers[k] || { name: p.kabadiwala.shopName || p.kabadiwala.name, ward: p.kabadiwala.ward, n: 0, kg: 0, paid: 0 }; sellers[k].n++; sellers[k].kg = r2(sellers[k].kg + kg(p)); sellers[k].paid = r2(sellers[k].paid + p.amount); });
    return { recycler: c.rec, user: { name: c.u.name, phone: c.u.phone, prefs: c.u.prefs || {} },
      today: { kg: sum(tRows, kg), pcs: sum(tRows, pcs), paid: sum(tRows, amt), n: tRows.length },
      month: { kg: sum(mRows, kg), pcs: sum(mRows, pcs), paid: sum(mRows, amt), n: mRows.length },
      total: { kg: sum(rows, kg), pcs: sum(rows, pcs), paid: sum(rows, amt), n: rows.length, hazardKg: sum(rows.filter(function (p) { return p.material.hazard; }), kg) },
      pending: { booked: mine.filter(function (p) { return p.status === 'booked'; }).length, awaiting: mine.filter(function (p) { return p.status === 'awaiting_confirmation'; }).length, disputed: mine.filter(function (p) { return p.status === 'disputed'; }).length },
      upcoming: mine.filter(function (p) { return p.status === 'booked' || p.status === 'awaiting_confirmation'; }).sort(function (a, b) { return a.id - b.id; }).map(function (p) { return pickupView(db, p); }),
      days: days, byMaterial: byMat, sellers: Object.keys(sellers).map(function (k) { return sellers[k]; }).sort(function (a, b) { return b.paid - a.paid; }), recent: rows.slice(0, 6) };
  };
  api.buyerPurchases = function (days, materialId) {
    var db = load(), c = buyerCtx(db), since = days ? Date.now() - days * DAY : 0;
    return purchaseRows(db, c.rec).filter(function (p) { return new Date(p.handover.confirmedAt).getTime() >= since && (!materialId || p.material.id === Number(materialId)); });
  };
  api.marketLots = function () {
    var db = load(), c = buyerCtx(db), rec = c.rec;
    return db.lots.filter(function (l) { return l.status === 'open'; }).map(function (l) {
      var m = mat(db, l.materialId), mine = bidOf(db, rec.id, m.id), k = userById(db, l.userId);
      var best = db.recyclers.filter(function (r) { return r.verified && bidOf(db, r.id, m.id); }).map(function (r) { return bidOf(db, r.id, m.id).rate; }).sort(function (a, b) { return b - a; })[0] || null;
      return { lot: l, material: m, seller: { name: k.shopName || k.name, ward: k.ward }, distanceKm: k.lat != null ? r2(haversine(rec, { lat: k.lat, lng: k.lng })) : null, myBid: mine ? mine.rate : null, bestBid: best, iAmBest: !!(mine && mine.rate >= best), value: mine ? r2(mine.rate * l.weightKg) : null };
    }).filter(function (x) { return x.myBid !== null; }).sort(function (a, b) { return b.lot.id - a.lot.id; });
  };
  api.updateBuyer = function (f) {
    return change(function (db) {
      var c = buyerCtx(db);
      need(f.name && String(f.name).trim(), 'Enter the contact name');
      c.u.name = String(f.name).trim().slice(0, 60);
      c.u.prefs = { sound: !!f.sound, voice: !!f.voice, desktop: !!f.desktop, newLots: f.newLots !== false };
      if (f.pickupAvailable !== undefined) c.rec.pickupAvailable = !!f.pickupAvailable;
      return c.u;
    });
  };
  api.publicStats = function () {
    var db = load(), conf = db.pickups.filter(function (p) { return p.status === 'confirmed'; }).map(function (p) { return pickupView(db, p); });
    return { kg: r2(conf.filter(function (p) { return p.material.unit === 'kg'; }).reduce(function (a, p) { return a + p.handover.receivedWeightKg; }, 0)), handovers: conf.length,
      paid: r2(conf.reduce(function (a, p) { return a + p.amount; }, 0)), workers: db.users.filter(function (u) { return u.role === 'kabadiwala'; }).length, recyclers: db.recyclers.filter(function (r) { return r.verified; }).length,
      byMaterial: db.materials.map(function (m) { var ps = conf.filter(function (p) { return p.material.id === m.id; }); return { material: m, qty: r2(ps.reduce(function (a, p) { return a + p.handover.receivedWeightKg; }, 0)) }; }) };
  };

  api.resetDemo = function () { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } api.logout(); load(); };
})();
