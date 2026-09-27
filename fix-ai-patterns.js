const fs = require('fs');
const stylePath = 'd:/TolKanta_SIH2026_Final/01_website/TolKanta_Website/css/style.css';
let css = fs.readFileSync(stylePath, 'utf8');

// FIX 1: Remove Inter/Geist font (AI telltale #10)
css = css.replace("'Inter', 'Mukta', system-ui, -apple-system, sans-serif", "'Mukta', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif");
css = css.replace("'Inter', 'Anek Devanagari', 'Mukta', system-ui, sans-serif", "'Anek Devanagari', 'Mukta', system-ui, sans-serif");
css = css.replace("'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace", "'IBM Plex Mono', ui-monospace, Consolas, monospace");

// FIX 2: Remove radial orb from hero (AI telltale #22)
css = css.replace('.hero::after { content: \'\'; position: absolute; width: 640px; height: 640px; right: -160px; top: -200px; \r\nborder-radius: 50%; background: radial-gradient(circle, rgba(217, 119, 6, 0.28), transparent 65%); }', '.hero::after { display: none; }');
// fallback - broader match
css = css.replace(/\.hero::after \{ content: '';[^}]*radial-gradient[^}]*\}/, '.hero::after { display: none; }');

// FIX 3: Remove dot grid from hero (AI telltale #23)
// The dot grid is inline in hero::before with background-image + background-size: 28px 28px
css = css.replace(/background-size: 28px 28px;/g, '');
css = css.replace(/background-image: linear-gradient\(90deg, rgba\(255,255,255,\.05\) 1px, transparent 1px\), linear-gradient\(rgba\(255,255,255,\.05\) 1px, transparent 1px\);/g, '');

// FIX 4: Remove coloured glowing drop shadows from buttons (AI telltale #5)
css = css.replace('box-shadow: 0 4px 10px -2px rgba(13, 148, 136, 0.4); }', '}');
css = css.replace('box-shadow: 0 6px 14px -2px rgba(13, 148, 136, 0.5); }', '}');
css = css.replace('box-shadow: 0 4px 10px -2px rgba(234, 88, 12, 0.4); }', '}');
css = css.replace('box-shadow: 0 4px 10px -2px rgba(30, 41, 59, 0.4); }', '}');

// FIX 5: Reduce card corner radius from 12px to 8px (AI telltale #19)
css = css.replace('--radius: 12px;', '--radius: 8px;');

// FIX 6: Remove scale/bounce hover on buttons (AI telltale #28 - hover animations)
css = css.replace('transition: transform .12s, background .15s, box-shadow .15s;', 'transition: background .12s;');
css = css.replace('.btn:active { transform: scale(.98); }', '.btn:active { opacity: .85; }');

// FIX 7: Lighten overall shadow (AI telltale #5 - drop shadows)
css = css.replace('--shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04);', '--shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);');

// FIX 8: Remove the hero panel glassmorphism (liquid glass, AI telltale #8)
// Replace with a clean bordered box
css = css.replace(
  '.hero-panel { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); backdrop-filter: blur(12px); border-radius: 20px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); }',
  '.hero-panel { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.15); border-radius: 10px; padding: 22px; }'
);

fs.writeFileSync(stylePath, css);
console.log('style.css fixed — all AI patterns removed.');
