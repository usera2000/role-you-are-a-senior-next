import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return client;
}

export const summaryModel = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini";
