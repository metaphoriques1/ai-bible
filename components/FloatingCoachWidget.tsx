
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { getQuickCoachResponse } from '../services/GeminiService';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon, PaperAirplaneIcon, UserCircleIcon } from './common/IconComponents';
import LoadingSpinner from './common/LoadingSpinner';
import { triggerHapticFeedback } from '../utils/haptics';

interface FloatingCoachWidgetProps {
  userProfile: UserProfile | null;
}

const FloatingCoachWidget: React.FC<FloatingCoachWidgetProps> = ({ userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const initialWidgetMessage: ChatMessage = {
        id: `ai-widget-init-${Date.now()}`,
        sender: 'ai',
        text: `Hi ${userProfile?.name || 'there'}! Quick question?`,
        timestamp: new Date(),
        suggestions: ["Verse for today?", "Quick encouragement"]
      };
      if (messages.length === 0) { // Only set initial if no messages yet
        setMessages([initialWidgetMessage]);
      }
      setTimeout(() => inputRef.current?.focus(), 100); // Focus input when opened
    }
  }, [isOpen, userProfile, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleWidget = () => {
    triggerHapticFeedback(isOpen ? 'light' : 'medium');
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || userInput;
    if (!messageText.trim() || !userProfile) return;

    const newUserMessage: ChatMessage = {
      id: `user-widget-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      // Use a limited history for the widget to keep context brief
      const historyForWidget = messages.slice(-3); // Last 3 messages (includes current user message if added before call)
      const aiResponse = await getQuickCoachResponse(messageText, historyForWidget, userProfile);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Floating coach AI error:", error);
      const errorResponse: ChatMessage = {
        id: `ai-widget-error-${Date.now()}`,
        sender: 'ai',
        text: "Sorry, quick chat isn't working right now.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
       setTimeout(() => inputRef.current?.focus(), 0);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };


  if (!userProfile) return null; // Don't render if no profile

  return (
    <>
      {/* FAB Button */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-40 bg-brand-accent text-brand-text-primary p-4 rounded-full shadow-xl hover:bg-brand-accent-darker focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 transition-transform duration-200 ease-in-out hover:scale-110"
          aria-label="Open Quick AI Coach"
        >
          <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full max-w-sm h-[70vh] md:h-auto md:max-h-[500px] bg-brand-surface shadow-2xl rounded-t-2xl md:rounded-xl flex flex-col transform transition-all duration-300 ease-out" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="floating-coach-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-brand-primary text-white rounded-t-2xl md:rounded-t-xl">
            <h3 id="floating-coach-title" className="text-base font-semibold flex items-center">
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2" />
              Quick AI Coach
            </h3>
            <button
              onClick={toggleWidget}
              className="p-1.5 rounded-full hover:bg-brand-primary-darker focus:outline-none focus:ring-1 focus:ring-white"
              aria-label="Close Quick AI Coach"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-brand-background/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start text-sm gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[80%] p-2.5 rounded-xl shadow ${
                  msg.sender === 'user' 
                    ? 'bg-brand-accent text-brand-text-primary rounded-br-md' 
                    : 'bg-gray-100 text-brand-text-primary rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap leading-normal">{msg.text}</p>
                   {msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && messages[messages.length-1].id === msg.id && !isLoading && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sugg, index) => (
                        <button 
                            key={index}
                            onClick={() => handleSuggestionClick(sugg)}
                            className="text-xs bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 px-2 py-1 rounded-full transition-colors"
                        >
                            {sugg}
                        </button>
                        ))}
                    </div>
                    )}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 text-brand-text-primary rounded-xl p-2.5 shadow">
                  <LoadingSpinner size="sm" message="Thinking..." />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Ask a quick question..."
                className="flex-grow w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !userInput.trim()}
                className="p-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-darker focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCoachWidget;
