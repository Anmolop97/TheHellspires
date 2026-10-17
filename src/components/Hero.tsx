import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="mb-10 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3 font-mono">
            <span className="w-6 h-[1px] bg-emerald-400/80"></span>
            <span>Intelligent Debugging Workspace</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-4">
            Find the bug.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Keep the flow.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Turn cryptic errors into clear, verified solutions. Start with instant offline rule-based diagnostics, then escalate to AI for multi-file root cause analysis.
          </p>
        </div>

        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="tactile-card p-3.5 rounded-xl border border-white/[0.08]"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <Code2 className="w-4 h-4 opacity-75" />
              <span className="text-[10px] font-mono font-medium text-emerald-400/80">CORE</span>
            </div>
            <strong className="block text-2xl font-bold text-white tracking-tight font-mono">18+</strong>
            <span className="text-slate-400 text-xs font-medium">Languages</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="tactile-card p-3.5 rounded-xl border border-white/[0.08]"
          >
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <Cpu className="w-4 h-4 opacity-75" />
              <span className="text-[10px] font-mono font-medium text-cyan-400/80">LOCAL</span>
            </div>
            <strong className="block text-2xl font-bold text-white tracking-tight font-mono">14,000+</strong>
            <span className="text-slate-400 text-xs font-medium">Patterns</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="tactile-card p-3.5 rounded-xl border border-white/[0.08]"
          >
            <div className="flex items-center justify-between text-teal-400 mb-1">
              <CheckCircle2 className="w-4 h-4 opacity-75" />
              <span className="text-[10px] font-mono font-medium text-teal-400/80">FIX</span>
            </div>
            <strong className="block text-2xl font-bold text-white tracking-tight font-mono">01</strong>
            <span className="text-slate-400 text-xs font-medium">Clear Step</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
