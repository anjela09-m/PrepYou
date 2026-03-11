import React, { useEffect, useState, useCallback } from "react";
import "./AdminDashboard.css";
import { getAllUsers, getAllGoals, getAdminStats, blockUser, unblockUser, getAllDailyPlans } from "../api/adminApi";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUsers,
    FiTarget,
    FiActivity,
    FiBarChart2,
    FiShield,
    FiShieldOff,
    FiUser,
    FiCheckCircle,
    FiClock,
    FiList,
    FiTrendingUp,
    FiDollarSign,
    FiStar,
    FiChevronDown,
    FiChevronRight,
    FiDownload,
    FiAlertCircle,
    FiInfo
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [users, setUsers] = useState([]);
    const [goals, setGoals] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        averageCompletionRate: 0,
        mostPopularGoalType: "N/A",
        revenue: 0,
        freeUsers: 0,
        proUsers: 0,
        positiveSentiment: 0,
        negativeSentiment: 0,
        totalJournals: 0,
        systemAlerts: []
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, goalsRes, statsRes, plansRes] = await Promise.all([
                getAllUsers(),
                getAllGoals(),
                getAdminStats(),
                getAllDailyPlans(),
            ]);

            setUsers(Array.isArray(usersRes.data?.users) ? usersRes.data.users : (Array.isArray(usersRes.data) ? usersRes.data : []));
            setGoals(Array.isArray(goalsRes.data?.goals) ? goalsRes.data.goals : (Array.isArray(goalsRes.data) ? goalsRes.data : []));
            setStats(statsRes.data || {});
            setPlans(Array.isArray(plansRes.data?.plans) ? plansRes.data.plans : (Array.isArray(plansRes.data) ? plansRes.data : []));
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast.error(error.response?.data?.message || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSidebarClick = (tab) => {
        setActiveTab(tab);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
        fetchData();
    };

    const handleBlockToggle = async (user) => {
        try {
            if (user.isBlocked) {
                await unblockUser(user._id);
                toast.success(`${user.name} unblocked`);
            } else {
                await blockUser(user._id);
                toast.success(`${user.name} blocked`);
            }
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const showProUsersList = () => {
        setSelectedDetail({
            title: "Pro Users Roster",
            icon: <FiStar className="text-yellow-500" />,
            color: "yellow",
            content: (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {stats.proUsersList?.map(sub => (
                        <div key={sub._id} className="bg-white/50 p-4 rounded-xl border border-[#FDC3A1] shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-[#8A244B]">{sub.user?.name || 'Unknown'}</span>
                                <span className="text-xs font-bold bg-[#FB9B8F]/20 text-[#8A244B] px-2 py-1 rounded-md">
                                    ₹{sub.amountPaid || 199} / {sub.planDuration ? sub.planDuration.charAt(0).toUpperCase() + sub.planDuration.slice(1) : 'Monthly'}
                                </span>
                            </div>
                            <span className="text-xs text-[#8A244B]/70">{sub.user?.email || ''}</span>
                            <span className="text-xs font-medium text-emerald-600 mt-1">Active since {new Date(sub.startDate).toLocaleDateString()}</span>
                        </div>
                    ))}
                    {(!stats.proUsersList || stats.proUsersList.length === 0) && (
                        <p className="text-sm text-center text-[#8A244B]/60">No pro users found.</p>
                    )}
                </div>
            )
        });
    };

    const handleStatClick = (type) => {
        switch (type) {
            case 'users':
                setSelectedDetail({
                    title: "Active Users (7 Days)",
                    icon: <FiUsers />,
                    color: "indigo",
                    content: (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-[#FB9B8F]/20 p-4 rounded-xl border border-[#FB9B8F]/30 text-center mb-4">
                                <p className="text-sm font-bold text-[#8A244B]">Tracking {stats.activeUsers} out of {stats.totalUsers} Total</p>
                            </div>
                            {stats.activeUsersList?.map(u => (
                                <div key={u._id} className="bg-white/50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[#8A244B] text-sm">{u.name}</span>
                                        <span className="text-xs text-[#8A244B]/70">{u.email}</span>
                                    </div>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Active</span>
                                </div>
                            ))}
                        </div>
                    )
                });
                break;
            case 'goals':
                setSelectedDetail({
                    title: "Active Goals Ongoing",
                    icon: <FiTarget />,
                    color: "purple",
                    content: (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-[#7AAACE]/20 p-4 rounded-xl border border-[#7AAACE]/30 text-center mb-4">
                                <p className="text-sm font-bold text-[#8A244B]">{stats.activeGoals} goals currently in progress</p>
                            </div>
                            {stats.activeGoalsList?.map(g => (
                                <div key={g._id} className="bg-white/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1">
                                    <span className="font-bold text-[#8A244B] text-sm">{g.title}</span>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8A244B]/70 truncate max-w-[150px]">{g.user?.name}</span>
                                        <span className="text-[10px] bg-[#FFF7CD] border border-[#FDC3A1] text-[#8A244B] px-2 py-1 rounded-md uppercase font-bold">{g.preparationMode}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                });
                break;
            case 'revenue':
                setSelectedDetail({
                    title: "Revenue Analytics",
                    icon: <FiDollarSign />,
                    color: "emerald",
                    content: (
                        <div className="space-y-4">
                            <div className="bg-[#FB9B8F]/20 p-6 rounded-xl border border-[#FB9B8F]/30 text-center">
                                <p className="text-sm font-semibold text-[#8A244B] uppercase tracking-wider mb-1">Total Revenue</p>
                                <p className="text-4xl font-bold text-[#8A244B]">₹{stats.revenue || 0}</p>
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={showProUsersList}
                                    className="w-full flex justify-between items-center p-3 bg-white/70 rounded-lg shadow-sm border border-gray-100 hover:bg-[#FADA7A] transition-colors group"
                                >
                                    <span className="text-[#8A244B] flex items-center gap-2 font-bold"><FiStar className="text-yellow-500" /> Pro Users Details</span>
                                    <span className="font-bold text-[#8A244B] bg-white px-2 py-0.5 rounded-md group-hover:bg-[#FFF7CD] transition-colors">{stats.proUsers || 0}</span>
                                </button>
                                <button
                                    className="w-full flex justify-between items-center p-3 bg-white/40 rounded-lg shadow-sm border border-gray-100 cursor-default"
                                >
                                    <span className="text-[#8A244B]/60 flex items-center gap-2 font-medium"><FiUser className="text-[#8A244B]/60" /> Free Plan Users</span>
                                    <span className="font-bold text-[#8A244B]/60">{stats.freeUsers || 0}</span>
                                </button>
                            </div>
                        </div>
                    )
                });
                break;
            default:
                break;
        }
    };

    const handleExportReport = () => {
        try {
            const csvRows = [];
            csvRows.push("PrepYou Platform Report");
            csvRows.push(`Generated On,${new Date().toLocaleDateString()}`);
            csvRows.push("");
            csvRows.push("METRICS,VALUE");
            csvRows.push(`Total Users,${stats.totalUsers}`);
            csvRows.push(`Active Users (7d),${stats.activeUsers}`);
            csvRows.push(`Total Goals,${stats.totalGoals}`);
            csvRows.push(`Average Completion Rate,${stats.averageCompletionRate}%`);
            csvRows.push(`Total Revenue,Rs ${stats.revenue || 0}`);
            csvRows.push(`Total Pro Users,${stats.proUsers || 0}`);
            csvRows.push("");
            csvRows.push("PRO USERS ROSTER");
            csvRows.push("Name,Email,Plan");
            stats.proUsersList?.forEach(sub => {
                csvRows.push(`"${sub.user?.name || 'Unknown'}","${sub.user?.email || ''}","Pro (Rs 199/mo)"`);
            });
            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `PrepYou_Admin_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Report Generated Successfully");
        } catch (error) {
            toast.error("Failed to generate report");
        }
    };

    if (loading && stats.totalUsers === 0) {
        return (
            <div className="admin-loading">
                <div className="loader"></div>
                <p>Establishing Secure Admin Connection...</p>
            </div>
        );
    }

    return (
        <div className="admin-page-container flex flex-col min-h-screen relative">
            <Navbar />
            <div className="flex flex-1 relative w-full items-stretch justify-start">
                <AdminSidebar activeTab={activeTab} onTabSelect={handleSidebarClick} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                
                <main className={`admin-main flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-20 w-full h-full pb-20`}>
                    <header className="admin-header-section flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-4 border-[var(--border-color)]">
                        <div className="header-text">
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold text-[var(--text-primary)] mb-2 inline-block"
                                style={{ background: 'none', WebkitTextFillColor: 'initial', WebkitBackgroundClip: 'initial' }}
                            >
                                Admin Dashboard
                            </motion.h1>
                            <p className="text-[var(--text-secondary)]">A unified perspective on platform analytics and user engagement.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-3">
                            <button
                                onClick={handleExportReport}
                                className="flex items-center gap-2 px-4 py-2 bg-[#FB9B8F] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-[#FDC3A1] hover:text-[#8A244B] transition-all transform hover:-translate-y-0.5"
                            >
                                <FiDownload className="text-lg" />
                                <span>Generate Report</span>
                            </button>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="overview">
                                <div className="stats-grid">
                                    <StatCard icon={<FiUsers />} label="Total Users" value={stats.totalUsers} color="indigo" subtext={`${stats.activeUsers} Active (7d)`} onClick={() => handleStatClick('users')} delay={0.1} />
                                    <StatCard icon={<FiTarget />} label="Active Goals" value={stats.activeGoals} color="purple" subtext={`Popular: ${stats.mostPopularGoalType}`} onClick={() => handleStatClick('goals')} delay={0.2} />
                                    <StatCard icon={<FiDollarSign />} label="Total Revenue" value={`₹${stats.revenue || 0}`} color="green" subtext={`${stats.proUsers || 0} Pro Users`} onClick={() => handleStatClick('revenue')} delay={0.3} />
                                </div>
                                
                                <div className="mt-8 bg-white/60 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#8A244B]">Insights: Sentiment Trends</h3>
                                            <p className="text-sm text-[#8A244B]/70 mt-1">Derived from user journal entries to understand engagement and motivation levels.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div className="bg-[#FFF7CD]/50 p-6 rounded-xl border border-[#FDC3A1]/50 flex flex-col items-center justify-center">
                                            <p className="text-sm font-semibold text-[#8A244B] uppercase tracking-wider mb-2">Total Journal Entries</p>
                                            <p className="text-5xl font-bold text-[#8A244B]">{stats.totalJournals}</p>
                                        </div>

                                        <div className="bg-[#FFF7CD]/50 p-6 rounded-xl border border-[#FDC3A1]/50">
                                            <p className="text-sm font-semibold text-[#8A244B] uppercase tracking-wider mb-4 border-b border-[#FDC3A1] pb-2">Sentiment Breakdown</p>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm font-medium mb-1">
                                                        <span className="text-[#8A244B] font-bold">Positive (Motivated / Excited)</span>
                                                        <span className="text-[#8A244B] font-bold">{stats.totalJournals > 0 ? Math.round((stats.positiveSentiment / stats.totalJournals) * 100) : 0}%</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#8A244B]/70 mb-1 leading-tight">{stats.totalJournals > 0 ? Math.round((stats.positiveSentiment / stats.totalJournals) * 100) : 0}% of recent journal entries indicate users are feeling extremely positive and motivated to study.</p>
                                                    <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#FDC3A1]/30 block shadow-inner">
                                                        <div className="bg-[#7AAACE] h-full rounded-full transition-all duration-1000 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]" style={{ width: `${stats.totalJournals > 0 ? (stats.positiveSentiment / stats.totalJournals) * 100 : 0}%` }}></div>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <div className="flex justify-between text-sm font-medium mb-1 mt-2">
                                                        <span className="text-[#8A244B] font-bold">Negative (Stressed / Burnout)</span>
                                                        <span className="text-[#8A244B] font-bold">{stats.totalJournals > 0 ? Math.round((stats.negativeSentiment / stats.totalJournals) * 100) : 0}%</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#8A244B]/70 mb-1 leading-tight">{stats.totalJournals > 0 ? Math.round((stats.negativeSentiment / stats.totalJournals) * 100) : 0}% of entries flag stress or demotivation, indicating where AI-interventions are adapting plans.</p>
                                                    <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#FDC3A1]/30 block shadow-inner">
                                                        <div className="bg-[#FB9B8F] h-full rounded-full transition-all duration-1000 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]" style={{ width: `${stats.totalJournals > 0 ? (stats.negativeSentiment / stats.totalJournals) * 100 : 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 bg-white/60 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#8A244B]">Platform Productivity Metrics</h3>
                                            <p className="text-sm text-[#8A244B]/70 mt-1">Real-time health analysis comparing active engagement against total platform data.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div onClick={() => handleStatClick('users')} className="bg-[#FB9B8F]/10 p-5 rounded-xl border border-[#FB9B8F]/30 relative overflow-hidden cursor-pointer hover:bg-[#FB9B8F]/20 transition-colors group">
                                            <p className="text-xs font-bold text-[#8A244B] uppercase tracking-wider mb-2 group-hover:underline">User Engagement</p>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-4xl font-bold text-[#8A244B]">{stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%</span>
                                            </div>
                                            <p className="text-xs font-medium text-[#8A244B]/70">{stats.activeUsers} out of {stats.totalUsers} total registered users have actively logged in this week.</p>
                                            <div className="mt-3"><span className="text-[10px] font-bold bg-white text-[#8A244B] px-2 py-1 rounded">Click to View Active Log</span></div>
                                            <FiUsers className="absolute -bottom-4 -right-2 text-6xl text-[#FB9B8F]/20 group-hover:scale-110 transition-transform" />
                                        </div>

                                        <div onClick={() => handleStatClick('goals')} className="bg-[#7AAACE]/10 p-5 rounded-xl border border-[#7AAACE]/30 relative overflow-hidden cursor-pointer hover:bg-[#7AAACE]/20 transition-colors group">
                                            <p className="text-xs font-bold text-[#8A244B] uppercase tracking-wider mb-2 group-hover:underline">Active Goal Ratio</p>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-4xl font-bold text-[#8A244B]">{stats.totalGoals > 0 ? Math.round((stats.activeGoals / stats.totalGoals) * 100) : 0}%</span>
                                            </div>
                                            <p className="text-xs font-medium text-[#8A244B]/70">{stats.activeGoals} goals are actively being pursued right now out of {stats.totalGoals} historical total.</p>
                                            <div className="mt-3"><span className="text-[10px] font-bold bg-white text-[#8A244B] px-2 py-1 rounded">Click to View Goals Log</span></div>
                                            <FiTarget className="absolute -bottom-4 -right-2 text-6xl text-[#7AAACE]/20 group-hover:scale-110 transition-transform" />
                                        </div>

                                        <div className="bg-[#FDC3A1]/20 p-5 rounded-xl border border-[#FDC3A1]/50 relative overflow-hidden group">
                                            <p className="text-xs font-bold text-[#8A244B] uppercase tracking-wider mb-2">Execution Health</p>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-4xl font-bold text-[#8A244B]">{Math.round(stats.averageCompletionRate)}%</span>
                                            </div>
                                            <p className="text-xs font-medium text-[#8A244B]/70">This is the average daily plan completion percentage automatically scored tracking all platform study plans.</p>
                                            <FiCheckCircle className="absolute -bottom-4 -right-2 text-6xl text-[#FDC3A1]/40" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 bg-white/60 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#8A244B] flex items-center gap-2">
                                                <FiAlertCircle className="text-[#FB9B8F]" /> System Alerts / Notifications Log
                                            </h3>
                                            <p className="text-sm text-[#8A244B]/70 mt-1">Live tracking of active backend events, issues, and platform milestones.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {stats.systemAlerts?.map((alert, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }} 
                                                animate={{ opacity: 1, x: 0 }} 
                                                transition={{ delay: idx * 0.1 }}
                                                key={idx} 
                                                className={`p-4 rounded-xl border flex gap-4 items-start ${
                                                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                                    alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                                                    alert.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
                                                    'bg-[#FFF7CD] border-[#FDC3A1]'
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {alert.type === 'error' && <FiAlertCircle className="text-red-500 text-xl" />}
                                                    {alert.type === 'warning' && <FiAlertCircle className="text-orange-500 text-xl" />}
                                                    {alert.type === 'success' && <FiCheckCircle className="text-emerald-500 text-xl" />}
                                                    {alert.type === 'info' && <FiInfo className="text-blue-500 text-xl" />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-bold ${
                                                        alert.type === 'error' ? 'text-red-800' :
                                                        alert.type === 'warning' ? 'text-orange-800' :
                                                        alert.type === 'success' ? 'text-emerald-800' :
                                                        'text-[#8A244B]'
                                                    }`}>{alert.title}</h4>
                                                    <p className={`text-xs mt-1 ${
                                                        alert.type === 'error' ? 'text-red-600' :
                                                        alert.type === 'warning' ? 'text-orange-600' :
                                                        alert.type === 'success' ? 'text-emerald-600' :
                                                        'text-[#8A244B]/80'
                                                    }`}>{alert.text}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {(!stats.systemAlerts || stats.systemAlerts.length === 0) && (
                                            <div className="p-4 rounded-xl bg-gray-50 text-gray-500 text-sm text-center">No alerts active.</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="analytics">
                                <div className="stats-grid">
                                    <StatCard icon={<FiTrendingUp />} label="Completion Rate" value={`${Math.round(stats.averageCompletionRate)}%`} color="cyan" subtext="System-wide average" onClick={() => handleStatClick('completion')} delay={0.1} />
                                    <StatCard icon={<FiList />} label="Recent Plans" value={plans.length} color="emerald" subtext="Daily study plans tracked" onClick={() => handleStatClick('plans')} delay={0.2} />
                                    <StatCard icon={<FiStar />} label="Pro Conversion" value={`${stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`} color="yellow" subtext={`${stats.freeUsers || 0} Free Users`} onClick={() => handleStatClick('conversion')} delay={0.3} />
                                </div>
                            </motion.div>
                        )}

                        {(activeTab === 'users' || activeTab === 'goals' || activeTab === 'plans') && (
                            <div className="admin-content-section w-full mt-4">
                                <div className="table-container shadow-xl">
                                    {activeTab === "users" && <UserTable key="users" users={users} onBlockToggle={handleBlockToggle} />}
                                    {activeTab === "goals" && <GoalTable key="goals" goals={goals} />}
                                    {activeTab === "plans" && <GroupedActivity key="plans" plans={plans} />}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedDetail && (
                    <StatDetailModal
                        detail={selectedDetail}
                        onClose={() => setSelectedDetail(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = React.memo(({ icon, label, value, color, subtext, onClick, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`stat-card cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden group`}
        onClick={onClick}
    >
        <div className={`p-4 rounded-xl bg-white/30 text-[#8A244B] shadow-inner text-2xl`}>{icon}</div>
        <div className="card-info z-10 flex flex-col">
            <span className="text-sm font-semibold text-[#8A244B]/80 uppercase tracking-widest">{label}</span>
            <span className="text-3xl font-bold text-[#8A244B] my-1">{value}</span>
            <span className="text-xs font-medium text-[#8A244B]/60">{subtext}</span>
        </div>
    </motion.div>
));

const UserTable = React.memo(({ users, onBlockToggle }) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <table className="premium-table w-full">
            <thead>
                <tr className="border-b border-gray-100/50">
                    <th className="text-left font-bold text-[#8A244B] p-4">User</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Role</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Status</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Last Active</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-[#FADA7A] transition-colors group">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full text-[#8A244B]"><FiUser /></div>
                                <div>
                                    <span className="block font-bold text-[#8A244B]">{user.name}</span>
                                    <span className="block text-xs text-[#8A244B]/70">{user.email}</span>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${user.role === 'admin' ? 'bg-[#7AAACE]/20 text-[#8A244B]' : 'bg-[#FFF7CD] text-[#8A244B] border border-[#FDC3A1]'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-[#8A244B]/80">
                            {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4">
                            {user.role !== 'admin' && (
                                <button
                                    onClick={() => onBlockToggle(user)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${user.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                >
                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {users.length === 0 && <div className="py-8 text-center text-[#8A244B]/70">No users found.</div>}
    </motion.div>
));

const GoalTable = React.memo(({ goals }) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <table className="premium-table w-full">
            <thead>
                <tr className="border-b border-gray-100/50">
                    <th className="text-left font-bold text-[#8A244B] p-4">User</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Goal</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Mode</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Level</th>
                    <th className="text-left font-bold text-[#8A244B] p-4">Status</th>
                </tr>
            </thead>
            <tbody>
                {goals.map((goal) => (
                    <tr key={goal._id} className="border-b border-gray-50 hover:bg-[#FADA7A] transition-colors">
                        <td className="p-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-[#8A244B]">{goal.user?.name || "Unknown"}</span>
                                <span className="text-xs text-[#8A244B]/70">{goal.user?.email || ""}</span>
                            </div>
                        </td>
                        <td className="p-4 font-medium text-[#8A244B]">{goal.title}</td>
                        <td className="p-4 capitalize text-[#8A244B]/80 font-medium">{goal.preparationMode}</td>
                        <td className="p-4">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FB9B8F]/20 text-[#8A244B]">{goal.level}</span>
                        </td>
                        <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${goal.status === 'accepted' ? 'bg-[#7AAACE]/20 text-[#8A244B]' : 'bg-gray-100 text-gray-500'}`}>{goal.status}</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {goals.length === 0 && <div className="py-8 text-center text-[#8A244B]/70">No goals to track.</div>}
    </motion.div>
));

const GroupedActivity = React.memo(({ plans }) => {
    const [expandedUsers, setExpandedUsers] = useState({});

    const toggleUser = (userName) => {
        setExpandedUsers(prev => ({ ...prev, [userName]: !prev[userName] }));
    };

    const grouped = plans.reduce((acc, plan) => {
        const userName = plan.user?.name || "Unknown";
        if (!acc[userName]) acc[userName] = [];
        acc[userName].push(plan);
        return acc;
    }, {});

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 p-6 bg-white/50 backdrop-blur w-full">
            {Object.entries(grouped).map(([name, userPlans]) => (
                <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
                    <button 
                        onClick={() => toggleUser(name)}
                        className="w-full flex items-center justify-between p-5 bg-[#FDC3A1]/30 hover:bg-[#FDC3A1]/50 transition-colors"
                    >
                        <h3 className="font-bold text-[#8A244B] flex items-center gap-3 text-lg">
                            <div className="p-2 bg-white rounded-full shadow-sm"><FiUser className="text-[#FB9B8F]" size={18}/></div>
                            {name}
                        </h3>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-[#8A244B]">{userPlans.length} records</span>
                            {expandedUsers[name] ? <FiChevronDown className="text-[#8A244B]" size={20} /> : <FiChevronRight className="text-[#8A244B]" size={20} />}
                        </div>
                    </button>
                    
                    <AnimatePresence>
                        {expandedUsers[name] && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userPlans.map(plan => (
                                         <div key={plan._id} className="bg-[#FFF7CD]/40 p-4 rounded-xl border border-[#FDC3A1]/50 hover:shadow-md transition-shadow">
                                              <div className="flex justify-between items-center mb-2">
                                                  <span className="font-bold text-[#8A244B]">{new Date(plan.date).toLocaleDateString()}</span>
                                                  <span className="text-[#8A244B] font-black text-lg">{plan.completionPercentage}%</span>
                                              </div>
                                              <p className="text-xs text-[#8A244B]/80 mb-3 truncate">{plan.goal?.title || `Routine task activity`}</p>
                                              <div className="h-2 w-full bg-white backdrop-blur rounded-full overflow-hidden border border-[#FDC3A1]/30 relative">
                                                 <div className="h-full bg-[#FB9B8F] rounded-full absolute left-0 top-0 transition-all duration-1000" style={{ width: `${plan.completionPercentage}%` }}></div>
                                              </div>
                                         </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
            {Object.keys(grouped).length === 0 && <div className="py-10 w-full text-center text-[#8A244B]/60 font-medium">No activity records found matching query.</div>}
        </motion.div>
    )
});

const StatDetailModal = React.memo(({ detail, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
            onClick={onClose}
        />
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative bg-[#FDC3A1] border border-[#FDC3A1]/50 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden z-10`}
        >
            <div className={`p-5 border-b border-[#8A244B]/10 flex justify-between items-center bg-white/30`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/50 text-[#8A244B]`}>
                        {detail.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[#8A244B] tracking-tight">{detail.title}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-md hover:bg-black/5 text-[#8A244B]/60 hover:text-[#8A244B] transition-colors"
                >
                    ✕
                </button>
            </div>
            <div className="p-6">
                {detail.content}
            </div>
            <div className="p-4 border-t border-[#8A244B]/10 bg-white/10 text-right">
                <button
                    onClick={onClose}
                    className="text-sm font-bold text-[#8A244B] px-4 py-1.5 rounded-lg hover:bg-white/40 transition-colors"
                >
                    Done
                </button>
            </div>
        </motion.div>
    </div>
));

const AdminSidebar = React.memo(({ activeTab, onTabSelect, isOpen, setIsOpen }) => (
    <div className={`absolute md:fixed inset-y-0 left-0 top-0 md:top-20 bg-[var(--bg-main)] border-r border-[#8A244B]/10 z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col shadow-xl`}>
         <div className="md:hidden flex items-center justify-between p-4 border-b border-[#8A244B]/10">
              <span className={`font-bold text-[#8A244B] ${isOpen ? 'block' : 'hidden'}`}>Admin Menu</span>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-[var(--button-bg)] rounded-lg text-white">
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                 </svg>
             </button>
         </div>
         <button onClick={() => setIsOpen(!isOpen)} className="hidden md:flex p-2 absolute -right-3 top-6 bg-[var(--button-bg)] border border-[#FDC3A1] rounded-full text-white shadow-lg hover:scale-110 transition-transform z-50">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
             </svg>
         </button>
         <div className="flex-1 mt-6 space-y-1.5 px-3 overflow-y-auto w-full">
             <SidebarItem icon={<FiBarChart2 />} label="Overview" isActive={activeTab === 'overview'} onClick={() => onTabSelect('overview')} isOpen={isOpen} />
             <SidebarItem icon={<FiUsers />} label="User Base" isActive={activeTab === 'users'} onClick={() => onTabSelect('users')} isOpen={isOpen} />
             <SidebarItem icon={<FiTarget />} label="Goals" isActive={activeTab === 'goals'} onClick={() => onTabSelect('goals')} isOpen={isOpen} />
             <SidebarItem icon={<FiList />} label="Activity" isActive={activeTab === 'plans'} onClick={() => onTabSelect('plans')} isOpen={isOpen} />
             <SidebarItem icon={<FiTrendingUp />} label="Analytics" isActive={activeTab === 'analytics'} onClick={() => onTabSelect('analytics')} isOpen={isOpen} />
         </div>
    </div>
));

const SidebarItem = React.memo(({ icon, label, isActive, onClick, isOpen }) => (
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all font-bold ${isActive ? 'bg-[var(--button-bg)] text-white shadow-md transform scale-[1.02]' : 'text-[#8A244B]/70 hover:bg-[#FDC3A1]/30 hover:text-[#8A244B]'}`}>
        <div className={`text-xl flex-shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'}`}>{icon}</div>
        {isOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
    </button>
));

export default AdminDashboard;
