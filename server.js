import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ── Reference SVGs stored server-side to keep client prompt small ──
const SPIRAL_REF = `SPIRAL(tornado,whirlpool,vortex,galaxy,helix,nautilus,cyclone,funnel,shell,updraft):
<svg viewBox="0 0 64 64" fill="none"><defs><filter id="fsp"><feTurbulence type="fractalNoise" baseFrequency="0.052" numOctaves="4" seed="14" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter><style>.sp1{stroke-dasharray:280;stroke-dashoffset:280;animation:spD 4s ease-in-out infinite}.sp2{stroke-dasharray:280;stroke-dashoffset:280;animation:spD 4s 0.3s ease-in-out infinite;opacity:0.52}.sp3{stroke-dasharray:280;stroke-dashoffset:280;animation:spD 4s 0.6s ease-in-out infinite;opacity:0.25}@keyframes spD{0%{stroke-dashoffset:280;opacity:0}10%{opacity:1}62%{stroke-dashoffset:0;opacity:1}80%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:280;opacity:0}}</style></defs><g filter="url(#fsp)"><path class="sp1" d="M32 33 L33 32 L34 30 L34 27 L32 23 L28 20 L22 18 L15 18 L9 21 L6 26 L6 32 L9 38 L14 43 L21 47 L29 49 L38 49 L46 46 L52 41 L56 34 L57 26 L55 18 L50 11 L43 6 L35 3" stroke="white" stroke-width="1.1" stroke-linecap="round" fill="none"/><path class="sp2" d="M32 33 L33 32 L34 30 L34 27 L32 23 L28 20 L22 18 L15 18 L9 21 L6 26 L6 32 L9 38 L14 43 L21 47 L29 49 L38 49 L46 46 L52 41 L56 34 L57 26 L55 18 L50 11 L43 6 L35 3" stroke="white" stroke-width="0.6" stroke-linecap="round" fill="none"/><circle cx="32" cy="33" r="1.3" fill="white" opacity="0.85"/></g></svg>`;

const RIPPLE_REF = `RIPPLE(ripple,orbit,echo,sonar,sound wave,shockwave,interference,eclipse,signal burst,tide):
<svg viewBox="0 0 64 64" fill="none"><defs><filter id="fr"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G"/></filter><style>.r1{animation:rD 3s 0s ease-in-out infinite alternate}.r2{animation:rD 3s 0.6s ease-in-out infinite alternate}.r3{animation:rD 3s 1.2s ease-in-out infinite alternate}@keyframes rD{0%{opacity:0;transform:scale(0.5)}20%{opacity:1}100%{opacity:0.7;transform:scale(1)}}</style></defs><g filter="url(#fr)"><ellipse class="r3" cx="32" cy="32" rx="24" ry="18" stroke="white" stroke-width="0.5" fill="none" opacity="0.4"/><ellipse class="r2" cx="32" cy="32" rx="16" ry="12" stroke="white" stroke-width="0.65" fill="none" opacity="0.6"/><ellipse class="r1" cx="32" cy="32" rx="8" ry="6" stroke="white" stroke-width="0.8" fill="none"/><circle cx="32" cy="32" r="1.5" fill="white" opacity="0.8"/></g></svg>`;

const ATTRACTOR_REF = `ATTRACTOR(infinity loop,feedback loop,butterfly effect,figure-eight,strange loop,oscillation):
<svg viewBox="0 0 64 64" fill="none"><defs><filter id="fa"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/></filter><style>.ap1{stroke-dasharray:300;stroke-dashoffset:300;animation:aD 3s ease-in-out infinite alternate}.ap2{stroke-dasharray:200;stroke-dashoffset:200;animation:aD 3s 0.4s ease-in-out infinite alternate;opacity:0.5}.ap3{stroke-dasharray:160;stroke-dashoffset:160;animation:aD 3s 0.8s ease-in-out infinite alternate;opacity:0.3}@keyframes aD{0%{stroke-dashoffset:300;opacity:0}20%{opacity:1}100%{stroke-dashoffset:0}}</style></defs><g filter="url(#fa)"><path class="ap1" d="M32 32 C20 20,8 24,10 34 C12 44,26 44,32 32 C38 20,52 18,54 28 C56 38,44 46,32 32" stroke="white" stroke-width="1" stroke-linecap="round"/><path class="ap2" d="M32 32 C22 22,12 28,14 36 C16 44,28 42,32 32 C36 22,48 20,50 30 C52 40,40 46,32 32" stroke="white" stroke-width="0.6" stroke-linecap="round"/><path class="ap3" d="M32 32 C24 24,16 30,18 38 C20 44,30 42,32 32 C34 24,44 22,46 30 C48 38,38 44,32 32" stroke="white" stroke-width="0.4" stroke-linecap="round"/><circle cx="32" cy="32" r="1.2" fill="white" opacity="0.6"/></g></svg>`;

const NETWORK_REF = `NETWORK(network,root system,lightning,tree branch,neural net,mycelium,river delta,coral):
<svg viewBox="0 0 64 64" fill="none"><defs><filter id="fn"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter><style>.n1{stroke-dasharray:60;stroke-dashoffset:60;animation:nD 3.5s ease-in-out infinite}.n2{stroke-dasharray:40;stroke-dashoffset:40;animation:nD 3.5s 0.28s ease-in-out infinite}.n3{stroke-dasharray:40;stroke-dashoffset:40;animation:nD 3.5s 0.56s ease-in-out infinite}.n4{stroke-dasharray:40;stroke-dashoffset:40;animation:nD 3.5s 0.84s ease-in-out infinite}.n5{stroke-dasharray:40;stroke-dashoffset:40;animation:nD 3.5s 1.12s ease-in-out infinite}.nd{animation:ndF 3.5s ease-in-out infinite}@keyframes nD{0%{stroke-dashoffset:60;opacity:0}12%{opacity:1}65%{stroke-dashoffset:0;opacity:1}82%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:60;opacity:0}}@keyframes ndF{0%{opacity:0}15%{opacity:1}70%{opacity:1}85%{opacity:0}100%{opacity:0}}</style></defs><g filter="url(#fn)"><path class="n1" d="M32,32 Q22,24 13,20" stroke="white" stroke-width="0.85" stroke-linecap="round" fill="none"/><path class="n2" d="M32,32 Q42,25 51,22" stroke="white" stroke-width="0.85" stroke-linecap="round" fill="none"/><path class="n3" d="M32,32 Q20,40 11,45" stroke="white" stroke-width="0.85" stroke-linecap="round" fill="none"/><path class="n4" d="M32,32 Q44,40 53,45" stroke="white" stroke-width="0.85" stroke-linecap="round" fill="none"/><path class="n5" d="M32,32 Q33,18 33,7" stroke="white" stroke-width="0.85" stroke-linecap="round" fill="none"/><circle class="nd" cx="32" cy="32" r="2" fill="white"/><circle class="nd" cx="13" cy="20" r="1.4" fill="white" style="animation-delay:0.28s"/><circle class="nd" cx="51" cy="22" r="1.4" fill="white" style="animation-delay:0.56s"/></g></svg>`;

const GRID_REF = `GRID(fragmented grid,chaos,data scatter,pixel dissolve,entropy,glitch,static):
<svg viewBox="0 0 64 64" fill="none"><defs><filter id="fg"><feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter><style>.gl{stroke-dasharray:30;stroke-dashoffset:30}.g1{animation:gT 3s 0s ease-in-out infinite alternate}.g2{animation:gT 3s 0.2s ease-in-out infinite alternate}.g3{animation:gT 3s 0.4s ease-in-out infinite alternate}.g4{animation:gT 3s 0.6s ease-in-out infinite alternate}@keyframes gT{0%{stroke-dashoffset:30;opacity:0}30%{opacity:1}100%{stroke-dashoffset:0;opacity:0.85}}.sd{animation:dD 3s ease-in-out infinite alternate}@keyframes dD{0%{opacity:0;transform:translate(3px,3px)}40%{opacity:0.9}100%{opacity:0.7;transform:translate(0,0)}}</style></defs><g filter="url(#fg)"><line class="gl g1" x1="8" y1="12" x2="28" y2="12" stroke="white" stroke-width="0.7"/><line class="gl g2" x1="8" y1="20" x2="28" y2="20" stroke="white" stroke-width="0.7"/><line class="gl g3" x1="12" y1="8" x2="12" y2="28" stroke="white" stroke-width="0.7"/><line class="gl g4" x1="20" y1="8" x2="20" y2="28" stroke="white" stroke-width="0.7"/><circle class="sd" cx="44" cy="36" r="1.2" fill="white" style="animation-delay:0.8s"/><circle class="sd" cx="52" cy="32" r="0.9" fill="white" style="animation-delay:1.2s"/><circle class="sd" cx="40" cy="46" r="0.8" fill="white" style="animation-delay:1.6s"/><circle class="sd" cx="50" cy="50" r="0.6" fill="white" style="animation-delay:2s"/></g></svg>`;

function buildSystemPrompt(profileDirective) {
  return `You are an SVG animation artist for Butterfly Effect Studio (BES). Animated icons — white strokes on transparent background, fractalNoise displacement filter, no fills except dot accents.

${profileDirective}

BEFORE YOU DRAW — REASON FIRST
Step 1: Identify the single most iconic, geometrically reducible element of the subject.
Step 2: Pick a canonical family: SPIRAL, RIPPLE, ATTRACTOR, NETWORK, or GRID.
Step 3: Inherit that family's construction logic exactly from the reference below.
Step 4: Output SVG only.

BES VISUAL SYSTEM
1. SEED PATHS — 3-8 paths of one iconic element, rendered simply.
2. ECHO LAYERS — each path echoed 2-3 times. Opacity: 1.0 > 0.6 > 0.35 > 0.2. Stagger 0.25-0.35s.
3. REVEAL — stroke-dasharray + stroke-dashoffset. Draw on, hold, fade. All infinite.
4. DISPLACEMENT — one fractalNoise feDisplacementMap. Unique filter id + class prefixes. Scale 1.0-1.6.
5. STROKES — Primary: 0.9-1.3. Echo1: 0.55-0.7. Echo2: 0.3-0.45. stroke-linecap="round" everywhere.
6. DOT — one filled circle r 1.0-1.8 at a meaningful anchor.

Keyframe template:
@keyframes X{0%{stroke-dashoffset:[len];opacity:0}10%{opacity:1}65%{stroke-dashoffset:0;opacity:1}85%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:[len];opacity:0}}

CANONICAL REFERENCES
${SPIRAL_REF}
${RIPPLE_REF}
${ATTRACTOR_REF}
${NETWORK_REF}
${GRID_REF}

HARD RULES
- Output ONLY raw SVG. No markdown, no backticks, no explanation.
- Opening tag: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width="64" height="64">
- All styles inside <defs><style></style></defs>
- White strokes only. No fills except dot accents. stroke-linecap="round" everywhere.
- Unique filter id and class prefixes per icon. Never reuse fa, fr, fg, fn, fsp.
- All animations infinite. Never static. Never skip echo system. One SVG only.`;
}

// ── Rate limit: queue requests, max 1 per 3s to stay under TPM ──
let requestQueue = Promise.resolve();
function queueRequest(fn) {
  requestQueue = requestQueue.then(() => new Promise(resolve => setTimeout(resolve, 3000))).then(fn);
  return requestQueue;
}

async function callGroq(systemPrompt, userPrompt) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      temperature: 1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Groq error ${response.status}`);
  }
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Empty response from Groq.");
  return text;
}

app.post("/api/generate", async (req, res) => {
  const { subject, profileDirective } = req.body;

  if (!subject) return res.status(400).json({ error: "Missing subject" });

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set");
    return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
  }

  console.log(`[generate] subject: ${subject}`);

  try {
    const systemPrompt = buildSystemPrompt(profileDirective || "");
    const userPrompt = `Subject: ${subject}\n\nStep 1 - identify the single most iconic geometric element.\nStep 2 - assign to a canonical family.\nStep 3 - inherit that family's construction logic from the reference.\nStep 4 - output the SVG and nothing else.`;

    const text = await callGroq(systemPrompt, userPrompt);
    console.log(`[generate] success for: ${subject}, length: ${text.length}`);
    res.json({ text });
  } catch (err) {
    console.error(`[generate] error for ${subject}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BES Icon Generator running on port ${PORT}`));
