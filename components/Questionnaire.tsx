
import React, { useState } from 'react';
import { UserProfile, TrainingGoal, FitnessLevel, Equipment } from '../types';
import { GOAL_OPTIONS, LEVEL_OPTIONS, DAY_OPTIONS, EQUIPMENT_OPTIONS } from '../constants';

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
    availableDays: ['Tue', 'Thu', 'Sat', 'Sun'],
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
            <h2 className="text-3xl font-bold">What's your primary goal?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setProfile({ ...profile, goal: opt.value }); nextStep(); }}
                  className={`p-6 rounded-2xl text-left transition-all border-2 ${profile.goal === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <i className={`fas ${opt.icon} text-2xl mb-3 ${profile.goal === opt.value ? 'text-emerald-400' : 'text-slate-400'}`}></i>
                  <div className="font-bold">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Your current fitness level?</h2>
            <div className="space-y-4">
              {LEVEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setProfile({ ...profile, level: opt.value }); nextStep(); }}
                  className={`w-full p-6 rounded-2xl text-left transition-all border-2 ${profile.level === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg">{opt.label}</span>
                    {profile.level === opt.value && <i className="fas fa-check-circle text-emerald-400"></i>}
                  </div>
                  <div className="text-slate-400 text-sm">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Schedule & Availability</h2>
            <div className="space-y-4">
              <label className="block text-slate-400 text-sm uppercase tracking-wider font-bold">Target Hours per Week</label>
              <div className="flex items-center gap-6">
                <input 
                  type="range" min="2" max="25" step="1"
                  value={profile.weeklyHours}
                  onChange={(e) => setProfile({...profile, weeklyHours: parseInt(e.target.value)})}
                  className="flex-grow accent-emerald-500"
                />
                <span className="text-3xl font-bold w-20">{profile.weeklyHours}h</span>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-slate-400 text-sm uppercase tracking-wider font-bold">Training Days</label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all border ${profile.availableDays.includes(day) ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/10 text-slate-400'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <button onClick={prevStep} className="text-slate-400 hover:text-white">Back</button>
              <button onClick={nextStep} className="px-8 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl">Next</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Final Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase">Age</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase">Weight (kg)</label>
                <input 
                  type="number" 
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-slate-400 text-sm uppercase tracking-wider font-bold">Equipment</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleEquipment(opt.value)}
                    className={`p-4 rounded-xl text-left border ${profile.equipment.includes(opt.value) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-slate-400'}`}
                  >
                    <i className={`fas ${profile.equipment.includes(opt.value) ? 'fa-check-square' : 'fa-square'} mr-3`}></i>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <button onClick={prevStep} className="text-slate-400 hover:text-white">Back</button>
              <button 
                onClick={() => onSubmit(profile)} 
                className="px-10 py-4 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Generate Training Plan
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <button onClick={onCancel} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Cancel
        </button>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% Complete</span>
        </div>
      </div>
      
      <div className="glass rounded-3xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderStep()}
      </div>
    </div>
  );
};

export default Questionnaire;
