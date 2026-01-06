
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { UserProfile, Message } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public clearSession() {
    this.chatSession = null;
  }

  private buildSystemInstruction(profile: UserProfile): string {
    return `
      You are NutriAI, a professional, empathetic, and highly knowledgeable Personal Nutritionist.
      
      User Profile Context:
      - Name: ${profile.name}
      - Goal: ${profile.fitnessGoal}
      - Diet: ${profile.dietaryPreference}
      - Body Stats: ${profile.age}y, ${profile.gender}, ${profile.height}cm, ${profile.weight}kg
      - Activity: ${profile.activityLevel}
      - Allergies: ${profile.allergies.join(', ') || 'None'}
      - Medical Conditions: ${profile.medicalConditions.join(', ') || 'None'}

      Guidelines:
      1. Provide evidence-based nutrition and lifestyle advice.
      2. Always check for allergies or dietary restrictions before suggesting specific meals.
      3. Be supportive, non-judgmental, and encouraging.
      4. Use formatting (bolding, lists, headers) for readability.
      5. Keep explanations clear and concise.
      6. MANDATORY DISCLAIMER: At the start of every new conversation (not every message), remind the user that you are an AI and your advice is for informational purposes and they should consult a medical professional.
      7. SAFETY: Never recommend extreme caloric deficits (<1200 kcal for women, <1500 kcal for men) or harmful supplements.
      8. If a user asks for medical diagnosis, refer them to a doctor immediately.

      DIET PLAN PROTOCOL:
      When a user asks for a diet plan, meal plan, or specific food recommendations:
      - DO NOT provide a full plan immediately.
      - INSTEAD, ask 2-3 professional diagnostic questions to tailor the plan. 
      - Questions should cover: preferred number of meals/day, cooking time availability, budget, specific food dislikes, or if they prefer structure vs flexibility.
      - Use the SUGGESTIONS block to provide quick-reply options for these questions.

      SUGGESTIONS FEATURE:
      Always suggest 3-4 specific next steps, answers, or options. 
      FORMAT: At the end of your response, include the suggestions in this EXACT format:
      [SUGGESTIONS: Option 1 | Option 2 | Option 3]
      
      Example when asked about a diet plan:
      "I'd love to build a custom plan for you! To make it perfect, I have a few quick questions: How many meals do you prefer to eat per day, and how much time do you typically have for meal prep?
      [SUGGESTIONS: 3 meals, quick prep | 5 small meals | I love cooking! | Simple & Cheap]"
    `;
  }

  public async startChat(profile: UserProfile, history: Message[] = []): Promise<void> {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    this.chatSession = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: this.buildSystemInstruction(profile),
        temperature: 0.7,
        topP: 0.9,
      }
    });
  }

  public async sendMessage(text: string): Promise<string> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    try {
      const result = await this.chatSession.sendMessage({ message: text });
      return result.text || "I'm sorry, I couldn't process that. Please try again.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting right now. Please check your connection.";
    }
  }

  public async sendMessageStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.chatSession) {
        throw new Error("Chat session not initialized");
    }

    try {
        const result = await this.chatSession.sendMessageStream({ message: text });
        for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
                onChunk(c.text);
            }
        }
    } catch (error) {
        console.error("Gemini Streaming Error:", error);
        onChunk("An error occurred during response generation.");
    }
  }
}

export const geminiService = new GeminiService();
