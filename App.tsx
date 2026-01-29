
import React, { useState } from 'react';
import Hero from './components/Hero.tsx';
import Questionnaire from './components/Questionnaire.tsx';
import TrainingPlanDisplay from './components/TrainingPlanDisplay.tsx';
import Loader from './components/Loader.tsx';
import LegalView from './components/LegalView.tsx';
import { UserProfile, FullTrainingPlan } from './types.ts';
import { generateTrainingPlan } from './services/geminiService.ts';

enum AppState { LANDING, QUESTIONNAIRE, LOADING, DISPLAY, PRIVACY, IMPRINT }

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [plan, setPlan] = useState<FullTrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setError(null);
    setState(AppState.QUESTIONNAIRE);
  };

  const handleSubmit = async (profile: UserProfile) => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const generatedPlan = await generateTrainingPlan(profile);
      setPlan(generatedPlan);
      setState(AppState.DISPLAY);
    } catch (err: any) {
      console.error("Plan Creation Error:", err);
      let message = "Der KI-Coach ist gerade nicht erreichbar. Bitte später versuchen.";
      
      if (err.message === "API_KEY_MISSING") {
        message = "Systemfehler: API-Konfiguration fehlt (Environment Variable prüfen).";
      }
      
      setError(message);
      setState(AppState.LANDING);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setState(AppState.LANDING);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-emerald-500/30">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
              <i className="fas fa-bolt text-slate-950 text-sm"></i>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-white italic">
              VELOCOACH.<span className="text-emerald-500">AI</span>
            </span>
          </div>
          <button className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
            Login
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col relative overflow-hidden">
        {error && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-slate-900 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-xl animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center relative">
          {state === AppState.LANDING && <Hero onStart={handleStart} />}
          {state === AppState.QUESTIONNAIRE && <Questionnaire onSubmit={handleSubmit} onCancel={() => setState(AppState.LANDING)} />}
          {state === AppState.LOADING && <Loader />}
          {state === AppState.DISPLAY && plan && <TrainingPlanDisplay plan={plan} onReset={handleReset} />}
          {state === AppState.PRIVACY && <LegalView type="privacy" onClose={() => setState(AppState.LANDING)} />}
          {state === AppState.IMPRINT && <LegalView type="imprint" onClose={() => setState(AppState.LANDING)} />}
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 bg-slate-900/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            {/* Logo Section */}
            <div className="flex justify-center md:justify-start">
              <div onClick={handleReset} className="cursor-pointer">
                <span className="font-bold text-white text-[10px] tracking-widest uppercase opacity-50">
                  VELOCOACH.<span className="text-emerald-500">AI</span>
                </span>
              </div>
            </div>
            
            {/* Center Section */}
            <div className="flex justify-center text-center">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest cursor-default select-none">
                Built with ❤️ in Cologne
              </span>
            </div>

            {/* Links Section */}
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <button onClick={() => setState(AppState.PRIVACY)} className="hover:text-emerald-400 transition-colors">Datenschutz</button>
              <button onClick={() => setState(AppState.IMPRINT)} className="hover:text-emerald-400 transition-colors">Impressum</button>
              <span className="text-slate-800">LIVE-V1.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
