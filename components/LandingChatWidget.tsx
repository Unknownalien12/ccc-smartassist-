import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { Message } from '../types';

interface LandingChatWidgetProps {
  systemName: string;
  themeColor: 'blue' | 'emerald' | 'violet';
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

const LandingChatWidget: React.FC<LandingChatWidgetProps> = ({
  systemName,
  themeColor,
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  isLoading,
  suggestions
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Theme Config
  const themes = {
    blue: { bg: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/40', text: 'text-blue-600', borderHover: 'hover:border-blue-400' },
    emerald: { bg: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/40', text: 'text-emerald-600', borderHover: 'hover:border-emerald-400' },
    violet: { bg: 'from-violet-600 to-fuchsia-600', shadow: 'shadow-violet-500/40', text: 'text-violet-600', borderHover: 'hover:border-violet-400' },
  };
  const theme = themes[themeColor];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Widget Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] max-w-[380px] h-[500px] max-h-[80vh] bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

          {/* Header */}
          <div className={`p-4 bg-gradient-to-r ${theme.bg} text-white flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{systemName}</h3>
                <p className="text-[10px] opacity-80">Always here for you! ✨</p>
              </div>
            </div>
            <button onClick={onToggle} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${theme.bg} rounded-2xl flex items-center justify-center shadow-lg mb-3`}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Hi there! I'm {systemName} 👋</p>
                <p className="text-xs text-slate-500 mb-6 px-4">Just a quick shout away if you need any help with school! What's on your mind? 💙</p>

                {/* FAQs in Widget */}
                <div className="flex flex-col gap-2">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(s)}
                      className={`text-xs text-left p-3 bg-white border border-slate-200 rounded-xl ${theme.borderHover} hover:shadow-md transition-all text-slate-600 font-medium`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm rounded-2xl ${msg.role === 'user'
                  ? `bg-gradient-to-br ${theme.bg} text-white rounded-tr-none shadow-md`
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                  <Loader2 className={`w-3 h-3 animate-spin ${theme.text}`} />
                  <span className="text-xs text-slate-400 font-bold">Hmm, let me see... 🤔</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything! 😊"
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl bg-gradient-to-r ${theme.bg} text-white shadow-md active:scale-95 transition-transform disabled:opacity-50`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={`group w-14 h-14 bg-gradient-to-br ${theme.bg} rounded-full flex items-center justify-center text-white shadow-2xl ${theme.shadow} hover:scale-110 active:scale-95 transition-all animate-in zoom-in duration-300 relative`}
        >
          <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
          <MessageSquare className="w-6 h-6 fill-current" />
        </button>
      )}
    </div>
  );
};

export default LandingChatWidget;
