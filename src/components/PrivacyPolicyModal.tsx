import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Database, Cpu, ExternalLink, Heart } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="w-full max-w-xl max-h-[85vh] flex flex-col bg-[#0b101d] border border-white/[0.1] rounded-2xl shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight">Privacy Policy & Architecture</h3>
                  <p className="text-xs text-slate-400">Transparent, client-first diagnostic security</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed custom-scrollbar">
              {/* Section 1 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wide uppercase font-mono">
                  <Cpu className="w-4 h-4" />
                  <span>100% Client-Side & Offline Execution</span>
                </div>
                <p className="text-xs text-slate-400">
                  Coditech operates on an offline-first architecture. All <strong className="text-slate-200">14,800+ error patterns</strong> and diagnostic rules are evaluated entirely inside your browser's local JavaScript runtime. When you click <strong className="text-emerald-400">Quick Diagnosis</strong>, zero bytes of your code or error logs are sent to any remote server.
                </p>
              </div>

              {/* Section 2 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wide uppercase font-mono">
                  <Lock className="w-4 h-4" />
                  <span>Optional AI Escalation (Gemini)</span>
                </div>
                <p className="text-xs text-slate-400">
                  If you choose to use <strong className="text-slate-200">✦ Ask AI</strong>, only the specific code and language you provided in the input field are transmitted to Google's Gemini API via your configured backend or personal API key. We do not store, log, or sell your source code.
                </p>
              </div>

              {/* Section 3 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs tracking-wide uppercase font-mono">
                  <Database className="w-4 h-4" />
                  <span>Local Browser Storage</span>
                </div>
                <p className="text-xs text-slate-400">
                  Your recent diagnostic history and preferences are preserved exclusively in your browser's <code className="text-emerald-300 font-mono text-[11px] bg-slate-900 px-1 py-0.5 rounded">localStorage</code>. No tracking cookies, tracking pixels, or third-party advertising scripts are loaded. You can clear your session history at any time with one click.
                </p>
              </div>

              {/* Section 4: Creator Credits */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span>Crafted with</span>
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>by Anmol & Anand</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Open-source project built for modern developers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/Anmolop97"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-emerald-300 text-xs font-medium border border-white/[0.1] transition-all hover:scale-105 shrink-0"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>@Anmolop97</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                  <a
                    href="https://github.com/anand05-cell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-cyan-300 text-xs font-medium border border-white/[0.1] transition-all hover:scale-105 shrink-0"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>@anand05-cell</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-black/20 flex items-center justify-end">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/[0.1] transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
