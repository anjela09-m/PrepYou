import React from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Views.css";

const ProfileView = ({ user, activeGoal }) => {
    const { logout } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter">Your Profile</h2>
                </div>
            </div>

            <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-[100px] -z-10 -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-10 mb-16">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-indigo-100 to-white rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-primary border-4 border-white shadow-2xl shadow-indigo-100/50 group-hover/avatar:scale-105 transition-transform duration-500">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full shadow-lg"></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl md:text-4xl font-black text-text-primary tracking-tighter">{user?.name}</h3>
                        <p className="text-text-muted font-medium">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {[
                        { label: "Email", val: user?.email || "N/A", icon: "📧" },
                        { label: "Account ID", val: user?.id || user?._id || "Unidentified", icon: "🆔" },
                        { label: "My Goal", val: activeGoal?.title || "No active goal selected", icon: "🎯" },
                    ].map((item) => (
                        <div key={item.label} className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:border-white transition-all duration-500 group/item">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="text-sm">{item.icon}</span>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">{item.label}</p>
                            </div>
                            <p className="text-lg font-black text-text-primary truncate">{item.val}</p>
                        </div>
                    ))}
                </div>

                {/* Usage Analytics */}
                <div className="mb-16">
                    <h4 className="text-2xl font-black text-text-primary tracking-tighter mb-8 px-2">Usage Analytics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl">✅</span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Lifetime</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-text-primary">{user?.stats?.tasksCompleted || 0}</p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Tasks Completed</p>
                            </div>
                        </div>
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl">🔥</span>
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Streak</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-text-primary">{user?.stats?.daysActive || 0}</p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Days Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Preferences */}
                <div className="mb-16">
                    <h4 className="text-2xl font-black text-text-primary tracking-tighter mb-8 px-2">System Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🔔</div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Daily Reminder</p>
                                <p className="text-base font-bold text-text-primary">{user?.preferences?.reminderTime || "20:00"}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">⏳</div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Daily Target</p>
                                <p className="text-base font-bold text-text-primary">{activeGoal?.weekdayHours || 2} Hours</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">✨</div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">AI Assistance</p>
                                <p className="text-base font-bold text-text-primary">{user?.preferences?.aiEnabled === false ? "Disabled" : "Active"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end p-8 bg-indigo-50/30 rounded-3xl border border-indigo-100/20 backdrop-blur-sm gap-6">
                    <button
                        onClick={logout}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100 shadow-sm hover:shadow-red-100 active:scale-95"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
