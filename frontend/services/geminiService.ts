import { GoogleGenAI } from "@google/genai";
import { UserProfile, Message, MacroData } from "../types";

// LLM provider: "nim" → NVIDIA NIM (Llama 4), anything else → Gemini (default)
const PROVIDER: "nim" | "gemini" =
  import.meta.env.VITE_AI_PROVIDER === "nim" ? "nim" : "gemini";

// ── Macro tag parser ──────────────────────────────────────────────────────────
export function parseMacroTag(text: string): MacroData | undefined {
  const match = text.match(/\[MACROS:\s*(.*?)\]/i);
  if (!match) return undefined;
  const parts = match[1].split("|").map((s) => s.trim());
  const nums: Record<string, number> = {};
  const strs: Record<string, string> = {};
  for (const part of parts) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim().toLowerCase();
    const val = part.slice(eqIdx + 1).trim();
    const num = parseFloat(val);
    if (!isNaN(num)) nums[key] = num;
    else strs[key] = val;
  }
  if (!nums.calories) return undefined;
  return {
    calories: nums.calories,
    protein: nums.protein ?? 0,
    carbs: nums.carbs ?? 0,
    fat: nums.fat ?? 0,
    fiber: nums.fiber,
    dish: strs.dish,
    serving: strs.serving,
    health_score: nums.health_score,
    ingredients: strs.ingredients ? strs.ingredients.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
  };
}

export function stripMacroTag(text: string): string {
  return text.replace(/\[MACROS:\s*.*?\]/gi, "").trim();
}

type NimContent =
  | string
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

interface NimMessage { role: string; content: NimContent; }

export class GeminiService {
  private currentHistory: NimMessage[] = [];
  private profile: UserProfile | null = null;
  private systemInstruction: string = "";

  public async startChat(profile: UserProfile, history: Message[] = []) {
    this.profile = profile;
    this.systemInstruction = this.buildSystemInstruction(profile);
    this.currentHistory = [{ role: "system", content: this.systemInstruction }];
    history.forEach((msg) => {
      this.currentHistory.push({ role: msg.role === "user" ? "user" : "assistant", content: msg.text });
    });
  }

  private buildSystemInstruction(profile: UserProfile): string {
    return `
      You are NutriAI, a professional, empathetic, and highly knowledgeable Personal Nutritionist.

      User Profile Context:
      - Name: "${profile.name}"
      - Goal: "${profile.fitnessGoal}"
      - Diet: "${profile.dietaryPreference}"
      - Stats: ${profile.age}y, ${profile.gender}, ${profile.height}cm, ${profile.weight}kg
      - Activity: "${profile.activityLevel}"
      - Allergies: "${profile.allergies.join(", ") || "None"}"
      - Medical Conditions: "${profile.medicalConditions.join(", ") || "None"}"

      Guidelines:
      1. Provide evidence-based nutrition and lifestyle advice.
      2. Always check for allergies or dietary restrictions before suggesting specific meals.
      3. Be supportive, non-judgmental, and encouraging.
      4. Use formatting (bolding, lists, headers) for readability.
      5. Keep explanations clear and concise.
      6. Add a brief AI disclaimer ONLY in your very first response. Never repeat it again.
      7. CRITICAL: Do NOT repeat the user's name, age, weight, height, goal, or other profile data in every message. Use the profile context silently to personalise advice. Only mention specific stats when the user explicitly asks about them or when directly relevant to the question.

      FOOD IMAGE ANALYSIS:
      When the user sends a food image:
      1. Identify all visible food items and estimate the dish name.
      2. Estimate portion size (small/medium/large or grams if possible).
      3. Include a nutritional breakdown using this EXACT tag at the end of your response (replace {placeholders}):
         [MACROS: calories={N} | protein={N} | carbs={N} | fat={N} | fiber={N} | dish={Dish Name} | serving={e.g. 1 plate (350g)} | health_score={0-10} | ingredients={item1,item2,item3}]
         - All numeric values must be plain numbers (no units inside the tag).
         - dish: short human-readable dish name.
         - serving: portion description.
         - health_score: integer 0–10 rating vs user's goal.
         - ingredients: comma-separated list (no spaces after commas).
      4. Rate the meal vs the user's goal (0-10 score with brief reasoning) in your text response.
      5. Flag any ingredients that conflict with their allergies: ${profile.allergies.join(", ") || "None"}.
      6. Suggest one easy swap to make the meal healthier or better aligned to their goal.

      SUGGESTIONS FEATURE:
      Always suggest 3-4 specific next steps, answers, or options.
      FORMAT: At the end of your response, include:
      [SUGGESTIONS: Option 1 | Option 2 | Option 3]
    `;
  }

  public async clearSession() {
    this.currentHistory = [];
    this.systemInstruction = "";
    this.profile = null;
  }

  private async sendNimStream(messages: NimMessage[], onChunk: (chunk: string) => void): Promise<string> {
    const isDev = import.meta.env.DEV;
    const url = isDev ? "/nim-api/chat/completions" : "/api/nim";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isDev) {
      const key = import.meta.env.VITE_NIM_KEY;
      if (!key) throw new Error("Missing VITE_NIM_KEY in .env");
      headers["Authorization"] = `Bearer ${key}`;
      headers["Accept"] = "text/event-stream";
    }

    const response = await fetch(url, {
      method: "POST", headers,
      body: JSON.stringify({ model: "meta/llama-4-maverick-17b-128e-instruct", messages, stream: true, max_tokens: 1024, temperature: 0.5, top_p: 1.0 }),
    });
    if (!response.ok) { const e = await response.text(); throw new Error(`NIM API Error ${response.status}: ${e}`); }
    if (!response.body) throw new Error("No streaming body from NIM API.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", assistantReply = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const dataStr = trimmed.slice(6).trim();
        if (dataStr === "[DONE]") continue;
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) { assistantReply += content; onChunk(content); }
        } catch { /* skip */ }
      }
    }
    if (buffer.trim().startsWith("data: ")) {
      const dataStr = buffer.trim().slice(6).trim();
      if (dataStr && dataStr !== "[DONE]") {
        try { const data = JSON.parse(dataStr); const content = data.choices?.[0]?.delta?.content; if (content) { assistantReply += content; onChunk(content); } } catch { /* ignore */ }
      }
    }
    return assistantReply;
  }

  private isUnavailable(err: unknown): boolean {
    const msg = String(err instanceof Error ? err.message : err);
    return msg.includes("503") || /unavailable|high demand|overloaded/i.test(msg);
  }

  private async sendGeminiStream(onChunk: (chunk: string) => void): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");
    const ai = new GoogleGenAI({ apiKey });
    const contents = this.currentHistory
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }] }));

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
    let lastErr: unknown;
    for (const model of models) {
      try {
        const response = await ai.models.generateContentStream({ model, config: { systemInstruction: this.systemInstruction }, contents });
        let assistantReply = "";
        for await (const chunk of response) { const text = chunk.text; if (text) { assistantReply += text; onChunk(text); } }
        return assistantReply;
      } catch (err) {
        if (this.isUnavailable(err)) {
          console.warn(`[NutriAI] ${model} unavailable, trying fallback...`);
          lastErr = err;
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  public async sendMessageStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.profile) throw new Error("Chat not started");
    this.currentHistory.push({ role: "user", content: text });
    let assistantReply = "";
    try {
      assistantReply = PROVIDER === "nim" ? await this.sendNimStream(this.currentHistory, onChunk) : await this.sendGeminiStream(onChunk);
      this.currentHistory.push({ role: "assistant", content: assistantReply });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Stream error:", message);
      onChunk(`⚠️ ${message}`);
    }
  }

  public async sendMessageWithImageStream(text: string, imageBase64: string, mimeType: string, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.profile) throw new Error("Chat not started");
    const prompt = text.trim() || "What is this food? Please give me the full nutritional breakdown.";
    const multimodalContent: NimMessage["content"] = [
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
      { type: "text", text: prompt },
    ];
    this.currentHistory.push({ role: "user", content: multimodalContent });
    let assistantReply = "";
    try {
      if (PROVIDER === "nim") {
        assistantReply = await this.sendNimStream(this.currentHistory, onChunk);
      } else {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");
        const ai = new GoogleGenAI({ apiKey });
        const priorContents = this.currentHistory
          .filter((m) => m.role !== "system" && typeof m.content === "string")
          .slice(0, -1)
          .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content as string }] }));
        const contents = [...priorContents, { role: "user", parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] }];
        const imgModels = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"];
        let imgLastErr: unknown;
        let streamed = false;
        for (const model of imgModels) {
          try {
            const response = await ai.models.generateContentStream({ model, config: { systemInstruction: this.systemInstruction }, contents });
            for await (const chunk of response) { const t = chunk.text; if (t) { assistantReply += t; onChunk(t); } }
            streamed = true;
            break;
          } catch (err) {
            if (this.isUnavailable(err)) {
              console.warn(`[NutriAI] ${model} unavailable (image), trying fallback...`);
              imgLastErr = err;
              continue;
            }
            throw err;
          }
        }
        if (!streamed) throw imgLastErr;
      }
      this.currentHistory.push({ role: "assistant", content: assistantReply });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Image stream error:", message);
      onChunk(`⚠️ ${message}`);
    }
  }
}

export const geminiService = new GeminiService();
