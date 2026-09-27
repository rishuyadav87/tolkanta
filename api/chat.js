/* =========================================================================
   TolKanta AI assistant: serverless function (Vercel: /api/chat)
   The browser sends the question, recent chat and a small snapshot of the
   live data it can see. This function adds the TolKanta knowledge, calls
   the Gemini API with the key kept on the server, and returns the answer.
   Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional)
   ========================================================================= */
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const BASE = 'https://generativelanguage.googleapis.com';

const PAGES = ['home', 'rates', 'sell', 'pickups', 'sales', 'buyers-rates', 'ledger', 'passport', 'profile', 'dashboard', 'login', 'verify', 'impact', 'how', 'ivr', 'whatsapp', 'buyer', 'recycler', 'market', 'purchases', 'notifications', 'admin', 'about', 'guide'];

const KNOWLEDGE = `
TolKanta (Team Tenet, Smart India Hackathon 2026 prototype) formalises India's informal e-waste chain.
Two sides:
- Seller = kabadiwala / scrap seller. Logs in via the Seller login (any mobile; demo 9000000001 Ramesh, 9000000004 Salma). Sells in 5 steps: photo (recognised on-device with TensorFlow.js MobileNet), choose item, weight (can be spoken), best authorised price vs local market rate, book a pickup (slot + payment Cash default, UPI or AePS). Pages: Dashboard, Sell scrap, Pickups, My sales (kg sold, money received, extra vs local rate), Buyers & rates (every buyer's live rate), Ledger (cash book incl. deals outside TolKanta), Earnings Passport, Notifications, Profile (name, shop, ward, GPS, e-Shram UAN, consent).
- Buyer = CPCB-authorised recycler. Logs in via the Buyer login (only numbers registered by the ULB; demo 9000000002 Harit, 9000000005 Circuit Recovery, 9000000006 Metro E-Waste). Gets notifications (bell, pop-up with chime, optional Hindi voice / desktop) for: new scrap listed matching their bids, pickup booked, handover recorded, purchase complete, cancellation, dispute. Pages: Buyer dashboard (kg bought today/month/all time, money paid), Pickups & weighing (verify the handover hash, confirm the weight received, which pays the seller; publish bids; EPR CSV), Scrap available, Purchases (history + CSV), Notifications, Profile & alerts.
- City officer (ULB) via Officer login (demo 9000000003): impact, weight disputes, price engine, recycler registry, hash-chain audit, EPR CSV.
Demo OTP is always 123456. Data in this demo lives in the browser; OTP, e-Shram checks and payments are simulated.
Handover record: at pickup the seller takes a photo; photo hash + GPS + time + weight are sealed into a SHA-256 record linked to the previous record (a hash chain). Anyone can check a hash on the public Verify page. If the buyer's weight is more than 5% below the handover weight, the pickup becomes a weight dispute for the ULB officer.
Board rate = median of live bids from authorised recyclers; officers can adjust. Sellers get alerts when a board rate goes up or down.
Earnings Passport: trust score out of 100 = verified sales 40 + weekly activity 20 + time on TolKanta 15 + no disputes 15 + e-Shram linked 10. Built only from hash-verified sales. QR opens a read-only lender view; phone number never shown. An indicator for lenders, not a credit bureau score.
Channels for people without smartphones: IVR helpline (press a number, hear today's rate in Hindi) and WhatsApp bot; every page has Listen buttons.
Safety: never burn wires or circuit boards (toxic smoke); never crush, puncture or heat lithium batteries (fire); never break CRT glass (lead); wear gloves; give hazardous items only to authorised recyclers.
Facts: SWM Rules 2026 in force from 1 April 2026. India generated about 14.1 lakh tons of e-waste in FY 2025-26; independent estimates say 85–95% is handled informally; 320+ registered recyclers. EPR targets 70%, rising to 80% from 2027-28; only CPCB-registered recyclers can issue EPR certificates.
No fee or commission for sellers in this prototype. This is not an official government website.`;

function systemPrompt(ctx) {
  const lang = ctx && ctx.lang === 'en' ? 'English' : 'Hindi (Devanagari script, simple everyday words)';
  return `You are "TolKanta सहायक", the voice-and-text assistant on the TolKanta website. Users are often kabadiwalas with limited literacy, recyclers, and city officers; SIH judges may also test you.

How to answer:
- Reply in ${lang} unless the user clearly writes in another language; if they write Hinglish, reply in simple Hindi.
- Your reply is also read aloud, so write plain text only: no markdown, no asterisks, no tables, no emojis except ⚠️ for safety. Short lines are fine.
- Be brief: 1 to 4 short sentences, or up to 5 short bullet lines starting with "• " for steps.
- Use ONLY the facts below and the LIVE DATA. Never invent prices, weights, money amounts, names or statuses. If something is not in the data, say so and point to the page where they can see it.
- Money in rupees like ₹3,144. Weights in kg.
- If the user wants to go somewhere or the answer is best seen on a page, end with one tag on its own line: [[GO:<page>]] where <page> is one of: ${PAGES.join(', ')}. Only use a page that fits the user's role (seller pages need a seller login, buyer pages a buyer login).
- If the question has nothing to do with TolKanta, e-waste, recycling, the demo or the users' work, answer in one friendly line and steer back.
- For anything about burning, breaking or opening hazardous items, give the safety advice.

TOLKANTA KNOWLEDGE:${KNOWLEDGE}

LIVE DATA from this user's screen (JSON; trust it over anything else):
${JSON.stringify(ctx || {}).slice(0, 9000)}`;
}

// Best-effort limiter (per warm instance): 20 requests per minute per IP
const hits = new Map();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now); hits.set(ip, list);
  return list.length > 20;
}

async function handler(req, res) {
  const send = (code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
  if (req.method === 'GET') return send(200, { ok: true, ai: !!process.env.GEMINI_API_KEY, model: MODEL });
  if (req.method !== 'POST') return send(405, { error: 'Use POST' });
  if (!process.env.GEMINI_API_KEY) return send(503, { error: 'AI is not configured on this server (GEMINI_API_KEY missing).' });
  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'x').split(',')[0].trim();
  if (limited(ip)) return send(429, { error: 'Too many questions in a minute. Please wait a moment.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || !Array.isArray(body.messages)) return send(400, { error: 'Send { messages: [...], context: {...} }' });
  const messages = body.messages.slice(-10).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', content: String(m.content || '').slice(0, 1500) })).filter((m) => m.content.trim());
  while (messages.length && messages[0].role !== 'user') messages.shift();
  // merge consecutive same-role turns
  const merged = [];
  messages.forEach((m) => { const last = merged[merged.length - 1]; if (last && last.role === m.role) last.content += '\n' + m.content; else merged.push({ ...m }); });
  if (!merged.length || merged[merged.length - 1].role !== 'user') return send(400, { error: 'The last message must be from the user.' });

  const geminiMessages = merged.map(m => ({ role: m.role, parts: [{ text: m.content }] }));

  try {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 25000);
    const r = await fetch(BASE + `/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 
        systemInstruction: { parts: [{ text: systemPrompt(body.context) }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
      }),
    });
    clearTimeout(timer);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return send(502, { error: (data.error && data.error.message) || ('AI service error ' + r.status) });
    
    let text = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts.map(p => p.text).join('').trim();
    }
    
    let go = null;
    const m = /\[\[GO:([a-z-]+)\]\]/i.exec(text);
    if (m) { go = PAGES.includes(m[1].toLowerCase()) ? m[1].toLowerCase() : null; text = text.replace(m[0], '').trim(); }
    text = text.replace(/\*\*?|__|`/g, '');
    return send(200, { text, go, model: MODEL });
  } catch (e) {
    return send(504, { error: e.name === 'AbortError' ? 'The AI took too long to answer.' : 'Could not reach the AI service.' });
  }
}

module.exports = handler;
module.exports.default = handler;
