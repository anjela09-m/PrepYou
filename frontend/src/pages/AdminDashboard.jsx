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
    FiStar
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("users");
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
        activeGoals: 0,
        completedGoals: 0,
        averageCompletionRate: 0,
        mostPopularGoalType: "N/A",
        revenue: 0,
        freeUsers: 0,
        proUsers: 0
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

            setUsers(usersRes.data);
            setGoals(goalsRes.data);
            setStats(statsRes.data);
            setPlans(plansRes.data);
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

    const handleBlockToggle = async (user) => {
        try {
            if (user.isBlocked) {
                await unblockUser(user._id);
                toast.success(`${user.name} unblocked`);
            } else {
                await blockUser(user._id);
                toast.success(`${user.name} blocked`);
            }
            // Update local state for immediate feedback
            setUsers(prev => prev.map(u =>
                u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u
            ));
            // Refresh stats in background
            const statsRes = await getAdminStats();
            setStats(statsRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const handleStatClick = (type) => {
        switch (type) {
            case 'users':
                setActiveTab('users');
                document.querySelector('.admin-content-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goals':
                setActiveTab('goals');
                document.querySelector('.admin-content-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'plans':
                setActiveTab('plans');
                document.querySelector('.admin-content-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'completion':
                setSelectedDetail({
                    title: "System Performance",
                    icon: <FiTrendingUp />,
                    color: "cyan",
                    content: (
                        <div className="space-y-4">
                            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">Average Completion Rate</p>
                                <p className="text-3xl font-bold text-white">{stats.averageCompletionRate}%</p>
                                <p className="text-xs text-cyan-300 mt-2">Across all daily plans submitted.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase">Active Users</p>
                                    <p className="text-xl font-bold text-white">{stats.activeUsers}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase">Total Goals</p>
                                    <p className="text-xl font-bold text-white">{stats.totalGoals}</p>
                                </div>
                            </div>
                        </div>
                    )
                });
                break;
            case 'revenue':
                setSelectedDetail({
                    title: "Revenue Analytics",
                    icon: <FiDollarSign />,
                    color: "green",
                    content: (
                        <div className="space-y-4">
                            <div className="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20 text-center">
                                <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">Total Revenue</p>
                                <p className="text-4xl font-bold text-white">₹{stats.revenue || 0}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-gray-400 flex items-center gap-2"><FiStar className="text-yellow-400" /> Pro Users</span>
                                    <span className="font-bold text-white">{stats.proUsers || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-gray-400 flex items-center gap-2"><FiUser className="text-blue-400" /> Free Users</span>
                                    <span className="font-bold text-white">{stats.freeUsers || 0}</span>
                                </div>
                            </div>
                        </div>
                    )
                });
                break;
            case 'conversion':
                const conversionRate = stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0;
                setSelectedDetail({
                    title: "Conversion Metrics",
                    icon: <FiStar />,
                    color: "yellow",
                    content: (
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-1">Pro Conversion Rate</p>
                                        <p className="text-3xl font-bold text-white">{conversionRate}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-yellow-200/70">Target: 20%</p>
                                    </div>
                                </div>
                                <div className="w-full bg-yellow-900/40 h-2 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${Math.min(conversionRate, 100)}%` }}></div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed text-center">
                                {stats.proUsers} out of {stats.totalUsers} registered users have upgraded to Pro.
                            </p>
                        </div>
                    )
                });
                break;
            default:
                break;
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
        <div className="admin-page-container">
            <Navbar />
            <main className="admin-main">
                <header className="admin-header-section">
                    <div className="header-text">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Executive Command Center
                        </motion.h1>
                        <p>Real-time systemic analytics and user management terminal.</p>
                    </div>
                </header>

                {/* Main Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        icon={<FiUsers />}
                        label="Total Users"
                        value={stats.totalUsers}
                        color="indigo"
                        subtext={`${stats.activeUsers} Active (7d)`}
                        onClick={() => handleStatClick('users')}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FiTarget />}
                        label="Active Goals"
                        value={stats.activeGoals}
                        color="purple"
                        subtext={`Popular: ${stats.mostPopularGoalType}`}
                        onClick={() => handleStatClick('goals')}
                        delay={0.2}
                    />
                    <StatCard
                        icon={<FiTrendingUp />}
                        label="Completion Rate"
                        value={`${stats.averageCompletionRate}%`}
                        color="cyan"
                        subtext="System-wide average"
                        onClick={() => handleStatClick('completion')}
                        delay={0.3}
                    />

                    <StatCard
                        icon={<FiList />}
                        label="Recent Plans"
                        value={plans.length}
                        color="emerald"
                        subtext="Daily study plans tracked"
                        onClick={() => handleStatClick('plans')}
                        delay={0.4}
                    />
                    <StatCard
                        icon={<FiDollarSign />}
                        label="Total Revenue"
                        value={`₹${stats.revenue || 0}`}
                        color="green"
                        subtext={`${stats.proUsers || 0} Pro Users`}
                        onClick={() => handleStatClick('revenue')}
                        delay={0.5}
                    />
                    <StatCard
                        icon={<FiStar />}
                        label="Pro Conversion"
                        value={`${stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`}
                        color="yellow"
                        subtext={`${stats.freeUsers || 0} Free Users`}
                        onClick={() => handleStatClick('conversion')}
                        delay={0.6}
                    />
                </div>

                {/* Tabs */}
                <div className="admin-content-section">
                    <div className="tabs-navigation">
                        <TabButton
                            active={activeTab === "users"}
                            onClick={() => setActiveTab("users")}
                            icon={<FiUsers />}
                            label="User Base"
                        />
                        <TabButton
                            active={activeTab === "goals"}
                            onClick={() => setActiveTab("goals")}
                            icon={<FiTarget />}
                            label="User Goals"
                        />
                        <TabButton
                            active={activeTab === "plans"}
                            onClick={() => setActiveTab("plans")}
                            icon={<FiList />}
                            label="Daily Activity"
                        />
                    </div>

                    <div className="table-container">
                        <AnimatePresence mode="wait">
                            {activeTab === "users" && (
                                <UserTable key="users" users={users} onBlockToggle={handleBlockToggle} />
                            )}
                            {activeTab === "goals" && (
                                <GoalTable key="goals" goals={goals} />
                            )}
                            {activeTab === "plans" && (
                                <PlanTable key="plans" plans={plans} />
                            )}
                        </AnimatePresence>
                    </div>
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
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, color, subtext, onClick, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`stat-card card-${color} cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden group`}
        onClick={onClick}
    >
        <div className="card-icon shadow-inner">{icon}</div>
        <div className="card-info z-10">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
            <span className="stat-subtext font-medium">{subtext}</span>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/10 p-1.5 rounded-lg text-xs text-white/70">
                View
            </div>
        </div>
    </motion.div>
);

const TabButton = ({ active, onClick, icon, label }) => (
    <button className={`tab-btn ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span>{label}</span>
    </button>
);

const UserTable = ({ users, onBlockToggle }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
    >
        <table className="premium-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user._id}>
                        <td>
                            <div className="user-info-cell">
                                <div className="avatar">
                                    <FiUser />
                                </div>
                                <div className="details">
                                    <span className="name">{user.name}</span>
                                    <span className="email">{user.email}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span className={`role-badge ${user.role}`}>
                                {user.role}
                            </span>
                        </td>
                        <td>
                            <span className={`status-pill ${user.isBlocked ? 'blocked' : 'active'}`}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                        </td>
                        <td>
                            <div className="active-time">
                                <FiClock />
                                <span>{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : "Never"}</span>
                            </div>
                        </td>
                        <td>
                            {user.role !== 'admin' && (
                                <button
                                    className={`action-btn ${user.isBlocked ? 'unblock' : 'block'}`}
                                    onClick={() => onBlockToggle(user)}
                                >
                                    {user.isBlocked ? <FiShield /> : <FiShieldOff />}
                                    <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {users.length === 0 && <div className="empty-state">No users found in system.</div>}
    </motion.div>
);

const GoalTable = ({ goals }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
    >
        <table className="premium-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Goal Title</th>
                    <th>Type</th>
                    <th>Level</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {goals.map((goal) => (
                    <tr key={goal._id}>
                        <td>
                            <div className="details">
                                <span className="name">{goal.user?.name || "Unknown"}</span>
                                <span className="email">{goal.user?.email || ""}</span>
                            </div>
                        </td>
                        <td>{goal.title}</td>
                        <td className="capitalize">{goal.preparationMode}</td>
                        <td>
                            <span className={`level-badge ${goal.level?.toLowerCase()}`}>
                                {goal.level}
                            </span>
                        </td>
                        <td>
                            <span className={`status-pill ${goal.status === 'accepted' ? 'active' : ''}`}>
                                {goal.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {goals.length === 0 && <div className="empty-state">No goals to track.</div>}
    </motion.div>
);

const PlanTable = ({ plans }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
    >
        <table className="premium-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Goal</th>
                    <th>Date</th>
                    <th>Progress</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {plans.map((plan) => (
                    <tr key={plan._id}>
                        <td>{plan.user?.name || "Unknown"}</td>
                        <td>{plan.goal?.title || "Deleted Goal"}</td>
                        <td>{new Date(plan.date).toLocaleDateString()}</td>
                        <td>
                            <div className="progress-cell">
                                <span className="percent">{plan.completionPercentage}%</span>
                                <div className="mini-bar">
                                    <div
                                        className="fill"
                                        style={{ width: `${plan.completionPercentage}%`, background: plan.completionPercentage === 100 ? 'var(--accent-emerald)' : 'var(--accent-indigo)' }}
                                    ></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span className={`status-pill ${plan.status === 'SUBMITTED' ? 'active' : ''}`}>
                                {plan.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {plans.length === 0 && <div className="empty-state">No activity records found.</div>}
    </motion.div>
);

const StatDetailModal = ({ detail, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        />
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative bg-[#0f172a] border border-gray-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden z-10`}
        >
            <div className={`p-6 border-b border-gray-700 flex justify-between items-center bg-${detail.color}-500/10`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${detail.color}-500/20 text-${detail.color}-400`}>
                        {detail.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{detail.title}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors"
                >
                    ✕
                </button>
            </div>
            <div className="p-6">
                {detail.content}
            </div>
            <div className="p-4 border-t border-gray-800 bg-black/20 text-center">
                <button
                    onClick={onClose}
                    className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                    Close
                </button>
            </div>
        </motion.div>
    </div>
);

export default AdminDashboard;
