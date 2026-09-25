import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  Zap,
  RotateCcw,
  Search,
  LifeBuoy,
  Cpu
} from 'lucide-react';
import { ChatMessage } from '../types';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

type ChatRole = 'forensic' | 'victim_support' | 'screener';
type ModelChoice = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

const ROLES: { id: ChatRole; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'forensic',
    title: 'Forensic Investigator',
    desc: 'Deep multi-factor deception & technical analysis',
    icon: <Search className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'victim_support',
    title: 'Incident Recovery Guide',
    desc: 'Triage for unauthorized charges & data exposure',
    icon: <LifeBuoy className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'screener',
    title: 'Rapid Screener',
    desc: 'Instant red-flag check for texts & SMS',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
  },
];

const MODELS: { id: ModelChoice; label: string; tag: string; desc: string }[] = [
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    tag: 'General Tasks',
    desc: 'Fast reasoning & high accuracy',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    tag: 'Fast Responses',
    desc: 'Low-latency rapid triage',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro',
    tag: 'Complex Forensic',
    desc: 'Advanced reasoning for contracts & schemes',
  },
];

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  initialMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "Hello! I'm your TrustLens AI Assistant. You can paste any suspicious communication, describe a questionable situation, or ask what steps to take if you suspect you've been targeted.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('forensic');
  const [selectedModel, setSelectedModel] = useState<ModelChoice>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('gemini-3.8-flash');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage && isOpen) {
      setInput(initialMessage);
    }
  }, [initialMessage, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          roleId: selectedRole,
          modelChoice: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      setActiveModelUsed(data.modelUsed || selectedModel);

      const assistantMessage: ChatMessage = {
        id: 'a-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content:
          err.message ||
          'Sorry, I encountered an issue processing your request. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content:
          "Conversation restarted. Ask me anything about suspicious texts, emails, payment requests, or fraud recovery.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    'How do I verify if an Amazon suspension notice is real?',
    'I sent money via Zelle to a seller who disappeared. What now?',
    'A recruiter asked me to buy software before starting work. Is this legit?',
    'What is the difference between phishing and spoofing?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div
        className="bg-[#091129] rounded-2xl border border-blue-900/60 shadow-2xl shadow-black/80 w-full max-w-4xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-blue-950 bg-[#070d20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-blue-600 to-indigo-700 p-px shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#081028] rounded-[11px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  TrustLens Gemini Advisor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 hidden sm:inline-flex">
                  Multi-Turn Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Contextual safety investigation powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors cursor-pointer min-h-[40px] flex items-center gap-1 text-xs"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advisor Persona & Model Controls Bar */}
        <div className="p-3 sm:px-5 border-b border-blue-950 bg-[#060b1b] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Persona selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
              Role:
            </span>
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
                      : 'bg-[#091330] text-slate-400 hover:text-slate-200 border border-blue-900/40 hover:bg-[#0d1a40]'
                  }`}
                  title={r.desc}
                >
                  {r.icon}
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              Model:
            </span>
            {MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-xs'
                      : 'bg-[#091330] text-slate-300 border border-blue-900/40 hover:bg-[#0d1a40]'
                  }`}
                  title={`${m.label} — ${m.desc}`}
                >
                  <span>{m.label.replace('Gemini ', '')}</span>
                  <span className="ml-1 text-[9px] opacity-75 hidden lg:inline">({m.tag})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Thread Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#070e24]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-blue-950 border border-blue-800 text-cyan-300'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md shadow-cyan-950/40'
                    : 'bg-[#0a1433] text-slate-200 border border-blue-900/60 rounded-tl-xs shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`mt-1.5 flex items-center justify-between gap-3 text-[10px] ${
                    msg.role === 'user' ? 'text-cyan-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <span className="text-[10px] font-mono text-cyan-400/80">
                      via {activeModelUsed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-blue-950 border border-blue-800 text-cyan-300">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0a1433] border border-blue-900/60 text-xs text-cyan-200 flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Gemini is evaluating multi-turn context and risk patterns...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-[#060b1b] border-t border-blue-950/60 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Try asking:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                className="text-xs text-slate-300 hover:text-white bg-[#0a1433] hover:bg-[#0f1d48] border border-blue-900/40 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer truncate max-w-xs"
              >
                {qp}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#070d20] border-t border-blue-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="gemini-chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask a question or paste a suspicious message to dissect..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 bg-[#09122e] border border-blue-900/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:bg-[#0c183b] transition-all min-h-[46px]"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              id="gemini-chatbot-send"
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 transition-all shadow-md min-h-[46px] cursor-pointer ${
                !input.trim() || isLoading
                  ? 'bg-[#0f1b3d] text-slate-500 cursor-not-allowed border border-blue-950'
                  : 'bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/25 active:scale-95'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Powered by Gemini 3 series • Multi-turn memory active</span>
            <span className="hidden sm:inline">Always confirm critical banking/personal decisions independently</span>
          </div>
        </div>
      </div>
    </div>
  );
};
