import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { getAICoachResponse } from '../services/GeminiService';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { 
  PaperAirplaneIcon, ChatBubbleLeftEllipsisIcon, UserCircleIcon, 
  MicrophoneIcon, SpeakerWaveIcon, ClipboardDocumentIcon, ShareIcon, BookmarkIcon,
  HandThumbUpIcon, HeartIcon, FaceSmileIcon, CheckCircleIcon, StopCircleIcon
} from './common/IconComponents';
import { triggerHapticFeedback } from '../utils/haptics';

// --- START Speech Recognition API type definitions ---
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly interpretation?: any;
  readonly emma?: any;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;

  addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface SpeechRecognitionEventMap {
  "audiostart": Event;
  "soundstart": Event;
  "speechstart": Event;
  "speechend": Event;
  "soundend": Event;
  "audioend": Event;
  "result": SpeechRecognitionEvent;
  "nomatch": SpeechRecognitionEvent;
  "error": SpeechRecognitionErrorEvent;
  "start": Event;
  "end": Event;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

// Augment the global Window interface
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
// --- END Speech Recognition API type definitions ---


interface PersonalCoachProps {
  userProfile: UserProfile | null;
}

// Check for SpeechRecognition API
const BrowserSpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null; // 'SpeechRecognition' here is the TYPE (interface)

if (BrowserSpeechRecognitionAPI) {
  recognition = new BrowserSpeechRecognitionAPI(); // Instantiate using the browser's API constructor
  recognition.continuous = false; // Process single utterances
  recognition.lang = 'en-US';
  recognition.interimResults = false; // Get final results
}


const PersonalCoach: React.FC<PersonalCoachProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const initialGreeting: ChatMessage = {
      id: `ai-init-${Date.now()}`,
      sender: 'ai',
      text: `Hello ${userProfile?.name || 'there'}! I'm your personal AI Discipleship Coach. How can I assist your spiritual growth today?`,
      timestamp: new Date(),
      suggestions: [
        "What did we discuss last time?", 
        "Discuss my spiritual resilience.",
        "Ask about my last journal entry.", 
        "Explore a passage.",
        "Help me with a question."
      ]
    };
    setMessages([initialGreeting]);
  }, [userProfile]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || userInput;
    if (!textToSend.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const aiResponse = await getAICoachResponse(textToSend, [...messages, newUserMessage], userProfile); 
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorResponse: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleVoiceInput = () => {
    if (!recognition) { // Use the module-level 'recognition' instance
      setSpeechError("Voice input is not supported by your browser.");
      triggerHapticFeedback('error');
      return;
    }
    triggerHapticFeedback('medium');
    setSpeechError(null);

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognition.start();
    }
  };

  useEffect(() => {
    if (!recognition) return; // Use the module-level 'recognition' instance

    recognition.onresult = (event: SpeechRecognitionEvent) => { // Type is now defined
      const transcript = event.results[0][0].transcript;
      setUserInput(prevInput => prevInput + (prevInput ? ' ' : '') + transcript); // Append transcript
      setIsRecording(false); // Stop recording indicator after result
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => { // Type is now defined
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setSpeechError("No speech detected. Please try again.");
      } else if (event.error === 'audio-capture') {
        setSpeechError("Audio capture failed. Check microphone permissions.");
      } else if (event.error === 'not-allowed') {
        setSpeechError("Microphone access denied. Please enable it in browser settings.");
      } else {
        setSpeechError(`Error: ${event.error}. Try again.`);
      }
      setIsRecording(false);
       triggerHapticFeedback('error');
    };
    
    recognition.onend = () => {
        setIsRecording(false); // Ensure recording state is reset
    };

    // Cleanup function
    return () => {
      if (recognition) { // Use the module-level 'recognition' instance
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        if(isRecording) recognition.stop();
      }
    };
  }, [isRecording]); // Rerun effect if isRecording changes to manage onend correctly

  const handleSpeakText = (text: string, messageId: string) => {
    if (typeof window.speechSynthesis === 'undefined') {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }
    triggerHapticFeedback('light');
    if (speakingMessageId === messageId && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onstart = () => setSpeakingMessageId(messageId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyToClipboard = async (text: string, messageId: string) => {
    triggerHapticFeedback('light');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    }
  };

  const handleShareText = async (text: string) => {
    triggerHapticFeedback('light');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GrowthPath AI Coach Response',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing text: ', err);
      }
    } else {
      alert("Sharing is not supported on your browser. Try copying the text.");
    }
  };
  
  const MessageActions = ({ msg }: { msg: ChatMessage }) => (
    <div className="absolute -bottom-3 right-0 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-brand-surface/80 backdrop-blur-sm p-1 rounded-full shadow-md">
      {msg.sender === 'ai' && (
        <>
          <button onClick={() => handleSpeakText(msg.text, msg.id)} title="Speak message" className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-text-secondary hover:text-brand-primary">
            <SpeakerWaveIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleCopyToClipboard(msg.text, msg.id)} title="Copy message" className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-text-secondary hover:text-brand-primary">
            {copiedMessageId === msg.id ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => handleShareText(msg.text)} title="Share message" className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-text-secondary hover:text-brand-primary">
            <ShareIcon className="w-4 h-4" />
          </button>
        </>
      )}
      <button onClick={() => { /* TODO: Implement bookmark */ triggerHapticFeedback('light'); }} title="Bookmark message" className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-text-secondary hover:text-brand-primary">
        <BookmarkIcon className="w-4 h-4" />
      </button>
      {/* Mock Emoji Reactions */}
      <button onClick={() => { /* TODO: Implement reaction */ triggerHapticFeedback('light'); }} title="Like" className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-text-secondary hover:text-brand-primary">
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
       <button onClick={() => { /* TODO: Implement reaction */ triggerHapticFeedback('light'); }} title="Love" className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-text-secondary hover:text-brand-primary">
        <HeartIcon className="w-4 h-4" />
      </button>
    </div>
  );


  return (
    <Card 
      className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col shadow-xl" 
      title="AI Discipleship Coach"
      titleClassName="font-display text-2xl"
    >
      <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-6 bg-brand-background rounded-md mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 group relative ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1" />
            )}
            <div className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[65%] p-3.5 rounded-2xl shadow-lg relative ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-br from-brand-primary to-blue-600 text-white rounded-br-lg' 
                : 'bg-gradient-to-br from-brand-surface to-gray-100 text-brand-text-primary border border-gray-200 rounded-bl-lg'
            }`}>
              <p className="text-base sm:text-[1.05rem] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-200/80 text-right' : 'text-brand-text-secondary/80'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
               <MessageActions msg={msg} />
            </div>
             {msg.sender === 'user' && (
              <UserCircleIcon className="w-10 h-10 text-brand-text-secondary flex-shrink-0 mt-1" />
            )}
            {msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && messages[messages.length-1].id === msg.id && !isLoading && (
              <div className="w-full flex justify-start pl-12 mt-1.5 flex-wrap gap-2">
                {msg.suggestions.map((sugg, index) => (
                  <button 
                    key={index}
                    onClick={() => handleSuggestionClick(sugg)}
                    className="text-xs bg-brand-accent/20 text-brand-accent-darker hover:bg-brand-accent/30 px-3.5 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && (
            <div className="flex items-start gap-2.5 justify-start">
                 <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1" />
                 <div className="max-w-xs sm:max-w-md lg:max-w-lg p-3.5 rounded-2xl shadow-lg bg-gradient-to-br from-brand-surface to-gray-100 text-brand-text-primary border border-gray-200 rounded-bl-lg">
                    <LoadingSpinner size="sm" message="Coach is reflecting..." />
                 </div>
            </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-brand-primary/10">
        {speechError && (
          <p className="text-xs text-red-600 mb-1.5 text-center bg-red-100 p-1 rounded">{speechError}</p>
        )}
        {isRecording && (
          <div className="mb-2 text-center text-sm text-brand-primary animate-pulse font-medium">
            Listening... (Tap microphone to stop)
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleVoiceInput}
            variant={isRecording ? "secondary" : "ghost"} // Changed to secondary when recording
            size="md"
            className={`aspect-square !p-2.5 ${isRecording ? 'animate-pulse ring-2 ring-brand-accent' : ''}`} 
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
            disabled={!BrowserSpeechRecognitionAPI} // Disable if not supported
          >
            {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
          </Button>
          <Input
            name="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type or use microphone..."
            className="flex-grow !text-base"
            disabled={isLoading || isRecording}
            containerClassName="mb-0 flex-grow"
          />
          <Button 
            onClick={() => handleSendMessage()} 
            isLoading={isLoading} 
            disabled={!userInput.trim() || isRecording} 
            aria-label="Send message"
            size="md"
            className="aspect-square !p-2.5" 
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PersonalCoach;
