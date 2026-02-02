import React, { useState } from 'react';
import { UserProfile, TrainingGoal, FitnessLevel, Equipment, Gender, TrainingPreference } from '../types.ts';
import { GOAL_OPTIONS, LEVEL_OPTIONS, DAY_OPTIONS, EQUIPMENT_OPTIONS, GENDER_OPTIONS, PREFERENCE_OPTIONS } from '../constants.ts';

interface QuestionnaireProps {
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
}

type MetricsKnowledge = 'both' | 'ftp' | 'hr' | 'none';

const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [metricsKnowledge, setMetricsKnowledge] = useState<MetricsKnowledge>('both');
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
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

  const getAllowedHoursRange = (dayCount: number) => {
    switch (dayCount) {
      case 1: return { min: 2, max: 5 };
      case 2: return { min: 2, max: 8 };
      case 3: return { min: 3, max: 12 };
      case 4: return { min: 4, max: 16 };
      case 5: return { min: 6, max: 20 };
      case 6: return { min: 8, max: 25 };
      case 7: return { min: 10, max: 25 };
      default: return { min: 2, max: 25 }; 
    }
  };

  const getFtpValidation = (val?: number) => {
    if (val === undefined) return null;
    if (val < 40 || val > 600) return { type: 'error', message: "Der Wert ist nicht plausibel. Bitte trage einen Wert zwischen 40 und 600 Watt ein." };
    if (val >= 40 && val <= 80) return { type: 'warning', message: "Der Wert ist sehr niedrig - bist du dir sicher?" };
    if (val >= 450 && val <= 600) return { type: 'warning', message: "Der Wert ist außergewöhnlich hoch und auf Profi-Niveau - bist du dir sicher?" };
    return null;
  };

  const getHrValidation = (val?: number) => {
    if (val === undefined) return null;
    if (val < 120 || val > 220) return { type: 'error', message: "Der Wert ist nicht plausibel. Bitte trage einen Wert zwischen 120 und 220 bpm ein." };
    if (val >= 120 && val <= 150) return { type: 'warning', message: "Der Puls ist sehr niedrig für einen Maximalwert - bist du dir sicher?" };
    if (val >= 205 && val <= 220) return { type: 'warning', message: "Der Puls ist außergewöhnlich hoch - bist du dir sicher?" };
    return null;
  };

  const startEditing = (field: string) => {
    setEditingFields(prev => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  const stopEditing = (field: string) => {
    setEditingFields(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
    setTouched(prev => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  const ftpValidation = getFtpValidation(profile.ftp);
  const hrValidation = getHrValidation(profile.maxHeartRate);

  const isStep4Blocked = () => {
    if (metricsKnowledge === 'both') {
      return !profile.ftp || !profile.maxHeartRate || ftpValidation?.type === 'error' || hrValidation?.type === 'error';
    }
    if (metricsKnowledge === 'ftp') {
      return !profile.ftp || ftpValidation?.type === 'error';
    }
    if (metricsKnowledge === 'hr') {
      return !profile.maxHeartRate || hrValidation?.type === 'error';
    }
    return false;
  };

  const handleStep4Next = () => {
    if (!isStep4Blocked()) {
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
    if (metricsKnowledge === 'none' || metricsKnowledge === 'hr') {
      delete finalProfile.ftp;
    }
    onSubmit(finalProfile as UserProfile);
  };

  const toggleDay = (day: string) => {
    const newDays = profile.availableDays.includes(day)
      ? profile.availableDays.filter(d => d !== day)
      : [...profile.availableDays, day];
    const dayCount = newDays.length;
    let newHours = profile.weeklyHours;
    if (dayCount > 0) {
      const { min, max } = getAllowedHoursRange(dayCount);
      newHours = Math.floor(min + (max - min) * 0.45);
    }
    setProfile(p => ({
      ...p,
      availableDays: newDays,
      weeklyHours: newHours
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
                <button key={opt.value} onClick={() => setProfile({ ...profile, goal: opt.value })} className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${profile.goal === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
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
                <button key={opt.value} onClick={() => setProfile({ ...profile, level: opt.value })} className={`w-full p-5 rounded-2xl text-left transition-all border-2 ${profile.level === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg">{opt.label}</span>
                  </div>
                  <div className="text-slate-400 text-sm leading-snug">{opt.description}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}><i className="fas fa-arrow-left mr-2"></i> Zurück</button>
              <button onClick={nextStep} className={primaryBtnClass} disabled={!profile.level}>Weiter <i className="fas fa-arrow-right ml-2"></i></button>
            </div>
          </div>
        );
      case 3:
        const dayCount = profile.availableDays.length;
        const { min, max } = getAllowedHoursRange(dayCount);
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Zeitplan</h2>
              <p className={questionClass}>Wie viel Zeit möchtest du pro Woche investieren?</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-slate-400 text-xs uppercase tracking-wider font-bold">Stunden pro Woche</label>
                <span className="text-xl font-bold text-emerald-400">{profile.weeklyHours} Stunden</span>
              </div>
              <input type="range" min={min} max={max} step="1" disabled={dayCount === 0} value={profile.weeklyHours} onChange={(e) => setProfile({...profile, weeklyHours: parseInt(e.target.value)})} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-20" />
            </div>
            <div className="space-y-4">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold">Bevorzugte Tage ({dayCount})</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAY_OPTIONS.map(day => (
                  <button key={day} onClick={() => toggleDay(day)} className={`h-12 flex items-center justify-center rounded-xl font-bold transition-all border ${profile.availableDays.includes(day) ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/10 text-slate-400'}`}>{day}</button>
                ))}
              </div>
              {dayCount === 0 && <p className="text-[11px] text-amber-500 italic font-bold">Bitte wähle mindestens einen Trainingstag aus.</p>}
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}><i className="fas fa-arrow-left mr-2"></i> Zurück</button>
              <button onClick={nextStep} className={primaryBtnClass} disabled={dayCount === 0}>Weiter <i className="fas fa-arrow-right ml-2"></i></button>
            </div>
          </div>
        );
      case 4:
        const showFtpVal = touched.has('ftp') && !editingFields.has('ftp');
        const showHrVal = touched.has('hr') && !editingFields.has('hr');
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Kennzahlen</h2>
              <p className={questionClass}>Kennst du deine aktuelle FTP und deinen Maximalpuls?</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[{ id: 'both', label: 'Ich kenne beide Werte' }, { id: 'ftp', label: 'Ich kenne nur meine FTP' }, { id: 'hr', label: 'Ich kenne nur meinen Maximalpuls' }, { id: 'none', label: 'Ich kenne keinen der Werte' }].map(opt => (
                <button key={opt.id} onClick={() => { setMetricsKnowledge(opt.id as MetricsKnowledge); setTouched(new Set()); setEditingFields(new Set()); setErrors({}); }} className={`p-4 rounded-xl text-left border-2 transition-all ${metricsKnowledge === opt.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' : 'border-white/5 bg-white/5 text-slate-400'}`}>{opt.label}</button>
              ))}
            </div>
            <div className="space-y-4 pt-2">
              {(metricsKnowledge === 'both' || metricsKnowledge === 'ftp') && (
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">FTP (Watt)</label>
                  <div className="relative">
                    <input type="number" value={profile.ftp ?? ''} onFocus={() => startEditing('ftp')} onBlur={() => stopEditing('ftp')} onChange={(e) => { startEditing('ftp'); setProfile({...profile, ftp: e.target.value ? parseInt(e.target.value) : undefined}); }} className={`w-full bg-white/5 border rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors ${showFtpVal && ftpValidation?.type === 'error' ? 'border-red-500' : showFtpVal && ftpValidation?.type === 'warning' ? 'border-amber-500/50' : 'border-white/10 focus:border-emerald-500'}`} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Watt</span>
                  </div>
                  {showFtpVal && ftpValidation && <p className={`text-[11px] font-bold italic ${ftpValidation.type === 'error' ? 'text-red-500' : 'text-amber-500'}`}>{ftpValidation.message}</p>}
                </div>
              )}
              {(metricsKnowledge === 'both' || metricsKnowledge === 'hr') && (
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Maximalpuls (bpm)</label>
                  <div className="relative">
                    <input type="number" value={profile.maxHeartRate ?? ''} onFocus={() => startEditing('hr')} onBlur={() => stopEditing('hr')} onChange={(e) => { startEditing('hr'); setProfile({...profile, maxHeartRate: e.target.value ? parseInt(e.target.value) : undefined}); }} className={`w-full bg-white/5 border rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors ${showHrVal && hrValidation?.type === 'error' ? 'border-red-500' : showHrVal && hrValidation?.type === 'warning' ? 'border-amber-500/50' : 'border-white/10 focus:border-emerald-500'}`} />
                  </div>
                  {showHrVal && hrValidation && <p className={`text-[11px] font-bold italic ${hrValidation.type === 'error' ? 'text-red-500' : 'text-amber-500'}`}>{hrValidation.message}</p>}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}><i className="fas fa-arrow-left mr-2"></i> Zurück</button>
              <button onClick={handleStep4Next} className={primaryBtnClass} disabled={isStep4Blocked()}>Weiter <i className="fas fa-arrow-right ml-2"></i></button>
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
              <div className="space-y-2"><label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Alter</label><input type="number" value={profile.age ?? ''} onChange={(e) => setProfile({...profile, age: e.target.value ? parseInt(e.target.value) : undefined})} className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors" /></div>
              <div className="space-y-2"><label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gewicht (kg)</label><input type="number" value={profile.weight ?? ''} onChange={(e) => setProfile({...profile, weight: e.target.value ? parseInt(e.target.value) : undefined})} className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl p-4 text-lg font-bold focus:outline-none transition-colors" /></div>
            </div>
            <div className="space-y-4">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold">Geschlecht</label>
              <div className="grid grid-cols-1 gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setProfile({...profile, gender: opt.value})} className={`p-4 rounded-xl text-left border-2 transition-all font-bold ${profile.gender === opt.value ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}><i className="fas fa-arrow-left mr-2"></i> Zurück</button>
              <button onClick={handleStep5Next} className={primaryBtnClass} disabled={!isStep5Complete}>Weiter <i className="fas fa-arrow-right ml-2"></i></button>
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
                  <button key={opt.value} onClick={() => toggleEquipment(opt.value)} className={`p-4 rounded-xl text-left border-2 flex items-center justify-between transition-all ${profile.equipment.includes(opt.value) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10'}`}>
                    <span className="font-bold">{opt.label}</span>
                    <i className={`fas ${profile.equipment.includes(opt.value) ? 'fa-check-circle text-emerald-500' : 'fa-circle text-slate-800'}`}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}><i className="fas fa-arrow-left mr-2"></i> Zurück</button>
              <button onClick={handleStep6Next} className={primaryBtnClass}>{shouldShowPreferenceStep() ? 'Weiter' : 'Plan erstellen'}</button>
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
                <button key={opt.value} onClick={() => setProfile({ ...profile, trainingPreference: opt.value })} className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${profile.trainingPreference === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.trainingPreference === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    <i className={`fas ${opt.icon} text-xl`}></i>
                  </div>
                  <div className="font-bold text-lg leading-tight">{opt.label}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center gap-4 pt-6">
              <button onClick={prevStep} className={secondaryBtnClass}><i className="fas fa-arrow-left mr-2"></i> Zurück</button>
              <button onClick={handleFinalSubmit} className={primaryBtnClass} disabled={!profile.trainingPreference}>Plan erstellen</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 md:py-12 px-4">
      <div className="mb-6">
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 px-1"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Schritt {step} von {totalSteps}</span></div>
      </div>
      <div className="glass rounded-3xl p-6 md:p-10 animate-fade-in">{renderStep()}</div>
    </div>
  );
};

export default Questionnaire;