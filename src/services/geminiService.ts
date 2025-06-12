
interface GeminiResponse {
  content: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using your provided API key
    this.apiKey = 'AIzaSyCsw06QWBk44pfvzpxy21gpRm8cV-tPvD8';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  private getSystemPrompt(): string {
    return `
You are Vidhi, an expert AI assistant specialized in AI policy documents and governance frameworks. Your responses must be clear, accurate, neutral, and grounded strictly in the provided documents.

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
      console.log('Sending request to Gemini API...');
      
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: this.getSystemPrompt() },
                { text: userMessage }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I apologize, but I'm currently unable to process your request. This could be due to a temporary service issue or API configuration problem. Please try again in a moment.";
    }
  }

  async generateStreamResponse(userMessage: string): Promise<AsyncGenerator<string, void, unknown>> {
    // For now, we'll simulate streaming by returning the full response
    // In a real implementation, you'd use the streaming endpoint
    const response = await this.generateResponse(userMessage);
    
    async function* streamGenerator() {
      const words = response.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate typing delay
      }
    }
    
    return streamGenerator();
  }
}

export const geminiService = new GeminiService();
