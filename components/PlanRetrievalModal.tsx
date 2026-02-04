
import React, { useState } from 'react';

interface PlanRetrievalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrieve: (code: string) => Promise<void>;
}

const PlanRetrievalModal: React.FC<PlanRetrievalModalProps> = ({ isOpen, onClose, onRetrieve }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;

    setError(null);
    setIsLoading(true);
    try {
      await onRetrieve(code);
      onClose();
    } catch (err: any) {
      setError("Plan nicht gefunden. Bitte überprüfe die ID.");
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

      <div className="relative w-full max-w-md glass rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-fade-in pointer-events-auto p-8 md:p-10">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
          Plan öffnen
        </h3>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Gebe hier die Plan-ID deines bereits erstellten Plans ein, den du aufrufen möchtest.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Plan-ID (4 Zeichen)</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              placeholder="Z.B. 7K9X"
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl p-4 text-2xl font-mono font-black text-center tracking-[0.5em] text-white focus:outline-none transition-colors uppercase"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold animate-fade-in">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || code.length < 4}
            className="w-full py-4 bg-emerald-500 text-slate-950 rounded-xl font-bold transition-all active:scale-[0.98] hover:bg-emerald-400 disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <i className="fas fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fas fa-folder-open"></i>
            )}
            Plan öffnen
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlanRetrievalModal;
