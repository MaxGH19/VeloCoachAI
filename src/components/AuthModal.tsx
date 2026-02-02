import React, { useState, useEffect } from 'react';
import { loginWithGoogle } from '../firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error("AuthModal Login Error:", err);
      setError(err.message || "Ein Fehler ist beim Login aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md glass rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-fade-in pointer-events-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="p-8 md:p-10">
          <div className="flex gap-8 mb-8 border-b border-white/5 relative z-10">
            <button 
              onClick={() => setMode('login')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'login' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setMode('register')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'register' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Registrieren
            </button>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
              {mode === 'login' ? 'Willkommen zurück' : 'Werde Teil der Crew'}
            </h3>
            <p className="text-slate-400 text-sm mb-8">
              {mode === 'login' 
                ? 'Logge dich ein, um deine Trainingspläne zu verwalten.' 
                : 'Erstelle ein Konto, um deinen Fortschritt zu speichern.'}
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold animate-fade-in">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full py-4 bg-white text-slate-950 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-wait' : 'hover:bg-slate-200'}`}
              >
                {isLoading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                )}
                {isLoading ? 'Verbindung wird hergestellt...' : 'Mit Google anmelden'}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-grow bg-white/5"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">oder</span>
                <div className="h-px flex-grow bg-white/5"></div>
              </div>

              <div className="space-y-3 opacity-50">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Adresse</label>
                  <input 
                    disabled
                    type="email" 
                    placeholder="name@beispiel.de"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none transition-colors text-white cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Passwort</label>
                  <input 
                    disabled
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none transition-colors text-white cursor-not-allowed"
                  />
                </div>
              </div>

              <button 
                className="w-full py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold transition-all cursor-not-allowed mt-4"
                disabled
              >
                {mode === 'login' ? 'Einloggen' : 'Konto erstellen'}
              </button>
              <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest mt-4">
                Email-Login ist in der Beta-Phase deaktiviert
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;