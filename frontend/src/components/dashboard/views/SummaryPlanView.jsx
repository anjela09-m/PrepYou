import React, { useState } from "react";
import { acceptGoal, regenerateGoalPlan } from "../../../api/goalApi";
import UIModal from "../../common/UIModal";

const SummaryPlanView = ({ goal, onAccepted }) => {
    const [loading, setLoading] = useState(false);
    const [regeneratePrompt, setRegeneratePrompt] = useState("");
    const [showRegenerateInput, setShowRegenerateInput] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

    const handleAccept = async () => {
        setLoading(true);
        try {
            await acceptGoal(goal._id);
            onAccepted();
        } catch (error) {
            setErrorModal({
                isOpen: true,
                message: "Failed to accept plan: " + (error.response?.data?.message || error.message)
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        try {
            await regenerateGoalPlan(goal._id, regeneratePrompt);
            onAccepted(); // Refresh data to see new summary
            setShowRegenerateInput(false);
            setRegeneratePrompt("");
        } catch (error) {
            setErrorModal({
                isOpen: true,
                message: "Failed to regenerate plan: " + (error.response?.data?.message || error.message)
            });
        } finally {
            setLoading(false);
        }
    };

    const summary = goal.summaryPlan || {};

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <UIModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                type="alert"
                title="Goal Error"
                message={errorModal.message}
                onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
            />
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl -z-10 -mr-40 -mt-40"></div>

                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 mb-4">
                        Strategic AI Roadmap
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter leading-tight mb-4">
                        Roadmap for <span className="text-primary">{goal.title}</span>
                    </h2>
                    <p className="text-lg text-text-muted font-bold max-w-2xl">
                        AI has architected a high-level summary for your target. Review the weekly focus and strategy before locking it in.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 text-sm">📅</span>
                                Weekly Structure
                            </h4>
                            <div className="space-y-4">
                                {summary.weeklyStructure?.map((week, idx) => (
                                    <div key={idx} className="flex items-start space-x-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:border-white transition-all duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-primary border border-gray-100 group-hover:scale-110 transition-transform">
                                            W{week.week}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-sm font-black text-text-primary leading-tight">{week.focus}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mr-3 text-sm">🎯</span>
                                Focus Areas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {summary.focusAreas?.map((area, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-text-primary shadow-sm hover:border-amber-200 hover:bg-amber-50 transition-colors">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-4">Master Strategy</h4>
                                <p className="text-lg font-bold leading-relaxed mb-6 italic opacity-95">
                                    "{summary.strategy}"
                                </p>
                                <div className="h-px w-full bg-white/20 mb-6"></div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Daily Investment</p>
                                        <p className="text-xl font-black">{summary.dailyEffort}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">🚀</div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3 text-sm">📊</span>
                                Skill Distribution
                            </h4>
                            <div className="space-y-4">
                                {summary.skillDistribution?.map((skill, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-muted">
                                            <span>{skill.skill}</span>
                                            <span className="text-primary">{skill.percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${skill.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col items-center space-y-8">
                    {showRegenerateInput && (
                        <div className="w-full max-w-2xl space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="relative">
                                <textarea
                                    className="w-full rounded-[2rem] border-gray-100 bg-gray-50 focus:border-primary focus:ring-4 focus:ring-primary/5 p-8 text-sm font-bold transition-all min-h-[120px]"
                                    placeholder="e.g. 'I want more focus on practical projects' or 'Give more weight to System Design'..."
                                    value={regeneratePrompt}
                                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                                />
                                <div className="absolute bottom-6 right-6 flex space-x-2">
                                    <button
                                        onClick={() => setShowRegenerateInput(false)}
                                        className="px-4 py-2 text-xs font-black text-text-muted uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={loading}
                                        className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? "Regenerating..." : "Apply Feedback"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full justify-center">
                        <button
                            onClick={handleAccept}
                            disabled={loading}
                            className="bg-primary text-white h-16 px-10 rounded-3xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                        >
                            {loading ? "Processing..." : "✅ Accept & Start Roadmap"}
                        </button>

                        {!showRegenerateInput && (
                            <button
                                onClick={() => setShowRegenerateInput(true)}
                                disabled={loading}
                                className="bg-white text-text-muted h-16 px-10 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 border-2 border-gray-100 transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
                            >
                                🔁 Regenerate with Feedback
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryPlanView;
