import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="mb-10 pt-4">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 mb-4 backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-slate-300/90 font-medium tracking-wide text-[11px]">Intelligent Debugging Workspace</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-4 font-sans">
          Find the bug.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Keep the flow.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Turn cryptic errors into clear, verified solutions. Start with instant offline rule-based diagnostics, then escalate to AI for multi-file root cause analysis.
        </p>
      </div>
    </section>
  );
};
