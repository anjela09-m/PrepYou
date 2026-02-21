import React, { useState } from "react";
import { createGoal, updateGoal } from "../../api/goalApi";
import UIModal from "../common/UIModal";

const GoalForm = ({ onSuccess, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        target: initialData?.target || "",
        preparationMode: initialData?.preparationMode || "placement",
        level: initialData?.level || "Beginner",
        weekdayHours: initialData?.weekdayHours || 2,
        weekendHours: initialData?.weekendHours || 4,
        dayEndTime: initialData?.dayEndTime || "21:00",
        deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : "",
        skills: initialData?.skills || [],
        weakAreas: initialData?.weakAreas?.join(", ") || ""
    });
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...formData.skills];
        newSkills[index][field] = value;
        setFormData({ ...formData, skills: newSkills });
    };

    const addSkill = () => {
        setFormData({ ...formData, skills: [...formData.skills, { name: "", priority: 3 }] });
    };

    const removeSkill = (index) => {
        const newSkills = formData.skills.filter((_, i) => i !== index);
        setFormData({ ...formData, skills: newSkills });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanedSkills = formData.skills.filter(s => s.name.trim() !== "");
            const weakAreasArray = formData.weakAreas.split(",").map(s => s.trim()).filter(s => s !== "");

            const goalPayload = {
                ...formData,
                skills: cleanedSkills,
                weakAreas: weakAreasArray
            };

            if (initialData?._id) {
                await updateGoal(initialData._id, goalPayload);
            } else {
                await createGoal(goalPayload);
            }
            onSuccess();
        } catch (error) {
            setErrorModal({
                isOpen: true,
                message: "Failed to save goal: " + (error.response?.data?.message || error.message)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <UIModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                type="alert"
                title="Goal Error"
                message={errorModal.message}
                onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
            />
            <form className="space-y-12" onSubmit={handleSubmit}>
                <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 space-y-10 relative overflow-hidden transition-all duration-500 hover:shadow-indigo-200/40">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -z-10 -mr-32 -mt-32"></div>

                    <div>
                        <h3 className="text-3xl font-black text-text-primary tracking-tighter mb-3">Architect Your Goal</h3>
                        <p className="text-sm font-bold text-text-muted max-w-lg leading-relaxed uppercase tracking-widest opacity-80">
                            Define your trajectory. Our AI will handle the complexity of scheduling.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-primary uppercase tracking-[0.2em] ml-1">Goal Vision</label>
                            <input
                                name="title"
                                value={formData.title}
                                placeholder="e.g. Senior SDE at Google"
                                required
                                className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 focus:border-primary focus:ring-4 focus:ring-primary/5 p-5 border text-base font-bold transition-all placeholder:text-gray-300 placeholder:font-medium"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-primary uppercase tracking-[0.2em] ml-1">North Star (Target)</label>
                            <input
                                name="target"
                                value={formData.target}
                                placeholder="e.g. Google, DeepMind, FAANG"
                                required
                                className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 focus:border-primary focus:ring-4 focus:ring-primary/5 p-5 border text-base font-bold transition-all placeholder:text-gray-300 placeholder:font-medium"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-primary uppercase tracking-[0.2em] ml-1">Strategy Mode</label>
                            <div className="relative">
                                <select
                                    name="preparationMode"
                                    value={formData.preparationMode}
                                    className="w-full appearance-none rounded-[1.5rem] border-gray-100 bg-gray-50/50 focus:border-primary focus:ring-4 focus:ring-primary/5 p-5 border text-base font-bold transition-all cursor-pointer"
                                    onChange={handleChange}
                                >
                                    <option value="placement">Job Placement</option>
                                    <option value="competitive">Competitive Coding</option>
                                    <option value="competitive-exam">Competitive Exam (NEET, JEE, etc.)</option>
                                    <option value="language-cert">Language Certification (IELTS, TOEFL)</option>
                                    <option value="skill-switch">Domain Transition</option>
                                    <option value="interview">Specific Interview</option>
                                    <option value="other">Other / Skill Acquisition</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-primary uppercase tracking-[0.2em] ml-1">Intensity Level</label>
                            <div className="flex space-x-2">
                                {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, level: lvl }))}
                                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.level === lvl
                                            ? "bg-primary text-white border-primary shadow-lg shadow-indigo-100"
                                            : "bg-white text-text-muted border-gray-50 hover:border-indigo-100 hover:text-primary"
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-1 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
                        <div className="p-5 space-y-2 bg-white rounded-[1.75rem] shadow-sm transform transition-all hover:scale-[1.02]">
                            <div className="flex items-center space-x-2">
                                <span className="text-base">☕</span>
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Weekdays</label>
                            </div>
                            <input
                                type="number"
                                name="weekdayHours"
                                value={formData.weekdayHours}
                                placeholder="Hours"
                                required
                                className="w-full border-none focus:ring-0 p-0 text-lg font-black text-text-primary placeholder:text-gray-200"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="p-5 space-y-2 bg-white rounded-[1.75rem] shadow-sm transform transition-all hover:scale-[1.02]">
                            <div className="flex items-center space-x-2">
                                <span className="text-base">🔥</span>
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Weekends</label>
                            </div>
                            <input
                                type="number"
                                name="weekendHours"
                                value={formData.weekendHours}
                                placeholder="Hours"
                                required
                                className="w-full border-none focus:ring-0 p-0 text-lg font-black text-text-primary placeholder:text-gray-200"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="p-5 space-y-2 bg-white rounded-[1.75rem] shadow-sm transform transition-all hover:scale-[1.02]">
                            <div className="flex items-center space-x-2">
                                <span className="text-base">🌙</span>
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Day End</label>
                            </div>
                            <select
                                name="dayEndTime"
                                value={formData.dayEndTime}
                                required
                                className="w-full border-none focus:ring-0 p-0 text-lg font-black text-text-primary"
                                onChange={handleChange}
                            >
                                <option value="20:00">8 PM</option>
                                <option value="21:00">9 PM</option>
                                <option value="22:00">10 PM</option>
                                <option value="23:00">11 PM</option>
                            </select>
                        </div>
                        <div className="p-5 space-y-2 bg-white rounded-[1.75rem] shadow-sm transform transition-all hover:scale-[1.02]">
                            <div className="flex items-center space-x-2">
                                <span className="text-base">🏁</span>
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Deadline</label>
                            </div>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                required
                                className="w-full border-none focus:ring-0 p-0 text-lg font-black text-text-primary"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-text-primary uppercase tracking-[0.2em] ml-1">Skill Forge</label>
                            <button
                                type="button"
                                onClick={addSkill}
                                className="bg-indigo-50 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                                + Manual Entry
                            </button>
                        </div>

                        {formData.skills.length === 0 && (
                            <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center group cursor-pointer hover:border-indigo-200 transition-colors" onClick={addSkill}>
                                <p className="text-sm font-bold text-text-muted group-hover:text-primary transition-colors">Start adding specific skills or let AI decide</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center p-2 bg-gray-50/50 rounded-2xl border border-gray-100 group animate-in zoom-in-95 duration-300">
                                    <input
                                        placeholder="Skill..."
                                        value={skill.name}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-black p-3"
                                        onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                                    />
                                    <div className="flex items-center pr-2">
                                        <select
                                            value={skill.priority}
                                            className="bg-white border-gray-100 rounded-xl text-[10px] font-black p-2 focus:ring-1 focus:ring-primary w-16"
                                            onChange={(e) => handleSkillChange(index, "priority", parseInt(e.target.value))}
                                        >
                                            <option value="1">P1</option>
                                            <option value="2">P2</option>
                                            <option value="3">P3</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(index)}
                                            className="ml-2 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 flex flex-col items-center w-full space-y-8">
                        <div className="w-full max-w-md space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full relative overflow-hidden bg-primary text-white py-6 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-70"
                            >
                                <div className="relative z-10 flex items-center justify-center space-x-3">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="uppercase tracking-[0.1em]">Engine Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-[0.1em]">{initialData ? "Update Roadmap" : "Generate AI Roadmap"}</span>
                                            <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000"></div>
                            </button>
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full text-xs font-black text-text-muted uppercase tracking-widest hover:text-primary transition-all text-center"
                                >
                                    Cancel Changes
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-3 text-text-muted">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Joined by 12,000+ top engineers</p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default GoalForm;
