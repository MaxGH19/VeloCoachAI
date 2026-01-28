
import React, { useState } from 'react';
import { UserProfile, TrainingGoal, FitnessLevel, Equipment } from '../types.ts';
import { GOAL_OPTIONS, LEVEL_OPTIONS, DAY_OPTIONS, EQUIPMENT_OPTIONS } from '../constants.ts';

interface QuestionnaireProps {
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    goal: 'Endurance',
    level: 'Intermediate',
    weeklyHours: 6,
    availableDays: ['Di', 'Do', 'Sa', 'So'],
    equipment: ['Road Bike'],
    age: 35,
    weight: 75,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleDay = (day: string) => {
    setProfile(p => ({
      ...p,
      availableDays: p.availableDays.includes(day)
        ? p.availableDays.filter(d => d !== day)
        : [...p.availableDays, day]
    }));
  };

  const toggleEquipment = (eq: Equipment) => {
    setProfile(p => ({
      ...p,
      equipment: p.equipment.includes(eq)
        ? p.equipment.filter(e => e !== eq)
        : [...p.equipment, eq]
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">Was ist dein Hauptziel?</h2>
            <div className="grid grid-cols-1 gap-3">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setProfile({ ...profile, goal: opt.value }); nextStep(); }}
                  className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${profile.goal === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.goal === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <i className={`fas ${opt.icon} text-xl`}></i>
                  </div>
                  <div className="font-bold text-lg">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">Aktuelles Fitnesslevel?</h2>
            <div className="space-y-3">
              {LEVEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setProfile({ ...profile, level: opt.value }); nextStep(); }}
                  className={`w-full p-5 rounded-2xl text-left transition-all border-2 ${profile.level === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg">{opt.label}</span>
                    {profile.level === opt.value && <i className="fas fa-check-circle text-emerald-400"></i>}
                  </div>
                  <div className="text-slate-400 text-sm leading-snug">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">Zeitplan & Verfügbarkeit</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-slate-400 text-xs uppercase tracking-wider font-bold">Stunden pro Woche</label>
                <span className="text-3xl font-bold text-emerald-400">{profile.weeklyHours}h</span>
              </div>
              <input 
                type="range" min="2" max="25" step="1"
                value={profile.weeklyHours}
                onChange={(e) => setProfile({...profile, weeklyHours: parseInt(e.target.value)})}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold">Trainingstage</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAY_OPTIONS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`h-12 flex items-center justify-center rounded-xl font-bold transition-all border ${profile.availableDays.includes(day) ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/10 text-slate-400'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button onClick={prevStep} className="flex-1 py-4 text-slate-400 font-bold bg-white/5 rounded-xl border border-white/10 active:bg-white/10">Zurück</button>
              <button onClick={nextStep} className="flex-[2] py-4 bg-emerald-500 text-slate-950 font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-emerald-500/20">Weiter</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">Letzte Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Alter</label>
                <input 
                  type="number" 
                  pattern="\d*"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gewicht (kg)</label>
                <input 
                  type="number" 
                  pattern="\d*"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold">Ausrüstung</label>
              <div className="grid grid-cols-1 gap-2">
                {EQUIPMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleEquipment(opt.value)}
                    className={`p-4 rounded-xl text-left border-2 flex items-center justify-between transition-all ${profile.equipment.includes(opt.value) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-slate-400'}`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <i className={`fas ${profile.equipment.includes(opt.value) ? 'fa-check-circle' : 'fa-circle text-slate-800'}`}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button onClick={prevStep} className="flex-1 py-4 text-slate-400 font-bold bg-white/5 rounded-xl border border-white/10 active:bg-white/10">Zurück</button>
              <button 
                onClick={() => onSubmit(profile)} 
                className="flex-[2] py-4 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
              >
                Plan erstellen
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 md:py-12 px-4">
      <div className="mb-6">
        <button onClick={onCancel} className="text-slate-500 hover:text-white mb-4 flex items-center gap-2 text-sm font-bold">
          <i className="fas fa-chevron-left"></i> BEENDEN
        </button>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="glass rounded-3xl p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderStep()}
      </div>
    </div>
  );
};

export default Questionnaire;
