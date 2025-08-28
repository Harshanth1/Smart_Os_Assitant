
import { GoogleGenAI, Type } from "@google/genai";
import { type CommandAction, CommandType } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const commandSchema = {
    type: Type.OBJECT,
    properties: {
        command: {
            type: Type.STRING,
            description: "The classified system command to execute.",
            enum: Object.values(CommandType),
        },
        parameters: {
            type: Type.OBJECT,
            description: "Parameters for the command. Varies based on the command type.",
            properties: {
                appName: { type: Type.STRING, description: "The name of the application to open." },
                fileName: { type: Type.STRING, description: "The name of the file to write to." },
                fileContent: { type: Type.STRING, description: "The content to write into the file." },
                topic: { type: Type.STRING, description: "The topic for content creation (e.g., an essay)." },
                settingName: { type: Type.STRING, description: "The name of the setting to toggle (e.g., 'WiFi', 'Bluetooth')." },
                settingValue: { type: Type.BOOLEAN, description: "The desired state for the setting (true for on, false for off)." },
                query: { type: Type.STRING, description: "The search query for the web." },
                directoryName: { type: Type.STRING, description: "The name of the directory/folder to create." },
                filePath: { type: Type.STRING, description: "The path of the file to be deleted." },
                sourcePath: { type: Type.STRING, description: "The source path of the file or directory to copy." },
                destinationPath: { type: Type.STRING, description: "The destination path for the copy operation." },
            },
        },
        explanation: {
            type: Type.STRING,
            description: "A friendly, conversational explanation of the action being taken for the user."
        }
    },
    required: ["command", "parameters", "explanation"]
};


const systemInstruction = `You are SmartOS, a helpful AI assistant that operates a user's computer. 
Your job is to translate the user's natural language requests into structured JSON commands. 
Analyze the user's prompt and determine the single most appropriate command and its necessary parameters from the provided schema.

When the user asks to open, launch, start or use an application or program, always classify it as OPEN_APP command.
Examples:
- "Open Chrome" → OPEN_APP with appName: "chrome"
- "Launch Excel" → OPEN_APP with appName: "excel"
- "Start Notepad" → OPEN_APP with appName: "notepad"
- "Can you open camera" → OPEN_APP with appName: "camera"
- "I need to check my email" → OPEN_APP with appName: "outlook"
- "Let me see my photos" → OPEN_APP with appName: "photos"

When the user asks to create, write, or make a file, always use WRITE_FILE command.
Examples:
- "Create a text file named notes.txt" → WRITE_FILE with fileName: "notes.txt", fileContent: ""
- "Write a Word document called report.docx" → WRITE_FILE with fileName: "report.docx", fileContent: ""
- "Make a spreadsheet named budget.xlsx" → WRITE_FILE with fileName: "budget.xlsx", fileContent: ""
- "Create a presentation file called proposal.pptx" → WRITE_FILE with fileName: "proposal.pptx", fileContent: ""
- "Write a text file shopping-list.txt with content 'milk, eggs, bread'" → WRITE_FILE with fileName: "shopping-list.txt", fileContent: "milk, eggs, bread"

IMPORTANT: Always include the file extension (.txt, .docx, .xlsx, .pdf, etc.) in the fileName parameter.
If the user doesn't specify an extension, infer the most appropriate one based on the context.

Always provide a brief, friendly 'explanation' for the user about what you are about to do.
If the command is ambiguous or you cannot determine a clear action, classify it as 'UNKNOWN' and explain why.`;

export const parseCommand = async (prompt: string): Promise<{ action: CommandAction, explanation: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: commandSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // Basic validation
        if (!parsedJson.command || !parsedJson.parameters || !parsedJson.explanation) {
            throw new Error('Invalid JSON structure from AI.');
        }

        const action: CommandAction = {
            command: parsedJson.command as CommandType,
            parameters: parsedJson.parameters,
        };

        return { action, explanation: parsedJson.explanation };

    } catch (error) {
        console.error("Error parsing command with Gemini:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
};