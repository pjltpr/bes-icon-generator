import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.static("public"));

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

async function callGroq(systemPrompt, userPrompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 800,
        temperature: 0.9,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await response.json();
    if (response.status === 429) {
      const waitMatch = data.error?.message?.match(/try again in ([\d.]+)s/);
      const waitMs = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) + 500 : 15000;
      console.log(`[groq] Rate limited, waiting ${waitMs}ms`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }
    if (!response.ok || data.error) throw new Error(data.error?.message || `Groq error ${response.status}`);
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty response from Groq.");
    return text;
  }
  throw new Error("Rate limit exceeded after retries. Please try again in a moment.");
}

async function callAnthropic(systemPrompt, userPrompt, maxTokens = 2000, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await response.json();
    if (response.status === 429) {
      console.log(`[anthropic] Rate limited, waiting 10s`);
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }
    if (!response.ok || data.error) throw new Error(data.error?.message || `Anthropic error ${response.status}`);
    const text = data.content?.[0]?.text || "";
    if (!text) throw new Error("Empty response from Anthropic.");
    return text;
  }
  throw new Error("Anthropic API error after retries.");
}

// Route 1: geometry description (Groq, cheap)
app.post("/api/geometry", async (req, res) => {
  const { systemPrompt, prompt } = req.body;
  if (!systemPrompt || !prompt) return res.status(400).json({ error: "Missing fields" });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  try {
    console.log(`[geometry] ${prompt.slice(0, 60)}`);
    const text = await callGroq(systemPrompt, prompt);
    res.json({ text });
  } catch (err) {
    console.error(`[geometry] error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route 2: static SVG render (Anthropic, precise)
app.post("/api/render", async (req, res) => {
  const { systemPrompt, prompt } = req.body;
  if (!systemPrompt || !prompt) return res.status(400).json({ error: "Missing fields" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  try {
    console.log(`[render] ${prompt.slice(0, 60)}`);
    const text = await callAnthropic(systemPrompt, prompt, 2000);
    res.json({ text });
  } catch (err) {
    console.error(`[render] error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route 3: animate selected SVG (Anthropic, precise)
app.post("/api/animate", async (req, res) => {
  const { systemPrompt, prompt } = req.body;
  if (!systemPrompt || !prompt) return res.status(400).json({ error: "Missing fields" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  try {
    console.log(`[animate] ${prompt.slice(0, 60)}`);
    const text = await callAnthropic(systemPrompt, prompt, 2500);
    res.json({ text });
  } catch (err) {
    console.error(`[animate] error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BES Icon Generator running on port ${PORT}`));
