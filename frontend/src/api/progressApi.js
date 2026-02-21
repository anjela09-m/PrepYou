import API from "../services/api";

// Get complete progress summary (today, weekly, trend)
export const getProgressSummary = () => API.get("/progress/summary");
