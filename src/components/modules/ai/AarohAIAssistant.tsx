import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, RotateCcw, Bot, User } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { processCampusAIQuery } from '../../../utils/aiAssistant';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AarohAIAssistant: React.FC = () => {
  const {
    user,
    role,
    timetable,
    attendance,
    courses,
    assignments,
    opportunities,
  } = useApp();

  // Only render for students
  if (role !== 'student') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_initial',
      sender: 'ai',
      text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your Aaroh campus assistant. Try asking me about your next class, attendance warnings, or upcoming deadlines!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Process query using offline smart parser
    setTimeout(() => {
      const responseText = processCampusAIQuery(query, {
        user,
        timetable,
        attendance,
        courses,
        assignments,
        opportunities,
      });

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_reset_${Date.now()}`,
        sender: 'ai',
        text: `Chat cleared. Ask me about your next class, attendance, or upcoming deadlines!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestionChips = [
    { label: 'Next class', query: 'When is my next class?' },
    { label: 'Attendance status', query: 'Check my attendance' },
    { label: 'Upcoming deadlines', query: 'What is due in the next 48 hours?' },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-sm border border-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700/30 transition-all duration-150 ease-in-out active:scale-95"
          aria-label={isOpen ? 'Close Aaroh AI Assistant' : 'Open Aaroh AI Assistant'}
          title="Aaroh AI Assistant"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white transition-transform duration-150" />
          ) : (
            <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-150" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[520px] h-[480px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden animate-in fade-in duration-150 font-sans"
          role="dialog"
          aria-label="Aaroh AI Chat Assistant"
        >
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                  <span>Aaroh AI</span>
                  <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                    Offline
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
                  Campus Intelligence Assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Query Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0 mr-0.5">
              Ask:
            </span>
            {suggestionChips.map(chip => (
              <button
                key={chip.label}
                onClick={() => handleSendMessage(chip.query)}
                className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded hover:border-teal-300 hover:text-teal-800 hover:bg-teal-50/50 whitespace-nowrap transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Message History Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FBFBFA]/60">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-slate-100 text-slate-900 border border-slate-200'
                        : 'bg-teal-50/70 text-slate-800 border border-teal-200/80'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-800 mb-1">
                        <Sparkles className="w-3 h-3 text-teal-700 shrink-0" />
                        <span>Aaroh Assistant</span>
                      </div>
                    )}
                    <div>{msg.text}</div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about next class, attendance, deadlines..."
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 disabled:opacity-40 disabled:hover:bg-teal-700 transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
