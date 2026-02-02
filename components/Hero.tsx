import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 md:pt-16 md:pb-20 text-center px-5">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/30 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[90%] bg-blue-600/20 rounded-full blur-[100px] md:blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-6 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Next-Gen Training
        </div>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-[1.1]">
          Train Smarter. <br className="hidden sm:block" />Ride Faster.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-2">
          VeloCoach.AI ist deine KI-gestützte Trainingsplattform. Erhalte einen professionellen Trainingsplan, der perfekt zu deinen Ambitionen und deinem Alltag passt.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center"
          >
            Trainingsplan erstellen
          </button>
          <button className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-center text-slate-300 font-semibold">
            Mehr erfahren
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;