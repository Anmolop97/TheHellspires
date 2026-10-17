import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, AlertCircle, Sparkles, Terminal } from 'lucide-react';
import { NovaAvatar } from './NovaAvatar';
import type { DiagnosticRule } from '../data/rules';

interface DiagnosticCardProps {
  rule: DiagnosticRule | null;
  aiResponse?: string | null;
  isLoading?: boolean;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  rule,
  aiResponse,
  isLoading
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="rounded-3xl p-8 border border-emerald-500/20 bg-[#0c121e]/80 backdrop-blur-2xl text-center relative overflow-hidden flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/10 to-emerald-500/5 animate-pulse pointer-events-none"></div>
        <NovaAvatar animation="working" size={130} />
        <h3 className="text-base font-bold text-white mt-3">Nova is analyzing error context...</h3>
        <p className="text-xs text-slate-400 mt-1 font-mono">Tracing AST patterns & root cause</p>
      </motion.div>
    );
  }

  if (!rule && !aiResponse) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rule?.title || "ai-response"}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="space-y-4"
      >
        {/* Core Diagnosis Card */}
        {rule && (
          <div className="rounded-3xl p-6 sm:p-7 border border-emerald-500/20 bg-[#0c121e]/80 backdrop-blur-2xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm p-1">
                  <NovaAvatar animation="proud" size={42} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>Verified Diagnosis</span>
                    </span>
                    {rule.category && (
                      <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25">
                        {rule.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight font-sans">
                    {rule.title}
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
              {rule.what}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
              {/* Why It May Happen */}
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Why It Happens</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {rule.why.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400/80 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Next Steps */}
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-3">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Suggested Next Steps</span>
                </div>
                <ol className="space-y-2 text-xs text-slate-300">
                  {rule.fix.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Code Solution Snippet */}
            {rule.code && (
              <div className="mt-5 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070b13]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-slate-950/60 text-xs text-slate-400 font-mono">
                  <span>Suggested Code Fix</span>
                  <button
                    onClick={() => copyCode(rule.code || "")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[11px]">Copy snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                  <code>{rule.code}</code>
                </pre>
              </div>
            )}

            {/* Optional AI Multi-Turn Tip */}
            {!aiResponse && (
              <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Want live multi-turn reasoning?</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-300/90">Add free Gemini API Key in Settings (⚙)</span>
              </div>
            )}
          </div>
        )}

        {/* AI Deeper Escalation Output */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="rounded-3xl p-6 sm:p-7 border border-cyan-500/25 bg-[#0c121e]/80 backdrop-blur-2xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-2.5 text-cyan-400 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Coditech AI · Deep Analysis</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {aiResponse}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
