'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    // Optionally pass consent flag to the server so it knows whether to log it
    body: { hasConsent },
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-br from-[#4A90E2] to-[#2C3E50] hover:shadow-lg hover:shadow-[#4A90E2]/20 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-shadow border border-white/10"
              aria-label="Open AI Assistant"
            >
              <MessageCircle size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 right-0 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] bg-[#0A1929] border border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#0D2137] border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#4A90E2] to-[#D4AF37] w-8 h-8 rounded-lg flex items-center justify-center shadow-inner">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Quanta Assistant</h3>
                    <p className="text-xs text-[#4A90E2]">Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                      <Bot size={32} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-medium">How can I help you?</h4>
                    <p className="text-xs text-gray-400 max-w-[250px]">
                      Ask me anything about Quanta Foundry&apos;s research projects, Workspace Q, or community.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex gap-3 max-w-[85%]',
                        m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                      )}
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        {m.role === 'user' ? (
                          <User size={14} className="text-gray-300" />
                        ) : (
                          <Bot size={14} className="text-[#D4AF37]" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'p-3 rounded-2xl text-sm leading-relaxed',
                          m.role === 'user'
                            ? 'bg-[#4A90E2] text-white rounded-tr-sm'
                            : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Bot size={14} className="text-[#D4AF37]" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/5 rounded-tl-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    I’m currently unable to answer. Please contact Quanta Foundry through the contact form.
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#0D2137] border-t border-white/10 space-y-3">
                {/* Privacy Toggle & Warning */}
                <div className="bg-white/5 rounded-lg p-2.5 space-y-2 border border-white/5">
                  <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-tight">
                    <ShieldAlert size={12} className="shrink-0 mt-0.5 text-amber-500" />
                    <p className="mb-3">
                    Do not share confidential, sensitive, or personal information. Chats are not saved unless you give consent below.
                  </p>
                  </div>
                  
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={hasConsent}
                        onChange={(e) => setHasConsent(e.target.checked)}
                      />
                      <div className="w-4 h-4 rounded border border-[#4A90E2]/30 bg-[#0A1929] peer-checked:bg-[#4A90E2] peer-checked:border-[#4A90E2] transition-colors flex items-center justify-center">
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors leading-tight flex-1">
                      I agree that Quanta Foundry may save this chat to improve the website, understand user needs, and develop future services.
                    </span>
                  </label>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim() || isLoading) return;
                    handleSubmit(e);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    maxLength={500}
                    className="w-full bg-[#0A1929] border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#4A90E2] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 p-1.5 rounded-full bg-[#4A90E2] text-white disabled:opacity-50 hover:bg-[#357ABD] transition-colors flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
