import React from "react";

const NoGoalView = ({ setView }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative mb-8">
                <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner animate-bounce duration-[3000ms]">
                    🎯
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full border-4 border-white animate-pulse"></div>
            </div>

            <div className="max-w-md space-y-4 mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tighter leading-tight">
                    Your Journey <span className="text-primary italic">Starts Here.</span>
                </h2>
                <p className="text-text-muted font-medium leading-relaxed">
                    You haven't set a preparation goal yet. Let's architect a personalized, AI-driven study path to help you crush your targets.
                </p>
            </div>

            <button
                onClick={() => setView("goal-setup")}
                className="group relative bg-primary text-white h-16 px-10 rounded-2xl font-black text-lg transition-all hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 active:scale-95 flex items-center space-x-3"
            >
                <span>Architect Your Path</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                {[
                    { title: "AI Strategy", desc: "Weekly roadmap generated for your specific level.", icon: "🧠" },
                    { title: "Daily Focus", desc: "Automated daily tasks and rollover logic.", icon: "⚡" },
                    { title: "Smart Stats", desc: "Real-time progress tracking and streak counts.", icon: "📊" }
                ].map((feat, i) => (
                    <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left">
                        <div className="text-2xl mb-3">{feat.icon}</div>
                        <h4 className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">{feat.title}</h4>
                        <p className="text-[11px] font-bold text-text-muted leading-relaxed uppercase opacity-60">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoGoalView;
