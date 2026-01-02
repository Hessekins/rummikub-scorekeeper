import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists (handled gracefully in UI if missing)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const askReferee = async (query: string): Promise<string> => {
  if (!ai) {
    return "API Key is missing. I cannot access the rulebook right now.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are an expert referee for the board game Rummikub. 
    Your goal is to answer questions about rules, scoring, and strategy clearly and concisely.
    - If asked about scoring: The standard rule is the winner gets the sum of all losers' remaining tile values. Losers get minus the value of their remaining tiles. Jokers often have a penalty of 30 points.
    - Keep answers short (under 100 words) unless detailed explanation is requested.
    - Be friendly and helpful.`;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed for game flow
      }
    });

    return response.text || "I couldn't find a rule for that. Try rephrasing.";
  } catch (error) {
    console.error("Gemini Referee Error:", error);
    return "Sorry, I'm having trouble checking the rules right now.";
  }
};
