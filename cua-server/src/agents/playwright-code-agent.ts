import OpenAI from "openai";
import logger from "../utils/logger";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class PlaywrightCodeAgent {
  private readonly model = "gpt-4.1-mini";

  async generateCode(instructions: string): Promise<string> {
    logger.debug("Generating Playwright code", { instructions });
    const response = await openai.responses.create({
      model: this.model,
      input: [
        {
          role: "system",
          content:
            "You convert test descriptions into runnable Playwright test scripts. Return only TypeScript code.",
        },
        { role: "user", content: instructions },
      ],
    });
    const code = response.output_text || "";
    logger.debug("Generated code", { code });
    return code.trim();
  }
}

export default PlaywrightCodeAgent;
