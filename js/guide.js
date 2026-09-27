/* =========================================================================
   TolKanta सहायक · Assistant chatbot (every page)
   Ask any doubt by typing or speaking (Hindi or English). Answers come as
   text and are read aloud. It knows the rules, the process and live demo
   data (rates, best bids, your earnings, your pickups), can take you to any
   page ("खाता खोलो"), and can run a spotlight tour of the current page.
   Runs fully in the browser: no server, no API key.
   ========================================================================= */
(function () {
  'use strict';
  var TK = window.TK;

  /* ---------------- where things are ---------------- */
  var DEST = [
    { id: 'home', path: 'index.html', en: 'Home', hi: 'होम', icon: 'home', words: ['home', 'main', 'start', 'होम', 'मुख्य', 'शुरू', 'घर'] },
    { id: 'rates', path: 'index.html#priceBoard', en: "Today's rates", hi: 'आज के दाम', icon: 'cash', words: ['rate', 'price', 'bhav', 'daam', 'दाम', 'भाव', 'रेट', 'कीमत', 'प्राइस'] },
    { id: 'sell', path: 'portal/sell.html', en: 'Sell scrap', hi: 'कबाड़ बेचें', icon: 'camera', words: ['sell', 'scrap', 'photo', 'kabad', 'बेच', 'बेचना', 'कबाड़', 'फोटो', 'सेल'] },
    { id: 'pickups', path: 'portal/pickups.html', en: 'My pickups', hi: 'मेरे पिकअप', icon: 'truck', words: ['pickup', 'pick up', 'van', 'gaadi', 'handover', 'पिकअप', 'गाड़ी', 'सौंप'] },
    { id: 'ledger', path: 'portal/ledger.html', en: 'Ledger', hi: 'खाता', icon: 'book', words: ['ledger', 'khata', 'hisab', 'account book', 'खाता', 'हिसाब', 'लेजर'] },
    { id: 'passport', path: 'portal/passport.html', en: 'Earnings Passport', hi: 'कमाई पासपोर्ट', icon: 'qr', words: ['passport', 'loan', 'score', 'credit', 'पासपोर्ट', 'लोन', 'कर्ज', 'स्कोर'] },
    { id: 'profile', path: 'portal/profile.html', en: 'Profile', hi: 'प्रोफ़ाइल', icon: 'user', words: ['profile', 'name', 'eshram', 'e-shram', 'प्रोफ़ाइल', 'प्रोफाइल', 'नाम', 'श्रम'] },
    { id: 'dashboard', path: 'portal/dashboard.html', en: 'My dashboard', hi: 'मेरा डैशबोर्ड', icon: 'chart', words: ['dashboard', 'earning', 'kamai', 'डैशबोर्ड', 'कमाई'] },
    { id: 'login', path: 'login.html', en: 'Log in', hi: 'लॉग इन', icon: 'lock', words: ['login', 'log in', 'sign in', 'otp', 'seller login', 'buyer login', 'लॉग', 'लॉगिन', 'ओटीपी'] },
    { id: 'verify', path: 'verify.html', en: 'Verify a record', hi: 'रिकॉर्ड जाँचें', icon: 'shield', words: ['verify', 'hash', 'check', 'record', 'जाँच', 'जांच', 'हैश', 'रिकॉर्ड'] },
    { id: 'impact', path: 'impact.html', en: 'Live impact', hi: 'असर', icon: 'leaf', words: ['impact', 'stats', 'असर', 'प्रभाव', 'आंकड़े'] },
    { id: 'how', path: 'how-it-works.html', en: 'How it works', hi: 'कैसे काम करता है', icon: 'list', words: ['how', 'work', 'process', 'कैसे', 'तरीका'] },
    { id: 'ivr', path: 'ivr.html', en: 'IVR helpline', hi: 'फ़ोन हेल्पलाइन', icon: 'phone', words: ['ivr', 'call', 'helpline', 'phone', 'फोन', 'फ़ोन', 'कॉल', 'हेल्पलाइन'] },
    { id: 'whatsapp', path: 'whatsapp.html', en: 'WhatsApp bot', hi: 'व्हाट्सऐप बॉट', icon: 'chat', words: ['whatsapp', 'chat', 'bot', 'message', 'व्हाट्सएप', 'व्हाट्सऐप', 'चैट', 'बॉट'] },
    { id: 'sales', path: 'portal/sales.html', en: 'My sales', hi: 'मेरी बिक्री', icon: 'up', words: ['my sales', 'sales', 'kg sold', 'sold', 'bikri', 'बिक्री', 'बेचा'] },
    { id: 'buyers-rates', path: 'portal/buyers.html', en: 'Buyers & rates', hi: 'खरीदार और दाम', icon: 'factory', words: ['buyers and rates', 'buyer rates', 'compare buyers', 'सब खरीदार'] },
    { id: 'buyer', path: 'portal/buyer.html', en: 'Buyer dashboard', hi: 'खरीदार डैशबोर्ड', icon: 'chart', words: ['buyer dashboard', 'buyer', 'khareedar', 'खरीदार'] },
    { id: 'recycler', path: 'portal/recycler.html', en: 'Pickups & weighing', hi: 'पिकअप और तौल', icon: 'truck', words: ['weighing', 'confirm weight', 'recycler console', 'bid', 'bids', 'epr', 'तौल', 'बोली'] },
    { id: 'market', path: 'portal/buyer-market.html', en: 'Scrap available', hi: 'उपलब्ध कबाड़', icon: 'search', words: ['scrap available', 'market', 'new scrap', 'bazaar', 'बाज़ार', 'उपलब्ध'] },
    { id: 'purchases', path: 'portal/buyer-purchases.html', en: 'Purchases', hi: 'खरीद', icon: 'list', words: ['purchases', 'purchase history', 'kg bought', 'kharid', 'खरीद'] },
    { id: 'notifications', path: 'portal/notifications.html', en: 'Notifications', hi: 'सूचनाएँ', icon: 'bell', words: ['notification', 'notifications', 'alerts', 'alert', 'suchna', 'सूचना', 'सूचनाएँ', 'अलर्ट'] },
    { id: 'admin', path: 'portal/admin.html', en: 'ULB control room', hi: 'नगर निगम कंट्रोल रूम', icon: 'building', words: ['admin', 'ulb', 'control', 'officer', 'नगर', 'निगम', 'एडमिन'] },
    { id: 'about', path: 'about.html', en: 'About the team', hi: 'टीम के बारे में', icon: 'users', words: ['about', 'team', 'contact', 'टीम', 'संपर्क'] },
    { id: 'guide', path: 'guide.html', en: 'Help centre', hi: 'मदद केंद्र', icon: 'book', words: ['guide', 'help', 'madad', 'गाइड', 'मदद', 'सहायता'] },
  ];

  /* ---------------- what each page does ---------------- */
  var PAGES = {
    index: { en: 'Home', hi: 'होम',
      sEn: 'This is the TolKanta home page. You can see today\'s fair e-waste prices, how the platform works and its live impact. Log in with your mobile number to sell scrap.',
      sHi: 'यह TolKanta का मुख्य पेज है। यहाँ आज के सही दाम, काम करने का तरीका और असर दिखता है। कबाड़ बेचने के लिए मोबाइल नंबर से लॉग इन करें।',
      steps: [['.nav-links', 'ऊपर का मेन्यू: यहाँ से किसी भी पेज पर जाएँ।', 'The top menu takes you to every page.'],
        ['#priceBoard', 'आज के दाम: हर सामान का रेट प्रति किलो या पीस।', "Today's board rates for each material, per kg or per piece."],
        ['#listenRates', 'यह बटन दबाकर दाम सुनें।', 'Press this to hear the rates read aloud.'],
        ['#ctaSell', 'यहाँ से कबाड़ बेचना शुरू करें।', 'Start selling scrap from here.'],
        ['#liveStats', 'अब तक का असर: कितना ई-कचरा सही जगह पहुँचा।', 'Live impact: how much e-waste reached authorised recyclers.'],
        ['.footer', 'नीचे: रीसाइक्लर और अधिकारी पोर्टल, और डेमो रीसेट।', 'The footer has the recycler and officer portals and the demo reset.']] },
    'how-it-works': { en: 'How it works', hi: 'कैसे काम करता है',
      sEn: 'This page explains the journey step by step: photo, fair price, authorised recycler, handover record and payment.',
      sHi: 'यह पेज पूरा तरीका बताता है: फोटो, सही दाम, अधिकृत रीसाइक्लर, हैंडओवर रिकॉर्ड और भुगतान।',
      steps: [['.page-head', 'पेज का परिचय।', 'What this page covers.'], ['main .steps', 'एक-एक कदम में पूरा तरीका।', 'The journey, one step at a time.']] },
    impact: { en: 'Live impact', hi: 'असर',
      sEn: 'Public numbers from verified handovers: kilograms diverted, money paid to kabadiwalas and material breakdown.',
      sHi: 'सत्यापित हैंडओवर से असली आंकड़े: कितना किलो ई-कचरा, कबाड़ीवालों को कितना पैसा, और किस सामान का कितना।',
      steps: [['#kpis', 'मुख्य आंकड़े।', 'Headline numbers.'], ['#byMat', 'सामान के हिसाब से।', 'Breakdown by material.']] },
    verify: { en: 'Verify a record', hi: 'रिकॉर्ड जाँचें',
      sEn: 'Anyone can paste a 64-character handover hash here to check that the record was not changed.',
      sHi: 'कोई भी यहाँ 64 अक्षर का हैश डालकर जाँच सकता है कि रिकॉर्ड बदला नहीं गया।',
      steps: [['#vf', 'यहाँ हैश डालें और जाँचें दबाएँ।', 'Paste a hash here and press Verify.'], ['#sample', 'डेमो के लिए नमूना हैश।', 'Fill in a sample hash for the demo.'], ['#result', 'नतीजा यहाँ दिखेगा।', 'The result appears here.']] },
    ivr: { en: 'IVR helpline demo', hi: 'फ़ोन हेल्पलाइन',
      sEn: 'For people without a smartphone: call, press a number and hear today\'s rate in Hindi.',
      sHi: 'बिना स्मार्टफोन वालों के लिए: कॉल करें, नंबर दबाएँ और हिंदी में आज का दाम सुनें।',
      steps: [['#call', 'हरा बटन: कॉल शुरू करें।', 'Green button starts the call.'], ['#keypad', 'सामान का नंबर दबाएँ।', 'Press the number for a material.'], ['#lcdLog', 'स्क्रीन पर बोली गई बात।', 'What the line said appears here.']] },
    whatsapp: { en: 'WhatsApp bot demo', hi: 'व्हाट्सऐप बॉट',
      sEn: 'Send a material name or number to get today\'s rate and nearby authorised recyclers, like on WhatsApp.',
      sHi: 'सामान का नाम या नंबर भेजें, आज का दाम और पास के अधिकृत रीसाइक्लर जानें, बिल्कुल व्हाट्सऐप की तरह।',
      steps: [['#chatBody', 'बातचीत यहाँ दिखेगी।', 'The conversation.'], ['#quick', 'जल्दी वाले बटन।', 'Quick replies.'], ['#chatForm', 'यहाँ लिखकर भेजें।', 'Type and send here.']] },
    about: { en: 'About the team', hi: 'टीम के बारे में',
      sEn: 'Who built TolKanta, the sources behind our numbers, and a contact form.',
      sHi: 'TolKanta किसने बनाया, आंकड़ों के स्रोत, और संपर्क फ़ॉर्म।',
      steps: [['.page-head', 'परिचय।', 'Introduction.'], ['#contact', 'हमें संदेश भेजें।', 'Send us a message.']] },
    login: { en: 'Log in', hi: 'लॉग इन',
      sEn: 'There are separate login sections: Seller login for kabadiwalas and Buyer login for authorised recyclers. City officers use the small officer login below. Enter your mobile number; in this demo the OTP is always 1 2 3 4 5 6.',
      sHi: 'लॉग इन के अलग हिस्से हैं: कबाड़ीवालों के लिए विक्रेता लॉग इन, और अधिकृत रीसाइक्लर के लिए खरीदार लॉग इन। नगर अधिकारी नीचे अधिकारी लॉग इन इस्तेमाल करें। मोबाइल नंबर डालें; डेमो में ओटीपी हमेशा 1 2 3 4 5 6 है।',
      steps: [['#sellerPanel', 'विक्रेता (कबाड़ीवाला) यहाँ लॉग इन करें। नया नंबर डालते ही खाता बनता है।', 'Sellers (kabadiwalas) log in here. A new number creates an account instantly.'], ['#buyerPanel', 'खरीदार (अधिकृत रीसाइक्लर) यहाँ लॉग इन करें। सिर्फ़ पंजीकृत नंबर चलते हैं।', 'Buyers (authorised recyclers) log in here. Only registered numbers work.'], ['#officerPanel', 'नगर अधिकारी यहाँ।', 'City officers log in here.']] },
    'passport-view': { en: 'Passport (lender view)', hi: 'पासपोर्ट (लोन देने वाले के लिए)',
      sEn: 'A read-only Earnings Passport that a kabadiwala shared by QR. It shows verified income and a trust score, never the phone number.',
      sHi: 'कबाड़ीवाले ने QR से जो कमाई पासपोर्ट भेजा, उसकी सिर्फ़ पढ़ने वाली कॉपी। फ़ोन नंबर कभी नहीं दिखता।',
      steps: [['#pvNote', 'यह कॉपी कहाँ से आई।', 'Where this copy came from.'], ['#pv', 'स्कोर और सत्यापित कमाई।', 'Score and verified income.']] },
    guide: { en: 'Help centre', hi: 'मदद केंद्र',
      sEn: 'Ask the assistant any question by text or voice, and read or listen to how every page of TolKanta works.',
      sHi: 'सहायक से कोई भी सवाल लिखकर या बोलकर पूछें, और TolKanta के हर पेज की जानकारी पढ़ें या सुनें।',
      steps: [['#guideSearch', 'यहाँ सवाल लिखें या माइक दबाकर बोलें।', 'Type a question here, or tap the mic and speak.'], ['#guideList', 'हर पेज की जानकारी, सुनने के बटन के साथ।', 'Every page explained, with listen buttons.']] },
    dashboard: { en: 'Kabadiwala dashboard', hi: 'कबाड़ीवाला डैशबोर्ड',
      sEn: 'Your home after login: today\'s earnings, active pickups, today\'s rates and your recent ledger.',
      sHi: 'लॉग इन के बाद आपका होम: आज की कमाई, चल रहे पिकअप, आज के दाम और हाल का खाता।',
      steps: [['#sidebar', 'बाईं तरफ़ मेन्यू: बेचें, पिकअप, खाता, पासपोर्ट, प्रोफ़ाइल।', 'Left menu: sell, pickups, ledger, passport, profile.'],
        ['#headRight', 'कबाड़ बेचने का बड़ा बटन, और सुनें।', 'The big Sell button and Listen.'], ['#dash .kpi', 'आज की कमाई।', "Today's earnings."], ['#dash table', 'आज के दाम, ऊपर-नीचे के साथ।', "Today's rates with the change since yesterday."]] },
    sell: { en: 'Sell scrap', hi: 'कबाड़ बेचें',
      sEn: 'Five easy steps: take a photo, choose the item, enter the weight, see the best authorised price, and book a pickup.',
      sHi: 'पाँच आसान कदम: फोटो लें, सामान चुनें, वज़न डालें, सबसे अच्छा दाम देखें और पिकअप बुक करें।',
      steps: [['#steps', 'ऊपर दिखता है आप किस कदम पर हैं।', 'Shows which step you are on.'], ['#drop', 'यहाँ फोटो डालें। फ़ोन पहचानने की कोशिश करेगा।', 'Add a photo here. The phone tries to recognise it.'],
        ['#matChips', 'या खुद सामान चुनें।', 'Or choose the item yourself.'], ['#hazardBox', 'ख़तरनाक सामान की सावधानी यहाँ।', 'Safety advice for hazardous items.'], ['#toStep2', 'आगे बढ़ें और वज़न डालें। माइक से बोलकर भी वज़न डाल सकते हैं।', 'Continue to weight. You can also say the weight with the mic.']] },
    pickups: { en: 'Pickups', hi: 'पिकअप',
      sEn: 'All your booked pickups. When the van arrives, open the pickup, take a handover photo and record it. You get paid when the recycler confirms.',
      sHi: 'आपके सभी पिकअप। गाड़ी आने पर पिकअप खोलें, फोटो लें और रिकॉर्ड करें। रीसाइक्लर की पुष्टि पर पैसा मिलता है।',
      steps: [['#pk .tabs', 'चालू और सभी पिकअप।', 'Active and all pickups.'], ['#pk .timeline', 'पिकअप कहाँ तक पहुँचा।', 'How far this pickup has progressed.'], ['#hDrop', 'हैंडओवर फोटो यहाँ।', 'Handover photo here.'], ['#hSave', 'दबाएँ: फोटो, जगह, समय और वज़न का पक्का रिकॉर्ड बनेगा।', 'Creates the tamper-proof record of photo, place, time and weight.'], ['.hash-box', 'यह हैश रिकॉर्ड का ताला है।', 'This hash seals the record.']] },
    sales: { en: 'My sales', hi: 'मेरी बिक्री',
      sEn: 'Everything you sold to authorised buyers: kilograms, money received, who bought from you, and how much extra you earned over the local market rate.',
      sHi: 'आपने अधिकृत खरीदारों को जो बेचा: कितने किलो, कितने पैसे मिले, किसने खरीदा, और लोकल मंडी से कितना ज़्यादा कमाया।',
      steps: [['#sa .kpi', 'आज, इस महीने और कुल बिक्री।', 'Sold today, this month and in total.'], ['#range', 'समय चुनें।', 'Choose the period.'], ['#sa table', 'हर बिक्री और उसका रिकॉर्ड।', 'Each sale with its record.']] },
    buyers: { en: 'Buyers & rates', hi: 'खरीदार और दाम',
      sEn: 'Every authorised buyer near you, how far they are, when they can pick up, and what each one pays today for every item. The best rate is highlighted.',
      sHi: 'आपके पास के सभी अधिकृत खरीदार, दूरी, पिकअप कब, और हर सामान का आज का दाम। सबसे अच्छा दाम हाइलाइट है।',
      steps: [['#br .grid', 'हर खरीदार की जानकारी।', 'Each buyer.'], ['#br table', 'हर सामान का दाम, हर खरीदार से।', 'Each item\'s rate from each buyer.']] },
    ledger: { en: 'Ledger', hi: 'खाता',
      sEn: 'Every rupee you bought and sold. Sales through TolKanta are added by themselves and marked verified.',
      sHi: 'हर रुपये का हिसाब। TolKanta से हुई बिक्री अपने आप जुड़ती है और सत्यापित दिखती है।',
      steps: [['#range', 'आज, 7 दिन, 30 दिन चुनें।', 'Choose today, 7 or 30 days.'], ['#led .kpi', 'कुल मुनाफ़ा।', 'Totals.'], ['#addForm', 'नकद सौदा खुद जोड़ें।', 'Add a cash deal yourself.'], ['#csv', 'फ़ाइल डाउनलोड करें।', 'Download a file.']] },
    passport: { en: 'Earnings Passport', hi: 'कमाई पासपोर्ट',
      sEn: 'Your verified income and trust score. Show the QR code to a bank or lender to apply for a loan.',
      sHi: 'आपकी सत्यापित कमाई और भरोसा स्कोर। लोन के लिए बैंक को QR कोड दिखाएँ।',
      steps: [['#pp .score-ring', 'आपका भरोसा स्कोर, सौ में से।', 'Your trust score out of 100.'], ['#pp .bar', 'स्कोर कैसे बनता है।', 'How the score is built.'], ['#copyLink', 'QR या लिंक से साझा करें।', 'Share by QR or link.']] },
    profile: { en: 'Profile', hi: 'प्रोफ़ाइल',
      sEn: 'Your name, shop, area and location. Linking your e-Shram number raises your trust score.',
      sHi: 'आपका नाम, दुकान, इलाका और जगह। ई-श्रम नंबर जोड़ने से स्कोर बढ़ता है।',
      steps: [['#name', 'अपना नाम लिखें।', 'Your name.'], ['#gps', 'दुकान की जगह लें।', 'Save your shop location.'], ['#uan', 'ई-श्रम नंबर (12 अंक)।', 'e-Shram UAN (12 digits).'], ['#pf .btn-primary', 'सेव करें।', 'Save.']] },
    buyer: { en: 'Buyer dashboard', hi: 'खरीदार डैशबोर्ड',
      sEn: 'For buyers (authorised recyclers): how many kilograms you bought today, this month and in total, money paid, pickups to handle, your latest notifications and new scrap near you.',
      sHi: 'खरीदार (अधिकृत रीसाइक्लर) के लिए: आज, इस महीने और कुल कितने किलो खरीदे, कितना भुगतान किया, कौन से पिकअप बाकी हैं, नई सूचनाएँ और पास में नया कबाड़।',
      steps: [['#bellWrap', 'घंटी: हर नई सूचना यहाँ आती है, आवाज़ के साथ।', 'The bell: every new notification arrives here, with a sound.'], ['#bd .kpi', 'आज, इस महीने और कुल खरीदा वज़न।', 'Kg bought today, this month and in total.'], ['#bd .spark', 'पिछले 14 दिन की खरीद।', 'Purchases over the last 14 days.'], ['#sidebar', 'मेन्यू: पिकअप, उपलब्ध कबाड़, खरीद, सूचनाएँ, प्रोफ़ाइल।', 'Menu: pickups, scrap available, purchases, notifications, profile.']] },
    recycler: { en: 'Pickups & weighing', hi: 'पिकअप और तौल',
      sEn: 'For buyers: incoming pickups, verify each handover record, confirm the weight received so the seller is paid, publish your bids and export EPR evidence.',
      sHi: 'खरीदार के लिए: आने वाले पिकअप, हर हैंडओवर रिकॉर्ड जाँचें, मिला वज़न पक्का करें ताकि विक्रेता को पैसा मिले, बोली लगाएँ और EPR रिपोर्ट निकालें।',
      steps: [['#headRight', 'पिकअप चालू या बंद करें।', 'Turn doorstep pickups on or off.'], ['#tabs', 'आने वाले, इतिहास, बोली, EPR।', 'Incoming, history, bids, EPR.'], ['[data-verify]', 'रिकॉर्ड जाँचें।', 'Verify the record.'], ['[data-confirm]', 'वज़न पक्का करें और भुगतान करें।', 'Confirm weight and pay.']] },
    'buyer-market': { en: 'Scrap available', hi: 'उपलब्ध कबाड़',
      sEn: 'Scrap that sellers listed and that matches your bids, with distance, lot value and whether your bid is currently the best. You are notified whenever a new lot is listed.',
      sHi: 'विक्रेताओं का डाला हुआ कबाड़ जो आपकी बोली से मेल खाता है: दूरी, कीमत, और क्या आपकी बोली सबसे अच्छी है। नया कबाड़ आते ही सूचना मिलती है।',
      steps: [['#sortC', 'नया, पास वाला या सबसे बड़ा चुनें।', 'Sort by newest, nearest or highest value.'], ['#mk .grid', 'हर लॉट की जानकारी।', 'Each open lot.']] },
    'buyer-purchases': { en: 'Purchases', hi: 'खरीद',
      sEn: 'Every lot you bought: date, seller, material, kilograms handed over and received, rate, amount paid and the verified record. Filter by period or material and download a CSV.',
      sHi: 'आपकी हर खरीद: तारीख, विक्रेता, सामान, सौंपा और मिला वज़न, रेट, भुगतान और सत्यापित रिकॉर्ड। समय या सामान से छाँटें और CSV डाउनलोड करें।',
      steps: [['#range', 'समय चुनें।', 'Choose the period.'], ['#mat', 'सामान चुनें।', 'Filter by material.'], ['#pu .kpi', 'कुल किलो और भुगतान।', 'Total kg and money paid.'], ['#pu table', 'हर खरीद की लाइन।', 'One row per purchase.']] },
    'buyer-profile': { en: 'Buyer profile & alerts', hi: 'खरीदार प्रोफ़ाइल और अलर्ट',
      sEn: 'Your facility and CPCB details, doorstep pickup on or off, and notification settings: new scrap alerts, sound, Hindi voice and desktop notifications.',
      sHi: 'आपकी फ़ैसिलिटी और CPCB जानकारी, पिकअप चालू या बंद, और सूचना सेटिंग: नया कबाड़, आवाज़, हिंदी में बोलकर, और डेस्कटॉप सूचना।',
      steps: [['#bpf', 'यहाँ सूचना सेटिंग बदलें और सेव करें।', 'Change notification settings here and save.'], ['#test', 'टेस्ट अलर्ट भेजकर देखें।', 'Send yourself a test alert.']] },
    notifications: { en: 'Notifications', hi: 'सूचनाएँ',
      sEn: 'All your notifications, newest first: new scrap, bookings, handovers, purchases, payments and disputes. Filter them and mark them read.',
      sHi: 'आपकी सभी सूचनाएँ, नई पहले: नया कबाड़, बुकिंग, हैंडओवर, खरीद, भुगतान और विवाद। छाँटें और पढ़ा हुआ करें।',
      steps: [['#ft', 'प्रकार से छाँटें।', 'Filter by type.'], ['#nt .card', 'हर सूचना; दबाएँ तो सही पेज खुलेगा।', 'Each notification; tap to open the right page.']] },
    admin: { en: 'ULB control room', hi: 'नगर निगम कंट्रोल रूम',
      sEn: 'For city officers: ward impact, weight disputes, the price engine, the recycler registry and the hash-chain audit.',
      sHi: 'नगर अधिकारियों के लिए: वार्ड का असर, वज़न विवाद, दाम तय करना, रीसाइक्लर सूची और हैश चेन जाँच।',
      steps: [['#tabs', 'असर, दाम, रीसाइक्लर, ऑडिट।', 'Impact, prices, recyclers, audit.'], ['#tabBody .kpi', 'मुख्य आंकड़े।', 'Headline numbers.'], ['#tabBody', 'चुने गए टैब की जानकारी।', 'The selected tab.']] },
  };

  /* ---------------- helpers ---------------- */
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };
  var sess = { get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } } };
  var lang = store.get('tk_guide_lang') || 'hi';
  var autoSpeak = store.get('tk_chat_voice') !== 'off';
  var inPortal = /\/portal\//.test(location.pathname);
  var pageKey = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var page = PAGES[pageKey] || PAGES.index;
  var href = function (path) { return (inPortal ? '../' : '') + path; };
  var t = function (hi, en) { return lang === 'hi' ? hi : en; };
  var esc = TK.esc;
  var isDeva = function (s) { return /[ऀ-ॿ]/.test(s); };
  var destById = function (id) { return DEST.find(function (d) { return d.id === id; }); };

  function speak(text, l) {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(text).replace(/[•·→✓⚠️🌿💡₹]/g, function (c) { return c === '₹' ? ' रुपये ' : ' '; })), code = (l || lang) === 'hi' ? 'hi-IN' : 'en-IN';
    u.lang = code; u.rate = 0.95;
    var vs = speechSynthesis.getVoices(), v = vs.find(function (x) { return x.lang === code; }) || vs.find(function (x) { return x.lang.slice(0, 2) === code.slice(0, 2); });
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // keyword test: Latin words need word boundaries, Devanagari is matched as a substring
  function has(q, w) { return isDeva(w) ? q.indexOf(w) >= 0 : new RegExp('(^|[^a-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)').test(q); }

  // Where do you want to go?
  function match(text) {
    var q = String(text || '').toLowerCase().trim(); if (!q) return null;
    if (/log ?out|लॉग ?आउट/.test(q)) return { id: 'logout', en: 'Log out', hi: 'लॉग आउट' };
    var best = null, score = 0;
    DEST.forEach(function (d) { d.words.concat([d.en.toLowerCase(), d.hi]).forEach(function (w) { if (has(q, w) && w.length > score) { best = d; score = w.length; } }); });
    return best;
  }
  function go(d) {
    if (d.id === 'logout') { TK.api.logout(); location.href = href('index.html'); return; }
    var same = d.path.split('#')[0] === (inPortal ? 'portal/' : '') + pageKey + '.html';
    if (same && d.path.indexOf('#') > 0) { var el = document.getElementById(d.path.split('#')[1]); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); spot(el); setTimeout(unspot, 2500); return; } }
    location.href = href(d.path);
  }

  /* =====================================================================
     Assistant brain: answers doubts from a knowledge base + live demo data
     ===================================================================== */
  var MAT = { PCB: ['pcb', 'motherboard', 'circuit', 'मदरबोर्ड', 'सर्किट', 'पीसीबी'], CU_WIRE: ['copper', 'wire', 'taar', 'तार', 'तांबा', 'कॉपर'], PHONE: ['phone', 'mobile', 'मोबाइल', 'फोन', 'फ़ोन'],
    LAPTOP: ['laptop', 'लैपटॉप'], LI_BATT: ['battery', 'lithium', 'बैटरी', 'लिथियम'], CRT: ['crt', 'tv', 'television', 'monitor', 'टीवी', 'मॉनिटर'], MIXED: ['keyboard', 'mouse', 'cable', 'mixed', 'कीबोर्ड', 'माउस', 'मिक्स'] };
  var RATE_W = ['rate', 'rates', 'price', 'daam', 'dam', 'bhav', 'kitna', 'kitne', 'how much', 'दाम', 'भाव', 'रेट', 'कीमत', 'कितना', 'कितने', 'क्या मिलेगा'];
  var NAV_W = ['open', 'go to', 'take me', 'show me', 'khol', 'kholo', 'खोल', 'ले चल', 'ले जा', 'जाना', 'जाओ', 'दिखाओ', 'दिखा दो'];

  var KB = [
    { id: 'greet', k: ['hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'हेलो', 'राम राम'], hi: 'नमस्ते! 🙏 मैं TolKanta सहायक हूँ। दाम, बेचने का तरीका, पिकअप, भुगतान, लोन पासपोर्ट, कुछ भी पूछिए। लिखकर या माइक दबाकर बोलकर।', en: 'Namaste! I am the TolKanta assistant. Ask me about prices, how to sell, pickups, payment or the loan passport. Type, or tap the mic and speak.' },
    { id: 'thanks', k: ['thank', 'thanks', 'thank you', 'dhanyavad', 'shukriya', 'धन्यवाद', 'शुक्रिया', 'बढ़िया'], hi: 'आपका स्वागत है! कुछ और पूछना हो तो बताइए।', en: 'You are welcome! Ask anything else any time.' },
    { id: 'what', k: ['tolkanta', 'what is this', 'what is tolkanta', 'tolkanta kya', 'तोलकांटा', 'टोलकांटा', 'यह वेबसाइट', 'this website', 'purpose', 'मकसद'], hi: 'TolKanta कबाड़ीवालों को ई-कचरे का सही दाम, अधिकृत (CPCB) रीसाइक्लर तक सीधा रास्ता, और हर सौदे का पक्का रिकॉर्ड देता है। इस रिकॉर्ड से कमाई पासपोर्ट बनता है जो लोन में मदद करता है।', en: 'TolKanta gives kabadiwalas a fair price for e-waste, a direct route to CPCB-authorised recyclers, and a tamper-proof record of every deal. Those records build an Earnings Passport that helps with loans.', go: 'how' },
    { id: 'sell', k: ['sell', 'how to sell', 'bechna', 'bechu', 'kaise beche', 'बेच', 'बेचूँ', 'बेचना', 'बेचे', 'कबाड़ कैसे'], hi: 'कबाड़ बेचने के 5 आसान कदम:\n1. सामान की फोटो लें\n2. सामान चुनें (फोटो से पहचान भी होती है)\n3. वज़न डालें या माइक से बोलें\n4. सबसे अच्छा अधिकृत दाम और रीसाइक्लर चुनें\n5. पिकअप का समय और भुगतान तरीका चुनकर बुक करें', en: 'Selling takes 5 steps:\n1. Take a photo of the scrap\n2. Choose the item (the photo is recognised on your device)\n3. Enter the weight, or say it with the mic\n4. Pick the best authorised price and recycler\n5. Choose a pickup slot and payment mode, then book', go: 'sell' },
    { id: 'otp', k: ['otp', 'password', 'login', 'log in', 'sign in', 'account', 'ओटीपी', 'लॉग इन', 'लॉगिन', 'खाता कैसे बनाएँ', 'register', 'रजिस्टर'], hi: 'लॉग इन के लिए 10 अंक का मोबाइल नंबर डालें। इस डेमो में ओटीपी हमेशा 123456 है। नया नंबर डालते ही कबाड़ीवाला खाता बन जाता है।\nडेमो नंबर: 9000000001 (कबाड़ीवाला), 9000000002 (रीसाइक्लर), 9000000003 (नगर अधिकारी)।', en: 'Log in with any 10-digit mobile number. In this demo the OTP is always 123456. A new number creates a kabadiwala account.\nDemo numbers: 9000000001 (kabadiwala), 9000000002 (recycler), 9000000003 (city officer).', go: 'login' },
    { id: 'pricehow', k: ['price decided', 'rate decided', 'how is price', 'board rate', 'median', 'दाम कैसे तय', 'रेट कैसे', 'दाम कौन तय', 'fair price', 'सही दाम'], hi: 'बोर्ड रेट सभी अधिकृत रीसाइक्लर की लाइव बोलियों का बीच वाला दाम (median) है। नगर अधिकारी इसे कंट्रोल रूम से देखते और अपडेट करते हैं। बेचते समय आपको सबसे ऊँची अधिकृत बोली दिखती है, लोकल कबाड़ मंडी के दाम से तुलना के साथ।', en: 'The board rate is the median of live bids from all authorised recyclers. The city officer reviews it in the control room. When you sell, you see the highest authorised bid, compared with the local kabadi-market rate.', go: 'rates' },
    { id: 'pay', k: ['payment', 'paisa', 'paise', 'pay', 'paid', 'money', 'upi', 'cash', 'aeps', 'पैसा', 'पैसे', 'भुगतान', 'नकद', 'कब मिलेगा', 'पेमेंट'], hi: 'रीसाइक्लर जैसे ही मिला हुआ वज़न पक्का करता है, भुगतान हो जाता है। तरीका आप बुकिंग के समय चुनते हैं: नकद (डिफ़ॉल्ट), UPI या AePS (आधार से)। रकम अपने आप आपके खाते (लेजर) में जुड़ जाती है।', en: 'You are paid as soon as the recycler confirms the weight received. You choose the mode when booking: cash (default), UPI or AePS (Aadhaar). The amount is added to your ledger automatically.', go: 'ledger' },
    { id: 'handover', k: ['handover', 'hash', 'record', 'tamper', 'proof', 'sha', 'हैंडओवर', 'सौंप', 'हैश', 'रिकॉर्ड', 'सबूत'], hi: 'गाड़ी आने पर पिकअप पेज खोलें, तराज़ू पर रखे सामान की फोटो लें और "रिकॉर्ड करें" दबाएँ। फोटो + GPS + समय + वज़न से SHA-256 हैश बनता है जो पिछले रिकॉर्ड से जुड़ा होता है। बाद में कोई भी बदलाव करे तो चेन टूट जाती है, इसलिए रिकॉर्ड पक्का रहता है।', en: 'When the van arrives, open the pickup, photograph the goods on the scale and press Record. Photo + GPS + time + weight are sealed into a SHA-256 hash linked to the previous record. Any later edit breaks the chain, so the record stays trustworthy.', go: 'pickups' },
    { id: 'verify', k: ['verify', 'check record', 'genuine', 'real', 'जाँच', 'जांच', 'असली', 'सत्यापित'], hi: 'कोई भी व्यक्ति "रिकॉर्ड जाँचें" पेज पर 64 अक्षर का हैश डालकर देख सकता है कि रिकॉर्ड बदला नहीं गया। रीसाइक्लर भुगतान से पहले यही जाँच करता है।', en: 'Anyone can paste the 64-character hash on the Verify page to confirm the record was not changed. Recyclers run the same check before paying.', go: 'verify' },
    { id: 'dispute', k: ['dispute', 'mismatch', 'less weight', 'weight kam', 'kam wazan', 'wazan kam', 'kam tola', 'kam likha', 'कम लिखा', 'cheat', 'fraud', 'विवाद', 'अंतर', 'कम वज़न', 'कम तौला', 'धोखा', 'शिकायत', 'complaint'], hi: 'अगर रीसाइक्लर का तौला वज़न आपके रिकॉर्ड से 5% से ज़्यादा कम है, तो पिकअप अपने आप "वज़न विवाद" में चला जाता है। नगर अधिकारी फोटो और हैश रिकॉर्ड देखकर फ़ैसला करते हैं। आपकी फोटो और समय का सबूत आपके पास रहता है।', en: 'If the recycler\'s weight is more than 5% below your recorded weight, the pickup becomes a weight dispute automatically. The city officer decides using the photo and the hash record, so your evidence is protected.' },
    { id: 'passport', k: ['passport', 'loan', 'credit', 'score', 'bank', 'mudra', 'lender', 'पासपोर्ट', 'लोन', 'कर्ज', 'क़र्ज़', 'स्कोर', 'बैंक', 'मुद्रा'], dyn: 'passport', go: 'passport' },
    { id: 'eshram', k: ['e-shram', 'eshram', 'uan', 'ई-श्रम', 'ईश्रम', 'श्रम कार्ड', 'labour card'], hi: 'ई-श्रम असंगठित कामगारों का राष्ट्रीय डेटाबेस है। प्रोफ़ाइल में 12 अंक का UAN जोड़ने से भरोसा स्कोर में 10 अंक जुड़ते हैं। डेमो में नंबर सिर्फ़ फ़ॉर्मेट से जाँचा जाता है।', en: 'e-Shram is the national database of unorganised workers. Adding your 12-digit UAN in Profile adds 10 points to your trust score. In this demo the number is only format-checked.', go: 'profile' },
    { id: 'safety', k: ['safe', 'safety', 'hazard', 'hazardous', 'danger', 'burn', 'acid', 'gloves', 'health', 'सुरक्षा', 'सावधान', 'ख़तरनाक', 'खतरनाक', 'जला', 'तेज़ाब', 'दस्ताने', 'सेहत'], hi: '⚠️ सुरक्षा:\n• तार जलाकर तांबा न निकालें, धुआँ ज़हरीला है\n• लिथियम बैटरी न तोड़ें, न पंचर करें, आग लग सकती है\n• CRT टीवी की ट्यूब न फोड़ें, उसमें सीसा (lead) है\n• दस्ताने पहनें और ये सामान सिर्फ़ अधिकृत रीसाइक्लर को दें', en: '⚠️ Safety:\n• Never burn wires for copper, the smoke is toxic\n• Do not break or puncture lithium batteries, they can catch fire\n• Do not smash CRT tubes, they contain lead\n• Wear gloves, and give these items only to authorised recyclers' },
    { id: 'recycler', k: ['recycler', 'buyer', 'who will buy', 'near', 'nearest', 'authorised', 'authorized', 'cpcb', 'रीसाइक्लर', 'खरीदार', 'कौन खरीदेगा', 'पास में', 'नज़दीक', 'अधिकृत'], dyn: 'recyclers' },
    { id: 'epr', k: ['epr', 'producer', 'brand', 'target', 'certificate', 'ब्रांड', 'लक्ष्य', 'सर्टिफिकेट', 'प्रमाणपत्र'], hi: 'ई-कचरा नियमों में कंपनियों (producers) को EPR रीसाइक्लिंग लक्ष्य पूरे करने होते हैं: अभी 70%, 2027-28 से 80%। EPR सर्टिफिकेट सिर्फ़ CPCB-पंजीकृत रीसाइक्लर दे सकते हैं। TolKanta हर किलो का हैश-सत्यापित, ट्रेस होने वाला सबूत देता है।', en: 'Producers must meet EPR recycling targets under the e-waste rules: 70% now, rising to 80% from 2027-28. Only CPCB-registered recyclers can issue EPR certificates. TolKanta provides hash-verified, traceable evidence for every kilogram.' },
    { id: 'rules', k: ['swm', 'rules', 'law', 'policy', 'government rule', 'नियम', 'कानून', 'क़ानून', 'नीति'], hi: 'ठोस कचरा प्रबंधन (SWM) नियम 2026, 1 अप्रैल 2026 से लागू हैं। भारत में 2025-26 में लगभग 14.1 लाख टन ई-कचरा बना, और अनुमान है कि 85–95% अभी भी अनौपचारिक तरीके से संभाला जाता है। 320 से ज़्यादा पंजीकृत रीसाइक्लर हैं, कमी भरोसेमंद रास्ते की है।', en: 'The Solid Waste Management Rules 2026 are in force from 1 April 2026. India generated about 14.1 lakh tons of e-waste in FY 2025-26, and independent estimates say 85–95% is still handled informally. There are 320+ registered recyclers; the missing link is a trusted route to them.' },
    { id: 'ai', k: ['photo', 'camera', 'ai', 'identify', 'recognise', 'recognize', 'फोटो', 'कैमरा', 'पहचान', 'पहचाने'], hi: 'फोटो से सामान की पहचान आपके ही फ़ोन/ब्राउज़र में होती है (TensorFlow.js MobileNet), फोटो कहीं भेजी नहीं जाती। पहचान न हो या इंटरनेट धीमा हो तो खुद सामान चुन लें।', en: 'The photo is recognised on your own device (TensorFlow.js MobileNet); it is not uploaded anywhere. If it cannot tell, or the internet is slow, just choose the item yourself.', go: 'sell' },
    { id: 'voice', k: ['voice', 'audio', 'speak', 'listen', 'mic', 'hindi', 'language', 'आवाज़', 'आवाज', 'बोल', 'सुन', 'माइक', 'हिंदी', 'भाषा', 'पढ़ नहीं'], hi: 'पढ़ने में दिक्कत हो तो कोई बात नहीं:\n• हर पेज पर "सुनें" बटन है\n• वज़न माइक से बोलकर डालें\n• इस चैट में माइक दबाकर सवाल पूछें, जवाब बोलकर मिलेगा\n• ऊपर हिंदी/English बदल सकते हैं', en: 'No need to read everything:\n• Every page has a Listen button\n• Say the weight with the mic\n• In this chat, tap the mic to ask and hear the answer\n• Switch हिंदी / English at the top' },
    { id: 'nophone', k: ['no smartphone', 'feature phone', 'keypad phone', 'ivr', 'call', 'helpline', 'बिना स्मार्टफोन', 'साधारण फ़ोन', 'कॉल', 'हेल्पलाइन'], hi: 'स्मार्टफोन नहीं है? IVR हेल्पलाइन पर कॉल करें, सामान का नंबर दबाएँ और आज का दाम हिंदी में सुनें। व्हाट्सऐप पर भी दाम पूछ सकते हैं।', en: 'No smartphone? Call the IVR helpline, press the number for your item and hear today\'s rate in Hindi. You can also ask on WhatsApp.', go: 'ivr' },
    { id: 'whatsapp', k: ['whatsapp', 'व्हाट्सऐप', 'व्हाट्सएप'], hi: 'व्हाट्सऐप बॉट पर सामान का नाम या नंबर भेजें, आज का दाम और पास के अधिकृत रीसाइक्लर मिलेंगे।', en: 'Send an item name or number to the WhatsApp bot to get today\'s rate and nearby authorised recyclers.', go: 'whatsapp' },
    { id: 'privacy', k: ['privacy', 'data', 'my data', 'data safe', 'my number', 'phone number', 'safe data', 'share', 'डेटा', 'गोपनीय', 'नंबर दिख', 'मेरी जानकारी'], hi: 'आपका फ़ोन नंबर लोन देने वालों या रिपोर्ट में कभी नहीं दिखता। पासपोर्ट सिर्फ़ पढ़ने के लिए साझा होता है। इस डेमो में सारा डेटा सिर्फ़ आपके ब्राउज़र में रहता है।', en: 'Your phone number is never shown to lenders or in reports. The passport is shared read-only. In this demo all data stays in your own browser.' },
    { id: 'cost', k: ['fee', 'fees', 'charge', 'free', 'commission', 'cost', 'मुफ़्त', 'मुफ्त', 'फ़ीस', 'फीस', 'कमीशन', 'शुल्क'], hi: 'इस प्रोटोटाइप में कबाड़ीवालों से कोई शुल्क या कमीशन नहीं लिया जाता।', en: 'In this prototype kabadiwalas pay no fee or commission.' },
    { id: 'offline', k: ['internet', 'offline', 'network', 'slow', 'इंटरनेट', 'नेटवर्क', 'धीमा'], hi: 'नक्शा और फोटो-पहचान के लिए इंटरनेट चाहिए, बाकी वेबसाइट बिना उनके भी चलती है। बिना इंटरनेट के IVR कॉल से दाम सुन सकते हैं।', en: 'The map and photo recognition need internet; everything else keeps working without them. Without data, you can hear rates on the IVR call.' },
    { id: 'team', k: ['team', 'who made', 'who built', 'sih', 'hackathon', 'tenet', 'टीम', 'किसने बनाया', 'हैकाथॉन'], hi: 'TolKanta को Team Tenet ने स्मार्ट इंडिया हैकाथॉन 2026 के लिए बनाया है।', en: 'TolKanta was built by Team Tenet for Smart India Hackathon 2026.', go: 'about' },
    { id: 'official', k: ['official', 'government', 'sarkari', 'सरकारी', 'सरकार', 'असली वेबसाइट'], hi: 'यह SIH 2026 का प्रोटोटाइप है, सरकारी वेबसाइट नहीं। सारे नाम, दाम और ID डेमो के लिए हैं।', en: 'This is an SIH 2026 prototype, not an official government website. All names, prices and IDs are demo data.' },
    { id: 'reset', k: ['reset', 'demo data', 'start again', 'रीसेट', 'फिर से शुरू'], hi: 'डेमो डेटा फिर से शुरू करने के लिए पेज के नीचे (फ़ुटर में) "Reset demo data" दबाएँ, या नगर अधिकारी के Audit टैब में।', en: 'To restore the demo data, press "Reset demo data" in the footer, or in the officer\'s Audit tab.' },
    { id: 'buyerwho', k: ['who is buyer', 'buyer kaun', 'buyer login', 'seller login', 'kaun khareedta', 'who buys', 'खरीदार कौन', 'विक्रेता', 'seller', 'buyer', 'खरीदार'], hi: 'TolKanta पर दो तरह के लोग हैं:\n• विक्रेता (कबाड़ीवाला): कबाड़ की फोटो और वज़न डालकर बेचता है\n• खरीदार (CPCB-अधिकृत रीसाइक्लर): नया कबाड़ और बुकिंग की सूचना पाता है, वज़न पक्का करके भुगतान करता है\nलॉग इन पेज पर दोनों के अलग हिस्से हैं। डेमो खरीदार: 9000000002।', en: 'TolKanta has two sides:\n• Seller (kabadiwala): lists scrap with a photo and weight, books a pickup\n• Buyer (CPCB-authorised recycler): gets notified of new scrap and bookings, confirms the weight and pays\nThe login page has a separate section for each. Demo buyer: 9000000002.', go: 'login' },
    { id: 'notif', k: ['notification', 'notifications', 'notified', 'alert', 'alerts', 'bell', 'suchna', 'सूचना', 'सूचनाएँ', 'अलर्ट', 'घंटी'], dyn: 'notif', go: 'notifications' },
    { id: 'bought', k: ['bought', 'kg bought', 'did i buy', 'how many kg', 'kitne kilo', 'kitna kilo', 'कितने किलो', 'how much did i buy', 'kitna khareeda', 'kitna kharida', 'खरीदा', 'कितना खरीदा', 'kharida', 'purchases', 'खरीद'], dyn: 'bought' },
    { id: 'sold', k: ['sold', 'how much did i sell', 'kitna becha', 'kitna bika', 'कितना बेचा', 'बिक्री', 'my sales'], dyn: 'sold', go: 'sales' },
    { id: 'earn', k: ['earning', 'earnings', 'income', 'kamai', 'profit', 'today', 'hisab', 'कमाई', 'मुनाफ़ा', 'मुनाफा', 'आज कितना', 'हिसाब', 'आमदनी'], dyn: 'earn', go: 'ledger' },
    { id: 'mypickup', k: ['my pickup', 'pickup', 'pickup status', 'kab aayega', 'kab aayegi', 'status', 'van', 'when will', 'slot', 'पिकअप', 'गाड़ी', 'कब आएगी', 'कब आएगा', 'स्टेटस'], dyn: 'pickups', go: 'pickups' },
    { id: 'rates', k: RATE_W.concat(['today rate', 'आज के दाम', 'आज का भाव']), dyn: 'rates', go: 'rates' },
    { id: 'tour', k: ['tour', 'this page', 'where am i', 'explain page', 'samjhao', 'टूर', 'इस पेज', 'यह पेज', 'समझाओ', 'कहाँ हूँ', 'क्या करूँ'], dyn: 'page' },
    { id: 'help', k: ['help', 'what can you do', 'madad', 'मदद', 'सहायता', 'क्या पूछ'], dyn: 'help' },
  ];

  function matOf(q) { var code = null; Object.keys(MAT).some(function (c) { if (MAT[c].some(function (w) { return has(q, w); })) { code = c; return true; } return false; }); return code ? TK.api.materials().find(function (m) { return m.code === code; }) : null; }
  function me() { try { return TK.api.me(); } catch (e) { return null; } }
  function needLogin() { return { text: t('यह जानने के लिए पहले कबाड़ीवाला खाते से लॉग इन करें (डेमो नंबर 9000000001, ओटीपी 123456)।', 'Please log in with a kabadiwala account first (demo number 9000000001, OTP 123456).'), go: 'login' }; }

  var DYN = {
    rates: function (q) {
      var m = matOf(q); if (m) return DYN.material(m);
      var ms = TK.api.materials();
      return { text: t('आज के बोर्ड रेट:\n', "Today's board rates:\n") + ms.map(function (x) { return '• ' + (lang === 'hi' ? x.nameHi : x.nameEn) + ': ₹' + x.boardRate + '/' + (x.unit === 'kg' ? t('किलो', 'kg') : t('पीस', 'piece')); }).join('\n') + t('\nकिसी एक सामान का नाम पूछें, सबसे अच्छी बोली बताऊँगा।', '\nAsk about one item to hear the best bid.'), go: 'rates' };
    },
    material: function (m) {
      var bids = TK.api.bestBids(m.id), b = bids[0], u = m.unit === 'kg' ? t('किलो', 'kg') : t('पीस', 'piece');
      return { text: (lang === 'hi' ? m.nameHi : m.nameEn) + '\n' + t('आज का बोर्ड रेट: ₹', "Today's board rate: ₹") + m.boardRate + '/' + u +
        (b ? t('\nसबसे अच्छी अधिकृत बोली: ₹', '\nBest authorised bid: ₹') + b.bid + ' · ' + b.name : '') + t('\nलोकल मंडी रेट (लगभग): ₹', '\nLocal market rate (approx.): ₹') + m.localRate +
        (b && m.localRate ? t('\nयानी लगभग ' + Math.round((b.bid - m.localRate) / m.localRate * 100) + '% ज़्यादा।', '\nThat is about ' + Math.round((b.bid - m.localRate) / m.localRate * 100) + '% more.') : '') +
        '\n' + (m.hazard ? '⚠️ ' : '💡 ') + (lang === 'hi' ? m.safetyHi : m.safetyEn), go: 'sell' };
    },
    recyclers: function (q) {
      var m = matOf(q) || TK.api.materials()[0], list = TK.api.bestBids(m.id).sort(function (a, b) { return (a.distanceKm || 99) - (b.distanceKm || 99); }).slice(0, 3);
      return { text: t('सिर्फ़ CPCB-अधिकृत रीसाइक्लर दिखाए जाते हैं। ', 'Only CPCB-authorised recyclers are shown. ') + (lang === 'hi' ? m.nameHi : m.nameEn) + t(' के लिए पास वाले:\n', ' – nearest buyers:\n') + list.map(function (r, i) { return (i + 1) + '. ' + r.name + ', ' + r.area + ' · ' + r.distanceKm + ' km · ₹' + r.bid + '/' + m.unit; }).join('\n'), go: 'sell' };
    },
    earn: function () {
      var u = me(); if (u && u.role === 'recycler') return DYN.bought(); if (!u || u.role !== 'kabadiwala') return needLogin();
      var d = TK.api.dashboard(), td = d.today;
      return { text: t('आज: बेचा ₹' + Math.round(td.sold) + ', खरीदा ₹' + Math.round(td.bought) + ', मुनाफ़ा ₹' + Math.round(td.net) + '।\nअब तक ' + d.impact.handovers + ' सत्यापित हैंडओवर, ' + d.impact.kg + ' किलो ई-कचरा सही जगह पहुँचाया।',
        'Today: sold ₹' + Math.round(td.sold) + ', bought ₹' + Math.round(td.bought) + ', net ₹' + Math.round(td.net) + '.\nSo far ' + d.impact.handovers + ' verified handovers and ' + d.impact.kg + ' kg of e-waste delivered safely.'), go: 'ledger' };
    },
    pickups: function () {
      var u = me(); if (!u) return needLogin();
      var ps = TK.api.pickups().filter(function (p) { return ['booked', 'awaiting_confirmation', 'disputed'].indexOf(p.status) >= 0; });
      if (!ps.length) return { text: t('अभी कोई चालू पिकअप नहीं है। कबाड़ बेचें से नया पिकअप बुक करें।', 'You have no active pickups. Book one from Sell scrap.'), go: 'sell' };
      return { text: t('आपके चालू पिकअप:\n', 'Your active pickups:\n') + ps.slice(0, 4).map(function (p) { var st = TK.status[p.status] || [p.status, p.status]; return '• #' + p.id + ' ' + (lang === 'hi' ? p.material.nameHi : p.material.nameEn) + ', ' + p.recycler.name + ' · ' + (lang === 'hi' ? TK.slot(p.slot).hi : TK.slot(p.slot).en) + ' · ' + (lang === 'hi' ? st[0] : st[1]); }).join('\n'), go: 'pickups' };
    },
    passport: function () {
      var base = t('कमाई पासपोर्ट सिर्फ़ हैश-सत्यापित बिक्री से बनता है। स्कोर (100 में): सत्यापित बिक्री 40, हर हफ़्ते काम 20, कितने समय से जुड़े 15, विवाद न होना 15, ई-श्रम 10। बैंक या NBFC को QR दिखाकर लोन के लिए कमाई का सबूत दें।',
        'The Earnings Passport is built only from hash-verified sales. Score out of 100: verified sales 40, weekly activity 20, time on TolKanta 15, no disputes 15, e-Shram 10. Show its QR to a bank or NBFC as proof of income for a loan.');
      var u = me();
      if (u && u.role === 'kabadiwala') { var p = TK.api.passport(); base += t('\nआपका स्कोर अभी ' + p.score + ' है (' + p.band.hi + '), ' + p.verifiedCount + ' सत्यापित बिक्री।', '\nYour score is ' + p.score + ' (' + p.band.en + ') with ' + p.verifiedCount + ' verified sales.'); }
      return { text: base, go: 'passport' };
    },
    sold: function () {
      var u = me(); if (!u || u.role !== 'kabadiwala') return u && u.role === 'recycler' ? DYN.bought() : needLogin();
      var x = TK.api.sellerSummary();
      return { text: t('आज बेचा: ' + x.today.kg + ' किलो (₹' + Math.round(x.today.amount) + ')।\nइस महीने: ' + x.month.kg + ' किलो, ₹' + Math.round(x.month.amount) + '।\nकुल: ' + x.total.kg + ' किलो, ' + x.total.n + ' सत्यापित बिक्री। लोकल मंडी से ₹' + Math.round(x.total.extra) + ' ज़्यादा मिले।',
        'Sold today: ' + x.today.kg + ' kg (₹' + Math.round(x.today.amount) + ').\nThis month: ' + x.month.kg + ' kg, ₹' + Math.round(x.month.amount) + '.\nAll time: ' + x.total.kg + ' kg over ' + x.total.n + ' verified sales, ₹' + Math.round(x.total.extra) + ' more than the local market would have paid.'), go: 'sales' };
    },
    notif: function () {
      var u = me();
      var base = t('खरीदार को सूचना मिलती है: नया कबाड़ डाला गया, पिकअप बुक हुआ, हैंडओवर हुआ (वज़न पक्का करें), खरीद पूरी, रद्द और विवाद। विक्रेता को बुकिंग और भुगतान की सूचना मिलती है। सूचना ऊपर घंटी में, आवाज़ के साथ पॉप-अप में, और सूचनाएँ पेज पर दिखती है।',
        'Buyers are notified when new scrap is listed, a pickup is booked, a handover is recorded (confirm the weight), a purchase completes, or a pickup is cancelled or disputed. Sellers are notified of bookings and payments. Alerts show in the bell, as a pop-up with sound, and on the Notifications page.');
      if (u) { var n = TK.api.notifications(3); base += t('\nआपकी ' + n.unread + ' सूचनाएँ अभी बिना पढ़ी हैं।', '\nYou have ' + n.unread + ' unread notification' + (n.unread === 1 ? '' : 's') + '.') + (n.items[0] ? t(' सबसे नई: ', ' Latest: ') + n.items[0].title.split(' · ')[lang === 'hi' ? 0 : 1] + ' – ' + n.items[0].body : ''); }
      return { text: base, go: u ? 'notifications' : 'login' };
    },
    bought: function (q) {
      var u = me();
      if (u && u.role === 'recycler') { var d = TK.api.buyerDashboard();
        return { text: t('आज खरीदा: ' + d.today.kg + ' किलो (₹' + Math.round(d.today.paid) + ')।\nइस महीने: ' + d.month.kg + ' किलो, ₹' + Math.round(d.month.paid) + '।\nकुल: ' + d.total.kg + ' किलो और ' + d.total.pcs + ' पीस, ' + d.total.n + ' सत्यापित खरीद।\nबाकी: ' + d.pending.booked + ' बुक, ' + d.pending.awaiting + ' वज़न पक्का करना है।',
          'Bought today: ' + d.today.kg + ' kg (₹' + Math.round(d.today.paid) + ').\nThis month: ' + d.month.kg + ' kg, ₹' + Math.round(d.month.paid) + '.\nAll time: ' + d.total.kg + ' kg and ' + d.total.pcs + ' pieces across ' + d.total.n + ' verified purchases.\nTo do: ' + d.pending.booked + ' booked, ' + d.pending.awaiting + ' awaiting your weight confirmation.'), go: 'purchases' }; }
      if (u && u.role === 'kabadiwala') return DYN.earn();
      return { text: t('खरीदार (रीसाइक्लर) के रूप में लॉग इन करें, फिर मैं बताऊँगा कि आपने कितने किलो खरीदे। डेमो खरीदार: 9000000002, ओटीपी 123456।', 'Log in as a buyer (recycler) and I will tell you how many kg you bought. Demo buyer: 9000000002, OTP 123456.'), go: 'login' };
    },
    page: function () { return { text: t('आप "' + page.hi + '" पेज पर हैं। ' + page.sHi, 'You are on the "' + page.en + '" page. ' + page.sEn), tour: !!(page.steps && page.steps.length) }; },
    help: function () { return { text: t('मैं इन बातों में मदद कर सकता हूँ:\n• विक्रेता और खरीदार लॉग इन, सूचनाएँ\n• आज के दाम और सबसे अच्छी बोली\n• कबाड़ कैसे बेचें, पिकअप, भुगतान\n• हैश रिकॉर्ड और वज़न विवाद\n• लोन पासपोर्ट और ई-श्रम\n• सुरक्षा और नियम (EPR, SWM 2026)\n• किसी भी पेज पर ले जाना, जैसे "खाता खोलो"', 'I can help with:\n• Seller and buyer login, notifications\n• Today\'s rates and the best bid\n• How to sell, pickups, payment\n• Hash records and weight disputes\n• The loan passport and e-Shram\n• Safety and rules (EPR, SWM 2026)\n• Taking you to any page, e.g. "open ledger"') }; },
  };

  function answer(raw) {
    var q = String(raw || '').toLowerCase().replace(/[?？!।,.]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!q) return DYN.help();
    // "open ledger" / "खाता खोलो" → navigate
    if (NAV_W.some(function (w) { return has(q, w); })) { var d = match(q); if (d) return { text: t(d.hi + ' खोल रहे हैं…', 'Opening ' + d.en + '…'), nav: d }; }
    if (/log ?out|लॉग ?आउट/.test(q)) return { text: t('लॉग आउट कर रहे हैं…', 'Logging you out…'), nav: { id: 'logout' } };
    // score every intent
    var best = null, top = 0;
    KB.forEach(function (it) { var s = 0; it.k.forEach(function (w) { if (has(q, w)) s += w.length + 2; }); if (s > top) { top = s; best = it; } });
    var m = matOf(q);
    // an item name with a price word, or an item alone, means "what's the rate"
    if (m && (!best || best.id === 'rates' || best.id === 'greet' || (RATE_W.some(function (w) { return has(q, w); }) && ['recycler', 'safety'].indexOf(best.id) < 0))) return DYN.material(m);
    if (!best) {
      var dd = match(q); if (dd) return { text: t('क्या आप "' + dd.hi + '" पेज देखना चाहते हैं?', 'Did you mean the "' + dd.en + '" page?'), go: dd.id };
      return { text: t('माफ़ कीजिए, यह मैं अभी नहीं समझ पाया। इनमें से कुछ पूछकर देखें: "आज के दाम", "कबाड़ कैसे बेचूँ", "पैसा कब मिलेगा", "लोन", "बैटरी सुरक्षा"।', 'Sorry, I did not get that yet. Try: "today\'s rates", "how do I sell", "when will I get paid", "loan", "battery safety".'), chips: true };
    }
    if (best.dyn) { var r = DYN[best.dyn](q); if (!r.go && best.go) r.go = best.go; return r; }
    return { text: lang === 'hi' ? best.hi : best.en, go: best.go };
  }

  /* ---------------- AI (Claude via /api/chat), with offline fallback ---------------- */
  var AI = { state: 'unknown', model: null };
  function probeAI(cb) {
    if (location.protocol === 'file:' || !window.fetch) { AI.state = 'off'; return cb && cb(); }
    var done = false, t = setTimeout(function () { if (!done) { done = true; AI.state = 'off'; if (cb) cb(); } }, 4000);
    fetch(href('api/chat'), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (done) return; done = true; clearTimeout(t); AI.state = j && j.ai ? 'on' : 'off'; AI.model = j && j.model; if (cb) cb(); })
      .catch(function () { if (done) return; done = true; clearTimeout(t); AI.state = 'off'; if (cb) cb(); });
  }
  function slim(p) { return { id: p.id, item: p.material.nameEn, qty: p.lot.weightKg + ' ' + p.material.unit, seller: p.kabadiwala && (p.kabadiwala.shopName || p.kabadiwala.name), buyer: p.recycler && p.recycler.name, slot: TK.slot(p.slot).en, status: p.status, amount: p.amount, payment: p.paymentMode }; }
  function context(replyIn) {
    var u = me(), c = { lang: replyIn, page: { id: pageKey, name: page.en, about: page.sEn }, role: u ? u.role : 'guest (not logged in)', user: u ? { name: u.name, shop: u.shopName, ward: u.ward } : null, nowIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) };
    try { c.todayRates = TK.api.materials().map(function (m) { var b = TK.api.bestBids(m.id)[0]; return { item: m.nameEn, hindi: m.nameHi, unit: m.unit, boardRate: m.boardRate, change: m.delta, localMarketRate: m.localRate, hazardous: m.hazard, bestBid: b ? b.bid : null, bestBuyer: b ? b.name : null }; }); } catch (e) { /* ignore */ }
    try {
      if (u && u.role === 'kabadiwala') {
        var d = TK.api.dashboard(), ss = TK.api.sellerSummary();
        c.seller = { today: d.today, sales: { today: ss.today, thisMonth: ss.month, allTime: ss.total }, activePickups: d.active.map(slim), deliveredToRecyclers: d.impact };
        try { var pp = TK.api.passport(); c.seller.passport = { score: pp.score, band: pp.band.en, verifiedSales: pp.verifiedCount, verifiedIncome: pp.verifiedIncome, parts: pp.parts, eShramLinked: pp.eshramLinked }; } catch (e) { /* ignore */ }
      } else if (u && u.role === 'recycler') {
        var b = TK.api.buyerDashboard(), mk = TK.api.marketLots();
        c.buyer = { facility: b.recycler.name, cpcb: b.recycler.cpcbAuthNo, bought: { today: b.today, thisMonth: b.month, allTime: b.total }, toDo: b.pending, pickups: b.upcoming.map(slim), openScrapMatchingMyBids: mk.slice(0, 5).map(function (x) { return { qty: x.lot.weightKg + ' ' + x.material.unit, item: x.material.nameEn, seller: x.seller.name, km: x.distanceKm, myBid: x.myBid, bestBid: x.bestBid }; }) };
      } else if (u && u.role === 'admin') { c.city = TK.api.adminOverview().kpis; }
      if (u) { var n = TK.api.notifications(4); c.notifications = { unread: n.unread, latest: n.items.map(function (x) { return x.title + ': ' + x.body; }) }; }
    } catch (e) { /* ignore */ }
    return c;
  }
  function askAI(replyIn, cb) {
    var hist = log.filter(function (m) { return !m.typing && m.text; }).slice(-10).map(function (m) { return { role: m.who === 'me' ? 'user' : 'assistant', content: m.text }; });
    var ctrl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 28000);
    fetch(href('api/chat'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist, context: context(replyIn) }), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) { clearTimeout(t); if (x.ok && x.j.text) cb(null, x.j); else cb(new Error((x.j && x.j.error) || 'AI error')); })
      .catch(function (e) { clearTimeout(t); cb(e); });
  }

  /* ---------------- chat UI ---------------- */
  var root, panel, fab, tour = null, hl = null, log = sess.get('tk_chat_log') || [];
  function visible(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; }
  function spot(el) { unspot(); hl = el; el.classList.add('tk-guide-hl'); }
  function unspot() { if (hl) hl.classList.remove('tk-guide-hl'); hl = null; }
  function saveLog() { sess.set('tk_chat_log', log.slice(-30)); }

  function suggestions() {
    var u = me(), role = u ? u.role : null;
    var hi = role === 'kabadiwala' ? ['आज मेरी कमाई कितनी है?', 'मेरा पिकअप कब आएगा?', 'तांबे के तार का दाम?', 'मेरा लोन स्कोर?', 'इस पेज का टूर'] : role === 'recycler' ? ['आज कितने किलो खरीदा?', 'नई सूचनाएँ?', 'वज़न विवाद क्या है?', 'EPR क्या है?', 'इस पेज का टूर'] : role === 'admin' ? ['दाम कैसे तय होता है?', 'SWM नियम 2026?', 'EPR लक्ष्य?', 'इस पेज का टूर'] : ['आज के दाम क्या हैं?', 'कबाड़ कैसे बेचूँ?', 'ओटीपी क्या है?', 'पैसा कब मिलेगा?', 'बैटरी सुरक्षा', 'इस पेज का टूर'];
    var en = role === 'kabadiwala' ? ['How much did I earn today?', 'When is my pickup?', 'Copper wire rate?', 'My loan score?', 'Tour this page'] : role === 'recycler' ? ['How many kg did I buy today?', 'Any new notifications?', 'What is a weight dispute?', 'What is EPR?', 'Tour this page'] : role === 'admin' ? ['How is the price decided?', 'SWM Rules 2026?', 'EPR targets?', 'Tour this page'] : ["What are today's rates?", 'How do I sell scrap?', 'What is the OTP?', 'When do I get paid?', 'Battery safety', 'Tour this page'];
    return lang === 'hi' ? hi : en;
  }
  function msgHtml(m, i) {
    var tl = function (hi, en) { return (m.lang || lang) === 'hi' ? hi : en; };
    if (m.typing) return '<div class="tk-c-msg bot tk-c-typing" aria-label="Thinking"><i></i><i></i><i></i></div>';
    if (m.who === 'me') return '<div class="tk-c-msg me">' + esc(m.text).replace(/\n/g, '<br>') + (m.voice ? '<span class="tk-c-via">🎤</span>' : '') + '</div>';
    var d = m.go && destById(m.go);
    return '<div class="tk-c-msg bot"><div>' + esc(m.text).replace(/\n/g, '<br>') + '</div>' + (m.note ? '<div class="tk-c-note">' + esc(m.note) + '</div>' : '') + '<div class="tk-c-acts">' + (m.ai ? '<span class="tk-c-ai">AI</span>' : '') +
      '<button type="button" class="tk-c-say" data-say="' + i + '" aria-label="' + tl('सुनें', 'Listen') + '">' + TK.icon('speaker') + tl('सुनें', 'Listen') + '</button>' +
      (d && !m.nav ? '<button type="button" class="tk-c-go" data-go="' + d.id + '">' + TK.icon(d.icon) + tl(d.hi + ' खोलें', 'Open ' + d.en) + '</button>' : '') +
      (m.tour ? '<button type="button" class="tk-c-go" data-act="tour">' + TK.icon('zap') + tl('टूर शुरू करें', 'Start tour') + '</button>' : '') + '</div></div>';
  }
  function renderChat() {
    var body = panel.querySelector('.tk-g-body');
    body.innerHTML = '<div class="tk-c-log" id="tkcLog" aria-live="polite">' +
      '<div class="tk-c-msg bot"><div>' + esc(t('नमस्ते! 🙏 मैं TolKanta सहायक हूँ। कोई भी सवाल पूछिए, लिखकर या 🎤 दबाकर बोलकर। जवाब लिखा भी मिलेगा और सुनाई भी देगा।', 'Namaste! I am the TolKanta assistant. Ask any question by typing or by tapping 🎤 and speaking. You will get the answer as text and audio.')) + '<div class="tk-c-page">' + esc(t('आप यहाँ हैं: ' + page.hi, 'You are on: ' + page.en)) + '</div></div></div>' +
      log.map(msgHtml).join('') + '<div class="tk-c-chips">' + suggestions().map(function (s) { return '<button type="button" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div></div>' +
      '<form class="tk-c-foot" id="tkcForm" autocomplete="off">' + (SR ? '<button type="button" class="tk-g-mic" id="tkgMic" aria-label="' + t('बोलकर पूछें', 'Ask by voice') + '">' + TK.icon('mic') + '</button>' : '') +
      '<input id="tkgQ" class="input" placeholder="' + t('अपना सवाल लिखें…', 'Type your question…') + '" aria-label="Your question"><button class="tk-c-send" aria-label="Send">' + TK.icon('send') + '</button></form>' +
      '<div class="tk-c-status" id="tkcStatus" role="status"></div>';
    var lg = body.querySelector('#tkcLog'); lg.scrollTop = lg.scrollHeight;
    body.querySelector('#tkcForm').onsubmit = function (e) { e.preventDefault(); var v = body.querySelector('#tkgQ').value.trim(); if (v) send(v, false); };
    var mic = body.querySelector('#tkgMic'); if (mic) mic.onclick = listen;
    lg.onclick = function (e) {
      var q = e.target.closest('[data-q]'), s = e.target.closest('[data-say]'), g = e.target.closest('[data-go]'), a = e.target.closest('[data-act]');
      if (q) send(q.dataset.q, false);
      else if (s) speak(log[Number(s.dataset.say)].text, log[Number(s.dataset.say)].lang);
      else if (g) go(destById(g.dataset.go));
      else if (a) startTour();
    };
  }
  // Reply language: Devanagari or Hinglish → Hindi; plain English → English; otherwise the toggle
  function replyLang(text) {
    var q = String(text).toLowerCase();
    if (isDeva(q)) return 'hi';
    if (/\b(kya|kaise|kab|kahan|kaun|kyu|kyun|hai|hain|mera|meri|mere|kitna|kitne|kitni|ka|ki|ke|ko|ne|se|me|mein|par|aur|bhi|nahi|batao|bataiye|chahiye|aayega|aayegi|milega|milegi|bhav|daam|paisa|kamai|wala|wali|kholo|khol|dikhao|chalo|namaste)\b/.test(q)) return 'hi';
    return /[a-z]/.test(q) ? 'en' : lang;
  }
  function send(text, byVoice) {
    var prev = lang; lang = replyLang(text); var rl = lang; lang = prev;
    var q = String(text).toLowerCase(), isNav = NAV_W.some(function (w) { return has(q, w); }) && !!match(q);
    var local = function (note) {
      var pl = lang; lang = rl; var r = answer(text); lang = pl;
      log.push({ who: 'bot', text: r.text, go: r.go, nav: !!r.nav, tour: !!r.tour, lang: rl, note: note });
      saveLog(); renderChat(); if (autoSpeak || byVoice) speak(r.text, rl);
      if (r.nav) setTimeout(function () { go(r.nav); }, 1300);
    };
    log.push({ who: 'me', text: text, voice: !!byVoice });
    // Page commands ("ledger kholo") and the page tour are handled instantly on the device
    var wantsTour = /tour|टूर|इस पेज|this page/.test(q);
    if (AI.state !== 'on' || isNav || wantsTour) { local(); }
    else {
      log.push({ who: 'bot', typing: true }); renderChat();
      askAI(rl, function (err, res) {
        log = log.filter(function (m) { return !m.typing; });
        if (err) return local(rl === 'hi' ? '(AI अभी उपलब्ध नहीं, ऑफ़लाइन जवाब)' : '(AI unavailable right now, offline answer)');
        log.push({ who: 'bot', text: res.text, go: res.go && destById(res.go) ? res.go : null, lang: rl, ai: true });
        saveLog(); renderChat(); if (autoSpeak || byVoice) speak(res.text, rl);
      });
    }
    if (!byVoice && window.innerWidth > 700) { var qi = panel.querySelector('#tkgQ'); if (qi) qi.focus(); }
  }
  function listen() {
    var r = new SR(), mic = panel.querySelector('#tkgMic'), st = panel.querySelector('#tkcStatus');
    stop(); r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; r.interimResults = true; r.maxAlternatives = 1;
    mic.classList.add('listening'); st.textContent = t('सुन रहे हैं… बोलिए', 'Listening… speak now');
    var finalText = '';
    r.onresult = function (e) { var s = ''; for (var i = 0; i < e.results.length; i++) { s += e.results[i][0].transcript; if (e.results[i].isFinal) finalText = s; } panel.querySelector('#tkgQ').value = s; };
    r.onerror = function (e) { st.textContent = e.error === 'not-allowed' ? t('माइक की अनुमति दें, या लिखकर पूछें।', 'Allow the microphone, or type instead.') : t('आवाज़ साफ़ नहीं आई। फिर से बोलें या लिखें।', 'Could not hear clearly. Try again or type.'); };
    r.onend = function () { mic.classList.remove('listening'); var v = finalText || panel.querySelector('#tkgQ').value; if (v.trim()) { st.textContent = ''; send(v.trim(), true); } };
    try { r.start(); } catch (e) { mic.classList.remove('listening'); }
  }

  /* ---------------- spotlight tour ---------------- */
  function startTour() {
    var steps = (page.steps || []).filter(function (s) { return visible(document.querySelector(s[0])); });
    if (!steps.length) { speak(t(page.sHi, page.sEn)); return; }
    tour = { steps: steps, i: 0 }; panel.classList.add('touring'); showStep();
  }
  function showStep() {
    var s = tour.steps[tour.i], el = document.querySelector(s[0]);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); spot(el); }
    panel.querySelector('.tk-g-body').innerHTML = '<div class="tk-g-page"><div class="tk-g-kicker">' + t('पेज टूर', 'Page tour') + ' · ' + esc(t(page.hi, page.en)) + ' · ' + (tour.i + 1) + ' / ' + tour.steps.length + '</div><h3>' + esc(t(s[1], s[2])) + '</h3><p class="tk-g-alt">' + esc(t(s[2], s[1])) + '</p>' +
      '<div class="tk-g-dots">' + tour.steps.map(function (_, i) { return '<i' + (i === tour.i ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' +
      '<div class="tk-g-row"><button type="button" class="btn btn-ghost btn-sm" id="tkgPrev"' + (tour.i ? '' : ' disabled') + '>← ' + t('पीछे', 'Back') + '</button><button type="button" class="btn btn-ghost btn-sm" id="tkgRe" aria-label="Listen again">' + TK.icon('speaker') + '</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="tkgNext">' + (tour.i === tour.steps.length - 1 ? t('ख़त्म', 'Finish') : t('आगे', 'Next') + ' →') + '</button></div><button type="button" class="tk-g-exit" id="tkgEnd">' + t('चैट पर वापस', 'Back to chat') + '</button></div>';
    speak(t(s[1], s[2]));
    panel.querySelector('#tkgPrev').onclick = function () { tour.i--; showStep(); };
    panel.querySelector('#tkgNext').onclick = function () { if (tour.i < tour.steps.length - 1) { tour.i++; showStep(); } else endTour(); };
    panel.querySelector('#tkgRe').onclick = function () { speak(t(s[1], s[2])); };
    panel.querySelector('#tkgEnd').onclick = endTour;
  }
  function endTour() { tour = null; unspot(); stop(); panel.classList.remove('touring'); renderChat(); }

  /* ---------------- open / close ---------------- */
  function showMode() { var m = root && root.querySelector('#tkgMode'); if (m) { m.textContent = AI.state === 'on' ? '● AI assistant (Claude) · text + voice' : AI.state === 'off' ? '● Offline answers · text + voice' : '● Connecting…'; m.classList.toggle('off', AI.state === 'off'); } }
  function open() {
    root.classList.add('open'); fab.setAttribute('aria-expanded', 'true'); if (!tour) renderChat();
    if (AI.state === 'unknown') probeAI(showMode); showMode();
    var b = document.getElementById('tkgBubble'); if (b) b.remove(); store.set('tk_guide_seen', '1');
    setTimeout(function () { var q = panel.querySelector('#tkgQ'); if (q && window.innerWidth > 700) q.focus(); }, 50);
  }
  function close() { root.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); if (tour) endTour(); unspot(); stop(); }

  function mount() {
    if (document.getElementById('tkGuide')) return;
    root = document.createElement('div'); root.id = 'tkGuide';
    root.innerHTML = '<div class="tk-g-panel" role="dialog" aria-label="TolKanta assistant chat"><div class="tk-g-head"><span class="tk-g-avatar">' + TK.icon('chat') + '</span><span class="tk-g-title"><b>TolKanta सहायक</b><small id="tkgMode">● Assistant · text + voice</small></span>' +
      '<button type="button" class="tk-g-voice" id="tkgVoice" aria-pressed="' + autoSpeak + '" title="Read answers aloud">' + TK.icon('speaker') + '</button>' +
      '<span class="tk-g-lang" role="group" aria-label="Language"><button type="button" data-l="hi">हिं</button><button type="button" data-l="en">EN</button></span>' +
      '<button type="button" class="tk-g-close" aria-label="Close assistant">' + TK.icon('x') + '</button></div><div class="tk-g-body"></div></div>' +
      '<button type="button" class="tk-g-fab" aria-expanded="false" aria-label="Ask the TolKanta assistant">' + TK.icon('chat') + '<span><span class="tk-hi">सवाल पूछें</span><span class="tk-sep"> · </span><span class="tk-en">Ask</span></span></button>' +
      (store.get('tk_guide_seen') ? '' : '<div class="tk-g-bubble" id="tkgBubble">कोई सवाल? लिखकर या बोलकर पूछें। 🎤<br><small>Questions? Ask me by text or voice.</small></div>');
    document.body.appendChild(root);
    panel = root.querySelector('.tk-g-panel'); fab = root.querySelector('.tk-g-fab');
    var setLang = function () { TK.$$('.tk-g-lang button', root).forEach(function (b) { b.classList.toggle('on', b.dataset.l === lang); b.setAttribute('aria-pressed', b.dataset.l === lang); }); };
    var setVoice = function () { var v = root.querySelector('#tkgVoice'); v.classList.toggle('off', !autoSpeak); v.setAttribute('aria-pressed', autoSpeak); v.title = autoSpeak ? 'Answers are read aloud (click to mute)' : 'Answers are muted (click to read aloud)'; };
    setLang(); setVoice();
    root.querySelector('.tk-g-lang').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; lang = b.dataset.l; store.set('tk_guide_lang', lang); setLang(); if (tour) showStep(); else renderChat(); };
    root.querySelector('#tkgVoice').onclick = function () { autoSpeak = !autoSpeak; store.set('tk_chat_voice', autoSpeak ? 'on' : 'off'); setVoice(); if (!autoSpeak) stop(); TK.toast(autoSpeak ? t('जवाब बोलकर सुनाए जाएँगे', 'Answers will be read aloud') : t('आवाज़ बंद', 'Voice off')); };
    fab.onclick = function () { root.classList.contains('open') ? close() : open(); };
    root.querySelector('.tk-g-close').onclick = close;
    var bub = root.querySelector('#tkgBubble'); if (bub) { bub.onclick = open; setTimeout(function () { if (bub.isConnected) bub.remove(); }, 9000); }
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (e.key === 'Escape' && root.classList.contains('open')) close();
      else if (e.key === '?' && tag !== 'input' && tag !== 'textarea' && tag !== 'select') { e.preventDefault(); open(); }
    });
    if (TK.param && (TK.param('guide') === '1' || TK.param('tour') === '1' || TK.param('ask'))) setTimeout(function () { open(); if (TK.param('tour') === '1') startTour(); else if (TK.param('ask')) send(TK.param('ask'), false); }, 400);
  }

  TK.guide = { DEST: DEST, PAGES: PAGES, speak: speak, stop: stop, match: match, go: go, answer: function (q) { var p = lang; lang = replyLang(q); try { return answer(q); } finally { lang = p; } },
    ask: function (q, byVoice) { if (!root.classList.contains('open')) open(); send(q, !!byVoice); }, listen: function () { if (!root.classList.contains('open')) open(); if (SR) setTimeout(listen, 150); }, open: function () { open(); }, lang: function () { return lang; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
