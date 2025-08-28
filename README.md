<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SmartOS Assistant

A lightweight AI operating system assistant that transforms natural language commands (text or voice) into executable system tasks.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Project Overview

SmartOS is designed as a "local ChatGPT meets Windows Spotlight meets AutoGPT", empowering users to control and operate desktop systems using plain English commands. From writing essays to opening apps and toggling connectivity, SmartOS enables hands-free, intelligent automation.

### Core Features

- **Voice and Text Commands**: Interact naturally using speech or typing
- **Smart Application Launcher**: Open applications with simple commands
- **File Operations**: Create, modify and manage files
- **Content Creation**: Generate essays, letters and other content
- **Web Search**: Find information without opening a browser
- **System Controls**: Toggle WiFi, Bluetooth and other settings

## Code Structure and Comments

### Main Components

#### `App.tsx` - Application Entry Point
```typescript
// Core React imports for state management and component rendering
import React, { useState, useEffect } from 'react';
// Type definitions for messages and commands 
import { type Message, type CommandAction, CommandType } from './types';
// Service for processing natural language with Gemini API
import { parseCommand } from './services/geminiService';
// Service for launching applications based on user commands
import { launchApplication } from './services/appLauncherService';
// Service for file operations
import { createFile } from './services/fileService';
// UI components for chat interface, command input, etc.
import ChatInterface from './components/ChatInterface';
// ... more imports

// Main App component that orchestrates the application flow
const App: React.FC = () => {
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // Loading state during API calls
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Error state for handling exceptions
  const [error, setError] = useState<string | null>(null);
  // Toggle for command suggestions visibility
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Initialize the app with a greeting message
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm SmartOS, your AI assistant. How can I help you operate your system today?",
      action: { command: CommandType.GREETING, parameters: {} }
    }]);
    setShowSuggestions(true);
  }, []);
  
  // Generate feedback messages based on executed commands
  const getExecutionFeedback = (action: CommandAction): string | null => {
    // Different feedback for different command types
    switch (action.command) {
      case CommandType.OPEN_APP:
        return `Done. Opening ${action.parameters.appName || 'the application'} for you.`;
      // ... other command types
    }
  };
  // ... rest of the component
}
```

#### `geminiService.ts` - NLU Processing with Google's Gemini API
```typescript
// Import Google's Generative AI SDK
import { GoogleGenAI, Type } from "@google/genai";
import { type CommandAction, CommandType } from '../types';

// Validate API key is available
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for command parsing
// This structure helps the AI understand how to categorize and extract
// parameters from user instructions
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
            description: "Parameters for the command. Varies based on command type.",
            properties: {
                // Parameters for application control
                appName: { 
                    type: Type.STRING, 
                    description: "The name of the application to open." 
                },
                // Parameters for file operations
                fileName: { 
                    type: Type.STRING, 
                    description: "The name of the file to write to." 
                },
                fileContent: { 
                    type: Type.STRING, 
                    description: "The content to write into the file." 
                },
                // ... other parameters
            },
        },
        explanation: {
            type: Type.STRING,
            description: "A friendly explanation of the action for the user."
        }
    },
    required: ["command", "parameters", "explanation"]
};
```

#### `useSpeechRecognition.ts` - Voice Command Hook
```typescript
import { useState, useEffect, useRef } from 'react';

// Fix for TypeScript: Define interfaces for the Web Speech API
// These definitions are needed because the Speech Recognition API
// is not yet standardized in TypeScript's DOM library
interface SpeechRecognition extends EventTarget {
  continuous: boolean;       // Whether to continue listening after first result
  interimResults: boolean;   // Whether to return interim results while processing
  lang: string;              // Language for recognition
  start: () => void;         // Start listening
  stop: () => void;          // Stop listening
  onresult: (event: any) => void;  // Event handler for results
  onerror: (event: any) => void;   // Event handler for errors
  onend: () => void;         // Event handler for recognition end
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

// Extend Window interface to include Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;  // For WebKit browsers
  }
}

// Get the appropriate Speech Recognition API based on browser
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// Custom hook for speech recognition functionality
export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const lastTranscriptRef = useRef('');

    useEffect(() => {
        // Check for browser support
        if (!SpeechRecognitionAPI) {
            console.error('Speech Recognition API not supported in this browser.');
            return;
        }

        // Initialize speech recognition with settings
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;  // Continue listening
        recognition.interimResults = true;  // Get results as they're processed
        recognition.lang = 'en-US';  // Set language to English
        // ... rest of the hook
    });
    // ... methods for start/stop listening
}
```

#### `ChatInterface.tsx` - UI Component for Messages
```typescript
import React, { useRef, useEffect } from 'react';
import { type Message as MessageType } from '../types';
import Message from './Message';

interface ChatInterfaceProps {
  messages: MessageType[];    // Array of chat messages
  isLoading: boolean;         // Whether a response is loading
  children?: React.ReactNode; // Optional child components
}

// Component that renders the chat conversation interface
const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  children 
}) => {
  // Reference to control scrolling behavior
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, children]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Render each message in the conversation */}
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      
      {children}

      {/* Show loading animation when waiting for response */}
      {isLoading && (
        <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-slate-700 rounded-lg rounded-bl-none px-4 py-3 max-w-lg">
                <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" style={{animationDelay: '200ms'}}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" style={{animationDelay: '400ms'}}></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
```

## Command Types and Examples

```typescript
// Supported command types in the system
export enum CommandType {
  GREETING = 'GREETING',           // Initial greeting
  OPEN_APP = 'OPEN_APP',           // Launch applications
  WRITE_FILE = 'WRITE_FILE',       // Create and write to files
  CREATE_CONTENT = 'CREATE_CONTENT', // Generate essays, letters, etc.
  TOGGLE_SETTING = 'TOGGLE_SETTING', // Toggle system settings
  SEARCH_WEB = 'SEARCH_WEB',       // Perform web searches
  CREATE_DIRECTORY = 'CREATE_DIRECTORY', // Create folders
  DELETE_FILE = 'DELETE_FILE',     // Delete files
  UNKNOWN = 'UNKNOWN'              // Fallback for unrecognized commands
}

// Example voice/text commands:
// "Open Chrome"
// "Write a document about climate change"
// "Turn off WiFi"
// "Search for local restaurants"
// "Create a folder called Projects"
```

## Architecture Flow

1. **User Input** → User speaks or types a command
2. **Speech Recognition** → For voice input, converts speech to text
3. **Natural Language Processing** → Gemini AI interprets command intent
4. **Command Classification** → Maps to predefined CommandType
5. **Parameter Extraction** → Identifies required parameters
6. **Service Delegation** → Routes to appropriate service (app launcher, file service, etc.)
7. **Action Execution** → Performs the requested operation
8. **Feedback Generation** → Creates user-friendly response
9. **UI Update** → Displays result to user in chat interface
