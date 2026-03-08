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

app.post("/api/generate", async (req, res) => {
  const { system, prompt } = req.body;
  if (!system || !prompt) {
    return res.status(400).json({ error: "Missing system or prompt" });
  }

  try {
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
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "Groq error" });
    }

    const text = data.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (err) {
    console.error("Groq request failed:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BES Icon Generator running on port ${PORT}`));
