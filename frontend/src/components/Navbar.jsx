import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./common/Logo";

const Navbar = ({ onDashboardAction }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-stone-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group mr-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-indigo/20 group-hover:scale-110 transition-transform duration-300">
                <Logo className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter">
                PrepYou
              </span>
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin-dashboard" className="text-xs font-bold text-[#8A244B] hover:text-[#8A244B]/70 transition-all px-3 py-1 bg-[#FDC3A1] rounded-lg border border-[#FB9B8F] shadow-sm ml-2">
                Admin Panel
              </Link>
            )}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-10">
            <Link to="/" className="text-sm font-bold text-text-muted hover:text-primary transition-all flex items-center gap-2">
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => onDashboardAction && onDashboardAction()}
                  className="text-sm font-bold text-text-muted hover:text-primary transition-all"
                >
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-2xl bg-gray-50 text-text-primary text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-text-muted hover:text-primary transition-all">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-2xl bg-accent text-white text-sm font-extrabold hover:bg-opacity-90 hover:-translate-y-0.5 transition-all shadow-xl shadow-brand-coral/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button className="p-2 text-text-muted hover:text-primary bg-gray-50 rounded-xl border border-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
