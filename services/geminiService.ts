
import { GoogleGenAI, Type } from "@google/genai";
import { BrowserType, ExtensionProject, AIModel, ChatUpdateResponse } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EXTENSION_SYSTEM_PROMPT = (browser: BrowserType) => `
You are a world-class senior browser extension engineer. 
Your goal is to generate high-quality, production-ready, secure, and performant source code for a ${browser.toUpperCase()} extension.

Guidelines to follow:
1. Manifest Version: Always use Manifest V3 for Chrome/Safari. Use V3 for Firefox unless V2 is specifically better for certain legacy APIs.
2. Security: Implement Content Security Policy (CSP) best practices. Avoid 'eval' or inline scripts.
3. Architecture: Use clear separation of concerns (Background Service Workers, Content Scripts, Popup UI, Options UI).
4. Styling: Use modern CSS or Tailwind CSS where applicable for UI components.
5. Safari Specifics: Ensure 'browser_specific_settings' are included for non-Chrome browsers.
6. Documentation: Include a brief README.md explaining how to load the extension.

IMPORTANT: You MUST return a JSON object with the following structure:
{
  "name": "Project Name",
  "files": [
    { "path": "manifest.json", "content": "..." },
    { "path": "popup/popup.html", "content": "..." }
  ]
}
`;

export const generateExtension = async (
  prompt: string,
  browser: BrowserType,
  modelName: AIModel = AIModel.GEMINI_PRO
): Promise<Partial<ExtensionProject>> => {
  // Use modelName if it's a Gemini model, otherwise default to GEMINI_PRO for generating content
  const modelToUse = modelName.startsWith('gemini') ? modelName : AIModel.GEMINI_PRO;
  
  const response = await ai.models.generateContent({
    model: modelToUse,
    contents: `Task: ${prompt}. Browser: ${browser}. Selected Engine Simulation: ${modelName}. Generate all necessary files.`,
    config: {
      systemInstruction: EXTENSION_SYSTEM_PROMPT(browser),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["path", "content"]
            }
          }
        },
        required: ["name", "files"]
      }
    }
  });

  // Extract text property directly as per guidelines
  const data = JSON.parse(response.text || '{}');
  const filesRecord: Record<string, string> = {};
  if (Array.isArray(data.files)) {
    data.files.forEach((file: { path: string; content: string }) => {
      filesRecord[file.path] = file.content;
    });
  }

  return {
    name: data.name || 'My Extension',
    browser,
    files: filesRecord,
    id: crypto.randomUUID(),
    createdAt: Date.now()
  };
};

export const chatWithAssistant = async (
  history: { role: string; content: string }[],
  currentFiles: Record<string, string>,
  browser: BrowserType
): Promise<ChatUpdateResponse> => {
  const chat = ai.chats.create({
    model: AIModel.GEMINI_FLASH,
    config: {
      systemInstruction: `You are an expert ${browser} extension debugger. 
      The current project files are: ${JSON.stringify(currentFiles)}. 
      If the user finds a bug or requests a change, you MUST provide:
      1. A clear explanation of the fix.
      2. The updated file contents if any code needs changing.
      
      You MUST respond in JSON format:
      {
        "explanation": "Your text response here...",
        "updatedFiles": [
           { "path": "path/to/file.js", "content": "new content here..." }
        ]
      }
      If no code change is needed, return an empty array for updatedFiles.`,
      responseMimeType: "application/json"
    }
  });

  const lastMessage = history[history.length - 1];
  const response = await chat.sendMessage({ message: lastMessage.content });
  try {
    // Correctly accessing .text property
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { explanation: response.text || "I processed your request, but couldn't format the code update." };
  }
};
