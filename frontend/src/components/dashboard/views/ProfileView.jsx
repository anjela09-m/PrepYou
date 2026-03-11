import React from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Views.css";

const ProfileView = ({ user, activeGoal, subscription }) => {
    const { logout } = useAuth();

    // Tier Logic
    const isPro = user?.role === 'admin' || subscription?.planType === 'pro';
    const tierBadge = isPro ? "PRO USER 👑" : "FREE TIER 🌱";

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            <div className="bg-gradient-to-br from-[#FFF5F3] to-[#F1E8EB] p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-[#5B2A3B]/10 border border-[#FFF5F3]/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F5D8D6]/50 to-[#D9C8CB]/40 rounded-full blur-[80px] -z-10 -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-1000"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12 border-b border-[#D9C8CB]/30 pb-10">
                    <div className="relative group/avatar cursor-pointer">
                        <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-tr from-[#5B2A3B] to-[#8C4A5E] rounded-3xl flex items-center justify-center text-4xl font-black text-[#FFF5F3] border-4 border-[#FFF5F3] shadow-xl shadow-[#5B2A3B]/30 group-hover/avatar:scale-105 transition-transform duration-500 overflow-hidden relative">
                            <span className="group-hover/avatar:hidden">{user?.name?.charAt(0) || "U"}</span>
                            <div className="absolute inset-0 bg-black/50 hidden group-hover/avatar:flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xs font-bold uppercase tracking-widest text-white">Upload</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FFB3B3] border-4 border-[#FFF5F3] rounded-full shadow-lg"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl md:text-3xl font-black text-[#5B2A3B] tracking-tighter">{user?.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${isPro ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-yellow-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {tierBadge}
                            </span>
                        </div>
                        <p className="text-[#8C4A5E] font-medium tracking-wide text-sm">Learner Profile</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {[
                        { label: "Account Email", val: user?.email || "N/A", icon: "📧" },
                        { label: "Goal Selected", val: activeGoal?.title || "No active goal", icon: "🎯" },
                        { label: "Account ID", val: user?.id || user?._id || "Unidentified", icon: "🆔" },
                    ].map((item) => (
                        <div key={item.label} className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#D9C8CB]/50 hover:bg-white hover:shadow-lg hover:border-white transition-all duration-300 group/item hover:-translate-y-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-base">{item.icon}</span>
                                <p className="text-[8px] font-black text-[#8C4A5E] uppercase tracking-[0.2em] group-hover/item:text-[#5B2A3B] transition-colors">{item.label}</p>
                            </div>
                            <p className="text-xs font-bold text-[#5B2A3B] truncate">{item.val}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-12 mb-12">
                    {/* Usage Analytics */}
                    <div>
                        <h4 className="text-lg font-black text-[#5B2A3B] tracking-tight mb-6 px-2 flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#8C4A5E]"></span> Analytics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-[#5B2A3B] text-white rounded-[2rem] border border-[#5B2A3B]/50 shadow-xl shadow-[#5B2A3B]/30 flex flex-col justify-between h-40 group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl filter drop-shadow-md">🚀</span>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-widest border border-white/30">Total</span>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white">{user?.stats?.tasksCompleted || 0}</p>
                                    <p className="text-[9px] font-bold text-[#F5D8D6] uppercase tracking-widest mt-1 opacity-80">Tasks Completed</p>
                                </div>
                            </div>
                            <div className="p-6 bg-white rounded-[2rem] border border-[#D9C8CB]/50 shadow-md shadow-[#D9C8CB]/20 flex flex-col justify-between h-40 group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl">🔥</span>
                                    <span className="px-3 py-1 bg-[#FFF5F3] text-[#F9A8A8] rounded-md text-[8px] font-black uppercase tracking-widest border border-[#F9A8A8]">Streak</span>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-[#5B2A3B]">{user?.stats?.daysActive || 0}</p>
                                    <p className="text-[9px] font-bold text-[#8C4A5E] uppercase tracking-widest mt-1 px-1">Days Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Preferences */}
                    <div>
                        <h4 className="text-lg font-black text-[#5B2A3B] tracking-tight mb-6 px-2 flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#8C4A5E]"></span> System</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-[#D9C8CB]/50 shadow-sm flex flex-col justify-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#8C4A5E] text-sm">🔔</span>
                                    <p className="text-[8px] font-black text-[#8C4A5E] uppercase tracking-widest">Base Reminder</p>
                                </div>
                                <p className="text-sm font-bold text-[#5B2A3B]">{user?.preferences?.reminderTime || "20:00"}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-[#D9C8CB]/50 shadow-sm flex flex-col justify-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#8C4A5E] text-sm">⏳</span>
                                    <p className="text-[8px] font-black text-[#8C4A5E] uppercase tracking-widest">Daily Limit</p>
                                </div>
                                <p className="text-sm font-bold text-[#5B2A3B]">{activeGoal?.weekdayHours || 2} Hrs</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-[#D9C8CB]/50 shadow-sm flex flex-col justify-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#8C4A5E] text-sm">✨</span>
                                    <p className="text-[8px] font-black text-[#8C4A5E] uppercase tracking-widest">AI Status</p>
                                </div>
                                <p className="text-sm font-bold text-[#5B2A3B]">{user?.preferences?.aiEnabled === false ? "Off" : "Active"}</p>
                            </div>
                            <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-center gap-2 ${isPro ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={isPro ? "text-yellow-600 text-sm" : "text-gray-500 text-sm"}>⚡</span>
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${isPro ? 'text-yellow-800' : 'text-gray-500'}`}>Capabilities</p>
                                </div>
                                <p className={`text-[10px] font-bold leading-tight ${isPro ? 'text-yellow-900' : 'text-gray-600'}`}>
                                    {isPro ? "Unlimited AI Generations & Deep Insights." : "Standard Daily Limits Apply. Upgrade to Pro."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end p-6 bg-[#D9C8CB]/20 rounded-3xl border border-[#D9C8CB]/40 backdrop-blur-sm gap-4 mt-8">
                    <button
                        onClick={logout}
                        className="w-full sm:w-auto px-10 py-4 bg-[#5B2A3B] text-white hover:bg-[#3E1D28] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#5B2A3B]/30 hover:shadow-2xl active:scale-95"
                    >
                        Secure Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
