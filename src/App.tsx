import React, { useState } from 'react';
import Hero from './components/Hero.tsx';
import Questionnaire from './components/Questionnaire.tsx';
import TrainingPlanDisplay from './components/TrainingPlanDisplay.tsx';
import Loader from './components/Loader.tsx';
import { UserProfile, FullTrainingPlan } from './types.ts';
import { generateTrainingPlan } from './services/geminiService.ts';

enum AppState {
  LANDING,
  QUESTIONNAIRE,
  LOADING,
  DISPLAY
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [plan, setPlan] = useState<FullTrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => setState(AppState.QUESTIONNAIRE);
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
      setError(err.message || "Es gab ein Problem. Bitte versuche es erneut.");
      setState(AppState.LANDING);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setState(AppState.LANDING);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <i className="fas fa-bolt text-slate-950 text-sm"></i>
            </div>
            <span className="font-extrabold text-xl tracking-tighter uppercase">VELOCOACH <span className="text-emerald-500">AI</span></span>
          </div>
          <button className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
            Login
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col">
        {error && (
          <div className="max-w-md mx-auto mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 animate-bounce">
            <i className="fas fa-exclamation-circle text-xl"></i>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center">
          {state === AppState.LANDING && <Hero onStart={handleStart} />}
          
          {state === AppState.QUESTIONNAIRE && (
            <Questionnaire onSubmit={handleSubmit} onCancel={handleCancel} />
          )}
          
          {state === AppState.LOADING && <Loader />}
          
          {state === AppState.DISPLAY && plan && (
            <TrainingPlanDisplay plan={plan} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="py-10 border-t border-white/5 bg-slate-900/50 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                <i className="fas fa-bolt text-emerald-500 text-[10px]"></i>
              </div>
              <span className="font-bold text-slate-300 text-sm tracking-wider">VELOCOACH AI</span>
            </div>
            <div className="flex gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-emerald-400 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">AGB</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Impressum</a>
            </div>
            <div className="text-slate-600 text-[10px] font-mono">
              VER. 1.0.4-STABLE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;