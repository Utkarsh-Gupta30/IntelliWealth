import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import apiClient from '../api/client';

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      message: 'Hello! I am your IntelliWealth AI Financial Coach. Ask me how to optimize your spending, save ₹5,000, or learn about SIP & Mutual Funds!',
      suggested_prompts: ['How much did I spend on food?', 'How can I save ₹5,000?', 'Explain SIP']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', message: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/chat/message', { message: query });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          message: res.data.reply,
          suggested_prompts: res.data.suggested_prompts
        }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', message: 'I encountered an error retrieving financial data. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 shadow-glow-blue flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      ) : (
        <div className="w-96 glass-panel rounded-3xl border border-[#232D42] shadow-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-4 bg-[#151C2C] border-b border-[#232D42] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">IntelliWealth AI Coach</h4>
                <p className="text-[10px] text-emerald-400 font-medium">● Real-time Intelligence Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                    : 'bg-[#0B0F17] border border-[#232D42] text-slate-200 rounded-bl-none'
                }`}>
                  {m.message}

                  {/* Prompt Chips */}
                  {m.suggested_prompts && m.suggested_prompts.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#232D42] flex flex-wrap gap-1.5">
                      {m.suggested_prompts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSend(p)}
                          className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[10px] font-medium transition-all"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 text-slate-400 text-xs items-center">
                <Bot className="w-4 h-4 text-blue-400 animate-spin" />
                <span>AI analyzing spending patterns...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#151C2C] border-t border-[#232D42] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything about your money..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-xl gradient-button text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
