import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the non-standard SpeechRecognition API to resolve TypeScript errors.
// By defining these interfaces and augmenting the global Window object, we inform TypeScript
// about the existence and shape of the SpeechRecognition API, which is not part of the
// standard DOM library typings.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

// Polyfill for browsers that might name it webkitSpeechRecognition
// FIX: Rename constant to avoid name collision with the SpeechRecognition interface type.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    // FIX: The type `SpeechRecognition` now correctly refers to the interface defined above.
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    // Track the last transcript to avoid duplicates
    const lastTranscriptRef = useRef('');

    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.error('Speech Recognition API not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            // Only update if we have new content and it's different from the last update
            if (finalTranscript && finalTranscript !== lastTranscriptRef.current) {
              console.log('New speech recognition result:', finalTranscript);
              lastTranscriptRef.current = finalTranscript;
              setTranscript(finalTranscript); // Replace instead of append to prevent accumulation
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasRecognitionSupport: !!SpeechRecognitionAPI
    };
};
