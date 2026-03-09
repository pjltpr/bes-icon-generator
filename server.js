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

async function callGroq(systemPrompt, userPrompt, maxTokens, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
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
  throw new Error("Rate limit exceeded after retries. Please try again in a moment.");
}

app.post("/api/generate", async (req, res) => {
  const { subject, systemPromptGeometry, systemPromptRender, geometryPrompt, renderPrompt } = req.body;
  if (!subject || !systemPromptGeometry || !systemPromptRender || !geometryPrompt || !renderPrompt) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
  }
  try {
    console.log(`[geometry] ${subject}`);
    const geometry = await callGroq(systemPromptGeometry, geometryPrompt, 1000);
    console.log(`[geometry] done: ${geometry.slice(0, 120)}`);

    console.log(`[render] ${subject}`);
    const svg = await callGroq(systemPromptRender, renderPrompt.replace("{{GEOMETRY}}", geometry), 1800);
    console.log(`[render] done, length: ${svg.length}`);

    res.json({ text: svg, geometry });
  } catch (err) {
    console.error(`[generate] error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BES Icon Generator running on port ${PORT}`));
