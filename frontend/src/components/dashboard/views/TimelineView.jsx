import React, { useState, useEffect } from "react";
import { getPlansTimeline } from "../../../api/planApi";

const TimelineView = ({ setView }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await getPlansTimeline();
                // Sort descending (newest first) for better UX, or ascending. Let's do descending.
                const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setPlans(sorted);
            } catch (err) {
                console.error("Failed to fetch timeline", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, []);

    const isToday = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const isFuture = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d.getTime() > today.getTime();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500">Loading your mission timeline...</p>
            </div>
        );
    }

    if (!plans.length) {
        return (
            <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-user-card p-12 rounded-2xl shadow-sm border border-user-sidebar flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-user-bg/50 text-user-text/40 rounded-full flex items-center justify-center text-3xl ring-8 ring-user-bg/50">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-user-text">Timeline Empty</h2>
                        <p className="text-sm font-medium text-user-text/80 max-w-sm mx-auto">No plans have been generated yet. Configure a goal to begin.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-user-card p-8 md:p-10 rounded-2xl shadow-sm border border-user-sidebar">
                <div className="mb-8 border-b border-user-sidebar pb-8">
                    <div className="inline-flex items-center px-3 py-1 bg-user-bg/50 text-user-text rounded-md text-xs font-semibold mb-3">
                        Strategic Execution
                    </div>
                    <h2 className="text-3xl font-bold text-user-text leading-tight">
                        Timeline Archive
                    </h2>
                    <p className="text-sm text-user-text/80 mt-2">
                        Review your past trajectories, manage today's mission, and preview upcoming locked schedules.
                    </p>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {plans.map((plan, idx) => {
                        const dayIsToday = isToday(plan.date);
                        const dayIsFuture = isFuture(plan.date);
                        const isSubmitted = plan.status === "SUBMITTED";

                        let stateStyle = "bg-user-bg/50 border-user-sidebar opacity-60 grayscale"; // Default past
                        let indicatorColor = "bg-user-sidebar border-user-card";
                        let titleStyle = "text-user-text/60";
                        let btnOrBadge = null;

                        if (dayIsToday) {
                            if (isSubmitted) {
                                stateStyle = "bg-user-card border-green-200 shadow-sm";
                                indicatorColor = "bg-green-500 border-green-100";
                                titleStyle = "text-user-text";
                                btnOrBadge = <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-100">Day Completed</span>;
                            } else {
                                stateStyle = "bg-user-card border-user-hover shadow-md ring-1 ring-user-hover/20";
                                indicatorColor = "bg-user-hover border-user-bg/50";
                                titleStyle = "text-user-hover";
                                btnOrBadge = (
                                    <button
                                        onClick={() => setView("dashboard")}
                                        className="text-xs font-bold text-user-text bg-user-bg hover:bg-user-hover hover:text-gray-900 transition-colors px-4 py-1.5 rounded-lg shadow-sm"
                                    >
                                        Execute Mission
                                    </button>
                                );
                            }
                        } else if (dayIsFuture) {
                            stateStyle = "bg-user-bg/50 border-user-sidebar border-dashed opacity-80";
                            indicatorColor = "bg-user-sidebar border-user-bg/50";
                            titleStyle = "text-user-text/40";
                            btnOrBadge = (
                                <span className="flex items-center gap-1 text-xs font-bold text-user-text/60 bg-user-card px-3 py-1 rounded-md border border-user-sidebar shadow-sm">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Locked (Preview)
                                </span>
                            );
                        } else {
                            // Past day
                            btnOrBadge = <span className="text-xs font-bold text-user-text/60 tracking-wider uppercase">— Read Only</span>;
                        }

                        const totalTasks = plan.tasks?.length || 0;
                        const completedTasks = plan.tasks?.filter(t => t.isCompleted).length || 0;
                        const score = isSubmitted ? plan.completionPercentage || Math.round((completedTasks / totalTasks) * 100) || 0 : null;

                        return (
                            <div key={plan._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Timeline Indicator */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${indicatorColor} z-10 mx-auto absolute left-0 md:left-1/2 -translate-x-1/2 md:translate-x-0`}>
                                    {dayIsToday && !isSubmitted ? (
                                        <div className="w-2.5 h-2.5 bg-user-card rounded-full animate-pulse"></div>
                                    ) : isSubmitted ? (
                                        <svg className="w-4 h-4 text-user-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : null}
                                </div>

                                {/* Content Card */}
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-auto md:ml-0 p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${stateStyle}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-user-sidebar pb-4">
                                        <div>
                                            <h3 className={`text-lg font-bold ${titleStyle}`}>
                                                {new Date(plan.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                            </h3>
                                            <p className="text-xs font-semibold text-user-text/40 mt-0.5">
                                                {dayIsToday ? "Today" : dayIsFuture ? "Upcoming" : "Past Mission"}
                                            </p>
                                        </div>
                                        <div>{btnOrBadge}</div>
                                    </div>

                                    {(isSubmitted || (!dayIsToday && !dayIsFuture)) && (
                                        <div className="flex items-center gap-6 mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-user-text/60 uppercase tracking-widest mb-1">Completion</p>
                                                <p className="text-xl font-bold text-user-text">{score ?? 0}%</p>
                                            </div>
                                            <div className="h-8 w-px bg-user-sidebar"></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-user-text/60 uppercase tracking-widest mb-1">Tasks</p>
                                                <p className="text-sm font-semibold text-user-text/80">{completedTasks} / {totalTasks}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Task Preview */}
                                    <div className="space-y-2">
                                        {plan.tasks?.slice(0, 3).map((task, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.isCompleted ? 'bg-green-400' : 'bg-user-sidebar'}`}></div>
                                                <span className={`truncate font-medium ${task.isCompleted ? 'text-user-text/40 line-through' : 'text-user-text/80'}`}>
                                                    {task.task}
                                                </span>
                                            </div>
                                        ))}
                                        {plan.tasks?.length > 3 && (
                                            <p className="text-xs font-semibold text-user-text/40 ml-3.5 pt-1">
                                                + {plan.tasks.length - 3} more tasks
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
