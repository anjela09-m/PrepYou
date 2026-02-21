import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/Navbar";
import DashboardOverview from "../components/dashboard/views/DashboardOverview";
import GoalSetupView from "../components/dashboard/views/GoalSetupView";
import DailyPlanView from "../components/dashboard/views/DailyPlanView";
import ProgressView from "../components/dashboard/views/ProgressView";
import ProfileView from "../components/dashboard/views/ProfileView";
import JournalView from "../components/dashboard/views/JournalView";
import RemindersView from "../components/dashboard/views/RemindersView";
import SettingsView from "../components/dashboard/views/SettingsView";
import SubscriptionView from "../components/dashboard/views/SubscriptionView";
import ReminderNotifier from "../components/common/ReminderNotifier";
import { getActiveGoal } from "../api/goalApi";
import { getTodayPlan } from "../api/planApi";
import { getProgressSummary } from "../api/progressApi";
import { getLatestEntry } from "../api/journalApi";
import { useAuth } from "../context/AuthContext";
import { getSubscriptionStatus } from "../api/subscriptionApi";

import SummaryPlanView from "../components/dashboard/views/SummaryPlanView";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeGoal, setActiveGoal] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [summary, setSummary] = useState(null);
  const [latestJournal, setLatestJournal] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  // Initialize sidebar closed by default as requested
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Parallelize initial essential requests to eliminate the waterfall delay
      const [goalRes, subRes] = await Promise.all([
        getActiveGoal(),
        getSubscriptionStatus()
      ]);

      setActiveGoal(goalRes.data);
      setSubscription(subRes.data);

      // 2. If an accepted goal exists, fetch the rest of the data.
      // We start this right away but don't strictly require it before 
      // clearing the loading state for a smoother UX.
      if (goalRes.data && goalRes.data.status === "accepted") {
        fetchSupplementalData();
      } else {
        // If no goal or draft goal, we can stop loading now
        if (!silent) setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setActiveGoal(null);
      if (!silent) setLoading(false);
    }
  };

  const fetchSupplementalData = async () => {
    try {
      // Start all supplemental fetches in parallel
      const [planRes, summaryRes, journalRes] = await Promise.all([
        getTodayPlan(),
        getProgressSummary().catch(() => ({ data: null })),
        getLatestEntry().catch(() => ({ data: null }))
      ]);

      setDailyPlan(planRes.data);
      setSummary(summaryRes.data);
      setLatestJournal(journalRes.data);
    } catch (error) {
      console.error("Error fetching supplemental data:", error);
    } finally {
      // Clear main loading state once heavy data is in (or failed)
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, navigate]);

  const toggleSidebar = (e) => {
    e.stopPropagation(); // Prevent main click from immediately closing it
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-text-muted font-medium italic">Preparing your personalized space...</p>
      </div>
    );

    // If goal exists but is in draft, show SummaryPlanView regardless of current 'view'
    // unless the user is trying to setup a new goal
    if (activeGoal && activeGoal.status === "draft" && view !== "goal-setup") {
      return <SummaryPlanView goal={activeGoal} onAccepted={() => fetchData(false)} />;
    }

    switch (view) {
      case "dashboard":
        return <DashboardOverview user={user} goal={activeGoal} plan={dailyPlan} setView={setView} summary={summary} latestJournal={latestJournal} subscription={subscription} onUpdate={() => fetchData(true)} />; // Silent update
      case "goal-setup":
        return <GoalSetupView goal={activeGoal} onGoalCreated={() => { fetchData(); setView("dashboard"); }} setView={setView} />;
      case "daily-plan":
        return <DailyPlanView plan={dailyPlan} onUpdate={() => fetchData(true)} setView={setView} />;
      case "progress":
        return <ProgressView goal={activeGoal} />;
      case "journal":
        return <JournalView />;
      case "reminders":
        return <RemindersView />;
      case "settings":
        return <SettingsView />;
      case "subscription":
        return <SubscriptionView />;
      case "profile":
        return <ProfileView user={user} activeGoal={activeGoal} />;
      default:
        return <DashboardOverview user={user} goal={activeGoal} plan={dailyPlan} setView={setView} summary={summary} latestJournal={latestJournal} subscription={subscription} onUpdate={fetchData} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <ReminderNotifier />
      <Sidebar
        activeView={view}
        setView={(v) => {
          setView(v);
          setIsSidebarOpen(false); // Close on selection
        }}
        isDisabled={!activeGoal}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeGoal={activeGoal}
      />

      <main
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
        onClick={() => isSidebarOpen && setIsSidebarOpen(false)} // Close when clicking main area if open
      >
        <div className="sticky top-0 z-30 flex items-center bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
          <button
            onClick={toggleSidebar}
            className="p-4 text-text-muted hover:text-primary transition-colors focus:outline-none"
            title="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <Navbar onDashboardAction={() => setView("dashboard")} />
          </div>
        </div>

        {/* Mobile Sidebar Toggle - Hidden if using the top bar toggle */}
        {/* We can remove the separate mobile toggle since the top bar one works for both now,
            provided Navbar doesn't block it.
            However, Navbar takes full width. Let's wrap Navbar properly.
        */}

        <div className="flex-1 px-4 md:px-12 py-8 md:py-14">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
