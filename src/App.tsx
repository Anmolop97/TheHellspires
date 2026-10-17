import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, RotateCcw, CheckCircle, ChevronDown } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiagnosticCard } from './components/DiagnosticCard';
import { NovaAvatar } from './components/NovaAvatar';
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
      } else {
        showToast('No exact local rule match. Try Ask AI!');
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
      if (!apiKey) {
        // Fallback demonstration mode if no API key is provided
        setTimeout(() => {
          setIsLoading(false);
          const simulatedAI = `Coditech AI Analysis for ${selectedLang}:\n\n` +
            `Root Cause Analysis:\nThe error reported stems from an unhandled boundary condition in the execution flow. ` +
            `When '${selectedLang}' processes this statement, the memory reference or object prototype fails to resolve.\n\n` +
            `Recommended Refactoring:\n` +
            `1. Introduce runtime assertion checks before the failure point.\n` +
            `2. Check that upstream payloads adhere to the expected schema.\n` +
            `3. For production grade resilience, attach error boundaries or recovery hooks.\n\n` +
            `💡 Tip: Provide your Gemini API Key in Settings (⚙) to enable live multi-turn reasoning!`;
          
          setAiResponse(simulatedAI);
          saveToHistory(errorInput, selectedLang, simulatedAI, 'ai');
          showToast('AI analysis complete');
        }, 800);
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
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Navigation */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Hero />

        {/* Main Workspace Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input & Controls Panel */}
          <section className="lg:col-span-7 space-y-6">
            <div className="tactile-card rounded-2xl p-6 border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    STEP 01
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight">Describe the Problem</h2>
                </div>
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="appearance-none bg-slate-900 border border-white/[0.1] rounded-lg px-3 py-1.5 pr-8 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                        {lang}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Textarea Code/Error input */}
              <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#070b13] focus-within:border-emerald-500/40 transition-colors">
                <textarea
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Paste error message, stack trace, or buggy snippet...\n\nExample:\nTypeError: Cannot read properties of undefined (reading 'name')`}
                  rows={8}
                  className="w-full p-4 bg-transparent text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none resize-y leading-relaxed"
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.04] bg-slate-950/40 text-[11px] text-slate-500 font-mono">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-slate-300">Ctrl + Enter</kbd> to diagnose</span>
                  <span>{errorInput.length} chars</span>
                </div>
              </div>

              {/* Action Buttons with Emil Kowalski spring scale */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={handleQuickFix}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors shadow-[0_0_20px_rgba(94,234,212,0.25)]"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Quick Fix</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={handleAskAI}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Ask AI</span>
                  </motion.button>
                </div>

                <button
                  onClick={() => {
                    setErrorInput('');
                    setActiveRule(null);
                    setAiResponse(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Pre-canned Example Chips */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <span className="text-[11px] text-slate-400 font-mono block mb-2 font-medium">
                  Try an example pattern:
                </span>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_CHIPS.map((chip, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      onClick={() => handleSelectExample(chip.lang, chip.error)}
                      className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/[0.08] hover:border-emerald-500/40 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors"
                    >
                      {chip.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Diagnostic Result Column */}
          <section className="lg:col-span-5">
            <DiagnosticCard
              rule={activeRule}
              aiResponse={aiResponse}
              isLoading={isLoading}
            />

            {!activeRule && !aiResponse && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="tactile-card rounded-2xl p-8 border border-white/[0.08] text-center flex flex-col items-center relative overflow-hidden"
              >
                <div className="relative mb-2">
                  <NovaAvatar animation="idle" size={150} />
                  <span className="absolute bottom-1 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-[#0c121e]"></span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span>Nova AI Assistant Ready</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Meet Nova, Your AI Debugger</h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Paste an error message or broken code on the left, and Nova will analyze AST context, trace root causes, and write the fix.
                </p>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* Footer with Creator Credits & Links */}
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

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
