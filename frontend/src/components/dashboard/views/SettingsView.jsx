import React from "react";

const SettingsView = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div>
                <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-2">Systems <span className="text-primary italic">Architecture.</span></h2>
                <p className="text-text-muted font-bold tracking-tight">Fine-tune your personal study environment.</p>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-gray-100/50 border border-gray-100 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <section className="space-y-6">
                        <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 text-sm">🧠</span>
                            Focus Mode
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-text-primary">Adaptive Workload</span>
                                <div className="w-10 h-5 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-text-muted font-bold uppercase leading-relaxed active:animate-pulse">AI automatically reduces tasks when it detects high stress in journals.</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3 text-sm">🎨</span>
                            Interface
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-text-primary">Vibrant Themes</span>
                                <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100 shadow-sm cursor-pointer"></div>
                                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-sm cursor-pointer"></div>
                                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-sm cursor-pointer"></div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="pt-10 border-t border-gray-50">
                    <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6">Danger Zone</h4>
                    <button className="px-8 py-4 rounded-2xl border-2 border-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all active:scale-95">
                        Archive All Progress & Delete Goal
                    </button>
                    <p className="mt-4 text-[10px] text-red-400 font-bold tracking-tight italic">Warning: This action is irreversible and will permanently delete your AI-generated roadmap.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
