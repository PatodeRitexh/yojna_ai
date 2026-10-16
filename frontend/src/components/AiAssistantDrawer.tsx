import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchemeId?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeSchemeId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your Yojana AI Welfare Assistant. Ask me about Central and Maharashtra government schemes, eligibility criteria, required documents, or application portals.',
      disclaimer:
        'Guidance is based on verified government records. Final eligibility is determined by the respective government authority.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Maharashtra scholarships for engineering students?',
    'What are the documents needed for PM-KISAN?',
    'Explain the Rajarshi Shahu Maharaj EBC fee waiver',
    'Am I eligible for Ayushman Bharat health card?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text, activeSchemeId);
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: res.reply,
        relevant_schemes: res.relevant_schemes,
        sources: res.sources,
        disclaimer: res.disclaimer,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not retrieve an answer at this moment. Please check the official portal directly at services.india.gov.in or myscheme.gov.in.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center border border-navy-700">
              <Bot className="w-5 h-5 text-saffron-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                Yojana AI Assistant
                <span className="text-[10px] bg-indiaGreen-700 text-white px-1.5 py-0.2 rounded font-normal">
                  RAG Verified
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">Real-time Scheme Guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-navy-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* Relevant Schemes preview */}
                {m.relevant_schemes && m.relevant_schemes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">Referenced Scheme Portals:</p>
                    {m.relevant_schemes.map((s) => (
                      <a
                        key={s.id}
                        href={s.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-navy-50 text-xs text-navy-900 font-medium border border-slate-200 transition-colors"
                      >
                        <span className="truncate pr-2">{s.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-navy-700 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Official Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    <span>Source: </span>
                    <a
                      href={m.sources[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-navy-700 hover:text-navy-900"
                    >
                      Official Government Notification
                    </a>
                  </div>
                )}
              </div>

              {m.disclaimer && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 max-w-[85%]">
                  <AlertCircle className="w-3 h-3 text-saffron-500 flex-shrink-0" />
                  <span>{m.disclaimer}</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <Bot className="w-4 h-4 text-saffron-500 animate-spin" />
              <span>Checking verified government records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-white border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-saffron-500" /> Suggested Inquiries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-slate-100 hover:bg-navy-50 hover:text-navy-900 text-slate-700 px-2.5 py-1 rounded-full transition-colors border border-slate-200 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about scholarships, pensions, farmer benefits..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Answers are grounded in published Indian welfare regulations.
          </p>
        </div>
      </div>
    </div>
  );
};
