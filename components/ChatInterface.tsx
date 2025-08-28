
import React, { useRef, useEffect } from 'react';
import { type Message as MessageType } from '../types';
import Message from './Message';

interface ChatInterfaceProps {
  messages: MessageType[];
  isLoading: boolean;
  children?: React.ReactNode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, children]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      
      {children}

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
