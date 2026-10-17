import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Cpu } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface FooterProps {
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-[#04070d]/80 backdrop-blur-md py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/coditech-icon.png" 
              alt="Coditech Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,245,212,0.4)]" 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm text-slate-200">
              <span>coditech</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(94,234,212,0.8)]"></span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Deterministic error diagnostics & offline knowledge engine
            </p>
          </div>
        </div>

        {/* Center Creator Credits */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" /> by
          </span>
          <motion.a
            href="https://github.com/Anmolop97"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-emerald-300 hover:text-emerald-200 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-medium font-mono transition-colors shadow-sm"
          >
            <GithubIcon className="w-3 h-3 text-slate-300" />
            <span>Anmolop97</span>
          </motion.a>
          <span className="text-xs text-slate-500">&</span>
          <motion.a
            href="https://github.com/anand05-cell"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-medium font-mono transition-colors shadow-sm"
          >
            <GithubIcon className="w-3 h-3 text-slate-300" />
            <span>anand05-cell</span>
          </motion.a>
        </div>

        {/* Right Action Links */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.06] text-[11px] font-mono text-slate-400">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>14,800+ Rules</span>
          </div>

          <motion.button
            onClick={onOpenPrivacy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Policy</span>
          </motion.button>

          <motion.a
            href="https://github.com/Anmolop97"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </motion.a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/[0.04] text-center text-[11px] text-slate-400">
        © 2026 Coditech. Crafted by <a href="https://github.com/Anmolop97" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white underline underline-offset-2">Anmolop97</a> & <a href="https://github.com/anand05-cell" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white underline underline-offset-2">anand05-cell</a>. Open source & privacy first.
      </div>
    </footer>
  );
};
