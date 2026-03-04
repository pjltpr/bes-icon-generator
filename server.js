require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const JELLYFISH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
<defs>
  <filter id="sk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/></filter>
  <clipPath id="jc"><rect x="0" y="0" width="64" height="64"/></clipPath>
  <style>
    .jb{stroke-dasharray:180;stroke-dashoffset:180;animation:jbD 3.5s ease-in-out infinite}
    .jb1{animation-delay:0s;stroke-width:0.9}.jb2{animation-delay:.25s;stroke-width:0.65;opacity:0.7}.jb3{animation-delay:.5s;stroke-width:0.45;opacity:0.45}
    @keyframes jbD{0%{stroke-dashoffset:180;opacity:0}12%{opacity:1}65%{stroke-dashoffset:0;opacity:1}85%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:180;opacity:0}}
    .jt{stroke-dasharray:60 60;stroke-dashoffset:0;animation:jtD 3s linear infinite}
    .jt1{animation-delay:0s}.jt2{animation-delay:.4s}.jt3{animation-delay:.8s}.jt4{animation-delay:1.2s}.jt5{animation-delay:1.6s}.jt6{animation-delay:2s}.jt7{animation-delay:2.4s}
    @keyframes jtD{0%{stroke-dashoffset:0;opacity:0}10%{opacity:0.8}80%{opacity:0.6}100%{stroke-dashoffset:-80;opacity:0}}
  </style>
</defs>
<g filter="url(#sk)" clip-path="url(#jc)">
  <path class="jb jb1" d="M12 30 C12 14,52 14,52 30 C52 38,44 42,32 42 C20 42,12 38,12 30Z" stroke="white" stroke-linecap="round" fill="none"/>
  <path class="jb jb2" d="M16 30 C16 17,48 17,48 30 C48 37,42 40,32 40 C22 40,16 37,16 30Z" stroke="white" stroke-linecap="round" fill="none"/>
  <path class="jb jb3" d="M20 30 C20 20,44 20,44 30 C44 36,40 38,32 38 C24 38,20 36,20 30Z" stroke="white" stroke-linecap="round" fill="none"/>
  <path class="jt jt1" d="M18 42 C16 48,20 52,18 58 C16 62,18 66,16 70" stroke="white" stroke-width="0.6" stroke-linecap="round" fill="none"/>
  <path class="jt jt2" d="M22 42 C22 48,24 52,22 58 C20 64,22 68,20 72" stroke="white" stroke-width="0.5" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path class="jt jt3" d="M27 42 C27 48,28 53,26 58 C24 63,26 68,24 72" stroke="white" stroke-width="0.6" stroke-linecap="round" fill="none"/>
  <path class="jt jt4" d="M32 42 C32 48,32 54,32 60 C32 65,32 68,32 72" stroke="white" stroke-width="0.7" stroke-linecap="round" fill="none"/>
  <path class="jt jt5" d="M37 42 C37 48,36 53,38 58 C40 63,38 68,40 72" stroke="white" stroke-width="0.6" stroke-linecap="round" fill="none"/>
  <path class="jt jt6" d="M42 42 C42 48,40 52,42 58 C44 64,42 68,44 72" stroke="white" stroke-width="0.5" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path class="jt jt7" d="M46 42 C48 48,44 52,46 58 C48 62,46 66,48 70" stroke="white" stroke-width="0.6" stroke-linecap="round" fill="none"/>
</g>
</svg>`;

const WAVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
<defs>
  <filter id="sk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" seed="14" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>
  <style>
    .w1{stroke-dasharray:200;stroke-dashoffset:200;animation:wD 3s ease-in-out infinite}
    .w2{stroke-dasharray:180;stroke-dashoffset:180;animation:wD 3s .3s ease-in-out infinite}
    .w3{stroke-dasharray:160;stroke-dashoffset:160;animation:wD 3s .6s ease-in-out infinite}
    @keyframes wD{0%{stroke-dashoffset:200;opacity:0}12%{opacity:1}65%{stroke-dashoffset:0;opacity:1}88%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:200;opacity:0}}
  </style>
</defs>
<g filter="url(#sk)">
  <path class="w1" d="M4 22 C10 14,16 10,22 16 C28 22,34 26,40 20 C46 14,52 10,60 18" stroke="white" stroke-width="1" stroke-linecap="round"/>
  <path class="w2" d="M4 32 C10 24,16 20,22 26 C28 32,34 36,40 30 C46 24,52 20,60 28" stroke="white" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>
  <path class="w3" d="M4 42 C10 34,16 30,22 36 C28 42,34 46,40 40 C46 34,52 30,60 38" stroke="white" stroke-width="0.5" stroke-linecap="round" opacity="0.4"/>
</g>
</svg>`;

const ROCKET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
<defs>
  <filter id="sk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter>
  <clipPath id="rc"><rect x="0" y="0" width="64" height="64"/></clipPath>
  <style>
    .sf{animation:sD 1.6s linear infinite}.sm{animation:sD 2.6s linear infinite}.ss{animation:sD 4s linear infinite}
    @keyframes sD{0%{transform:translateY(-8px);opacity:0}8%{opacity:1}88%{opacity:.8}100%{transform:translateY(72px);opacity:0}}
    .pl{animation:pG .5s ease-out infinite}.p1{animation-delay:0s}.p2{animation-delay:.1s}.p3{animation-delay:.2s}
    @keyframes pG{0%{opacity:.9;transform:scaleY(.5)}100%{opacity:0;transform:scaleY(1.4)}}
    .rg{animation:rF 3.5s ease-in-out infinite}
    @keyframes rF{0%,100%{transform:translateX(0)}50%{transform:translateX(.8px)}}
  </style>
</defs>
<g clip-path="url(#rc)">
  <circle class="sf" cx="10" cy="0" r="0.8" fill="white" style="animation-delay:0s"/>
  <circle class="sf" cx="52" cy="0" r="0.7" fill="white" style="animation-delay:.4s"/>
  <circle class="sf" cx="22" cy="0" r="0.9" fill="white" style="animation-delay:.9s"/>
  <circle class="sm" cx="16" cy="0" r="0.6" fill="white" opacity="0.7" style="animation-delay:0s"/>
  <circle class="sm" cx="56" cy="0" r="0.5" fill="white" opacity="0.7" style="animation-delay:.8s"/>
  <circle class="ss" cx="36" cy="0" r="0.4" fill="white" opacity="0.4" style="animation-delay:0s"/>
  <circle class="ss" cx="48" cy="0" r="0.3" fill="white" opacity="0.4" style="animation-delay:2s"/>
</g>
<g filter="url(#sk)">
  <g class="rg">
    <path d="M29 46 L29 18 Q32 12 35 18 L35 46 Q32 48 29 46Z" stroke="white" stroke-width="0.8" fill="none" stroke-linejoin="round"/>
    <path d="M22 44 L22 22 Q24 17 26 22 L26 44 Q24 46 22 44Z" stroke="white" stroke-width="0.7" fill="none" stroke-linejoin="round"/>
    <path d="M38 44 L38 22 Q40 17 42 22 L42 44 Q40 46 38 44Z" stroke="white" stroke-width="0.7" fill="none" stroke-linejoin="round"/>
    <path d="M30 42 L30 8 Q32 4 34 8 L34 42Z" stroke="white" stroke-width="0.9" fill="none" stroke-linejoin="round"/>
    <path d="M30 28 L18 42 L30 40" stroke="white" stroke-width="0.8" fill="none" stroke-linejoin="round"/>
    <path d="M34 28 L46 42 L34 40" stroke="white" stroke-width="0.8" fill="none" stroke-linejoin="round"/>
    <g class="pl p1" style="transform-origin:32px 48px"><path d="M30.5 48 Q32 54 33.5 48" stroke="white" stroke-width="0.6" fill="none" opacity="0.7" stroke-linecap="round"/></g>
    <g class="pl p2" style="transform-origin:24px 46px"><path d="M23 46 Q24 52 25 46" stroke="white" stroke-width="0.6" fill="none" opacity="0.6" stroke-linecap="round"/></g>
    <g class="pl p3" style="transform-origin:40px 46px"><path d="M39 46 Q40 52 41 46" stroke="white" stroke-width="0.6" fill="none" opacity="0.6" stroke-linecap="round"/></g>
  </g>
</g>
</svg>`;

const SPIDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
<defs>
  <filter id="sk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="4" seed="17" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>
  <style>
    .ws{stroke-dasharray:36;stroke-dashoffset:36}
    .ws1{animation:wsD 3s 0s ease-out infinite}.ws2{animation:wsD 3s .1s ease-out infinite}.ws3{animation:wsD 3s .2s ease-out infinite}.ws4{animation:wsD 3s .3s ease-out infinite}
    .ws5{animation:wsD 3s .4s ease-out infinite}.ws6{animation:wsD 3s .5s ease-out infinite}.ws7{animation:wsD 3s .6s ease-out infinite}.ws8{animation:wsD 3s .7s ease-out infinite}
    @keyframes wsD{0%{stroke-dashoffset:36;opacity:0}10%{opacity:1}55%{stroke-dashoffset:0;opacity:1}80%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:36;opacity:0}}
    .wr{stroke-dasharray:200;stroke-dashoffset:200}
    .wr1{animation:wrD 3s .8s ease-out infinite}.wr2{animation:wrD 3s 1s ease-out infinite}.wr3{animation:wrD 3s 1.2s ease-out infinite}.wr4{animation:wrD 3s 1.4s ease-out infinite}
    @keyframes wrD{0%{stroke-dashoffset:200;opacity:0}10%{opacity:1}55%{stroke-dashoffset:0;opacity:1}80%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:200;opacity:0}}
    .wc{animation:wcP 3s ease-in-out infinite}
    @keyframes wcP{0%,100%{opacity:0}50%,75%{opacity:1}}
  </style>
</defs>
<g filter="url(#sk)">
  <line class="ws ws1" x1="32" y1="32" x2="32" y2="6" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws2" x1="32" y1="32" x2="51" y2="13" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws3" x1="32" y1="32" x2="58" y2="32" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws4" x1="32" y1="32" x2="51" y2="51" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws5" x1="32" y1="32" x2="32" y2="58" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws6" x1="32" y1="32" x2="13" y2="51" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws7" x1="32" y1="32" x2="6" y2="32" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <line class="ws ws8" x1="32" y1="32" x2="13" y2="13" stroke="white" stroke-width="0.7" stroke-linecap="round"/>
  <polygon class="wr wr1" points="32,22 39,25 42,32 39,39 32,42 25,39 22,32 25,25" stroke="white" stroke-width="0.65" fill="none"/>
  <polygon class="wr wr2" points="32,15 42,19 48,32 42,45 32,49 22,45 16,32 22,19" stroke="white" stroke-width="0.55" fill="none" opacity="0.8"/>
  <polygon class="wr wr3" points="32,9 45,14 54,32 45,50 32,55 19,50 10,32 19,14" stroke="white" stroke-width="0.45" fill="none" opacity="0.6"/>
  <polygon class="wr wr4" points="32,5 47,11 58,32 47,53 32,59 17,53 6,32 17,11" stroke="white" stroke-width="0.35" fill="none" opacity="0.4"/>
  <circle class="wc" cx="32" cy="32" r="1.5" fill="white"/>
</g>
</svg>`;

const LEAF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
<defs>
  <filter id="sk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/></filter>
  <style>
    .lo{stroke-dasharray:220;stroke-dashoffset:220;animation:lD 4s ease-in-out infinite}
    .lm{stroke-dasharray:160;stroke-dashoffset:160;animation:lD 4s .4s ease-in-out infinite}
    .li{stroke-dasharray:100;stroke-dashoffset:100;animation:lD 4s .8s ease-in-out infinite}
    .lv{stroke-dasharray:60;stroke-dashoffset:60;animation:lD 4s 1.2s ease-in-out infinite}
    @keyframes lD{0%{stroke-dashoffset:220;opacity:0}10%{opacity:1}65%{stroke-dashoffset:0;opacity:1}85%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:220;opacity:0}}
  </style>
</defs>
<g filter="url(#sk)">
  <path class="lo" d="M32 56 C16 48,8 34,12 20 C16 8,28 6,32 8 C36 6,48 8,52 20 C56 34,48 48,32 56Z" stroke="white" stroke-width="0.9" stroke-linecap="round"/>
  <path class="lm" d="M32 52 C20 44,14 32,17 21 C20 12,29 10,32 12 C35 10,44 12,47 21 C50 32,44 44,32 52Z" stroke="white" stroke-width="0.65" stroke-linecap="round" opacity="0.7"/>
  <path class="li" d="M32 46 C24 40,20 30,22 22 C24 16,30 14,32 16 C34 14,40 16,42 22 C44 30,40 40,32 46Z" stroke="white" stroke-width="0.5" stroke-linecap="round" opacity="0.5"/>
  <path class="lv" d="M32 56 C32 44,32 24,32 8" stroke="white" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/>
  <path class="lv" d="M32 36 C26 32,18 30,14 28 M32 28 C26 24,20 22,16 20 M32 44 C38 40,46 38,50 36 M32 36 C38 32,46 30,50 28" stroke="white" stroke-width="0.4" stroke-linecap="round" opacity="0.35"/>
</g>
</svg>`;

const SYSTEM_PROMPT = `You are an SVG animation artist. You create hand-drawn animated icons — white strokes on transparent background, no fills, with a subtle hand-drawn displacement filter.

Here are 5 real examples of the exact quality and style you must match. Study them carefully — the path geometry, animation architecture, timing, layering, and filter usage are all exactly right.

EXAMPLE 1 — JELLYFISH:
${JELLYFISH_SVG}

EXAMPLE 2 — WAVE:
${WAVE_SVG}

EXAMPLE 3 — ROCKET:
${ROCKET_SVG}

EXAMPLE 4 — SPIDER WEB:
${SPIDER_SVG}

EXAMPLE 5 — LEAF:
${LEAF_SVG}

HARD RULES:
- Output ONLY raw SVG. No markdown, no backticks, no explanation.
- Opening tag exactly: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
- All styles inside <defs><style></style></defs>
- White strokes only. No fills. stroke-linecap="round" everywhere.
- Always include the filter in defs. Use unique class name prefixes per icon to avoid conflicts.
- All animations infinite loops.
- Match the quality of the 5 examples above exactly.`;

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: `Create an animated SVG icon of: ${prompt}` }] }],
          generationConfig: { maxOutputTokens: 4000, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let svg = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    svg = svg.replace(/^```[\w]*\n?/gm, "").replace(/\n?```$/gm, "").trim();
    const match = svg.match(/<svg[\s\S]*<\/svg>/i);
    res.json({ svg: match ? match[0] : svg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BES Icon Generator running on port ${PORT}`));
