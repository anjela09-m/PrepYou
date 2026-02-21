import API from "../services/api";

export const getAllUsers = () => API.get("/admin/users");
export const blockUser = (id) => API.patch(`/admin/users/${id}/block`);
export const unblockUser = (id) => API.patch(`/admin/users/${id}/unblock`);
export const getAllGoals = () => API.get("/admin/goals");
export const getAllDailyPlans = () => API.get("/admin/daily-plans");
export const getAdminStats = () => API.get("/admin/stats");
