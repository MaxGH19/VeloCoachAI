
import React, { useState } from 'react';
import Hero from './components/Hero.tsx';
import Questionnaire from './components/Questionnaire.tsx';
import TrainingPlanDisplay from './components/TrainingPlanDisplay.tsx';
import Loader from './components/Loader.tsx';
import { UserProfile, FullTrainingPlan } from './types.ts';
import { generateTrainingPlan } from './services/geminiService.ts';

enum AppState { LANDING, QUESTIONNAIRE, LOADING, DISPLAY }

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [plan, setPlan] = useState<FullTrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKeyButton, setShowKeyButton] = useState(false);

  const handleStart = () => {
    setError(null);
    setShowKeyButton(false);
    setState(AppState.QUESTIONNAIRE);
  };

  const handleCancel = () => setState(AppState.LANDING);

  const handleConnectKey = async () => {
    if (typeof (window as any).aistudio !== 'undefined') {
      try {
        await (window as any).aistudio.openSelectKey();
        setError(null);
        setShowKeyButton(false);
        // Nach Key-Auswahl gehen wir zurück zum Questionnaire
        setState(AppState.QUESTIONNAIRE);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleSubmit = async (profile: UserProfile) => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const generatedPlan = await generateTrainingPlan(profile);
      setPlan(generatedPlan);
      setState(AppState.DISPLAY);
    } catch (err: any) {
      console.error("Plan Error:", err);
      if (err.message === "MISSING_API_KEY" || err.message?.includes("API Key")) {
        setError("API Key fehlt. Bitte verknüpfe einen Google AI Studio Key für Netlify.");
        setShowKeyButton(true);
      } else {
        setError(err.message || "Es gab ein Problem. Bitte versuche es erneut.");
      }
      setState(AppState.LANDING);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setState(AppState.LANDING);
    setError(null);
    setShowKeyButton(false);
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
          <button className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
            Login
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col overflow-hidden">
        {error && (
          <div className="max-w-md mx-auto mt-6 p-6 bg-slate-900 border border-red-500/20 rounded-2xl z-50 text-center shadow-2xl animate-fade-in">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-3"></i>
            <p className="text-sm font-bold text-slate-200 mb-4">{error}</p>
            {showKeyButton && (
              <button 
                onClick={handleConnectKey}
                className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-key"></i> Key jetzt verknüpfen
              </button>
            )}
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center relative">
          {state === AppState.LANDING && <Hero onStart={handleStart} />}
          {state === AppState.QUESTIONNAIRE && <Questionnaire onSubmit={handleSubmit} onCancel={handleCancel} />}
          {state === AppState.LOADING && <Loader />}
          {state === AppState.DISPLAY && plan && <TrainingPlanDisplay plan={plan} onReset={handleReset} />}
        </div>
      </main>

      <footer className="py-10 border-t border-white/5 bg-slate-900/50 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                <i className="fas fa-bolt text-emerald-500 text-[10px]"></i>
              </div>
              <span className="font-bold text-white text-sm tracking-wider uppercase">VELOCOACH.<span className="text-emerald-500">AI</span></span>
            </div>
            <div className="flex gap-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-emerald-400 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">AGB</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Impressum</a>
            </div>
            <div className="text-slate-600 text-[10px] font-mono">
              VER. 1.0.5-STABLE
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-6 text-center">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© 2025 VELOCOACH.AI • BORN IN GERMANY</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
