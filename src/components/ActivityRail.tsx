import React from 'react';
import { motion } from 'framer-motion';
import { Files, Bug, History, Settings, Shield } from 'lucide-react';

export type ActiveTab = 'files' | 'debug' | 'history' | 'settings';

interface ActivityRailProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  historyCount: number;
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  activeTab,
  onSelectTab,
  historyCount
}) => {
  const navItems = [
    { id: 'debug' as ActiveTab, icon: Bug, label: 'Bug Scanner' },
    { id: 'files' as ActiveTab, icon: Files, label: 'Explorer' },
    { id: 'history' as ActiveTab, icon: History, label: 'Past Sessions', badge: historyCount },
  ];

  return (
    <aside className="w-13 h-full border-r border-white/[0.08] bg-[#060608] flex flex-col items-center justify-between py-3 z-20 select-none">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_16px_rgba(45,212,191,0.25)] bg-[#050b11] flex items-center justify-center p-0.5 cursor-pointer"
          title="Coditech Studio"
        >
          <img 
            src="/coditech-icon.png" 
            alt="Coditech Logo" 
            className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(45,212,191,0.35)]" 
          />
        </motion.div>

        {/* Navigation Rail Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => onSelectTab(item.id)}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-white/[0.12] text-white border border-white/[0.2] shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
                {isActive && (
                  <motion.span
                    layoutId="rail-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r"
                  />
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-black"></span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings Button */}
      <div className="flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onSelectTab('settings')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </motion.button>

        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-mono text-zinc-400" title="Security Verified">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>
    </aside>
  );
};
