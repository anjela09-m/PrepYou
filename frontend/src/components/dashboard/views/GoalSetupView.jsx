import React, { useState } from "react";
import GoalForm from "../GoalForm";
import UIModal from "../../common/UIModal";
import { deleteGoal } from "../../../api/goalApi";
import "./Views.css";

const GoalSetupView = ({ goal, onGoalCreated, setView }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", onConfirm: () => { } });

    const handleEditSuccess = () => {
        setIsEditing(false);
        onGoalCreated();
    };

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleReset = async () => {
        try {
            await deleteGoal(goal._id);
            setModal({
                isOpen: true,
                type: "alert",
                title: "Goal Reset",
                message: "Your goal has been successfully deleted.",
                onConfirm: () => {
                    closeModal();
                    onGoalCreated(); // Refresh parent data (will result in no active goal)
                }
            });
        } catch (error) {
            setModal({
                isOpen: true,
                type: "alert",
                title: "Error",
                message: "Failed to reset goal: " + (error.response?.data?.message || error.message),
                onConfirm: closeModal
            });
        }
    };

    const confirmReset = () => {
        setModal({
            isOpen: true,
            type: "confirm",
            title: "Reset Goal?",
            message: "Are you sure you want to reset your goal? This will delete all progress and cannot be undone.",
            confirmText: "Yes, Reset Everything",
            onConfirm: handleReset
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <UIModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                {...modal}
            />
            {!goal || isEditing ? (
                <div className="flex flex-col items-center text-center space-y-10">
                    {!goal && (
                        <div className="p-4 bg-indigo-50 rounded-[2rem] border-2 border-dashed border-indigo-100/50">
                            <div className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center text-5xl shadow-xl shadow-indigo-100 animate-bounce">
                                🎯
                            </div>
                        </div>
                    )}
                    <GoalForm
                        onSuccess={handleEditSuccess}
                        initialData={goal}
                        onCancel={isEditing ? () => setIsEditing(false) : null}
                    />
                </div>
            ) : (
                <div className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl -z-10 -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter leading-tight">
                                {goal.title}
                            </h2>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            {goal.status === "draft" && (
                                <button
                                    onClick={() => setView("dashboard")}
                                    className="px-8 py-4 bg-primary text-white hover:bg-indigo-600 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95 animate-pulse"
                                >
                                    ✨ View AI Roadmap
                                </button>
                            )}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-gray-50 text-text-muted hover:bg-white hover:shadow-lg hover:text-text-primary rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-gray-100 active:scale-95"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={confirmReset}
                                    className="px-6 py-3 bg-red-50/50 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-red-100/10 active:scale-95"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all duration-500 group/item">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 group-hover/item:text-primary transition-colors">Target Level</p>
                            <div className="flex items-center space-x-3 text-2xl font-black text-text-primary">
                                <span className="text-3xl">⚡</span>
                                <span>{goal.level}</span>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all duration-500 group/item">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 group-hover/item:text-primary transition-colors">Target Deadline</p>
                            <div className="flex items-center space-x-3 text-2xl font-black text-text-primary">
                                <span className="text-3xl">🗓️</span>
                                <span>{new Date(goal.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-50/30 rounded-3xl border border-indigo-100/20 backdrop-blur-sm">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Strategic Description</p>
                        <p className="text-lg font-bold text-text-primary leading-relaxed">
                            {goal.description || `Preparing for ${goal.target || 'your target'} with a focus on ${goal.level} level mastery.`}
                        </p>
                    </div>

                    <div className="mt-12 flex items-center justify-center p-6 bg-amber-50 rounded-3xl border border-amber-100 group-hover:animate-pulse">
                        <p className="text-xs font-bold text-amber-700 text-center leading-relaxed italic">
                            {goal.status === "draft"
                                ? "💡 Status: Your roadmap is ready for review. Click 'View AI Roadmap' to start your mission."
                                : "💡 Strategic Notice: To pivot your path, you'll need to archive current progress and re-architect your roadmap."
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalSetupView;
