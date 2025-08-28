
import React, { useState, useEffect } from 'react';
import { type Message, type CommandAction, CommandType } from './types';
import { parseCommand } from './services/geminiService';
import { launchApplication } from './services/appLauncherService';
import { createFile } from './services/fileService';
import ChatInterface from './components/ChatInterface';
import CommandInput from './components/CommandInput';
import Header from './components/Header';
import CommandSuggestions from './components/CommandSuggestions';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    // Initial greeting message from the assistant
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: "Hello! I'm SmartOS, your AI assistant. How can I help you operate your system today?",
        action: {
            command: CommandType.GREETING,
            parameters: {},
        }
      },
    ]);
    setShowSuggestions(true);
  }, []);
  
  const getExecutionFeedback = (action: CommandAction): string | null => {
      switch (action.command) {
          case CommandType.OPEN_APP:
              return `Done. Opening ${action.parameters.appName || 'the application'} for you.`;
          case CommandType.WRITE_FILE:
              return `I've successfully created and saved the file "${action.parameters.fileName || 'your file'}".`;
          case CommandType.CREATE_CONTENT:
              return `Alright, I've drafted some content about "${action.parameters.topic}". It's ready when you are.`;
          case CommandType.TOGGLE_SETTING:
              const state = action.parameters.settingValue ? 'ON' : 'OFF';
              return `Okay, I've turned the ${action.parameters.settingName} ${state}.`;
          case CommandType.SEARCH_WEB:
              return `Here are the web search results for "${action.parameters.query}".`;
          case CommandType.CREATE_DIRECTORY:
              return `Directory "${action.parameters.directoryName || 'new folder'}" has been created successfully.`;
          case CommandType.DELETE_FILE:
              return `The file "${action.parameters.filePath || 'the specified file'}" has been deleted.`;
          case CommandType.COPY_FILE:
              return `Successfully copied from "${action.parameters.sourcePath || 'source'}" to "${action.parameters.destinationPath || 'destination'}".`;
          case CommandType.UNKNOWN:
              return "Could you try rephrasing your command? Try to be more specific, for example: 'Open Chrome' or 'Create a file named report.txt with the content \"This is my report\"'.";
          default:
              return null;
      }
  }

  const handleSendMessage = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    
    setShowSuggestions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
        const result = await parseCommand(text);
        
        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: result.explanation,
            action: result.action,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Execute the actual command based on the type
        let customFeedback = null;
        try {
            if (result.action.command === CommandType.OPEN_APP && result.action.parameters.appName) {
                console.log(`Attempting to open app: ${result.action.parameters.appName}`);
                const appResult = await launchApplication(result.action.parameters.appName);
                console.log(`App launch result:`, appResult);
                
                if (!appResult.success) {
                    customFeedback = `I tried to open ${result.action.parameters.appName}, but encountered an issue: ${appResult.message}`;
                }
            } 
            else if (result.action.command === CommandType.WRITE_FILE) {
                const fileName = result.action.parameters.fileName;
                const fileContent = result.action.parameters.fileContent || '';
                
                if (fileName) {
                    console.log(`Creating file: ${fileName} with content length: ${fileContent.length}`);
                    const fileResult = await createFile(fileName, fileContent);
                    console.log(`File creation result:`, fileResult);
                    
                    if (!fileResult.success) {
                        customFeedback = `I tried to create the file "${fileName}", but encountered an issue: ${fileResult.message}`;
                    } else {
                        customFeedback = fileResult.message;
                    }
                } else {
                    customFeedback = "I couldn't create the file because the file name was not specified.";
                }
            }
        } catch (error) {
            console.error('Error executing command:', error);
        }

        const feedbackContent = customFeedback || getExecutionFeedback(result.action);
        if (feedbackContent) {
            setTimeout(() => {
                const feedbackMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: feedbackContent,
                };
                setMessages((prev) => [...prev, feedbackMessage]);
            }, 800);
        }
        return true;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to get response from AI. ${errorMessage}`);
        const assistantErrorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I'm having a little trouble with that request. Could you please try rephrasing it? For example, be more specific like 'Open Chrome' or 'Create a file named shopping-list.txt'.",
        };
        setMessages((prev) => [...prev, assistantErrorMessage]);
        return false;
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white font-sans">
      <Header />
      <ChatInterface messages={messages} isLoading={isLoading}>
        {showSuggestions && <CommandSuggestions onSelectSuggestion={handleSendMessage} />}
      </ChatInterface>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}
        <CommandInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;