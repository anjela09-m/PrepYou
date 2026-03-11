import React, { useState, useEffect } from "react";
import { getProgressSummary } from "../../../api/progressApi";
import "./Views.css";

const ProgressView = ({ goal }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await getProgressSummary();
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch progress", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-text-muted italic">Analyzing your growth trajectory...</p>
        </div>
    );

    if (!stats) return (
        <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-5xl">📊</div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-text-primary tracking-tighter">No Data Points Yet</h2>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest max-w-sm">Complete your first task to unlock deep analytics.</p>
                </div>
            </div>
        </div>
    );

    const { today, weekly, trend, levelSuggestion } = stats;

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter">Your Progress Journey</h2>
                </div>
                <p className="text-sm font-bold text-text-muted max-w-xs leading-relaxed uppercase tracking-widest opacity-60">
                    Real-time quantification of your learning momentum.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Today's Snapshot */}
                <div className="bg-gradient-to-br from-white to-emerald-50 p-10 rounded-[3.5rem] shadow-xl shadow-emerald-100/50 border border-emerald-100 flex flex-col justify-between group overflow-hidden relative transition-all duration-500 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-emerald-900 uppercase tracking-widest mb-10">Today's Pulse</h3>
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="relative w-48 h-48 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                {/* Outer rotating dashed ring */}
                                <div className="absolute inset-0 border-[6px] border-dashed border-emerald-300/50 rounded-full animate-[spin_10s_linear_infinite]" />
                                {/* Inner rotating dotted ring */}
                                <div className="absolute inset-2 border-[4px] border-dotted border-teal-400/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                
                                <svg className="w-44 h-44 transform -rotate-90 relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                                    <circle className="text-emerald-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="88" cy="88" />
                                    <circle
                                        className="text-emerald-500 transition-all duration-1000 ease-out"
                                        strokeWidth="12"
                                        strokeDasharray={502}
                                        strokeDashoffset={502 - (502 * today.completionPercentage) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="80"
                                        cx="88"
                                        cy="88"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-5xl font-black text-emerald-900 drop-shadow-md">{today.completionPercentage}%</span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Velocity</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                {[
                                    { label: "Execution", val: today.completedTasks, color: "text-emerald-600", bg: "bg-emerald-100/50", icon: "✅" },
                                    { label: "Active", val: today.pendingTasks, color: "text-amber-600", bg: "bg-amber-100/50", icon: "⚡" },
                                    { label: "Deferred", val: today.rolledOverTasks, color: "text-indigo-600", bg: "bg-indigo-100/50", icon: "➡️" }
                                ].map((s) => (
                                    <div key={s.label} className={`flex items-center justify-between p-4 ${s.bg} rounded-2xl border border-white/50 backdrop-blur-sm group/item hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl inline-block group-hover/item:scale-125 transition-transform duration-300">{s.icon}</span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
                                        </div>
                                        <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Last 7 Days Trend (Graph) */}
                <div className="bg-gradient-to-br from-white to-indigo-50 p-10 rounded-[3.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-100 group overflow-hidden relative transition-all duration-500 hover:shadow-2xl">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -ml-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="text-lg font-black text-indigo-900 uppercase tracking-widest font-title">Weekly Progress</h3>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-80 font-sans mt-1">Behavioral Consistency Graph</p>
                        </div>

                        <div className="flex-1 flex items-end justify-between relative pl-8 pt-4">
                            {/* Y-Axis Labels */}
                            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[8px] font-bold text-indigo-400 opacity-60">
                                <span>100%</span>
                                <span>50%</span>
                                <span>0%</span>
                            </div>

                            {/* Grid Lines */}
                            <div className="absolute left-6 right-0 top-0 bottom-6 flex flex-col justify-between z-0">
                                <div className="w-full h-px border-t border-dashed border-indigo-200"></div>
                                <div className="w-full h-px border-t border-dashed border-indigo-200"></div>
                                <div className="w-full h-px border-t border-dashed border-indigo-200"></div>
                            </div>

                            {/* SVG Chart */}
                            <svg className="absolute left-6 right-0 top-0 bottom-6 w-full h-full overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradientDetails" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={`M0,100 ${trend.map((d, i) => `L${(i / (trend.length - 1 || 1)) * 100},${100 - d.percentage}`).join(' ')} L100,100 Z`}
                                    fill="url(#gradientDetails)"
                                    opacity="0.8"
                                />
                                <polyline
                                    fill="none"
                                    stroke="#4F46E5"
                                    strokeWidth="2.5"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={
                                        trend.length > 0
                                            ? trend.map((d, i) => `${(i / (trend.length - 1 || 1)) * 100},${100 - d.percentage}`).join(' ')
                                            : "0,100 100,100"
                                    }
                                    className="drop-shadow-[0_4px_6px_rgba(79,70,229,0.3)]"
                                />
                                {trend.map((d, i) => (
                                    <circle
                                        key={i}
                                        cx={(i / (trend.length - 1 || 1)) * 100}
                                        cy={100 - d.percentage}
                                        r="3"
                                        fill="#fff"
                                        stroke="#4F46E5"
                                        strokeWidth="2"
                                        vectorEffect="non-scaling-stroke"
                                        className="hover:scale-150 transition-all duration-300 origin-center cursor-pointer shadow-indigo-500"
                                    />
                                ))}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="w-full flex justify-between absolute bottom-0 left-6 right-0 translate-y-full pt-2">
                                {trend.map((day, i) => (
                                    <div key={i} className="text-[10px] font-bold text-indigo-500 uppercase text-center w-8 bg-indigo-50 rounded-full px-1 py-0.5">
                                        {new Date(day.date).toLocaleDateString([], { weekday: 'short' }).charAt(0)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Summary - Pastoral Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                {[
                    { label: "Avg. Completion", val: `${weekly.averageCompletion}%`, sub: "Weekly Velocity", color: "from-blue-50 to-indigo-100", accent: "text-indigo-700", icon: "🚀", border: "border-indigo-200/50" },
                    { label: "Total Directives", val: weekly.totalTasks, sub: "Total Assignments", color: "from-purple-50 to-fuchsia-100", accent: "text-fuchsia-700", icon: "📋", border: "border-fuchsia-200/50" },
                    { label: "Successful Sorties", val: weekly.completedTasks, sub: "Mission Completion", color: "from-emerald-50 to-teal-100", accent: "text-teal-700", icon: "🎯", border: "border-teal-200/50" },
                    { label: "Bypassed Targets", val: weekly.rolledOverTasks, sub: "Roll-over Count", color: "from-rose-50 to-pink-100", accent: "text-rose-700", icon: "⏭️", border: "border-rose-200/50" }
                ].map((item) => (
                    <div key={item.label} className={`p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br ${item.color} border ${item.border} backdrop-blur-sm relative overflow-hidden group`}>
                        <div className="absolute -top-4 -right-4 text-7xl opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">{item.icon}</div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${item.accent} opacity-80 mb-2`}>{item.label}</p>
                        <p className={`text-4xl font-black tracking-tighter ${item.accent} drop-shadow-sm`}>{item.val}</p>
                        <p className={`text-[10px] font-bold uppercase opacity-60 ${item.accent} mt-2`}>{item.sub}</p>
                    </div>
                ))}

                {stats.weeklyReflections && (
                    <>
                        <div className="p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/50 relative overflow-hidden group col-span-2 md:col-span-1 lg:col-span-2 flex items-center gap-6">
                            <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl -mr-10 -mb-10"></div>
                            <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-white/50 group-hover:rotate-12 transition-transform duration-500 relative z-10">📝</div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 opacity-80 mb-1">Journals Written</p>
                                <p className="text-4xl font-black text-amber-700 drop-shadow-sm">{stats.weeklyReflections.totalJournals}</p>
                                <p className="text-[10px] font-bold uppercase opacity-70 text-amber-800 mt-1">Self-Reflections</p>
                            </div>
                        </div>
                        <div className="p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-sky-50 to-cyan-100 border border-cyan-200/50 relative overflow-hidden group col-span-2 md:col-span-1 lg:col-span-2 flex items-center gap-6">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-200/40 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-500 relative z-10">
                                {stats.weeklyReflections.mostFrequentMood === 'motivated' ? '🔥' :
                                    stats.weeklyReflections.mostFrequentMood === 'stressed' ? '😰' :
                                        stats.weeklyReflections.mostFrequentMood === 'demotivated' ? '📉' : '😐'}
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-800 opacity-80 mb-1">Dominant Mood</p>
                                <p className="text-4xl font-black text-cyan-700 drop-shadow-sm capitalize">{stats.weeklyReflections.mostFrequentMood || "N/A"}</p>
                                <p className="text-[10px] font-bold uppercase opacity-70 text-cyan-800 mt-1">Emotional Baseline</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProgressView;
