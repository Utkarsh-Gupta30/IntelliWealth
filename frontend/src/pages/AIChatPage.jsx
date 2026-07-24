import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Trash2 } from 'lucide-react';
import apiClient from '../api/client';

export const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/chat/history');
      if (res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([
          {
            sender: 'bot',
            message: 'Hello! I am your IntelliWealth AI Financial Coach. Ask me how to optimize your spending, save ₹5,000, or explain SIP & Mutual Funds!',
            suggested_prompts: ['How much did I spend on food?', 'How can I save ₹5,000?', 'Explain SIP', 'Why is my Financial Score low?']
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', message: query, timestamp: new Date().toISOString() };
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
          suggested_prompts: res.data.suggested_prompts,
          timestamp: res.data.timestamp
        }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', message: 'Encountered an error fetching financial insights.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">AI Financial Assistant</h2>
        <p className="text-xs text-slate-400 mt-0.5">Ask questions about your transactions, saving strategies, or investment terms.</p>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border border-[#232D42] overflow-hidden flex flex-col">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 shrink-0 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-[#0B0F17] border border-[#232D42] text-slate-200 rounded-bl-none'
              }`}>
                {m.message}

                {m.suggested_prompts && m.suggested_prompts.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#232D42] flex flex-wrap gap-2">
                    {m.suggested_prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(p)}
                        className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium transition-all"
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
              <span>Analyzing ledger & processing answer...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#151C2C] border-t border-[#232D42] flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask: 'How much did I spend on food?' or 'Explain SIP'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#0B0F17] border border-[#232D42] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            className="gradient-button px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2"
          >
            <span>Send</span> <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
