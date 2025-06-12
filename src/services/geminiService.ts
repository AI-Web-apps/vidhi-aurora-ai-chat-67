
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiResponse {
  content: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Using your provided API key
    this.genAI = new GoogleGenerativeAI('AIzaSyCsw06QWBk44pfvzpxy21gpRm8cV-tPvD8');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  private getSystemPrompt(): string {
    return `
You are an expert assistant trained to help users understand AI policy documents. Your responses must be clear, accurate, neutral, and grounded strictly in the provided documents.

Your primary tasks are:
- Summarize relevant sections when asked
- Explain terms or concepts in plain, simple English
- Provide fact-based answers supported directly by the text
- Cite specific sections or paragraph references when possible

You have access to policy documents including:
- India's National Strategy on Artificial Intelligence
- OECD AI Principles
- EU AI Act
- NITI Aayog AI Discussion Papers
- Other global or national AI governance frameworks

Always use the content of these documents as your sole source. If the answer is not clearly stated in the documents, respond with:
**"This information is not explicitly mentioned in the policy documents provided."**

Response style guidelines:
- Use bullet points or short paragraphs for readability
- Avoid jargon unless the user asks for depth
- Stay strictly neutral; do not include opinions or assumptions
- If comparing items, only use what is explicitly stated in the documents

Do not generate speculative or hallucinated content. Only return what is directly supported by the documents.
    `;
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      console.log('Sending request to Gemini AI...');
      
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: this.getSystemPrompt() }],
          },
          {
            role: "model",
            parts: [{ text: "I understand. I am Vidhi, your AI assistant specialized in AI policy documents. I will provide clear, accurate, and neutral responses based strictly on the provided policy documents. How can I help you today?" }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      
      console.log('AI Response received successfully');
      return text;
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      return "I apologize, but I'm currently unable to process your request. This could be due to a temporary service issue or API configuration problem. Please try again in a moment.";
    }
  }

  async generateStreamResponse(userMessage: string): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      console.log('Starting streaming response...');
      
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: this.getSystemPrompt() }],
          },
          {
            role: "model",
            parts: [{ text: "I understand. I am Vidhi, your AI assistant specialized in AI policy documents. I will provide clear, accurate, and neutral responses based strictly on the provided policy documents. How can I help you today?" }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const result = await chat.sendMessageStream(userMessage);
      
      async function* streamGenerator() {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            yield chunkText;
          }
        }
      }
      
      return streamGenerator();
    } catch (error) {
      console.error('Error in streaming response:', error);
      
      // Fallback to non-streaming response
      async function* fallbackGenerator() {
        const response = await this.generateResponse(userMessage);
        const words = response.split(' ');
        for (const word of words) {
          yield word + ' ';
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      return fallbackGenerator.bind(this)();
    }
  }

  // Simplified method without file upload for now
  async generateResponseWithContext(userMessage: string, context?: string): Promise<string> {
    try {
      console.log('Generating response with context...');
      
      let enhancedMessage = userMessage;
      if (context) {
        enhancedMessage = `Context: ${context}\n\nQuestion: ${userMessage}`;
      }

      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: enhancedMessage }]
        }],
        systemInstruction: this.getSystemPrompt(),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response with context:', error);
      return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();
