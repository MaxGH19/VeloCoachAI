
import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden pt-20 pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <i className="fas fa-bicycle mr-2"></i> Powered by Gemini 3 Pro
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Train Smarter. <br />Ride Faster.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The first AI-native training platform for amateur cyclists. Get a professional, periodized 4-week training plan tailored to your goals and schedule in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
          >
            Generate My Plan
          </button>
          <a href="#features" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            See How it Works
          </a>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="fa-bolt" 
            title="Power-Based" 
            description="Precise interval sessions defined by your FTP and power zones."
          />
          <FeatureCard 
            icon="fa-calendar" 
            title="Life-First" 
            description="Training that fits your work-life balance. You choose the days."
          />
          <FeatureCard 
            icon="fa-chart-line" 
            title="Periodized" 
            description="Scientifically structured phases to ensure peak performance."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-6 glass rounded-2xl text-left">
    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
      <i className={`fas ${icon} text-xl`}></i>
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

export default Hero;
