import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

export function createAnthropicClient(): Anthropic {
  const tokenFile = process.env.CLAUDE_SESSION_INGRESS_TOKEN_FILE;
  if (tokenFile) {
    try {
      const authToken = fs.readFileSync(tokenFile, "utf-8").trim();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Anthropic({ authToken, apiKey: null as any });
    } catch {
      // fall through to API key
    }
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
