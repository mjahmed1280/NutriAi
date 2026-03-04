import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Send, Mic, MicOff, Camera, X, ImageIcon,
  Leaf, User, Loader2, PlusCircle, RotateCcw, PanelLeft, Printer
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { geminiService } from '../services/geminiService';
import { parseMacroTag, stripMacroTag } from '../services/geminiService';
import MacroCard from './MacroCard';
import { Message } from '../types';
import { cn } from '../lib/utils';

interface ChatWindowProps {
  onReset?: () => void;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

// ── Web Speech API types ──────────────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// ── Parse helpers ─────────────────────────────────────────────────────────────
function parseResponse(text: string): { cleanText: string; suggestions: string[] | undefined; macros: ReturnType<typeof parseMacroTag> } {
  const suggestionMatch = text.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
  const suggestions = suggestionMatch
    ? suggestionMatch[1].split('|').map((s) => s.trim()).filter(Boolean)
    : undefined;
  const cleanNoSuggestions = text.replace(/\[SUGGESTIONS:\s*.*?\]/gi, '').trim();
  const macros = parseMacroTag(cleanNoSuggestions);
  const cleanText = stripMacroTag(cleanNoSuggestions);
  return { cleanText, suggestions, macros };
}

const COOLDOWN_MS = 2000;

// ── Message bubble ─────────────────────────────────────────────────────────────
const MessageBubble = React.memo(({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) => {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
    >
      <div className={cn('flex gap-3 max-w-[85%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md',
          isUser ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 text-white'
        )}>
          {isUser ? <User size={15} /> : <Leaf size={15} />}
        </div>

        {/* Bubble */}
        <div className={cn(
          'rounded-2xl text-sm leading-relaxed shadow-lg',
          isUser
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none px-4 py-3'
            : 'bg-[#0D1F14] border border-white/8 border-l-4 border-l-emerald-500 text-[#F0FDF4] rounded-tl-none px-4 py-3'
        )}>
          {/* Image preview in user bubble */}
          {msg.imageBase64 && (
            <img
              src={`data:${msg.imageMimeType ?? 'image/jpeg'};base64,${msg.imageBase64}`}
              alt="Uploaded food"
              className="rounded-xl mb-2 max-h-48 w-auto object-cover"
            />
          )}

          {/* Analyzing shimmer (AI streaming with no text yet) */}
          {isStreaming && !msg.text ? (
            <div className="space-y-2 py-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-3">
                <Loader2 size={13} className="animate-spin" />
                {msg.imageBase64 ? 'Analyzing your food...' : 'Thinking...'}
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 bg-[length:200%_100%] animate-shimmer w-full" />
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 bg-[length:200%_100%] animate-shimmer w-3/4" />
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 bg-[length:200%_100%] animate-shimmer w-1/2" />
            </div>
          ) : (
            <div className={cn('prose prose-sm max-w-none', isUser ? 'prose-invert' : 'prose-invert')}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-emerald-300">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-2 text-emerald-400">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-bold mb-1 uppercase tracking-wider text-emerald-500">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="mb-0">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-emerald-500/40 pl-3 italic text-white/60 my-2">{children}</blockquote>,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          )}

          {/* MacroCard */}
          {msg.macros && !isStreaming && (
            <MacroCard macros={msg.macros} />
          )}
        </div>
      </div>
    </motion.div>
  );
});
MessageBubble.displayName = 'MessageBubble';

// ── Suggestion chips ──────────────────────────────────────────────────────────
const SuggestionChips = ({ suggestions, onSelect }: { suggestions: string[]; onSelect: (s: string) => void }) => (
  <motion.div
    className="mt-3 ml-11 flex flex-wrap gap-2"
    initial="hidden"
    animate="visible"
    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
  >
    {suggestions.map((s, i) => (
      <motion.button
        key={i}
        variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(s)}
        className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
      >
        {s}
      </motion.button>
    ))}
  </motion.div>
);

// ── Main ChatWindow ────────────────────────────────────────────────────────────
const ChatWindow: React.FC<ChatWindowProps> = ({ onReset, onNewChat, onToggleSidebar, isSidebarOpen }) => {
  const { profile, messages, addMessage, updateLastMessage } = useAppStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastSent, setLastSent] = useState(0);

  // Image state
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Init chat ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    geminiService.startChat(profile, messages);
    if (messages.length === 0) triggerWelcome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── Welcome message ────────────────────────────────────────────────────────
  const triggerWelcome = () => {
    // Use getState() (synchronous) to avoid stale closure / React StrictMode double-invoke
    if (useAppStore.getState().messages.length > 0) return;
    const raw = `Hi ${profile!.name}! I've reviewed your profile. Since you're working towards **${profile!.fitnessGoal}** with a **${profile!.dietaryPreference}** diet, I'm ready to help you crush your nutrition goals. How can I assist you today?\n[SUGGESTIONS: Create a meal plan | Calculate my macros | Healthy snack ideas | Tips for better sleep]`;
    const { cleanText, suggestions } = parseResponse(raw);
    addMessage({ id: Date.now().toString(), role: 'model', text: cleanText, suggestions, timestamp: Date.now() });
  };

  // ── Image processing ───────────────────────────────────────────────────────
  const processImageFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large — max 10 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setPendingImage({ base64, mimeType: file.type || 'image/jpeg', previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Dropzone ───────────────────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => { if (files[0]) processImageFile(files[0]); },
    accept: { 'image/*': [] },
    noClick: true,
    multiple: false,
  });

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (customText?: string) => {
    const now = Date.now();
    if (now - lastSent < COOLDOWN_MS) return;

    const textToSend = (customText ?? input).trim();
    const hasImage = !!pendingImage;
    if (!textToSend && !hasImage) return;
    if (isTyping) return;

    setInput('');
    setLastSent(now);
    const capturedImage = pendingImage;
    setPendingImage(null);

    // User message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend || (hasImage ? '*(image sent)*' : ''),
      imageBase64: capturedImage?.base64,
      imageMimeType: capturedImage?.mimeType,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setIsTyping(true);

    // Placeholder AI message (streaming target)
    const aiMsgId = (Date.now() + 1).toString();
    addMessage({ id: aiMsgId, role: 'model', text: '', timestamp: Date.now() });

    let fullResponse = '';

    const onChunk = (chunk: string) => {
      fullResponse += chunk;
      const { cleanText, suggestions, macros } = parseResponse(fullResponse);
      updateLastMessage((msg) =>
        msg.id === aiMsgId ? { ...msg, text: cleanText, suggestions, macros } : msg
      );
    };

    try {
      if (capturedImage) {
        await geminiService.sendMessageWithImageStream(textToSend, capturedImage.base64, capturedImage.mimeType, onChunk);
      } else {
        await geminiService.sendMessageStream(textToSend, onChunk);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      updateLastMessage((m) => m.id === aiMsgId ? { ...m, text: `⚠️ ${msg}` } : m);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Voice input ────────────────────────────────────────────────────────────
  const toggleVoice = () => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported in this browser'); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => { toast.error('Voice input failed'); setIsListening(false); };
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  // ── Textarea auto-resize ───────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div
      {...getRootProps()}
      className="flex flex-col h-full bg-[#04090A] relative"
    >
      <input {...getInputProps()} />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#04090A]/90 backdrop-blur-sm border-2 border-dashed border-emerald-500 rounded-xl m-2"
          >
            <ImageIcon size={48} className="text-emerald-400 mb-4" />
            <p className="text-xl font-bold text-emerald-300 font-display">Drop your food photo here</p>
            <p className="text-sm text-emerald-500 mt-2">We'll analyze it instantly</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-white/6 bg-[#04090A]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="font-display font-semibold text-[#F0FDF4] text-sm tracking-wide">NutriAI</span>
        </div>
        <div className="flex items-center gap-1">
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-emerald-400 hover:bg-white/5 transition-all text-xs font-medium"
              title="New chat"
            >
              <PlusCircle size={14} />
              New Chat
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/5 transition-all text-xs font-medium"
              title="Reset profile"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                isSidebarOpen ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              )}
              title="Toggle sidebar"
            >
              <PanelLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg, idx) => {
          const isLastAI = msg.role === 'model' && idx === messages.length - 1;
          const isStreaming = isLastAI && isTyping;
          const showChips = !isTyping && isLastAI && msg.suggestions && msg.suggestions.length > 0;
          const isDietPlan = msg.role === 'model' && !isStreaming && /day\s*[1-7]|breakfast|lunch|dinner|meal plan/i.test(msg.text) && msg.text.length > 300;

          const handlePrintPlan = () => {
            const el = document.getElementById(`msg-${msg.id}`);
            if (el) { el.setAttribute('data-print-target', 'true'); window.print(); setTimeout(() => el.removeAttribute('data-print-target'), 2000); }
          };

          return (
            <div key={msg.id} id={`msg-${msg.id}`}>
              {isDietPlan && (
                <button
                  onClick={handlePrintPlan}
                  className="mb-2 ml-11 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Printer size={11} />
                  Download Plan
                </button>
              )}
              <MessageBubble msg={msg} isStreaming={isStreaming} />
              {showChips && (
                <SuggestionChips
                  suggestions={msg.suggestions!}
                  onSelect={(s) => handleSend(s)}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-white/6 bg-[#04090A] py-3">
        <div className="max-w-3xl mx-auto px-4">
        {/* Image preview strip */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
            >
              <img
                src={pendingImage.previewUrl}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover border border-white/10"
              />
              <span className="text-xs text-white/50 flex-1">Image ready to send</span>
              <button
                onClick={() => setPendingImage(null)}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-emerald-400 transition-all flex items-center justify-center"
            title="Upload food photo"
          >
            <Camera size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) processImageFile(e.target.files[0]); e.target.value = ''; }}
          />

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={isListening ? '' : input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : pendingImage ? 'Describe your food or just send...' : 'Ask about diet plans, macros, or recipes...'}
            rows={1}
            className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-[#F0FDF4] placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all leading-relaxed"
            style={{ minHeight: '42px' }}
          />

          {/* Mic button */}
          <button
            onClick={toggleVoice}
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl transition-all flex items-center justify-center',
              isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-emerald-400'
            )}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => handleSend()}
            disabled={(!input.trim() && !pendingImage) || isTyping}
            className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/20 text-white transition-all flex items-center justify-center shadow-lg shadow-emerald-900/30"
            title="Send"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
