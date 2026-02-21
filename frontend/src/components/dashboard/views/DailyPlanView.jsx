import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { acceptPlan, regeneratePlan, completeTask, submitDay as submitDayAPI } from "../../../api/planApi";
import { createEntry } from "../../../api/journalApi";
import UIModal from "../../common/UIModal";
import "./Views.css";

const DailyPlanView = ({ plan, onUpdate, setView }) => {
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [journalContent, setJournalContent] = useState("");
    const [sentimentResult, setSentimentResult] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: () => { } });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));
    const openAlert = (title, message) => setModal({ isOpen: true, type: "alert", title, message, onConfirm: closeModal });

    const handleAccept = async () => {
        setLoading(true);
        try {
            await acceptPlan();
            onUpdate();
            toast.success("Mission Accepted! 🚀");
        } catch (error) {
            openAlert("Error", "Failed to accept plan");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async (feedback) => {
        // Feedback comes from modal if provided, or from prompt text area (if unaccepted plan view)
        const finalPrompt = feedback || prompt;
        setLoading(true);
        try {
            await regeneratePlan(finalPrompt);
            onUpdate();
            setPrompt("");
            closeModal();
            toast.success("New Plan Generated 🧠");
        } catch (error) {
            closeModal();
            openAlert("Error", "Failed to regenerate plan");
        } finally {
            setLoading(false);
        }
    };

    // Local state for optimistic updates
    const [optimisticTasks, setOptimisticTasks] = useState(null);

    // Sync optimistic tasks when plan changes
    React.useEffect(() => {
        if (plan?.tasks) {
            setOptimisticTasks(plan.tasks);
        }
    }, [plan?.tasks]);

    const handleToggleTask = async (taskId) => {
        if (!plan) return;

        // Prevent toggling if day is already submitted
        if (plan.status === "SUBMITTED") {
            openAlert("Locked", "This day has been submitted and locked. Tasks cannot be modified.");
            return;
        }

        // Optimistic Update
        const previousTasks = [...optimisticTasks];
        const newTasks = optimisticTasks.map(t =>
            t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setOptimisticTasks(newTasks);

        try {
            const res = await completeTask(plan._id, taskId); // res.data.plan contains updated plan
            onUpdate();

            // Celebration & Journal Prompt Logic
            const updatedTasks = res.data.plan.tasks;
            const allCompleted = updatedTasks.every(t => t.isCompleted);

            if (allCompleted) {
                setModal({
                    isOpen: true,
                    type: "confirm",
                    title: "Great work today 🎉",
                    message: "You've crushed your daily goals! Would you like to reflect on your day?",
                    confirmText: "Write Journal",
                    cancelText: "No thanks",
                    onConfirm: () => {
                        closeModal();
                        setView("journal");
                    },
                    onCancel: () => closeModal()
                });
            }

        } catch (error) {
            setOptimisticTasks(previousTasks);
            openAlert("Error", "Failed to update task status");
        }
    };

    // Use optimisticTasks for rendering if available
    const displayTasks = optimisticTasks || plan?.tasks || [];

    const handleSubmitDay = async () => {
        setLoading(true);
        try {
            const response = await submitDayAPI();
            onUpdate();
            closeModal();
            openAlert("Day Completed!", response.data.message || "Great job! Your progress has been logged.");
        } catch (error) {
            closeModal();
            openAlert("Error", "Failed to submit day: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const openSubmitConfirm = () => {
        setModal({
            isOpen: true,
            type: "confirm",
            title: "Finish Day?",
            message: "Are you sure you want to submit today's progress? This will lock the day and roll over pending tasks to tomorrow.",
            confirmText: "Yes, Finish Day",
            onConfirm: handleSubmitDay
        });
    };

    const openRegenerateModal = () => {
        setModal({
            isOpen: true,
            type: "prompt",
            title: "Regenerate Plan",
            message: "Regenerate today's plan? This will replace your current tasks.",
            inputPlaceholder: "e.g., I have more time today, give me harder tasks...",
            confirmText: "Regenerate",
            onConfirm: (feedback) => handleRegenerate(feedback)
        });
    };

    const handleJournalSubmit = async () => {
        if (!journalContent.trim()) return;
        setLoading(true);
        try {
            const res = await createEntry(journalContent);
            setSentimentResult(res.data.sentiment);
            toast?.success("Reflection saved!");
            setJournalContent("");
        } catch (error) {
            openAlert("Error", "Failed to save reflection");
        } finally {
            setLoading(false);
        }
    };

    const getSentimentEmoji = (s) => {
        switch (s?.toLowerCase()) {
            case 'motivated': return '🔥';
            case 'neutral': return '😐';
            case 'stressed': return '😰';
            case 'demotivated': return '📉';
            default: return '🧠';
        }
    };

    if (!plan) {
        return (
            <div className="max-w-4xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <UIModal
                    isOpen={modal.isOpen}
                    onClose={closeModal}
                    {...modal}
                />
                <div className="bg-white p-16 rounded-[4rem] shadow-2xl shadow-brand-indigo/50 border border-brand-indigo/10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary"></div>
                    <div className="w-24 h-24 bg-brand-indigo/5 rounded-3xl flex items-center justify-center text-5xl shadow-inner">
                        📅
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold text-text-primary tracking-tighter">Plan Horizon Clear</h2>
                        <p className="text-sm font-semibold text-text-muted uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                            Initialize your daily trajectory. Our AI is standing by.
                        </p>
                    </div>
                    <button
                        onClick={() => handleRegenerate("")}
                        disabled={loading}
                        className="bg-primary text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? "Generating Roadmap..." : "Generate Daily Plan"}
                    </button>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-indigo/5/50 rounded-full blur-3xl -z-10"></div>
                </div>
            </div>
        );
    }

    if (!plan.isAccepted) {
        return (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <UIModal
                    isOpen={modal.isOpen}
                    onClose={closeModal}
                    {...modal}
                />
                <div className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-brand-indigo/50 border border-brand-indigo/10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tighter leading-tight">
                                Daily Focus Architect
                            </h2>
                        </div>
                        <div className="flex bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                            <div className="px-6 py-3 text-center">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Tasks</p>
                                <p className="text-xl font-bold text-text-primary">{displayTasks.length}</p>
                            </div>
                            <div className="w-px bg-gray-200 my-2"></div>
                            <div className="px-6 py-3 text-center">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Impact</p>
                                <p className="text-xl font-bold text-text-primary">High</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-4">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Review today's AI-generated strategy before starting.</p>
                    </div>

                    <div className="space-y-4 mb-12">
                        {displayTasks.map((task, index) => (
                            <div key={index} className="flex items-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 group hover:bg-white hover:shadow-xl hover:border-white transition-all duration-500">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                                    🚀
                                </div>
                                <div className="ml-6 flex-1">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1 block">{task.skill}</span>
                                    <p className="text-base font-semibold text-text-primary leading-tight">{task.task}</p>
                                </div>
                                <div className="px-4 py-2 bg-brand-indigo/5 rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest">
                                    {task.duration} MIN
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-4">Advanced Feedback (Optional)</label>
                            <textarea
                                placeholder="Refine your roadmap... (e.g., 'Focus more on architecture concepts')"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-white rounded-[2rem] border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 p-6 text-sm font-semibold min-h-[100px] transition-all resize-none shadow-sm"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleRegenerate(prompt)} // Use local state prompt
                                disabled={loading} // Enable even if prompt empty to regenerate defaults
                                className="flex-1 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] text-text-muted hover:bg-white hover:text-primary transition-all border-2 border-transparent hover:border-primary/10 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                Regenerate
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={loading}
                                className="flex-[2] py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] bg-primary text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? "Locking in..." : "🚀 Deploy Mission to Dashboard"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <UIModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                {...modal}
            />
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary tracking-tighter">Mission Control</h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Execution window open</p>
                    </div>
                </div>
                <button
                    onClick={openRegenerateModal}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-white text-text-muted hover:text-primary rounded-2xl border border-gray-100 hover:shadow-lg transition-all active:scale-95 group"
                    title="Regenerate Plan"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Regenerate</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {displayTasks.map((task) => (
                    <div
                        key={task._id}
                        className={`group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-brand-indigo/50 ${task.isCompleted
                            ? "border-emerald-100 bg-emerald-50/5 grayscale-[0.8] opacity-60"
                            : "border-gray-100 hover:border-primary/10"
                            }`}
                    >
                        <div className="flex items-center">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={task.isCompleted}
                                    onChange={() => handleToggleTask(task._id)}
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
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${task.isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-brand-indigo/5 text-primary"
                                        }`}>
                                        {task.skill}
                                    </span>
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                                        ⏱️ {task.duration} MIN
                                    </span>
                                </div>
                                <p className={`text-lg font-semibold leading-tight transition-all duration-500 ${task.isCompleted ? "text-text-muted line-through" : "text-text-primary"
                                    }`}>
                                    {task.task}
                                </p>
                            </div>

                            {!task.isCompleted && (
                                <div className="hidden md:flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex -space-x-1">
                                        {[1, 2].map(i => (
                                            <div key={i} className="w-4 h-4 bg-gray-100 rounded-full border border-white"></div>
                                        ))}
                                    </div>
                                    <span className="text-[8px] font-bold text-text-muted uppercase mt-1">Experts</span>
                                </div>
                            )}
                        </div>

                        {/* Task Progress Bar (subtle) */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className={`h-full transition-all duration-1000 ${task.isCompleted ? 'w-full bg-emerald-500' : 'w-0 bg-primary group-hover:w-1/3'}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Day Button or Celebration */}
            {plan.status === "SUBMITTED" ? (
                <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="p-10 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[3rem] border-2 border-emerald-200 flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-emerald-200 animate-bounce">🎉</div>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-emerald-700 uppercase tracking-widest">Day Completed!</p>
                            <p className="text-sm font-semibold text-emerald-600 max-w-md">
                                Your progress has been locked. Completion: {plan.completionPercentage}%
                            </p>
                        </div>
                    </div>

                </div>
            ) : (
                <button
                    onClick={openSubmitConfirm}
                    disabled={loading}
                    className="w-full p-10 bg-gradient-to-r from-primary to-accent hover:from-indigo-600 hover:to-orange-500 text-white rounded-[3rem] border-2 border-white shadow-2xl shadow-indigo-200 transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            ✅
                        </div>
                        <p className="text-2xl font-bold uppercase tracking-widest">✨ Finalize & Finish Day</p>
                        <p className="text-sm font-semibold opacity-90 max-w-md">
                            Lock your completion, roll over pending tasks, and generate tomorrow's plan
                        </p>
                    </div>
                </button>
            )}
        </div>
    );
};

export default DailyPlanView;
