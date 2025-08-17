import express from "express";
import { config } from "dotenv";
import OpenAI from "openai";

config({ path: ".env.development" });

const app = express();
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/generate", async (req, res) => {
  const { scenario } = req.body as { scenario?: string };
  if (!scenario) {
    return res.status(400).json({ error: "scenario required" });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Generate a Playwright test script in TypeScript for the following scenario:\n${scenario}`,
    });
    const testCase = response.output_text || "";
    res.json({ testCase });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Testcase server listening on port ${port}`);
});
