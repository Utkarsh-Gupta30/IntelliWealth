import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, AlertCircle, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import apiClient from '../api/client';

export const EducationPage = () => {
  const [topics, setTopics] = useState([]);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/education/topics'),
      apiClient.get('/education/ai-suggestion')
    ]).then(([topRes, aiRes]) => {
      setTopics(topRes.data);
      setAiAdvice(aiRes.data);
      if (topRes.data.length > 0) setSelectedTopic(topRes.data[0]);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-500">Loading Investment Modules...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Investment Education & Strategy</h2>
        <p className="text-xs text-slate-400 mt-1">Learn fundamental investment concepts with non-personalized educational AI guidance.</p>
      </div>

      {/* AI Tailored Educational Suggestion Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white font-display">AI Educational Roadmap tailored to your Profile</h3>
        </div>

        <div className="space-y-2 mb-4 text-xs text-slate-300">
          {aiAdvice?.educational_advice?.map((adv, i) => (
            <div key={i} className="flex items-start gap-2 bg-[#0B0F17]/60 p-3 rounded-xl border border-[#232D42]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{adv}</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{aiAdvice?.disclaimer}</span>
        </div>
      </div>

      {/* Topic Master-Detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Tabs List */}
        <div className="space-y-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t)}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                selectedTopic?.id === t.id
                  ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-lg'
                  : 'bg-[#151C2C] border-[#232D42] text-slate-400 hover:text-white hover:bg-[#1C263B]'
              }`}
            >
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-0.5">{t.category}</span>
                <h4 className="text-xs font-bold text-white">{t.title}</h4>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          ))}
        </div>

        {/* Selected Topic Content Detail Panel */}
        {selectedTopic && (
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-[#232D42] space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase">
                {selectedTopic.category}
              </span>
              <h3 className="text-xl font-bold font-display text-white mt-2">{selectedTopic.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedTopic.definition}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
                <h4 className="text-xs font-bold text-emerald-400 mb-2">Key Benefits</h4>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {selectedTopic.benefits?.map((b, i) => <li key={i}>• {b}</li>)}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
                <h4 className="text-xs font-bold text-rose-400 mb-2">Risks & Considerations</h4>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {selectedTopic.risks?.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
              <h4 className="text-xs font-bold text-blue-400 mb-1">Real World Example</h4>
              <p className="text-xs text-slate-300">{selectedTopic.examples}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
              <h4 className="text-xs font-bold text-white mb-2">Beginner Tips</h4>
              <p className="text-xs text-slate-300">{selectedTopic.beginner_tips}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
