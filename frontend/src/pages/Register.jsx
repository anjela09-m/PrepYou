import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import UIModal from "../components/common/UIModal";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    preferredStudyTime: "morning",
    targetType: "placements"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // AJAX request using Axios
      await API.post("/auth/register", formData);
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      // Set error modal instead of inline error
      setErrorModal({ isOpen: true, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/bg%20vdo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full">
        <Navbar />
      </div>

      <UIModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        type="alert"
        title="Registration Failed"
        message={errorModal.message}
        onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 md:py-20 w-full">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white/50 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>

            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary text-center">
                Join PrepYou
              </h2>
              <p className="mt-3 text-center text-text-muted font-medium">
                Start your AI-powered journey today.
              </p>

              <form className="mt-10 space-y-5" onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2 ml-1">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="block w-full rounded-2xl border-gray-100 bg-white/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm p-4 border transition-all duration-200 outline-none"
                      placeholder="e.g. Alex Johnson"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2 ml-1">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="block w-full rounded-2xl border-gray-100 bg-white/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm p-4 border transition-all duration-200 outline-none"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2 ml-1">Password</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full rounded-2xl border-gray-100 bg-white/50 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm p-4 pr-12 border transition-all duration-200 outline-none"
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white hover:bg-secondary hover:-translate-y-0.5 transition-all shadow-xl shadow-brand-indigo/30 disabled:opacity-70 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : "Start Your Journey"}
                  </button>
                </div>

                <div className="text-center mt-8">
                  <p className="text-text-muted font-medium text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-accent hover:text-secondary underline underline-offset-4 decoration-2 decoration-accent/20 hover:decoration-accent transition-all">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
