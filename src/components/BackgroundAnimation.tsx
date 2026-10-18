import React from 'react';

export const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Real Cinematic Hellspires Background */}
      <div className="absolute inset-0">
        <img
          src="/hellspires-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-top opacity-40 sm:opacity-50 select-none scale-[1.02] filter contrast-110 brightness-95"
          loading="eager"
        />
        {/* Calibrated Vignette Overlays for Flawless Text & Card Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060911]/75 via-[#060911]/60 to-[#060911]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,transparent_0%,#060911_85%)]" />
      </div>

      {/* Precision Micro-Dot Matrix Grid */}
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 75% at 50% 15%, black 45%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 75% at 50% 15%, black 45%, transparent 95%)',
        }}
      />

      {/* Orb 1 (Emerald Glow): Top-left breathing float */}
      <div className="absolute -top-24 -left-24 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-teal-600/5 blur-[140px] animate-aurora-1 will-change-transform" />

      {/* Orb 2 (Cyan Aurora): Top-right organic drift towards center */}
      <div className="absolute top-10 -right-24 w-[720px] h-[720px] rounded-full bg-gradient-to-bl from-cyan-400/20 via-sky-500/10 to-blue-600/5 blur-[150px] animate-aurora-2 will-change-transform" />

      {/* Orb 3 (Deep Teal Accent): Workspace container backdrop subtle pulse */}
      <div className="absolute top-[28%] left-1/2 w-[820px] h-[480px] rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-400/15 to-cyan-500/10 blur-[150px] animate-aurora-3 will-change-transform" />

      {/* Seamless Bottom Vignette Fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060911]" />
    </div>
  );
};
