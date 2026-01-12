import { UserProfile, Message } from "../types";

export class GeminiService {
  private backendUrl: string =
    import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000/api/nim-chat";

  private provider: string = import.meta.env.VITE_AI_PROVIDER || "nim";

  private currentHistory: { role: string; content: string }[] = [];
  private hasSentInitialSystemMessage = false;
  private profile: UserProfile | null = null;

  constructor() {}

  public async startChat(profile: UserProfile, history: Message[] = []) {
    // Save profile & clear history
    this.profile = profile;
    this.currentHistory = [];

    // Build system instruction once
    const systemMsg = this.buildSystemInstruction(profile);

    // Push system message first (so backend sees context)
    this.currentHistory.push({ role: "system", content: systemMsg });

    // If there’s prior history, map and add it
    history.forEach((msg) => {
      this.currentHistory.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      });
    });

    this.hasSentInitialSystemMessage = true;
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
      6. MANDATORY DISCLAIMER: At the start of every new conversation (not every message), remind the user that you are an AI and your advice is for informational purposes and they should consult a medical professional.

      SUGGESTIONS FEATURE:
      Always suggest 3-4 specific next steps, answers, or options. 
      FORMAT: At the end of your response, include the suggestions in this EXACT format:
      [SUGGESTIONS: Option 1 | Option 2 | Option 3]
    `;
  }

  public async clearSession() {
    this.currentHistory = [];
    this.profile = null;
    this.hasSentInitialSystemMessage = false;
  }

  public async sendMessageStream(
    text: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.profile) throw new Error("Chat not started");

    // Add the latest user message to history
    this.currentHistory.push({ role: "user", content: text });

    let assistantReply = "";

    try {
      if (this.provider === "gemini") {
        // Make backend call
        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: this.currentHistory,
          }),
        });

        if (!response.body) {
          onChunk("⚠️ No streaming body from backend.");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantReply += chunk;
          onChunk(chunk);
        }
      } else {
        // Direct NIM call (proxied via Vite for CORS)
        const INVOKE_URL = "/nim-api/chat/completions";
        const MODEL_NAME = "meta/llama-4-maverick-17b-128e-instruct";
        const apiKey = import.meta.env.VITE_NIM_KEY;
        // console.log("heyyyy----")
        // console.log("VITE_NIM_KEY:", import.meta.env.VITE_NIM_KEY);
        if (!apiKey) {
          throw new Error("Missing NIM_KEY. Check your .env file.");
        }

        const response = await fetch(INVOKE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "text/event-stream"
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: this.currentHistory,
            stream: true,
            max_tokens: 1024,
            temperature: 0.5,
            top_p: 1.0
          }),
        });

        if (!response.ok) {
           const errText = await response.text();
           throw new Error(`NIM API Error: ${response.status} ${response.statusText} - ${errText}`);
        }

        if (!response.body) {
          onChunk("⚠️ No streaming body from NIM API.");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") continue;

            try {
              const data = JSON.parse(dataStr);
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                assistantReply += content;
                onChunk(content);
              }
            } catch (e) {
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }

      // Store assistant reply in history
      this.currentHistory.push({
        role: "assistant",
        content: assistantReply,
      });
    } catch (err) {
      console.error("Stream error:", err);
      onChunk("⚠️ Error reading stream.");
    }
  }
}

export const geminiService = new GeminiService();