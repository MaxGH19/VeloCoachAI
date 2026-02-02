
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero.tsx';
import Questionnaire from './components/Questionnaire.tsx';
import TrainingPlanDisplay from './components/TrainingPlanDisplay.tsx';
import Loader from './components/Loader.tsx';
import LegalView from './components/LegalView.tsx';
import AuthModal from './components/AuthModal.tsx';
import { UserProfile, FullTrainingPlan } from './types.ts';
import { generateTrainingPlan } from './services/geminiService.ts';
import { auth } from './firebase';
// Fix: Separating type and value imports for better module resolution compatibility
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

enum AppState {
  LANDING,
  QUESTIONNAIRE,
  LOADING,
  DISPLAY,
  PRIVACY,
  IMPRINT
}

const App: React.FC = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [plan, setPlan] = useState<FullTrainingPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<{ message: string; isQuota: boolean } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const isNetlify = window.location.hostname.includes('netlify.app');
    if (!isNetlify) {
      setHasAccess(true);
      return;
    }
    const isAlreadyAuth = localStorage.getItem('app_access_granted') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const accessKey = urlParams.get('key');
    const SECRET_PW = 'max-testet-1909';
    if (accessKey === SECRET_PW || isAlreadyAuth) {
      setHasAccess(true);
      localStorage.setItem('app_access_granted', 'true');
      if (accessKey) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

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
      setState(AppState.DISPLAY);
    } catch (err: any) {
      console.error("Plan Generation Error:", err);
      
      let message = "Ein unerwarteter Fehler ist aufgetreten.";
      let isQuota = false;

      const errStr = err.message || "";
      if (errStr === "LOCAL_DAILY_LIMIT_REACHED") {
        message = "Tageslimit erreicht: Du hast heute bereits 100 Pläne erstellt. Morgen geht es weiter!";
        isQuota = true;
      } else if (errStr === "PROVIDER_RATE_LIMIT") {
        message = "Der KI-Coach macht gerade eine kurze Pause (Server überlastet). Bitte warte 60 Sekunden und versuche es erneut.";
        isQuota = false;
      } else {
        message = "Fehler bei der Erstellung. Bitte prüfe deine Internetverbindung oder versuche es erneut.";
      }

      setError({ message, isQuota });
      setState(AppState.QUESTIONNAIRE);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setProfile(null);
    setState(AppState.LANDING);
    setError(null);
  };

  const handleLogout = () => auth && signOut(auth);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
          <i className="fas fa-lock text-slate-950 text-2xl"></i>
        </div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">VELOCOACH.<span className="text-emerald-500">AI</span></h1>
        <p className="text-emerald-500/80 font-black uppercase tracking-[0.3em] text-[10px] mb-8">Private Beta Access Only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><i className="fas fa-bolt text-slate-950 text-sm"></i></div>
            <span className="font-extrabold text-xl tracking-tighter uppercase text-white italic">VELOCOACH.<span className="text-emerald-500">AI</span></span>
          </div>
          {user ? (
            <button onClick={handleLogout} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-xs font-bold hover:text-red-400 transition-all">Logout</button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20">Login</button>
          )}
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col">
        {error && (
          <div className="max-w-xl mx-auto mt-6 px-4 w-full z-50">
            <div className={`p-4 ${error.isQuota ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} border rounded-2xl flex items-start gap-4 shadow-2xl backdrop-blur-xl`}>
              <div className="flex-grow">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{error.isQuota ? 'Limit erreicht' : 'System-Hinweis'}</p>
                <p className="text-sm font-bold leading-relaxed">{error.message}</p>
              </div>
              <button onClick={() => setError(null)} className="text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
          </div>
        )}
        <div className="flex-grow flex flex-col justify-center relative">
          {state === AppState.LANDING && <Hero onStart={handleStart} />}
          {state === AppState.QUESTIONNAIRE && <Questionnaire onSubmit={handleSubmit} onCancel={handleCancel} />}
          {state === AppState.LOADING && <Loader />}
          {state === AppState.DISPLAY && plan && profile && <TrainingPlanDisplay plan={plan} profile={profile} onReset={handleReset} />}
          {state === AppState.PRIVACY && <LegalView type="privacy" onClose={() => setState(AppState.LANDING)} />}
          {state === AppState.IMPRINT && <LegalView type="imprint" onClose={() => setState(AppState.LANDING)} />}
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Built in Cologne</span>
          <div className="flex gap-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <button onClick={() => setState(AppState.PRIVACY)} className="hover:text-emerald-400">Datenschutz</button>
            <button onClick={() => setState(AppState.IMPRINT)} className="hover:text-emerald-400">Impressum</button>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
    </div>
  );
};

export default App;
