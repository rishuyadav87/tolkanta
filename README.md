# TolKanta · तोलकांटा (Team Tenet · SIH 2026)

A complete multi-page **website** in plain HTML, CSS and JavaScript. No framework, no build step, no server.
Fair prices, authorised recyclers and tamper-evident records for India's informal e-waste chain.

## Open it

- **Quickest:** double-click `index.html`. It works straight from the folder in Chrome or Edge.
- **Local server with the AI assistant (recommended):** needs Node 18+, no `npm install`.
  ```
  cd TolKanta_Website
  ANTHROPIC_API_KEY=sk-ant-... node server.js            # macOS / Linux
  set ANTHROPIC_API_KEY=sk-ant-... && node server.js     # Windows (cmd)
  # then open http://localhost:3000
  ```
  Without a key it still runs; the assistant uses its offline answers.
- **Any static server** (no AI): `python -m http.server 8000`.

## Deploy on Vercel (about 2 minutes)

1. Go to vercel.com → **Add New… → Project**.
2. Either import the GitHub repo that holds this folder, or drag and drop the folder on vercel.com/new.
3. Framework preset: **Other**. Build command and Output directory: leave empty (defaults). The `api/` folder is picked up as a serverless function automatically.
4. **Settings → Environment Variables:** add `ANTHROPIC_API_KEY` (your Claude API key from console.anthropic.com). Optional: `ANTHROPIC_MODEL`.
5. Press **Deploy**. `vercel.json` is included; `api/chat.js` becomes the AI function automatically.
6. Open the site → orange **Ask** button → the header says **AI assistant (Claude)**.

Or with the CLI: `npm i -g vercel && vercel --prod` from inside this folder.

## Logins: separate Seller and Buyer sections

`login.html` has a **Seller login** (kabadiwalas) and a **Buyer login** (CPCB-authorised recyclers), plus a small **Officer login** for the ULB. Each section accepts only its own accounts: a buyer number typed into the seller section is refused with a clear message, and only ULB-registered numbers can log in as buyers. Links: `login.html?as=seller`, `login.html?as=buyer`, `login.html?as=admin`.

## Demo accounts (OTP is always `123456`)

| Mobile | Section | Account |
|---|---|---|
| 9000000001 | Seller | Ramesh · Ramesh Scrap Traders |
| 9000000004 | Seller | Salma · Salma Kabadi Store |
| any other 10-digit number | Seller | a new seller account |
| 9000000002 | Buyer | Harit E-Recyclers |
| 9000000005 | Buyer | Circuit Recovery Works |
| 9000000006 | Buyer | Metro E-Waste Processors |
| 9000000003 | Officer | ULB control room |

## Buyer portal (authorised recyclers)

| Page | What the buyer gets |
|---|---|
| `portal/buyer.html` | Dashboard: **kg bought** today / this month / all time, money paid, pickups to handle, 14-day chart, bought by material, top sellers, latest notifications, new scrap near you |
| `portal/recycler.html` | Pickups & weighing: verify each handover hash, confirm the weight received (pays the seller), publish bids, EPR CSV |
| `portal/buyer-market.html` | Scrap available: open lots matching your bids, distance, value, whether your bid is the best |
| `portal/buyer-purchases.html` | Purchase history: seller, material, kg handed → received, rate, paid, record hash; filters + CSV |
| `portal/notifications.html` | All notifications with filters (shared by sellers, buyers and officers) |
| `portal/buyer-profile.html` | Facility + CPCB details, doorstep pickup on/off, alert settings (new scrap, sound, Hindi voice, desktop), test alert |

**Notifications.** A bell with an unread count sits on every portal page. Buyers are notified when new scrap matching their bids is listed, a pickup is booked with them, a handover is recorded, a purchase completes, or a pickup is cancelled or disputed. Sellers are notified of bookings and payments; officers of disputes. When another tab changes something, an alert pops up live with a chime, optional Hindi voice and optional desktop notification.

## 3-minute live demo for judges

0. **Tab 2 first:** Buyer login `9000000002` → buyer dashboard (keep it open to watch notifications arrive).
1. **Tab 1:** Seller login `9000000001` → **Sell scrap** → add a photo → pick *Motherboard / PCB* → weight `12` → see the best authorised price → pick **Harit E-Recyclers** → book.
2. On the pickup page, add the handover photo → **Record handover**. A SHA-256 record hash appears.
3. **Tab 2:** the buyer has already been alerted (booking, then handover). Open **Pickups & weighing** → **Verify record** → **Confirm and pay**. Check **Purchases** for kg bought.
4. Tab 1 updates by itself: *Paid*. The ledger and Earnings Passport update too.
5. **Tab 3:** log in as `9000000003` → Control room → **Audit & EPR → Run full audit** → chain intact → download the EPR CSV.
6. Ask the assistant (orange **सवाल पूछें · Ask** button): *"तांबे का दाम?"*, *"when do I get paid?"*, *"खाता खोलो"*, or tap 🎤 and speak.

Reset everything any time: footer → **Reset demo data**.

## What's inside

```
index.html            Home: live price board, stats, channels, impact
how-it-works.html     The journey step by step
impact.html           Public impact numbers
verify.html           Public hash verifier (anyone can check a record)
ivr.html              IVR helpline simulator (Hindi voice)
whatsapp.html         WhatsApp bot simulator
guide.html            Help centre: every page explained, text + audio
about.html            Team, sources, contact
login.html            Separate Seller / Buyer / Officer login sections
passport-view.html    Lender's read-only Earnings Passport (opened from the QR)
portal/               Logged-in portals
  dashboard.html      Kabadiwala dashboard
  sell.html           5-step Sell wizard (photo AI, voice weight, map, booking)
  pickups.html        Pickups, handover capture, SHA-256 record, live status
  sales.html          My sales: kg sold, money received, buyers, CSV
  buyers.html         Buyers & rates: every buyer's live rate per item
  ledger.html         Cash ledger, CSV export
  passport.html       Earnings Passport + trust score + QR
  profile.html        Profile, GPS, e-Shram UAN, consent
  buyer.html          Buyer dashboard (kg bought, pickups, notifications)
  buyer-market.html   Scrap available near the buyer
  buyer-purchases.html Purchase history + CSV
  buyer-profile.html  Buyer profile + alert settings
  notifications.html  Notifications (all roles)
  recycler.html       Buyer: pickups & weighing, verify, confirm weight, bids, EPR CSV
  admin.html          ULB control room: impact, price engine, registry, audit
css/                  style.css (site) + portal.css (portals)
js/                   db.js (data + hash chain), sha256.js, common.js (layout,
                      speech, GPS), guide.js (assistant chatbot), pages/*.js
vendor/               Leaflet 1.9.4 and qrcode-generator 1.4.4 (bundled, work offline)
assets/img/           Logo, favicon, sample photo
api/chat.js           AI assistant function (Vercel serverless; also used by server.js)
server.js             Local server: website + AI function (node server.js)
package.json          Node version + start script (no dependencies)
.env.example          Environment variables for the AI key
vercel.json           Static hosting config
```

## Seller portal (kabadiwalas)

| Page | What the seller gets |
|---|---|
| `portal/dashboard.html` | Today's earnings, active pickups, today's rates, notifications, My-sales summary, recent ledger |
| `portal/sell.html` | 5-step Sell wizard (photo AI, voice weight, best price, map of buyers, booking) |
| `portal/pickups.html` | Pickup status timeline, handover photo + GPS + weight → sealed SHA-256 record, live "Paid" update |
| `portal/sales.html` | **My sales:** kg sold today / month / all time, money received, extra earned over local market, who bought, full list + CSV |
| `portal/buyers.html` | **Buyers & rates:** every authorised buyer, distance, pickup slot, and each buyer's rate for every item (best highlighted) |
| `portal/ledger.html` | Cash book including deals outside TolKanta |
| `portal/passport.html` | Earnings Passport + trust score + QR for lenders |
| `portal/notifications.html` | Pickup booked, handover recorded, payment received, rate up / down alerts, disputes |

## Language switch and layout

- **EN / हिं / Both** switch in the top bar and the portal sidebar. Labels are written once as "हिंदी · English" and the switch shows one side, so pages are not cluttered. Default: English.
- Top menu trimmed to How it works · Impact · Verify · Help · More ▾ (IVR demo, WhatsApp demo, About, Home).
- Larger minimum text size (13px) and darker grey for readability on a projector.

## The assistant chatbot (every page)

- Orange **सवाल पूछें · Ask** button, bottom right (or press `?`).
- Ask by **typing** or by **voice** (🎤, Chrome/Edge). Answers appear as text and are **read aloud**; the speaker button in the header mutes it.
- Hindi or English: Devanagari and Hinglish questions get Hindi answers, English questions get English.
- Knows the process (selling, OTP, payment, handover hash, disputes, passport, e-Shram, safety, EPR, SWM Rules 2026) and reads **live demo data**: today's rates and best bids, your earnings, your pickup status, your trust score.
- Navigates on request: *"ledger kholo"*, *"open sell page"*.
- **Page tour:** "इस पेज का टूर" / "Tour this page" spotlights each part of the page and explains it aloud.
- **AI mode (Claude):** when deployed with `ANTHROPIC_API_KEY`, questions go to `api/chat.js`, which sends Claude the question, recent chat, TolKanta knowledge and a snapshot of what this user can see (today's rates and best bids; for sellers their sales, pickups and passport score; for buyers kg bought, pickups and open scrap). The key never reaches the browser. Answers are short, plain text so they can be read aloud, and can include an "Open page" button. Default model: `claude-haiku-4-5-20251001` (fast, low cost); change with `ANTHROPIC_MODEL`.
- **Offline mode:** opened from the folder, on a plain static server, without internet or without a key, the same chat uses its built-in answers. Page commands ("ledger kholo") and the page tour always run instantly on the device.
- Basic protection: 20 questions per minute per IP, message length limits, 25-second timeout.

## How it works technically

- **Data:** a JSON database in the browser's `localStorage` (`tolkanta_db_v2`), shared by all tabs, so a recycler tab and a kabadiwala tab see each other's changes instantly. Each tab has its own login (`sessionStorage`).
- **Tamper-evident records:** each handover = canonical JSON of photo SHA-256 + GPS + time + weight + previous record hash → SHA-256. Changing any old value breaks the chain from there on (`Audit` tab and `verify.html` recompute it).
- **Photo AI:** TensorFlow.js MobileNet, loaded on demand from jsDelivr and run on the device. Without internet the user picks the item manually.
- **Voice:** Web Speech API (hi-IN) for read-aloud, spoken weight and the assistant.

## Needs internet for

Google Fonts (falls back to system fonts), OpenStreetMap map tiles (the recycler list still works), and the photo-recognition model. Everything else works offline.

## Honest limits (prototype)

- The AI assistant needs a Claude API key (billed per use by Anthropic). Without it, the offline answers are used.
- Data lives in one browser. A production build would move `js/db.js` behind a real API (PostgreSQL + object storage) with the same function names.
- OTP, e-Shram and payments are simulated. The IVR and WhatsApp pages are simulators of those channels.
- All names, prices, IDs and CPCB numbers are demo data. This is not an official Government of India website.

## Facts used

SWM Rules 2026 in force from 1 April 2026 · about 14.1 lakh tons e-waste in FY 2025-26 · 85–95% handled informally (independent estimates) · 320+ registered recyclers · EPR targets 70%, 80% from 2027-28 · only CPCB-registered recyclers can issue EPR certificates.
