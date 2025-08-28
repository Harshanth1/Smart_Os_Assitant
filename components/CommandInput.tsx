
import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SendIcon } from './icons/SendIcon';
import { StopIcon } from './icons/StopIcon';

interface CommandInputProps {
  onSendMessage: (text: string) => Promise<boolean>;
  isLoading: boolean;
}

const CommandInput: React.FC<CommandInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [hasSubmittedTranscript, setHasSubmittedTranscript] = useState(false);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const success = await onSendMessage(inputValue);
      if (success) {
        setInputValue('');
      }
      inputRef.current?.focus();
    }
  };
  
  // Auto-submit the transcript when speech recognition completes
  useEffect(() => {
    // Reset the submission state when listening starts again
    if (isListening) {
      setHasSubmittedTranscript(false);
      return;
    }
    
    // Only submit if we have a transcript, we're not listening, and we haven't submitted this transcript yet
    if (transcript && !isListening && transcript.trim() !== '' && !hasSubmittedTranscript) {
      console.log('Auto-submitting speech transcript:', transcript);
      setHasSubmittedTranscript(true);
      
      const handleTranscriptSubmission = async () => {
        const success = await onSendMessage(transcript);
        if (success) {
          setInputValue('');
        }
      };
      handleTranscriptSubmission();
    }
  }, [transcript, isListening, onSendMessage, hasSubmittedTranscript]);
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      inputRef.current?.focus();
    } else {
      startListening();
    }
  };


  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-slate-700/50 p-2 rounded-lg border border-slate-600/50">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a command or use the microphone..."
        className="flex-1 bg-transparent focus:outline-none px-3 py-2 text-slate-200 placeholder-slate-400"
        disabled={isLoading || isListening}
        autoFocus
      />
      {hasRecognitionSupport && (
         <button
          type="button"
          onClick={toggleListening}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-cyan-500 ${
            isListening ? 'bg-red-500/80 text-white hover:bg-red-600' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
          }`}
        >
          {isListening ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-cyan-500"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
};

export default CommandInput;