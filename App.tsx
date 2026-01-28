
import React, { useState } from 'react';
import Hero from './components/Hero';
import Questionnaire from './components/Questionnaire';
import TrainingPlanDisplay from './components/TrainingPlanDisplay';
import Loader from './components/Loader';
import { UserProfile, FullTrainingPlan } from './types';
import { generateTrainingPlan } from './services/geminiService';

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
    } catch (err) {
      console.error("Failed to generate plan:", err);
      setError("We encountered an issue generating your plan. Please try again.");
      setState(AppState.LANDING);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setState(AppState.LANDING);
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-slate-950 text-sm"></i>
            </div>
            <span className="font-extrabold text-xl tracking-tighter">VELOCOACH <span className="text-emerald-500">AI</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-emerald-400 transition-colors">Methodology</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Community</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
          </div>
          <div>
            <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-all">
              Login
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {error && (
          <div className="max-w-md mx-auto mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {state === AppState.LANDING && <Hero onStart={handleStart} />}
        
        {state === AppState.QUESTIONNAIRE && (
          <Questionnaire onSubmit={handleSubmit} onCancel={handleCancel} />
        )}
        
        {state === AppState.LOADING && <Loader />}
        
        {state === AppState.DISPLAY && plan && (
          <TrainingPlanDisplay plan={plan} onReset={handleReset} />
        )}
      </main>

      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <i className="fas fa-bolt text-emerald-500 text-[10px]"></i>
            </div>
            <span className="font-bold text-slate-300">VELOCOACH AI</span>
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <div className="text-slate-600 text-xs">
            © 2024 VeloCoach AI. Built with Gemini 3 Pro.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
