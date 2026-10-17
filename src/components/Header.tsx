import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Settings, History } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onToggleHistory,
  historyCount
}) => {
  return (
    <header className="flex items-center justify-between py-6 px-4 sm:px-8 border-b border-white/[0.06] backdrop-blur-md sticky top-0 z-40 bg-[#060911]/80">
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[#060911] shadow-[0_0_24px_rgba(94,234,212,0.25)] font-black text-xl"
        >
          <Terminal className="w-5 h-5 stroke-[2.5]" />
        </motion.div>
        <div>
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg text-slate-100">
            <span>coditech</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(94,234,212,0.8)]"></span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-wide hidden sm:block">
            deterministic error diagnostics
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] font-medium text-slate-300">14,000+ rules engine active</span>
        </div>

        <motion.button
          onClick={onToggleHistory}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium transition-colors shadow-sm"
          title="Recent Sessions"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Sessions</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-semibold">
              {historyCount}
            </span>
          )}
        </motion.button>

        <motion.button
          onClick={onOpenSettings}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium transition-colors shadow-sm"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Settings</span>
        </motion.button>

        <motion.a
          href="https://github.com/Anmolop97"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium transition-colors shadow-sm"
          title="GitHub @Anmolop97"
        >
          <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline font-mono text-[11px]">GitHub</span>
        </motion.a>
      </div>
    </header>
  );
};
