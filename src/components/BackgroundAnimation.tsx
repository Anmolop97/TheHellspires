import React from 'react';

export const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Precision Micro-Dot Matrix Grid */}
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] opacity-75"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 75% at 50% 15%, black 45%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 75% at 50% 15%, black 45%, transparent 95%)',
        }}
      />

      {/* Orb 1 (Emerald Glow): Top-left breathing float */}
      <div className="absolute -top-24 -left-24 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-emerald-400/25 via-emerald-500/15 to-teal-600/5 blur-[130px] animate-aurora-1 will-change-transform" />

      {/* Orb 2 (Cyan Aurora): Top-right organic drift towards center */}
      <div className="absolute top-10 -right-24 w-[720px] h-[720px] rounded-full bg-gradient-to-bl from-cyan-400/25 via-sky-500/15 to-blue-600/5 blur-[140px] animate-aurora-2 will-change-transform" />

      {/* Orb 3 (Deep Teal Accent): Workspace container ke peeche subtle radial pulse */}
      <div className="absolute top-[28%] left-1/2 w-[820px] h-[480px] rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-400/20 to-cyan-500/15 blur-[140px] animate-aurora-3 will-change-transform" />

      {/* Seamless Bottom Vignette Fade (No harsh top line) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060911]/80" />
    </div>
  );
};
