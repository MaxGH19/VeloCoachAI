
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
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-3">{plan.planTitle}</h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">{plan.summary}</p>
        </div>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm font-bold"
        >
          Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <StatCard label="Total Est. TSS" value={plan.targetMetrics.estimatedTSS.toString()} icon="fa-bolt" color="text-yellow-500" />
        <StatCard label="Weekly Volume" value={plan.targetMetrics.weeklyVolume} icon="fa-clock" color="text-blue-500" />
        <StatCard label="Plan Duration" value={`${plan.weeks.length} Weeks`} icon="fa-calendar" color="text-emerald-500" />
        <StatCard label="Phases" value="Periodized" icon="fa-layer-group" color="text-purple-500" />
      </div>

      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {plan.weeks.map((w, idx) => (
            <button
              key={idx}
              onClick={() => setActiveWeek(idx)}
              className={`flex-shrink-0 px-8 py-4 rounded-2xl transition-all border-2 text-left min-w-[160px] ${activeWeek === idx ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}
            >
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${activeWeek === idx ? 'text-slate-800' : 'text-slate-500'}`}>Week {w.weekNumber}</div>
              <div className="font-bold">Focus: {w.focus}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-list-ul text-emerald-500"></i>
            Daily Sessions
          </h3>
          {currentWeek.sessions.map((session, idx) => (
            <SessionCard key={idx} session={session} />
          ))}
        </div>

        <div className="space-y-8">
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">Intensity Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getIntensityColor(entry.intensity)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase text-slate-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Low</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Moderate</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> High</div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Coach's Advice</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              "Focus on consistency this week. The ${currentWeek.focus} phase is designed to build the necessary adaptations without overtraining. If you feel excessive fatigue, dial back the intensity by 10% on your moderate rides."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="glass rounded-2xl p-6">
    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => {
  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:border-emerald-500/30 transition-all group">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-white/5 border border-white/10 group-hover:bg-emerald-500/10 transition-all">
        <span className="text-xs font-bold text-slate-500 uppercase">{session.day}</span>
        <span className="text-2xl font-bold">{session.durationMinutes}</span>
        <span className="text-[10px] font-bold text-slate-500">MIN</span>
      </div>
      <div className="flex-grow">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h4 className="font-bold text-lg">{session.title}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getIntensityBadge(session.intensity)}`}>
            {session.intensity}
          </span>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase font-medium">{session.type}</span>
        </div>
        <p className="text-slate-400 text-sm mb-3 leading-relaxed">{session.description}</p>
        {session.intervals && (
          <div className="flex items-start gap-2 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
            <i className="fas fa-stopwatch text-emerald-400 mt-1"></i>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase block mb-1">Interval Set</span>
              <span className="text-slate-300">{session.intervals}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPlanDisplay;
