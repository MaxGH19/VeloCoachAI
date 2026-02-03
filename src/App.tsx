
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
  const [error, setError] = useState<{ message: string; isRateLimit: boolean } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // Umgebungserkennung zur Sicherheit
    const hostname = window.location.hostname;
    const isLocalOrPreview = hostname.includes('localhost') || 
                            hostname.includes('127.0.0.1') || 
                            hostname.includes('webcontainer.io');

    if (isLocalOrPreview) {
      setHasAccess(true);
    } else {
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
      } else {
        setHasAccess(false);
      }
    }
  }, []);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser as User | null);
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
      } else if (errStr.includes("INVALID_API_KEY")) {
        message = "Konfigurationsfehler: Der API-Schlüssel ist ungültig oder fehlt.";
      } else if (errStr.includes("EMPTY_RESPONSE")) {
        message = "Der KI-Coach hat keine Daten geliefert. Bitte versuche es noch einmal.";
      }
      
      setError({ message, isRateLimit });
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

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
          <i className="fas fa-lock text-slate-950 text-2xl"></i>
        </div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
          VELOCOACH.<span className="text-emerald-500">AI</span>
        </h1>
        <p className="text-emerald-500/80 font-black uppercase tracking-[0.3em] text-[10px] mb-8">
          Private Beta Access Only
        </p>
        <div className="max-w-xs p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Diese Anwendung ist derzeit nur für autorisierte Tester zugänglich. Bitte nutze den bereitgestellten Beta-Link.
          </p>
        </div>
      </div>
    );
  }

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
          
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              <button 
                onClick={() => openAuth('login')}
                className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-lg text-xs sm:text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Eingeloggt als</span>
                  <span className="text-xs font-bold text-slate-300">{user.displayName || 'Athlet'}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-[10px] sm:text-xs font-bold hover:text-red-400 hover:border-red-400/30 transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16 flex flex-col overflow-hidden">
        {error && (
          <div className="max-w-xl mx-auto mt-6 px-4 w-full z-50">
            <div className={`p-4 ${error.isRateLimit ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} border rounded-2xl flex items-start gap-4 shadow-2xl backdrop-blur-xl animate-fade-in`}>
              <div className="flex-grow">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{error.isRateLimit ? 'Limit Erreicht' : 'Systemfehler'}</p>
                <p className="text-sm font-bold leading-relaxed">{error.message}</p>
              </div>
              <button onClick={() => setError(null)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
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
              <div className="text-slate-600 text-mono uppercase tracking-tighter">VER. 1.0.9-LIVE-PROTECTED</div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
};

export default App;
