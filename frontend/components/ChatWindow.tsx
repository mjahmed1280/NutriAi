
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, UserProfile } from '../types';
import { ICONS } from '../constants';
import { geminiService } from '../services/geminiService';

interface ChatWindowProps {
  profile: UserProfile;
  initialHistory: Message[];
  onHistoryUpdate: (messages: Message[]) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ profile, initialHistory, onHistoryUpdate }) => {
  const [messages, setMessages] = useState<Message[]>(initialHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const COOLDOWN_MS = 3000;

  useEffect(() => {
    geminiService.startChat(profile, initialHistory);
    if (messages.length === 0) {
        handleWelcome();
    }
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    onHistoryUpdate(messages);
  }, [messages, isTyping]);

  const handleWelcome = async () => {
    setIsTyping(true);
    const welcomeMsg = `Hi ${profile.name}! I've reviewed your profile. Since you're looking for **${profile.fitnessGoal}** with a **${profile.dietaryPreference}** diet, I'm excited to help you optimize your nutrition. How can I assist you today? 

*(Note: I am an AI, consult a doctor for medical advice.)*
[SUGGESTIONS: Create a meal plan | Calculate my macros | Healthy snack ideas | Tips for better sleep]`;
    
    const parsed = parseResponse(welcomeMsg);
    const newMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: parsed.cleanText,
        suggestions: parsed.suggestions,
        timestamp: Date.now()
    };
    setMessages([newMessage]);
    setIsTyping(false);
  };

  const parseResponse = (text: string) => {
    const suggestionRegex = /\[SUGGESTIONS:\s*(.*?)\]/i;
    const match = text.match(suggestionRegex);
    let suggestions: string[] | undefined = undefined;
    let cleanText = text;

    if (match) {
      suggestions = match[1].split('|').map(s => s.trim()).filter(s => s.length > 0);
      cleanText = text.replace(suggestionRegex, '').trim();
    }

    return { cleanText, suggestions };
  };

  const handleSend = async (customText?: string) => {
    const now = Date.now();
    if (now - lastSent < COOLDOWN_MS) return;

    const textToSend = customText || input.trim();
    if (!textToSend || isTyping) return;

    if (!customText) setInput('');
    setLastSent(now);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMessage: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, modelMessage]);

    let fullResponse = '';
    await geminiService.sendMessageStream(textToSend, (chunk) => {
      fullResponse += chunk;
      const parsed = parseResponse(fullResponse);
      setMessages(prev => 
        prev.map(msg => msg.id === modelMsgId ? { 
          ...msg, 
          text: parsed.cleanText,
          suggestions: parsed.suggestions 
        } : msg)
      );
    });

    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Scrollable Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth"
      >
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const showSuggestions = !isTyping && msg.role === 'model' && isLastMessage && msg.suggestions && msg.suggestions.length > 0;

          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'
                }`}>
                  {msg.role === 'user' ? <ICONS.User className="w-5 h-5" /> : <ICONS.Leaf className="w-5 h-5" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <div className="prose prose-sm prose-emerald max-w-none">
                    {msg.text ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-emerald-800">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-emerald-700">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-md font-bold mb-1 uppercase tracking-wider text-emerald-600">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="mb-0">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-inherit border-b border-emerald-300/30">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-emerald-200 pl-4 italic text-gray-600 my-2">{children}</blockquote>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      isTyping && msg.role === 'model' ? (
                        <span className="flex gap-1 items-center font-medium text-emerald-600">
                          Analyzing
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce delay-75">.</span>
                          <span className="animate-bounce delay-150">.</span>
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Suggestions (Right below the model message) */}
              {showSuggestions && (
                <div className="mt-4 ml-11 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {msg.suggestions?.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Container */}
      <div className="bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-20 p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-4xl mx-auto items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about diet plans, macros, or recipes..."
            className="flex-1 bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 placeholder-gray-400 transition-all border border-gray-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-emerald-600 text-white p-3.5 rounded-xl hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 shrink-0"
            title="Send message"
          >
            <ICONS.Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
