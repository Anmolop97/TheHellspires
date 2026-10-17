import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, RotateCcw, CheckCircle, ChevronDown, ArrowRight } from 'lucide-react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiagnosticCard } from './components/DiagnosticCard';
import { NovaAvatar } from './components/NovaAvatar';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { HistorySidebar } from './components/HistorySidebar';
import type { HistoryItem } from './components/HistorySidebar';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { SUPPORTED_LANGUAGES, EXAMPLE_CHIPS, analyzeError } from './data/rules';
import type { DiagnosticRule } from './data/rules';

const STORAGE_KEY_HISTORY = 'coditech_v2_history';
const STORAGE_KEY_API_KEY = 'coditech_v2_api_key';

export function App() {
  const [errorInput, setErrorInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('JavaScript');
  const [diagMode, setDiagMode] = useState<'instant' | 'ai'>('instant');
  const [activeRule, setActiveRule] = useState<DiagnosticRule | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load history & API key on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY);
      if (savedKey) setApiKey(savedKey);
    } catch (e) {
      console.error('Failed to load local storage', e);
    }
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveToHistory = (errorText: string, lang: string, answerText: string, kind: 'quick' | 'ai') => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      language: lang,
      error: errorText,
      answer: answerText,
      kind,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };
    const updated = [newItem, ...history.slice(0, 99)];
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch {
      showToast('Storage full; session not saved');
    }
  };

  // Run instant deterministic quick fix
  const handleQuickFix = () => {
    if (!errorInput.trim()) {
      showToast('Paste an error message or code snippet first');
      return;
    }

    setIsLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      const match = analyzeError(errorInput, selectedLang);
      setIsLoading(false);
      setActiveRule(match);

      if (match) {
        saveToHistory(
          errorInput,
          selectedLang,
          `${match.title}\n\n${match.what}\n\nFix:\n${match.fix.join('\n')}`,
          'quick'
        );
        showToast('Diagnosis ready');
      }
    }, 200);
  };

  // Escalate to AI
  const handleAskAI = async () => {
    if (!errorInput.trim()) {
      showToast('Paste an error message or code snippet first');
      return;
    }

    setIsLoading(true);

    try {
      const match = analyzeError(errorInput, selectedLang);
      setActiveRule(match);

      if (!apiKey) {
        // High-intelligence local diagnosis without duplicate card spam
        setTimeout(() => {
          setIsLoading(false);
          setAiResponse(null);
          if (match) {
            saveToHistory(
              errorInput,
              selectedLang,
              `${match.title}\n\n${match.what}\n\nFix:\n${match.fix.join('\n')}`,
              'ai'
            );
          }
          showToast('Diagnosis complete');
        }, 250);
        return;
      }

      // Live Gemini API call
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an elite senior design and systems engineer diagnosing a ${selectedLang} error. Provide a concise, highly actionable explanation of why this error happens and exact code to fix it:\n\nError/Code:\n${errorInput}`
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from AI.';
      setIsLoading(false);
      setAiResponse(text);
      saveToHistory(errorInput, selectedLang, text, 'ai');
      showToast('AI analysis complete');
    } catch (err: any) {
      setIsLoading(false);
      showToast('AI request failed: ' + (err.message || 'Check network'));
    }
  };

  // Keyboard shortcut: Ctrl + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleDiagnose();
    }
  };

  // Unified trigger based on selected mode
  const handleDiagnose = () => {
    if (diagMode === 'ai') {
      handleAskAI();
    } else {
      handleQuickFix();
    }
  };

  // Populate example
  const handleSelectExample = (lang: string, error: string) => {
    setSelectedLang(lang);
    setErrorInput(error);
    const match = analyzeError(error, lang);
    setActiveRule(match);
    setAiResponse(null);
  };

  // Restore history item
  const handleRestoreSession = (item: HistoryItem) => {
    setSelectedLang(item.language);
    setErrorInput(item.error);
    const match = analyzeError(item.error, item.language);
    setActiveRule(match);
    if (item.kind === 'ai') {
      setAiResponse(item.answer);
    } else {
      setAiResponse(null);
    }
    setIsHistoryOpen(false);
    showToast('Session restored');
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-x-hidden">
      {/* Living Ambient Cyber Aurora & Micro-Dot Grid */}
      <BackgroundAnimation />

      {/* Main Content Layers */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <Hero />

        {/* Modern AI Studio Workspace Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Modern Input & Controls Panel */}
          <section className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl p-6 sm:p-7 border border-white/[0.08] bg-[#0c121e]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
              {/* Subtle ambient bloom behind card */}
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Clean spacious modern input */}
              <div className="relative min-h-[170px]">
                <textarea
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your error, stack trace, or code snippet..."
                  rows={7}
                  className="w-full bg-transparent text-sm sm:text-base font-mono text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/25 selection:text-emerald-200"
                />
              </div>

              {/* Floating integrated bottom action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Language Selector Pill */}
                  <div className="relative">
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="appearance-none bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] rounded-full pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer transition-colors"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                          {lang}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Mode Switcher Pill */}
                  <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/[0.1]">
                    <button
                      type="button"
                      onClick={() => setDiagMode('instant')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        diagMode === 'instant'
                          ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Instant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiagMode('ai')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        diagMode === 'ai'
                          ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Deep AI</span>
                    </button>
                  </div>
                </div>

                {/* Primary Action Button & Clear */}
                <div className="flex items-center gap-2.5">
                  {errorInput && (
                    <button
                      onClick={() => {
                        setErrorInput('');
                        setActiveRule(null);
                        setAiResponse(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={handleDiagnose}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 text-slate-950 font-bold text-xs tracking-tight transition-all shadow-[0_0_24px_rgba(52,211,153,0.35)] hover:shadow-[0_0_32px_rgba(52,211,153,0.5)] disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isLoading ? 'Diagnosing...' : 'Diagnose Error'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Quick Scenario Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
              {EXAMPLE_CHIPS.slice(0, 5).map((chip, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={() => handleSelectExample(chip.lang, chip.error)}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 transition-all font-medium cursor-pointer"
                >
                  {chip.label}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Diagnostic Result / Companion Column */}
          <section className="lg:col-span-5">
            <DiagnosticCard
              rule={activeRule}
              aiResponse={aiResponse}
              isLoading={isLoading}
            />

            {!activeRule && !aiResponse && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="relative rounded-3xl p-8 border border-white/[0.08] bg-[#0c121e]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center flex flex-col items-center overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-transparent blur-3xl rounded-full pointer-events-none" />

                <div className="relative mb-3 z-10">
                  <NovaAvatar animation="idle" size={140} />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 z-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span>Model Ready</span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-4 z-10">
                  Instant AI Code Diagnostics
                </h3>

                <div className="space-y-2.5 text-left w-full max-w-xs mx-auto z-10">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Root cause isolation</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <span>One-click verified fix</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>Multi-language AST support</span>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </main>

        {/* Footer with Creator Credits & Links */}
        <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />
      </div>

      {/* Slide-over History Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleRestoreSession}
        onDelete={(id) => {
          const updated = history.filter((x) => x.id !== id);
          setHistory(updated);
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        }}
        onClearAll={() => {
          setHistory([]);
          localStorage.removeItem(STORAGE_KEY_HISTORY);
          showToast('History cleared');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(key) => {
          setApiKey(key);
          localStorage.setItem(STORAGE_KEY_API_KEY, key);
          showToast('API key updated');
        }}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Toast Notification with Emil Kowalski spring entrance */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
