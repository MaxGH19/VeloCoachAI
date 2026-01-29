
import React, { useState } from 'react';
import Hero from './components/Hero.tsx';
import Questionnaire from './components/Questionnaire.tsx';
import TrainingPlanDisplay from './components/TrainingPlanDisplay.tsx';
import Loader from './components/Loader.tsx';
import { UserProfile, FullTrainingPlan } from './types.ts';
import { generateTrainingPlan } from './services/geminiService.ts';

enum AppState { LANDING, QUESTIONNAIRE, LOADING, DISPLAY }

// Note: Removed local declaration of aistudio to avoid duplication with environment-provided types.
// We use (window as any).aistudio to safely access the pre-configured environment methods.

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [plan, setPlan] = useState<FullTrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    // Vor dem Start prüfen, ob ein API-Key vorhanden ist (für Browser-Umgebungen)
    if (typeof (window as any).aistudio !== 'undefined') {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      } catch (e) {
        console.warn("API Key check failed, proceeding anyway.");
      }
    }
    setState(AppState.QUESTIONNAIRE);
  };

  const handleCancel = () => setState(AppState.LANDING);

  const handleSubmit = async (profile: UserProfile) => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const generatedPlan = await generateTrainingPlan(profile);
      setPlan(generatedPlan);
      setState(AppState.DISPLAY);
    } catch (err: any) {
      console.error("Plan Error:", err);
      // Falls der Key fehlt oder ungültig ist, den Dialog erneut triggern
      if (err.message.includes("API Key must be set") || err.message.includes("entity was not found")) {
        setError("API Key fehlt oder ist ungültig. Bitte wähle einen Key aus.");
        if (typeof (window as any).aistudio !== 'undefined') {
          await (window as any).aistudio.openSelectKey();
        }
      } else {
        setError(err.message || "Es gab ein Problem. Bitte versuche es erneut.");
      }
      setState(AppState.LANDING);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setState(AppState.LANDING);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-emerald-500/30">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <i className="fas fa-bolt text-slate-950 text-sm"></i>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-white">
              VELOCOACH.<span className="text-emerald-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[10px] font-bold text-slate-500 tracking-widest uppercase italic">Elite Performance</span>
            <button className="px-4 py-1.5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/5 transition-all uppercase tracking-tighter">
              Login
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col overflow-x-hidden">
        {error && (
          <div className="max-w-md mx-auto mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 animate-bounce z-50">
            <i className="fas fa-exclamation-circle text-xl"></i>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center relative">
          {state === AppState.LANDING && <Hero onStart={handleStart} />}
          {state === AppState.QUESTIONNAIRE && <Questionnaire onSubmit={handleSubmit} onCancel={handleCancel} />}
          {state === AppState.LOADING && <Loader />}
          {state === AppState.DISPLAY && plan && <TrainingPlanDisplay plan={plan} onReset={handleReset} />}
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© 2025 VELOCOACH.AI • BORN IN GERMANY</div>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-emerald-400">Datenschutz</a>
            <a href="#" className="hover:text-emerald-400">AGB</a>
            <a href="#" className="hover:text-emerald-400">Impressum</a>
          </div>
          <div className="text-slate-700 text-[10px] font-mono">VER. 1.0.5-STABLE</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
