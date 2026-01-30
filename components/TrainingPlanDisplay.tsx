
import React, { useState } from 'react';
import { FullTrainingPlan, TrainingSession, UserProfile } from '../types.ts';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlanDisplayProps {
  plan: FullTrainingPlan;
  profile: UserProfile;
  onReset: () => void;
}

const TrainingPlanDisplay: React.FC<PlanDisplayProps> = ({ plan, profile, onReset }) => {
  const [activeWeek, setActiveWeek] = useState(0);
  const currentWeek = plan.weeks[activeWeek];

  const chartData = currentWeek.sessions.map(s => ({
    day: s.day,
    duration: s.durationMinutes,
    intensity: s.intensity
  }));

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return '#ef4444';
      case 'Moderate': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#334155';
    }
  };

  const athleteLabel = profile.gender === 'weiblich' ? 'Athletin' : 'Athlet';
  const hasKennzahlen = profile.ftp || profile.maxHeartRate;

  // Filter gender if "keine Angabe"
  const athleteDetails = [
    profile.gender && profile.gender !== 'keine Angabe' ? profile.gender : null,
    profile.age ? `${profile.age} Jahre` : null,
    profile.weight ? `${profile.weight} kg` : null
  ].filter(Boolean).join(', ');

  // Heuristic: if MaxHR exactly matches formula, mark it as estimated
  const isEstimatedHR = profile.maxHeartRate && profile.age && profile.maxHeartRate === (220 - profile.age);

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div className="flex-grow">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase leading-none italic">
            {plan.planTitle}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">{plan.summary}</p>
        </div>
        <button 
          onClick={onReset}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all font-bold uppercase text-xs tracking-widest shrink-0"
        >
          Neustart
        </button>
      </div>

      {/* Zusammengefasste Datenkachel */}
      <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 mb-12 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
          {/* TSS */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <i className="fas fa-bolt text-yellow-500"></i>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">TSS</div>
              <div className="text-xl font-black tracking-tight">{plan.targetMetrics.estimatedTSS}</div>
            </div>
          </div>

          {/* Volumen */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <i className="fas fa-clock text-blue-500"></i>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Volumen</div>
              <div className="text-xl font-black tracking-tight">{plan.targetMetrics.weeklyVolume} / Woche</div>
            </div>
          </div>

          {/* Athlet Info */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <i className="fas fa-user text-emerald-500"></i>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{athleteLabel}</div>
              <div className="text-xl font-black tracking-tight">
                {athleteDetails}
              </div>
            </div>
          </div>

          {/* Kennzahlen (bedingt) */}
          {hasKennzahlen && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <i className="fas fa-chart-simple text-purple-500"></i>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Kennzahlen</div>
                <div className="text-xl font-black tracking-tight">
                  {[
                    profile.ftp ? `FTP: ${profile.ftp} Watt` : null,
                    profile.maxHeartRate ? `Max.-Puls: ${profile.maxHeartRate} bpm${isEstimatedHR ? ' (geschätzt)' : ''}` : null
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wochen-Navigation */}
      <div className="grid grid-cols-2 lg:flex gap-3 mb-10">
        {plan.weeks.map((w, idx) => (
          <button
            key={idx}
            onClick={() => setActiveWeek(idx)}
            className={`px-4 py-4 rounded-2xl transition-all border-2 text-left lg:flex-1 ${activeWeek === idx ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'}`}
          >
            <div className={`text-[9px] font-black uppercase tracking-[0.15em] mb-1 ${activeWeek === idx ? 'text-slate-900/70' : 'text-slate-500'}`}>Woche {w.weekNumber}</div>
            <div className="font-bold text-xs md:text-sm uppercase leading-tight truncate">{w.focus}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-grow bg-white/5"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Tages-Sessions</h3>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>
          {currentWeek.sessions.map((session, idx) => (
            <SessionCard key={idx} session={session} />
          ))}
        </div>

        <div className="space-y-8 hidden lg:block">
          <div className="glass rounded-[2rem] p-8 border border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fas fa-chart-simple text-emerald-500"></i> Intensität
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIntensityColor(entry.intensity)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => {
  const isRest = session.intensity === 'Rest' || session.type.toLowerCase().includes('ruhe');
  const h = Math.floor(session.durationMinutes / 60);
  const m = session.durationMinutes % 60;
  const timeStr = `${h}:${m.toString().padStart(2, '0')}`;

  return (
    <div className={`group glass rounded-2xl p-6 border transition-all ${isRest ? 'opacity-40 grayscale' : 'border-white/5 hover:border-emerald-500/50'}`}>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Enlarged Box for time details */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-full sm:w-28 h-20 sm:h-24 rounded-2xl bg-slate-950 border border-white/5 group-hover:border-emerald-500/20 transition-colors shadow-inner">
          <span className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{session.day}</span>
          <span className="text-2xl font-black leading-none text-white tracking-tighter">{timeStr}</span>
          <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Std.</span>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-black text-lg uppercase tracking-tight break-words hyphens-auto">{session.title}</h4>
            {!isRest && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shrink-0 mt-1 ${
                session.intensity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                session.intensity === 'Moderate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {session.intensity}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{session.description}</p>
          {session.intervals && (
            <div className="flex items-start gap-2 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              <i className="fas fa-bolt text-[10px] text-emerald-500 mt-1"></i>
              <span className="text-xs font-bold text-emerald-400/80 italic whitespace-pre-wrap">{session.intervals}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanDisplay;
