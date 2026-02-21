import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UIModal from "../common/UIModal";
import { Logo } from "../common/Logo";

const Sidebar = ({ activeView, setView, isDisabled, isOpen, onClose, activeGoal }) => {
    const { logout, user } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // ... menuItems array definition (omitted for brevity in prompt, but preserved in file via context match if needed, or I need to rewrite it if I am replacing the whole file? replace_file_content replaces strictly.
    // I should modify lines to include imports and return statement edits.

    const menuItems = [
        {
            id: "goal-setup", label: "Active Goal", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            id: "dashboard", label: "Overview", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: "progress", label: "Progress", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            id: "journal", label: "Journal", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
        {
            id: "reminders", label: "Reminders", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        },
        {
            id: "profile", label: "Profile", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: "subscription", label: "Upgrade Plan", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 w-72 bg-[#FDFBF7] border-r border-stone-100 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl shadow-brand-indigo/5 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <UIModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                type="confirm"
                title="Log Out"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                onConfirm={logout}
            />
            <div className="p-8 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-indigo/20 group-hover:scale-110 transition-transform duration-300">
                        <Logo className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-primary tracking-tighter">
                        PrepYou
                    </span>
                </Link>
                <button
                    onClick={onClose}
                    className="md:hidden p-2 text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
                {activeGoal && (
                    <div className="px-4 mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="p-5 bg-secondary rounded-[2rem] text-white shadow-xl shadow-brand-indigo/20 flex flex-col space-y-3 relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Active Mission</span>
                                <h3 className="text-sm font-bold tracking-tight line-clamp-1">{activeGoal.title}</h3>
                                <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                        </div>
                    </div>
                )}

                <nav className="space-y-1.5">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => !isDisabled || item.id === "dashboard" || item.id === "profile" || item.id === "settings" ? setView(item.id) : null}
                            disabled={isDisabled && item.id !== "dashboard" && item.id !== "profile" && item.id !== "settings"}
                            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeView === item.id
                                ? "bg-brand-indigo/5 text-primary shadow-sm shadow-brand-indigo/10"
                                : "text-text-muted hover:bg-gray-50 hover:text-text-primary"
                                } ${isDisabled && item.id !== "dashboard" && item.id !== "profile" ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}`}
                        >
                            <span className={`${activeView === item.id ? "text-primary scale-110" : "text-gray-400 group-hover:text-primary group-hover:scale-110"} transition-all duration-300`}>
                                {item.icon}
                            </span>
                            <span className={`text-sm font-bold tracking-tight ${activeView === item.id ? "text-primary" : "text-text-muted group-hover:text-text-primary"}`}>
                                {item.label}
                            </span>
                            {activeView === item.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-6 border-t border-gray-50 flex flex-col space-y-4">
                {user?.role === "admin" && (
                    <Link
                        to="/admin-dashboard"
                        className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-2xl text-secondary bg-brand-indigo/5 hover:bg-brand-indigo/10 border border-brand-indigo/10 transition-all duration-300 group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-bold uppercase tracking-widest">Admin Panel</span>
                    </Link>
                )}
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-2xl text-red-600 bg-red-50/10 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-300 group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
