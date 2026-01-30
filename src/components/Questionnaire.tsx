
import React, { useState } from 'react';
import { UserProfile, TrainingGoal, FitnessLevel, Equipment, Gender, TrainingPreference } from '../types.ts';
import { GOAL_OPTIONS, LEVEL_OPTIONS, DAY_OPTIONS, EQUIPMENT_OPTIONS, GENDER_OPTIONS, PREFERENCE_OPTIONS } from '../constants.ts';

interface PlanstreckeProps {
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
}

type MetricsKnowledge = 'both' | 'ftp' | 'hr' | 'none';

const Questionnaire: React.FC<PlanstreckeProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [metricsKnowledge, setMetricsKnowledge] = useState<MetricsKnowledge>('both');
  const [errors, setErrors] = useState<{ ftp?: boolean; hr?: boolean; details?: boolean }>({});
  
  const [profile, setProfile] = useState<UserProfile>({
    goal: '' as TrainingGoal,
    level: '' as FitnessLevel,
    weeklyHours: 6,
    availableDays: ['Di', 'Do', 'Sa', 'So'],
    equipment: [],
    gender: '', 
    age: undefined,
    weight: undefined,
    ftp: undefined,
    maxHeartRate: undefined,
    trainingPreference: undefined,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const shouldShowPreferenceStep = () => {
    const hasSmartTrainer = profile.equipment.includes('Smart Trainer');
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
    const weekends = ['Sa', 'So'];
    const hasWeekdays = profile.availableDays.some(d => weekdays.includes(d));
    const hasWeekends = profile.availableDays.some(d => weekends.includes(d));
    return hasSmartTrainer && hasWeekdays && hasWeekends;
  };

  const totalSteps = shouldShowPreferenceStep() ? 7 : 6;

  const handleStep4Next = () => {
    const newErrors: { ftp?: boolean; hr?: boolean } = {};
    if ((metricsKnowledge === 'both' || metricsKnowledge === 'ftp') && !profile.ftp) {
      newErrors.ftp = true;
    }
    if ((metricsKnowledge === 'both' || metricsKnowledge === 'hr') && !profile.maxHeartRate) {
      newErrors.hr = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      nextStep();
    }
  };

  const handleStep5Next = () => {
    if (profile.age && profile.weight && profile.gender) {
      setErrors({});
      nextStep();
    }
  };

  const handleStep6Next = () => {
    if (shouldShowPreferenceStep()) {
      nextStep();
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    const finalProfile = { ...profile };
    
    if ((metricsKnowledge === 'none' || metricsKnowledge === 'ftp') && profile.age) {
      finalProfile.maxHeartRate = 220 - profile.age;
    }

    if (metricsKnowledge === 'none') {
      delete finalProfile.ftp;
    } else if (metricsKnowledge === 'hr') {
      delete finalProfile.ftp;
    }

    onSubmit(finalProfile as UserProfile);
  };

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

  const primaryBtnClass = "px-8 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-emerald-400";
  const secondaryBtnClass = "px-8 py-3 bg-white/5 text-slate-300 font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center border border-white/10";
  
  const questionClass = "text-slate-200 text-xl md:text-2xl font-semibold italic leading-tight mb-4";

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Dein Ziel</h2>
              <p className={questionClass}>Wähle deinen sportlichen Fokus für die nächsten 4 Wochen.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setProfile({ ...profile, goal: opt.value })}
                  className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${profile.goal === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.goal === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <i className={`fas ${opt.icon} text-xl`}></i>
                  </div>
                  <div className="font-bold text-lg">{opt.label}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-center pt-6">
              <button onClick={nextStep} className={primaryBtnClass} disabled={!profile.goal}>Weiter</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Fitnesslevel</h2>
              <p className={questionClass}>Wie schätzt du deine aktuelle Leistungsfähigkeit ein?</p>
            </div>
            <div className="space-y-3">
              {LEVEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setProfile({ ...profile, level: opt.value })}
                  className={`w-full p-5 rounded-2xl text-left transition-all border-2 ${profile.level === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg">{opt.label}</span>
                  </div>
                  <div className="text-slate-400 text-sm leading-snug">{opt.description}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}>
                <i className="fas fa-arrow-left mr-2"></i> Zurück
              </button>
              <button onClick={nextStep} className={primaryBtnClass} disabled={!profile.level}>
                Weiter <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Zeitplan</h2>
              <p className={questionClass}>Wie viel Zeit möchtest du pro Woche investieren?</p>
            </div>
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
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold">Bevorzugte Tage</label>
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
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}>
                <i className="fas fa-arrow-left mr-2"></i> Zurück
              </button>
              <button onClick={nextStep} className={primaryBtnClass}>
                Weiter <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Kennzahlen</h2>
              <p className={questionClass}>Kennst du deine aktuelle FTP und deinen Maximalpuls?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'both', label: 'Ich kenne beide Werte' },
                { id: 'ftp', label: 'Ich kenne nur meine FTP' },
                { id: 'hr', label: 'Ich kenne nur meinen Maximalpuls' },
                { id: 'none', label: 'Ich kenne keinen der Werte' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setMetricsKnowledge(opt.id as MetricsKnowledge);
                    setErrors({});
                  }}
                  className={`p-4 rounded-xl text-left border-2 transition-all ${metricsKnowledge === opt.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' : 'border-white/5 bg-white/5 text-slate-400'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              {(metricsKnowledge === 'both' || metricsKnowledge === 'ftp') && (
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">FTP (Funktionelle Leistungsschwelle)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={profile.ftp ?? ''}
                      onChange={(e) => {
                        setProfile({...profile, ftp: e.target.value ? parseInt(e.target.value) : undefined});
                        if (e.target.value) setErrors(prev => ({ ...prev, ftp: false }));
                      }}
                      className={`w-full bg-white/5 border rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors ${errors.ftp ? 'border-red-500' : 'border-white/10 focus:border-emerald-500'}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Watt</span>
                  </div>
                  {errors.ftp && <p className="text-red-500 text-xs font-bold italic">Pflichtfeld für diese Option</p>}
                </div>
              )}
              
              {(metricsKnowledge === 'both' || metricsKnowledge === 'hr') && (
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Maximalpuls (bpm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={profile.maxHeartRate ?? ''}
                      onChange={(e) => {
                        setProfile({...profile, maxHeartRate: e.target.value ? parseInt(e.target.value) : undefined});
                        if (e.target.value) setErrors(prev => ({ ...prev, hr: false }));
                      }}
                      className={`w-full bg-white/5 border rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors ${errors.hr ? 'border-red-500' : 'border-white/10 focus:border-emerald-500'}`}
                    />
                  </div>
                  {errors.hr && <p className="text-red-500 text-xs font-bold italic">Pflichtfeld für diese Option</p>}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}>
                <i className="fas fa-arrow-left mr-2"></i> Zurück
              </button>
              <button onClick={handleStep4Next} className={primaryBtnClass}>
                Weiter <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        );
      case 5:
        const isStep5Complete = profile.age !== undefined && profile.weight !== undefined && profile.gender !== '';
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Details zu dir</h2>
              <p className={questionClass}>Ein paar physiologische Daten für die Feinabstimmung.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Alter</label>
                <input 
                  type="number" 
                  value={profile.age ?? ''}
                  onChange={(e) => setProfile({...profile, age: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gewicht (kg)</label>
                <input 
                  type="number" 
                  value={profile.weight ?? ''}
                  onChange={(e) => setProfile({...profile, weight: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold">Geschlecht</label>
              <div className="grid grid-cols-1 gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile({...profile, gender: opt.value})}
                    className={`p-4 rounded-xl text-left border-2 transition-all font-bold ${profile.gender === opt.value ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}>
                <i className="fas fa-arrow-left mr-2"></i> Zurück
              </button>
              <button 
                onClick={handleStep5Next} 
                className={primaryBtnClass}
                disabled={!isStep5Complete}
              >
                Weiter <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Ausrüstung</h2>
              <p className={questionClass}>Welches Equipment steht dir zur Verfügung?</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {EQUIPMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleEquipment(opt.value)}
                    className={`p-4 rounded-xl text-left border-2 flex items-center justify-between transition-all ${profile.equipment.includes(opt.value) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'}`}
                  >
                    <span className="font-bold">{opt.label}</span>
                    <i className={`fas ${profile.equipment.includes(opt.value) ? 'fa-check-circle text-emerald-500' : 'fa-circle text-slate-800'}`}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}>
                <i className="fas fa-arrow-left mr-2"></i> Zurück
              </button>
              <button onClick={handleStep6Next} className={primaryBtnClass}>
                {shouldShowPreferenceStep() ? 'Weiter' : 'Plan erstellen'}
              </button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Trainingspräferenzen</h2>
              <p className={questionClass}>Wie gestaltet sich deine Trainingswoche?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {PREFERENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setProfile({ ...profile, trainingPreference: opt.value })}
                  className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${profile.trainingPreference === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.trainingPreference === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <i className={`fas ${opt.icon} text-xl`}></i>
                  </div>
                  <div className="font-bold text-lg leading-tight">{opt.label}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}>
                <i className="fas fa-arrow-left mr-2"></i> Zurück
              </button>
              <button onClick={handleFinalSubmit} className={primaryBtnClass} disabled={!profile.trainingPreference}>
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
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Schritt {step} von {totalSteps}</span>
        </div>
      </div>
      
      <div className="glass rounded-3xl p-6 md:p-10 animate-fade-in">
        {renderStep()}
      </div>
    </div>
  );
};

export default Questionnaire;
