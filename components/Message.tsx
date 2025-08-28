
import React from 'react';
import { type Message } from '../types';
import InterpretedAction from './InterpretedAction';
import { UserIcon } from './icons/UserIcon';
import { LogoIcon } from './icons/LogoIcon';

interface MessageProps {
  message: Message;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center">
          <LogoIcon className="w-5 h-5 text-cyan-400" />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-lg max-w-lg prose prose-invert prose-sm ${
            isUser
              ? 'bg-cyan-600 rounded-br-none'
              : 'bg-slate-700 rounded-bl-none'
          }`}
        >
          <p className="text-slate-50">{message.content}</p>
        </div>
        {!isUser && message.action && (
          <div className="mt-2">
            <InterpretedAction action={message.action} />
          </div>
        )}
      </div>
       {isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-slate-600 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
};

export default Message;
