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
                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-widest mb-10">Today's Pulse</h3>
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="relative w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-gray-50" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="88" cy="88" />
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
                                    <span className="text-5xl font-black text-text-primary">{today.completionPercentage}%</span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Velocity</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                {[
                                    { label: "Execution", val: today.completedTasks, color: "bg-emerald-500", icon: "✅" },
                                    { label: "Active", val: today.pendingTasks, color: "bg-amber-400", icon: "⚡" },
                                    { label: "Deferred", val: today.rolledOverTasks, color: "bg-indigo-400", icon: "➡️" }
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group/item hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-base">{s.icon}</span>
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest">{s.label}</span>
                                        </div>
                                        <span className="text-lg font-black text-text-primary">{s.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Last 7 Days Trend (Graph) */}
                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-widest font-title">Weekly Progress</h3>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60 font-sans">Behavioral Consistency Graph</p>
                        </div>

                        <div className="flex-1 flex items-end justify-between relative pl-8 pt-4">
                            {/* Y-Axis Labels */}
                            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[8px] font-bold text-text-muted opacity-40">
                                <span>100%</span>
                                <span>50%</span>
                                <span>0%</span>
                            </div>

                            {/* Grid Lines */}
                            <div className="absolute left-6 right-0 top-0 bottom-6 flex flex-col justify-between z-0">
                                <div className="w-full h-px bg-gray-100 border-t border-dashed border-gray-200"></div>
                                <div className="w-full h-px bg-gray-100 border-t border-dashed border-gray-200"></div>
                                <div className="w-full h-px bg-gray-100 border-t border-dashed border-gray-200"></div>
                            </div>

                            {/* SVG Chart */}
                            <svg className="absolute left-6 right-0 top-0 bottom-6 w-full h-full overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradientDetails" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <polyline
                                    fill="none"
                                    stroke="url(#gradientDetails)"
                                    strokeWidth="0"
                                    points={
                                        trend.length > 0
                                            ? trend.map((d, i) => `${(i / (trend.length - 1 || 1)) * 100},${100 - d.percentage}`).join(' ')
                                            : "0,100 100,100"
                                    }
                                />
                                <path
                                    d={`M0,100 ${trend.map((d, i) => `L${(i / (trend.length - 1 || 1)) * 100},${100 - d.percentage}`).join(' ')} L100,100 Z`}
                                    fill="url(#gradientDetails)"
                                    opacity="0.5"
                                />
                                <polyline
                                    fill="none"
                                    stroke="#4F46E5"
                                    strokeWidth="2" // reduced stroke width relative to 100x100 coord system
                                    vectorEffect="non-scaling-stroke" // keeps line thin even if scaled
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={
                                        trend.length > 0
                                            ? trend.map((d, i) => `${(i / (trend.length - 1 || 1)) * 100},${100 - d.percentage}`).join(' ')
                                            : "0,100 100,100"
                                    }
                                    className="drop-shadow-lg"
                                />
                                {trend.map((d, i) => (
                                    <circle
                                        key={i}
                                        cx={(i / (trend.length - 1 || 1)) * 100}
                                        cy={100 - d.percentage}
                                        r="2" // Adjusted radius for 100x100 viewbox
                                        fill="#fff"
                                        stroke="#4F46E5"
                                        strokeWidth="1"
                                        vectorEffect="non-scaling-stroke"
                                        className="hover:scale-150 transition-all duration-300 origin-center cursor-pointer"
                                    />
                                ))}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="w-full flex justify-between absolute bottom-0 left-6 right-0 translate-y-full pt-2">
                                {trend.map((day, i) => (
                                    <div key={i} className="text-[10px] font-bold text-text-muted uppercase text-center w-8">
                                        {new Date(day.date).toLocaleDateString([], { weekday: 'short' }).charAt(0)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: "Avg. Completion", val: `${weekly.averageCompletion}%`, sub: "Weekly Velocity", accent: "text-primary" },
                        { label: "Total Directives", val: weekly.totalTasks, sub: "Total Assignments", accent: "text-text-primary" },
                        { label: "Successful Sorties", val: weekly.completedTasks, sub: "Mission Completion", accent: "text-emerald-500" },
                        { label: "Bypassed Targets", val: weekly.rolledOverTasks, sub: "Roll-over Count", accent: weekly.rolledOverTasks > 5 ? "text-red-500" : "text-text-primary" }
                    ].map((item) => (
                        <div key={item.label} className="text-center md:text-left space-y-2">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.label}</p>
                            <p className={`text-4xl font-black tracking-tighter ${item.accent}`}>{item.val}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase opacity-40">{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Weekly Reflection Insights (New) */}
                {stats.weeklyReflections && (
                    <div className="mt-12 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">📝</div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Journals Written</p>
                                <p className="text-3xl font-black text-text-primary">{stats.weeklyReflections.totalJournals}</p>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Self-Reflections</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl">
                                {stats.weeklyReflections.mostFrequentMood === 'motivated' ? '🔥' :
                                    stats.weeklyReflections.mostFrequentMood === 'stressed' ? '😰' :
                                        stats.weeklyReflections.mostFrequentMood === 'demotivated' ? '📉' : '😐'}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Dominant Mood</p>
                                <p className="text-3xl font-black text-text-primary capitalize">{stats.weeklyReflections.mostFrequentMood || "N/A"}</p>
                                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Emotional Baseline</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-12 md:p-16 rounded-[4rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-0"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center text-4xl shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                        💡
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <span className="px-4 py-1.5 bg-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20">AI Strategic Insight</span>
                        <div className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                            {weekly.averageCompletion > 70 ? (
                                <p>Operational efficiency is peak. Consistency exceeds 70%. <span className="text-accent">{levelSuggestion === 'upgrade' ? "Ready for Level Tier Up." : "Maintain current momentum."}</span></p>
                            ) : weekly.averageCompletion > 40 ? (
                                <p>Moderate progress detected. <span className="text-amber-400">Action: Reduce task overflow to optimize retention.</span></p>
                            ) : (
                                <p>Efficiency drop-off detected. <span className="text-red-400">{levelSuggestion === 'downgrade' ? "Recommendation: Recalibrate goal intensity." : "Prioritize High-Impact tasks."}</span></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressView;
