
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
      // Startet den Popup-Prozess
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error("AuthModal Login Error:", err);
      setError(err.message || "Ein Fehler ist beim Login aufgetreten.");
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
        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        )}

        <div className="p-8 md:p-10">
          <div className="flex gap-8 mb-8 border-b border-white/5 relative z-10">
            <button 
              onClick={() => !isLoading && setMode('login')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'login' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'} ${isLoading ? 'cursor-wait' : ''}`}
            >
              Login
            </button>
            <button 
              onClick={() => !isLoading && setMode('register')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'register' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'} ${isLoading ? 'cursor-wait' : ''}`}
            >
              Registrieren
            </button>
          </div>

          <div className="relative z-10 text-center sm:text-left">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
              {isLoading ? 'Verbindung wird hergestellt' : (mode === 'login' ? 'Willkommen zurück' : 'Werde Teil der Crew')}
            </h3>
            <p className="text-slate-400 text-sm mb-8">
              {isLoading 
                ? 'Bitte schließe das Google-Fenster nicht...' 
                : (mode === 'login' 
                  ? 'Logge dich ein, um deine Trainingspläne zu verwalten.' 
                  : 'Erstelle ein Konto, um deinen Fortschritt zu speichern.')}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold animate-fade-in text-left">
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
                  <i className="fas fa-circle-notch animate-spin text-emerald-600"></i>
                ) : (
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                )}
                {isLoading ? 'Warte auf Google...' : 'Mit Google anmelden'}
              </button>

              {!isLoading && (
                <>
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-grow bg-white/5"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">oder</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>

                  <div className="space-y-3 opacity-30">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Adresse</label>
                      <input 
                        disabled
                        type="email" 
                        placeholder="In der Beta deaktiviert"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest mt-4">
                    Nutze Google für den schnellen Beta-Zugang
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
