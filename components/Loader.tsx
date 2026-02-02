import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "Analysiere deine Ziele...",
    "Optimiere Erholungsphasen...",
    "Berechne TSS-Belastungen...",
    "Strukturiere Intervallblöcke...",
    "Simuliere physiologische Anpassungen...",
    "Finalisiere deinen periodisierten Plan..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % tips.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-bolt text-4xl text-emerald-500 animate-pulse"></i>
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent text-center">
        Dein individueller Trainingsplan wird erstellt
      </h2>
      <p className="text-emerald-400 font-mono tracking-widest text-sm uppercase animate-pulse text-center">
        {tips[tipIndex]}
      </p>
      
      <div className="max-w-xs w-full bg-white/5 h-1 rounded-full mt-12 overflow-hidden">
        <div className="bg-emerald-500 h-full animate-[loading_20s_ease-out_forwards]"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;