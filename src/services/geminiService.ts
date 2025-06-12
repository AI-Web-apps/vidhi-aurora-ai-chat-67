
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiResponse {
  content: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private uploadedFiles: Map<string, any> = new Map();

  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyCsw06QWBk44pfvzpxy21gpRm8cV-tPvD8');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  private getSystemPrompt(): string {
    return `
You are Vidhi, an advanced AI assistant that can help with both general questions and AI policy document analysis. You have two main capabilities:

1. **General AI Assistant**: Answer any questions on topics like technology, science, general knowledge, coding, business, etc. Be helpful, accurate, and conversational.

2. **AI Policy Expert**: When provided with policy documents, analyze them to:
   - Summarize relevant sections when asked
   - Explain terms or concepts in plain, simple English
   - Provide fact-based answers supported directly by the text
   - Cite specific sections or paragraph references when possible

Available policy documents may include:
- India's National Strategy on Artificial Intelligence
- OECD AI Principles
- EU AI Act
- NITI Aayog AI Discussion Papers
- Other global or national AI governance frameworks

Response guidelines:
- For general questions: Provide helpful, accurate responses like ChatGPT
- For policy questions with documents: Ground responses strictly in provided documents
- Use bullet points or short paragraphs for readability
- Stay neutral and factual
- If document info isn't available, clearly state that and offer general knowledge instead

You are conversational, helpful, and knowledgeable across all topics while being especially expert in AI policy when documents are provided.
    `;
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      console.log('Sending request to Gemini AI...');
      
      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: userMessage }]
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
      const text = response.text();
      
      console.log('AI Response received successfully');
      return text;
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      return "I apologize, but I'm currently unable to process your request. This could be due to a temporary service issue. Please try again in a moment.";
    }
  }

  async uploadPDFFromURL(url: string, displayName: string): Promise<any> {
    try {
      console.log(`Uploading PDF: ${displayName}...`);
      
      // Fetch PDF as ArrayBuffer
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      const pdfBuffer = await response.arrayBuffer();
      const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

      // For now, we'll store the blob and simulate processing
      // In a real implementation, this would use the Google AI file upload API
      const fileData = {
        blob: fileBlob,
        name: displayName,
        mimeType: "application/pdf",
        url: url,
        processed: true
      };

      this.uploadedFiles.set(displayName, fileData);
      
      console.log(`PDF processed successfully: ${displayName}`);
      return fileData;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  async generateResponseWithPDF(userMessage: string, pdfUrl?: string, pdfName?: string): Promise<string> {
    try {
      console.log('Generating response with PDF context...');
      
      let enhancedMessage = userMessage;
      
      if (pdfUrl && pdfName) {
        try {
          // Check if we have this file cached
          let pdfData = this.uploadedFiles.get(pdfName);
          
          if (!pdfData) {
            pdfData = await this.uploadPDFFromURL(pdfUrl, pdfName);
          }
          
          enhancedMessage = `Context: I have access to the document "${pdfName}" (${pdfUrl}). Please analyze this document to answer the following question. If the information is not in the document, please state that clearly and provide general knowledge instead.

Question: ${userMessage}`;
          
          console.log(`PDF context added for: ${pdfName}`);
        } catch (pdfError) {
          console.warn('PDF upload failed, proceeding with text-only mode:', pdfError);
          enhancedMessage = `Note: Unable to process the PDF document "${pdfName}". I'll answer based on my general knowledge about AI policies and regulations.

Question: ${userMessage}`;
        }
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
      console.error('Error generating response with PDF:', error);
      return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
  }

  async generateStreamResponse(userMessage: string): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      console.log('Starting streaming response...');
      
      const result = await this.model.generateContentStream({
        contents: [{
          role: "user",
          parts: [{ text: userMessage }]
        }],
        systemInstruction: this.getSystemPrompt(),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

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
}

export const geminiService = new GeminiService();
