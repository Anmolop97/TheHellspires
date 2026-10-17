import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ChevronDown, Send, Bot, CheckCircle2, Wand2, GitCommit, ShieldAlert } from 'lucide-react';
import type { DiagnosticRule } from '../data/rules';

interface AIAgentPaneProps {
  rule: DiagnosticRule | null;
  aiResponse?: string | null;
  isLoading?: boolean;
  onApplyPatch?: (code: string) => void;
  onAskFollowup?: (question: string) => void;
}

export const AIAgentPane: React.FC<AIAgentPaneProps> = ({
  rule,
  aiResponse,
  isLoading,
  onApplyPatch,
  onAskFollowup
}) => {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(true);
  const [followupText, setFollowupText] = useState('');

  const copyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (codeText: string) => {
    if (!onApplyPatch) return;
    onApplyPatch(codeText);
    setApplied(true);
    setTimeout(() => setApplied(false), 2200);
  };

  const handleSendFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupText.trim() || !onAskFollowup) return;
    onAskFollowup(followupText.trim());
    setFollowupText('');
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          className="space-y-4 max-w-xs"
        >
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            <Wand2 className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Tracing Code Context...</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">Analyzing abstract syntax tree & memory boundaries</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!rule && !aiResponse) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 mb-3 shadow-[0_0_24px_rgba(255,255,255,0.03)]">
          <Bot className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-sm font-semibold text-white tracking-wide">AI Agent Standby</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed font-sans">
          Select or paste an error in the editor, then press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.14] text-white font-mono text-[11px]">Ctrl + Enter</kbd> to trace the root cause.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rule?.title || "ai-response"}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
        transition={{ type: "spring", stiffness: 450, damping: 32 }}
        className="h-full flex flex-col justify-between overflow-y-auto pr-1"
      >
        <div className="space-y-4">
          {/* Agent Status & Timeline */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span className="font-bold text-white tracking-tight">AI Agent Inspection</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">3-Point Verification</span>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="flex items-center gap-1.5 text-zinc-300 bg-white/[0.04] p-1.5 rounded-lg border border-white/[0.06]">
                <Check className="w-3 h-3 text-white" />
                <span>AST Parsed</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300 bg-white/[0.04] p-1.5 rounded-lg border border-white/[0.06]">
                <Check className="w-3 h-3 text-white" />
                <span>Root Traced</span>
              </div>
              <div className="flex items-center gap-1.5 text-white bg-white/[0.08] p-1.5 rounded-lg border border-white/[0.14]">
                <Check className="w-3 h-3 text-white" />
                <span>Patch Ready</span>
              </div>
            </div>
          </div>

          {/* Diagnosis Headline */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-black bg-white px-2 py-0.5 rounded">
                VERIFIED FIX
              </span>
              <span className="text-xs text-zinc-400 font-mono">Senior Engineer Review</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight font-sans">
              {rule?.title || "AI Deep Diagnostics"}
            </h2>
            {rule && (
              <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                {rule.what}
              </p>
            )}
          </div>

          {/* AI Response Text (if active) */}
          {aiResponse && (
            <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.1]">
              {aiResponse}
            </div>
          )}

          {/* Interactive Live Diff / Fix Box */}
          {rule?.code && (
            <div className="rounded-xl overflow-hidden border border-white/[0.12] bg-[#050507] shadow-xl">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.08] bg-white/[0.04] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-medium text-[11px]">Proposed Patch</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleApply(rule.code || "")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-zinc-200 text-black font-bold transition-colors text-[10px] shadow-sm"
                  >
                    {applied ? (
                      <>
                        <Check className="w-3 h-3 text-black" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 text-black" />
                        <span>Apply to Editor</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={() => copyCode(rule.code || "")}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Snippet with Diff Highlighting */}
              <pre className="p-3.5 text-xs font-mono text-zinc-100 overflow-x-auto leading-relaxed bg-black/60">
                <code>{rule.code}</code>
              </pre>
            </div>
          )}

          {/* Collapsible Deep Reasoning & Root Causes */}
          {rule && (
            <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setIsReasoningOpen(!isReasoningOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Root Causes & Edge Cases ({rule.why.length})</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isReasoningOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isReasoningOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="px-3.5 pb-3.5 pt-1 border-t border-white/[0.06] bg-black/40 space-y-3"
                  >
                    <div>
                      <ul className="space-y-1.5 text-[11px] text-zinc-300 pt-1">
                        {rule.why.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-zinc-500">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Prevention Checklist:
                      </span>
                      <ul className="space-y-1 text-[11px] text-zinc-300">
                        {rule.fix.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-white shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Interactive Follow-Up Bar at Bottom */}
        <div className="pt-3 border-t border-white/[0.08] mt-3">
          <form onSubmit={handleSendFollowup} className="relative flex items-center">
            <input
              type="text"
              value={followupText}
              onChange={(e) => setFollowupText(e.target.value)}
              placeholder="Ask a follow-up (e.g. Why does this work?)..."
              className="w-full pl-3 pr-9 py-2 bg-white/[0.04] border border-white/[0.1] focus:border-white/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!followupText.trim()}
              className="absolute right-1.5 p-1.5 rounded-lg bg-white disabled:bg-white/10 text-black disabled:text-zinc-600 transition-colors"
              title="Send Follow-Up"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
