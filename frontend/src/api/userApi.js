import API from "../services/api";

// Get user profile
export const getUserProfile = () => API.get("/user/profile");

// Update user settings
export const updateUserSettings = (settings) => API.put("/user/settings", settings);
