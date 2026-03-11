import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { completeTask, submitDay as submitDayAPI, regeneratePlan } from "../../../api/planApi";
import UIModal from "../../common/UIModal";
import confetti from "canvas-confetti";

const DashboardOverview = ({ user, goal, plan, setView, summary, latestJournal, subscription, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        type: "alert", // alert, confirm, prompt
        title: "",
        message: "",
        onConfirm: () => { },
        isLoading: false
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    // Motivation from AI - clean up common AI formatting symbols
    const cleanMotivation = (plan?.dailyMotivation || "Your consistency is elite! Keep crushing those goals - you're making steady progress. 🚀")
        .replace(/\*\*/g, '')
        .replace(/\*\(.*?\)\*/g, '') // Remove italicized reasoning like *(Reasoning)*
        .replace(/^\s*\*|\*\s*$/g, '') // Remove standalone italics markers
        .replace(/^["']|["']$/g, '')
        .replace(/"/g, '') // Aggressively remove ALL double quotes
        .trim();

    const handleRegenerate = async (feedback) => {
        setModal(prev => ({ ...prev, isLoading: true }));
        try {
            await regeneratePlan(feedback);
            onUpdate();
            closeModal();
            toast?.success("Plan Refreshed! 🔄");
        } catch (error) {
            closeModal(); // Close prompt
            // Show error modal
            setModal({
                isOpen: true,
                type: "alert",
                title: "Error",
                message: "Failed to regenerate plan. Please try again.",
                onConfirm: () => closeModal()
            });
        }
    };

    // ... (omitting unchanged methods for brevity in tool call, sticking to one replace block per call usually safer but I need to replace separate blocks. I will use multi_replace for clarity.)

    // Actually, I can use multi_replace.
    // Block 1: handleRegenerate toast.
    // Block 2: Free Plan badge.

    // Returning for separate tool call or single replace if contiguous. They are not contiguous.
    // multi_replace is safer.

    // Local state for optimistic updates
    const [optimisticTasks, setOptimisticTasks] = useState(null);

    // Sync optimistic tasks when plan changes
    React.useEffect(() => {
        if (plan?.tasks) {
            setOptimisticTasks(plan.tasks);
        }
    }, [plan?.tasks]);

    const handleToggleTask = async (taskId, e) => {
        if (plan?.status === "SUBMITTED") {
            toast?.error("This day is finalized.");
            return;
        }

        // Optimistic Update
        const previousTasks = [...optimisticTasks];
        const newTasks = optimisticTasks.map(t =>
            t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setOptimisticTasks(newTasks);

        // Check if we just completed the last task
        const totalTasks = newTasks.length;
        const completeTasksCount = newTasks.filter(t => t.isCompleted).length;
        const taskObj = optimisticTasks.find(t => t._id === taskId);
        
        if (completeTasksCount === totalTasks && !taskObj.isCompleted) {
            // Exploding fireworks!
            const rect = e.target.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { x, y },
                colors: ['#34D399', '#10B981', '#059669', '#FDE68A', '#FBBF24']
            });
        }

        try {
            await completeTask(plan._id, taskId);
            // Sync with parent (silent fetch)
            onUpdate();
        } catch (error) {
            // Revert on error
            setOptimisticTasks(previousTasks);
            toast?.error("Failed to update task. Reverting...");
            console.error(error);
        }
    };

    // Use optimisticTasks for rendering if available
    const displayTasks = optimisticTasks || plan?.tasks || [];

    const handleFinishDay = async () => {
        setModal(prev => ({ ...prev, isLoading: true }));
        try {
            await submitDayAPI();
            onUpdate();
            // Instead of standard Day Complete, immediately prompt Journal
            setModal({
                isOpen: true,
                type: "confirm",
                title: "Day Locked In! 🔒",
                message: "Great job completing today! Would you like to quickly jump into your Daily Journal to reflect on your progress?",
                confirmText: "Write Now",
                cancelText: "Maybe Later",
                onConfirm: () => {
                    setView("journal");
                    closeModal();
                }
            });
        } catch (error) {
            closeModal();
            setModal({
                isOpen: true,
                type: "alert",
                title: "Error",
                message: "Failed to finish day. Please try again.",
                onConfirm: () => closeModal()
            });
        }
    };

    const openFinishDayModal = () => {
        setModal({
            isOpen: true,
            type: "confirm",
            title: "Finish Day?",
            message: "This will lock today's progress and roll over any pending tasks to tomorrow. Are you ready?",
            confirmText: "Yes, Finish Day",
            cancelText: "Cancel",
            onConfirm: handleFinishDay
        });
    };

    const openRegenerateModal = () => {
        setModal({
            isOpen: true,
            type: "prompt",
            title: "Regenerate Plan",
            message: "Tell the AI what you'd like to change about this plan (e.g. 'More coding', 'Less math').",
            inputPlaceholder: "I have more time today...",
            confirmText: "Regenerate",
            onConfirm: (feedback) => handleRegenerate(feedback)
        });
    };

    const calculateProgress = () => {
        if (displayTasks.length === 0) return 0;
        const completed = displayTasks.filter(t => t.isCompleted).length;
        return Math.round((completed / displayTasks.length) * 100);
    };

    const stats = {
        completed: displayTasks.filter(t => t.isCompleted).length || 0,
        total: displayTasks.length || 0,
        percentage: calculateProgress(),
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <UIModal
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onClose={closeModal}
                isLoading={modal.isLoading}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                inputPlaceholder={modal.inputPlaceholder} 
            />

            {!goal ? (
                <div className="bg-white p-16 rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner animate-bounce">
                        🎯
                    </div>
                    <div>
                        <h2 className="text-4xl font-title text-text-primary tracking-tighter mb-2">Ready to Level Up?</h2>
                        <p className="text-sm font-sans font-semibold text-text-muted uppercase tracking-widest max-w-sm mx-auto">Set your goal and let AI architect your path to mastery.</p>
                    </div>
                    <button
                        onClick={() => setView("goal-setup")}
                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-secondary transition-all shadow-2xl shadow-indigo-100 active:scale-95"
                    >
                        👈 Set Your Goal
                    </button>
                </div>
            ) : !plan ? (
                <div className="bg-white p-16 rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">
                        📅
                    </div>
                    <div>
                        <h2 className="text-4xl font-title text-text-primary tracking-tighter mb-2">No Plan Yet</h2>
                        <p className="text-sm font-sans font-semibold text-text-muted uppercase tracking-widest max-w-sm mx-auto">Generate your daily plan to get started.</p>
                    </div>
                    <button
                        onClick={() => setView("daily-plan")}
                        className="bg-primary text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-secondary transition-all shadow-2xl shadow-indigo-100 active:scale-95"
                    >
                        Generate Daily Plan
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* 1. Header Section (Clean Style - Pastel Green) */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 md:p-10 rounded-[3rem] border border-emerald-100/50 shadow-xl shadow-teal-100/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="relative z-10 space-y-4 max-w-2xl">
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black text-text-primary tracking-tighter leading-tight">
                                    {getGreeting()}, <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                        {user?.name?.split(' ')[0] || 'Scholar'}
                                    </span>! 👋
                                </h1>
                                <p className="text-sm font-bold text-text-muted uppercase tracking-widest mt-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-stone-200/50">
                                <p className="text-lg md:text-xl font-serif text-text-primary/90 leading-relaxed pl-1">
                                    {cleanMotivation}
                                </p>
                            </div>
                        </div>

                        {/* Active Mission Badge */}
                        {goal && (
                            <div className="bg-[#FDFBF7] p-6 rounded-[2rem] border border-stone-100 flex flex-col items-center text-center space-y-3 min-w-[200px] hover:shadow-lg transition-all group cursor-default">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-stone-50 group-hover:scale-110 transition-transform">
                                    🎯
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Current Mission</p>
                                    <p className="font-bold text-primary text-sm line-clamp-1">{goal.title}</p>
                                </div>
                                <div className="px-3 py-1 bg-white rounded-full border border-gray-100 text-[10px] font-bold text-text-muted uppercase tracking-widest shadow-sm">
                                    {goal.target || "On Track"}
                                </div>
                            </div>
                        )}

                        {/* Subtle Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
                    </div>

                    {/* 3. Today's Daily Plan (Tasks) */}
                    <div>
                        {/* Header with Progress */}
                        <div className="flex items-center justify-between px-4 mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                                <div>
                                    <h2 className="text-3xl font-title text-text-primary tracking-tighter">Today's Focus</h2>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                        {stats.completed} of {stats.total} completed • {stats.percentage}%
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="hidden md:flex items-center px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <span className="text-xs font-bold text-primary">{stats.percentage}% Done</span>
                                </div>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="grid grid-cols-1 gap-6">
                            {displayTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className={`group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 ${task.isCompleted
                                        ? "border-emerald-100 bg-emerald-50/5 grayscale-[0.8] opacity-60"
                                        : "border-gray-100 hover:border-primary/10"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={task.isCompleted}
                                                onChange={(e) => handleToggleTask(task._id, e)}
                                                disabled={loading || plan.status === "SUBMITTED"}
                                                className="w-8 h-8 rounded-xl border-2 border-gray-200 text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            {task.isCompleted && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-full h-full bg-emerald-500 rounded-xl animate-ping opacity-20"></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-8 flex-1">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${task.isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-primary"
                                                    }`}>
                                                    {task.skill}
                                                </span>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                    ⏱️ {task.duration} MIN
                                                </span>
                                                {task.isRolledOver && !task.isCompleted && (
                                                    <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase tracking-tighter">Rolled Over</span>
                                                )}
                                            </div>
                                            <p className={`text-lg font-bold leading-tight transition-all duration-500 ${task.isCompleted ? "text-text-muted line-through" : "text-text-primary"
                                                }`}>
                                                {task.task}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Task Progress Bar (subtle) */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className={`h-full transition-all duration-1000 ${task.isCompleted ? 'w-full bg-emerald-500' : 'w-0 bg-primary group-hover:w-1/3'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Progress Overview & Actions - Light Mist bg */}
                    <div className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50 mt-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-text-primary tracking-tight">Progress Overview</h3>
                            <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-primary shadow-sm border border-gray-100">{stats.percentage}% Completed</span>
                        </div>
                        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden mb-8">
                            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out" style={{ width: `${stats.percentage}%` }}></div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                            <button onClick={() => setView("daily-plan")} className="flex-1 min-w-[140px] p-4 bg-white hover:bg-indigo-50 text-primary rounded-2xl border border-gray-200 hover:border-primary transition-all font-bold text-xs uppercase tracking-widest">📋 Full View</button>
                            <button onClick={openRegenerateModal} disabled={loading || plan?.status === "SUBMITTED"} className="flex-1 min-w-[140px] p-4 bg-white hover:bg-amber-50 text-amber-600 rounded-2xl border border-gray-200 hover:border-amber-500 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">🔄 Regenerate</button>
                            {plan.status !== "SUBMITTED" ? (
                                <button onClick={openFinishDayModal} disabled={loading} className="flex-1 min-w-[140px] p-4 bg-primary hover:bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all font-bold text-xs uppercase tracking-widest">✨ Finish Day</button>
                            ) : (
                                <div className="flex-1 min-w-[140px] p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center font-bold text-xs uppercase tracking-widest">🎉 Completed</div>
                            )}
                            <button onClick={() => setView("progress")} className="flex-1 min-w-[140px] p-4 bg-white hover:bg-emerald-50 text-emerald-600 rounded-2xl border border-gray-200 hover:border-emerald-500 transition-all font-bold text-xs uppercase tracking-widest">📊 Progress</button>
                        </div>
                    </div>


                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
