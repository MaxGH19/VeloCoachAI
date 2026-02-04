
import React, { useState } from 'react';
import Hero from './components/Hero.tsx';
import Questionnaire from './components/Questionnaire.tsx';
import TrainingPlanDisplay from './components/TrainingPlanDisplay.tsx';
import Loader from './components/Loader.tsx';
import LegalView from './components/LegalView.tsx';
import PlanRetrievalModal from './components/PlanRetrievalModal.tsx';
import { UserProfile, FullTrainingPlan } from './types.ts';
import { generateTrainingPlan } from './services/geminiService.ts';
import { savePlan, getPlanByCode } from './services/storageService.ts';

enum AppState {
  LANDING,
  QUESTIONNAIRE,
  LOADING,
  DISPLAY,
  PRIVACY,
  IMPRINT
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [plan, setPlan] = useState<FullTrainingPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<{ message: string; isRateLimit: boolean } | null>(null);
  const [isRetrievalModalOpen, setIsRetrievalModalOpen] = useState(false);
  
  // App Version für Footer
  const hostname = window.location.hostname;
  const isPreview = hostname.includes('webcontainer.io') || hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const appVersion = isPreview ? '1.1.2-PREVIEW' : '1.1.2-LIVE';

  const handleStart = () => {
    setError(null);
    setState(AppState.QUESTIONNAIRE);
  };
  
  const handleCancel = () => setState(AppState.LANDING);

  const handleSubmit = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setState(AppState.LOADING);
    setError(null);
    try {
      const generatedPlan = await generateTrainingPlan(userProfile);
      setPlan(generatedPlan);
      
      // Automatisch in Firestore speichern
      await savePlan(generatedPlan, userProfile);
      
      setState(AppState.DISPLAY);
    } catch (err: any) {
      console.error("Plan Error:", err);
      let message = "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.";
      let isRateLimit = false;
      const errStr = err.message || "";
      
      if (errStr === "LOCAL_DAILY_LIMIT_REACHED") {
        message = "Tageslimit erreicht: Du hast heute bereits 500 Pläne erstellt. Morgen geht es weiter!";
        isRateLimit = true;
      } else if (errStr.includes("PROVIDER_RATE_LIMIT") || errStr.includes("RATE_LIMIT")) {
        message = "Der KI-Coach ist gerade sehr beschäftigt. Bitte warte kurz und klicke dann erneut auf 'Plan erstellen'.";
        isRateLimit = true;
      }
      
      setError({ message, isRateLimit });
      setState(AppState.QUESTIONNAIRE);
    }
  };

  const handleRetrievePlan = async (code: string) => {
    const result = await getPlanByCode(code);
    if (result) {
      setPlan(result.plan);
      setProfile(result.profile);
      setState(AppState.DISPLAY);
    } else {
      throw new Error("NOT_FOUND");
    }
  };

  const handleReset = () => {
    setPlan(null);
    setProfile(null);
    setState(AppState.LANDING);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <i className="fas fa-bolt text-slate-950 text-sm"></i>
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tighter uppercase text-white italic">VELOCOACH.<span className="text-emerald-500">AI</span></span>
          </div>
          
          <div className="hidden sm:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50">Beta Version</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col overflow-hidden relative">
        {error && (
          <div className="max-w-xl mx-auto mt-6 px-4 w-full z-50">
            <div className={`p-4 ${error.isRateLimit ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} border rounded-2xl flex items-start gap-4 shadow-2xl backdrop-blur-xl animate-fade-in`}>
              <div className="flex-grow">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{error.isRateLimit ? 'Limit' : 'Fehler'}</p>
                <p className="text-sm font-bold leading-relaxed">{error.message}</p>
              </div>
              <button onClick={() => setError(null)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center relative">
          {state === AppState.LANDING && <Hero onStart={handleStart} onOpenPlan={() => setIsRetrievalModalOpen(true)} />}
          {state === AppState.QUESTIONNAIRE && <Questionnaire onSubmit={handleSubmit} onCancel={handleCancel} />}
          {state === AppState.LOADING && <Loader />}
          {state === AppState.DISPLAY && plan && profile && <TrainingPlanDisplay plan={plan} profile={profile} onReset={handleReset} />}
          {state === AppState.PRIVACY && <LegalView type="privacy" onClose={() => setState(AppState.LANDING)} />}
          {state === AppState.IMPRINT && <LegalView type="imprint" onClose={() => setState(AppState.LANDING)} />}
        </div>
      </main>

      <footer className="py-10 border-t border-white/5 bg-slate-900/50 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div onClick={handleReset} className="cursor-pointer flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                  <i className="fas fa-bolt text-emerald-500 text-[10px]"></i>
                </div>
                <span className="font-bold text-white text-sm tracking-wider uppercase">
                  VELOCOACH.<span className="text-emerald-500">AI</span>
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest cursor-default select-none">
                Built with ❤️ in Cologne
              </span>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <button onClick={() => setState(AppState.PRIVACY)} className="hover:text-emerald-400 transition-colors">Datenschutz</button>
                <button onClick={() => setState(AppState.IMPRINT)} className="hover:text-emerald-400 transition-colors">Impressum</button>
              </div>
              <div className="text-slate-600 text-mono uppercase tracking-tighter text-[10px] font-bold">{appVersion}</div>
            </div>
          </div>
        </div>
      </footer>

      <PlanRetrievalModal 
        isOpen={isRetrievalModalOpen} 
        onClose={() => setIsRetrievalModalOpen(false)} 
        onRetrieve={handleRetrievePlan} 
      />
    </div>
  );
};

export default App;
