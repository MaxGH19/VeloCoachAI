
import React, { useState } from 'react';
import { FullTrainingPlan, WeeklyPlan, TrainingSession } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlanDisplayProps {
  plan: FullTrainingPlan;
  onReset: () => void;
}

const TrainingPlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
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
      default: return '#64748b';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">{plan.planTitle}</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">{plan.summary}</p>
        </div>
        <button 
          onClick={onReset}
          className="w-full md:w-auto px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
        >
          Neuer Plan
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-10">
        <StatCard label="TSS" value={plan.targetMetrics.estimatedTSS.toString()} icon="fa-bolt" color="text-yellow-500" />
        <StatCard label="Umfang" value={plan.targetMetrics.weeklyVolume} icon="fa-clock" color="text-blue-500" />
        <StatCard label="Dauer" value={`${plan.weeks.length} Wo.`} icon="fa-calendar" color="text-emerald-500" />
        <StatCard label="Art" value="Periodisiert" icon="fa-layer-group" color="text-purple-500" />
      </div>

      <div className="mb-6 sticky top-16 z-30 bg-slate-950/95 backdrop-blur-sm -mx-4 px-4 py-2 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {plan.weeks.map((w, idx) => (
            <button
              key={idx}
              onClick={() => setActiveWeek(idx)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all border-2 text-left min-w-[120px] ${activeWeek === idx ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${activeWeek === idx ? 'text-slate-800' : 'text-slate-500'}`}>Woche {w.weekNumber}</div>
              <div className="font-bold text-sm truncate">{w.focus}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-calendar-day text-emerald-500"></i>
            Tagesplan
          </h3>
          {currentWeek.sessions.map((session, idx) => (
            <SessionCard key={idx} session={session} />
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">Intensitätsprofil</h3>
            <div className="h-56">
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
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-bold uppercase text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Erholung</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Aerob</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Schwelle</div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border-l-4 border-emerald-500">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-2">Trainer-Tipp</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "Bleib konsistent. Die Phase {currentWeek.focus} dient der Grundlagenanpassung. Wenn es stressig wird, priorisiere die Einheiten mit hoher Intensität."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="glass rounded-2xl p-4 md:p-6">
    <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 ${color}`}>
      <i className={`fas ${icon} text-sm`}></i>
    </div>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
    <div className="text-xl md:text-2xl font-black">{value}</div>
  </div>
);

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => {
  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Fix: Use casting to string to bypass TypeScript's narrowing which would otherwise prevent comparison with values outside the defined union.
  const isRest = (session.intensity as string) === 'Rest' || (session.intensity as string) === 'Ruhetag' || session.type.toLowerCase().includes('rest') || session.type.toLowerCase().includes('ruhe');

  return (
    <div className={`glass rounded-2xl p-5 border transition-all ${isRest ? 'opacity-70 border-white/5' : 'border-white/5 hover:border-emerald-500/30'}`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">{session.day}</span>
          <span className="text-xl font-black leading-none">{session.durationMinutes}</span>
          <span className="text-[8px] font-bold text-slate-500 mt-0.5">MIN</span>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4 className="font-bold text-base truncate pr-2">{session.title}</h4>
            {!isRest && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border shrink-0 ${getIntensityBadge(session.intensity)}`}>
                {session.intensity}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 md:line-clamp-none mb-2">{session.description}</p>
          {session.intervals && (
            <div className="mt-2 py-2 px-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 flex items-start gap-2">
              <i className="fas fa-bolt text-[10px] text-emerald-400 mt-1"></i>
              <span className="text-[11px] text-slate-300 font-medium leading-snug">{session.intervals}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanDisplay;
