import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, AlertTriangle, Paperclip, Loader2, Sparkles, Menu } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  systemName: string;
  themeColor: 'blue' | 'emerald' | 'violet';
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isOffline: boolean;
  suggestions?: string[];
  onToggleSidebar?: () => void;
  onFeedback?: (messageId: string, feedback: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  systemName,
  themeColor,
  messages,
  onSendMessage,
  isLoading,
  isOffline,
  suggestions = [],
  onToggleSidebar,
  onFeedback
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Theme styles map
  const themeStyles = {
    blue: {
      botIcon: 'from-blue-500 to-indigo-600',
      userBubble: 'bg-blue-600/90 border-blue-500',
      loader: 'text-blue-600',
      sendBtn: 'bg-slate-900 hover:bg-slate-800',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      suggestionHover: 'hover:border-blue-300',
      suggestionText: 'group-hover:text-blue-600'
    },
    emerald: {
      botIcon: 'from-emerald-500 to-teal-600',
      userBubble: 'bg-emerald-600/90 border-emerald-500',
      loader: 'text-emerald-600',
      sendBtn: 'bg-emerald-900 hover:bg-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      suggestionHover: 'hover:border-emerald-300',
      suggestionText: 'group-hover:text-emerald-600'
    },
    violet: {
      botIcon: 'from-violet-500 to-fuchsia-600',
      userBubble: 'bg-violet-600/90 border-violet-500',
      loader: 'text-violet-600',
      sendBtn: 'bg-violet-900 hover:bg-violet-800',
      badge: 'bg-violet-100 text-violet-700 border-violet-200',
      suggestionHover: 'hover:border-violet-300',
      suggestionText: 'group-hover:text-violet-600'
    }
  };

  const currentTheme = themeStyles[themeColor];

  return (
    <div className="flex flex-col h-full relative">
      {/* Header Area */}
      <div className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 border-b border-white/40 bg-white/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button - Highly Visible on Small Screens */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-white shadow-md border border-slate-200 rounded-xl text-slate-700 active:scale-95 transition-all"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex flex-col">
            <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-1.5 leading-none">
              {systemName}
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${currentTheme.badge} hidden sm:inline-block`}>
                Beta
              </span>
            </h2>
            <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Neural Core Active
            </p>
          </div>
        </div>

        {isOffline && (
          <div className="flex items-center gap-2 bg-amber-100/80 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">OFFLINE MODE</span>
            <span className="sm:hidden text-[9px]">OFFLINE</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 scrollbar-hide">
        {/* FAQ Section - Always visible */}
        {suggestions.length > 0 && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.botIcon} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Frequently Asked Questions</h3>
                <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wider">Click to ask</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {suggestions.slice(0, 6).map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(faq)}
                    disabled={isLoading}
                    className={`group relative p-3 sm:p-4 bg-white/70 hover:bg-white backdrop-blur-sm border border-slate-200/50 ${currentTheme.suggestionHover} rounded-2xl transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-lg ${currentTheme.suggestionText} opacity-60 group-hover:opacity-100 transition-opacity`}>💬</span>
                      <span className={`text-xs sm:text-sm font-semibold text-slate-700 ${currentTheme.suggestionText} line-clamp-2`}>
                        {faq}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 p-4 sm:p-8 animate-in fade-in duration-700">
            <div className="relative">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${currentTheme.botIcon} rounded-[2rem] flex items-center justify-center shadow-2xl shadow-slate-400/30`}>
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Hey there! 👋 Welcome to {systemName}</h3>
              <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
                I'm your official student companion! 💙 Whether you're curious about enrollment, tuition, or just want to know more about school life, I've got your back. Ask me anything below!
              </p>
            </div>
          </div>
        )}

        {/* Messages */}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full animate-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] sm:max-w-[80%] md:max-w-[70%] gap-2 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user'
                ? 'bg-slate-200 text-slate-600'
                : `bg-gradient-to-br ${currentTheme.botIcon} text-white`
                }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 sm:p-6 text-sm leading-relaxed shadow-lg whitespace-pre-wrap backdrop-blur-md ${msg.role === 'user'
                    ? `${currentTheme.userBubble} text-white rounded-3xl rounded-tr-none border`
                    : msg.isError
                      ? 'bg-amber-50/90 text-slate-800 border border-amber-200 rounded-3xl rounded-tl-none'
                      : 'bg-white/80 text-slate-800 border border-white/60 rounded-3xl rounded-tl-none'
                    }`}
                >
                  {msg.content}
                </div>
                <div className="flex w-full justify-between items-center mt-2 px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {msg.role === 'user' ? 'You' : systemName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'model' && !msg.isError && onFeedback && (
                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => onFeedback(msg.id, 1)}
                        className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${msg.feedback === 1 ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300'}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>
                      </button>
                      <button
                        onClick={() => onFeedback(msg.id, -1)}
                        className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${msg.feedback === -1 ? 'text-red-500 bg-red-50' : 'text-slate-300'}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.37-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start w-full animate-in fade-in duration-300">
            <div className="flex gap-4 max-w-[85%] sm:max-w-[75%]">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br ${currentTheme.botIcon} flex items-center justify-center shadow-lg`}>
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="bg-white/50 p-4 rounded-3xl rounded-tl-none border border-white/50 shadow-sm flex items-center gap-3 backdrop-blur-md">
                <Loader2 className={`w-4 h-4 animate-spin ${currentTheme.loader}`} />
                <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">WAIT A SEC, JUST THINKING... 🤔</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white/40 border-t border-white/40 backdrop-blur-lg">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-violet-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything! 😊"
              className="relative w-full bg-white/80 border border-white/50 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 font-medium"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 sm:p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${input.trim() && !isLoading
              ? `${currentTheme.sendBtn} text-white hover:shadow-xl`
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 sm:mt-4">
          Cainta Catholic College • {systemName} Support
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;