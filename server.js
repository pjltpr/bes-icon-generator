import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.static("public"));

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ── Strict sequential queue — one request at a time, 45s gap to stay under 12k TPM ──
let requestQueue = Promise.resolve();
function queueRequest(fn) {
  requestQueue = requestQueue
    .then(() => new Promise(resolve => setTimeout(resolve, 45000)))
    .then(fn);
  return requestQueue;
}

async function callGroq(systemPrompt, userPrompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        temperature: 1,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();

    if (response.status === 429) {
      const waitMatch = data.error?.message?.match(/try again in ([\d.]+)s/);
      const waitMs = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) + 1000 : 60000;
      console.log(`[groq] Rate limited, waiting ${waitMs}ms before retry ${attempt + 1}/${retries}`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Groq error ${response.status}`);
    }

    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty response from Groq.");
    return text;
  }
  throw new Error("Rate limit exceeded after retries. Please wait a moment and try again.");
}

app.post("/api/generate", async (req, res) => {
  const { system, prompt } = req.body;

  if (!system || !prompt) {
    return res.status(400).json({ error: "Missing system or prompt" });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set");
    return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
  }

  console.log(`[generate] queued: ${prompt.slice(0, 80)}`);

  try {
    const text = await queueRequest(() => callGroq(system, prompt));
    console.log(`[generate] success, length: ${text.length}`);
    res.json({ text });
  } catch (err) {
    console.error(`[generate] error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BES Icon Generator running on port ${PORT}`));
