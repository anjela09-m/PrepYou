import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Get today's AI-generated plan
export const getTodayPlan = () => API.get("/plan/today");

// Complete a single task
export const completeTask = (planId, taskId) =>
  API.put(`/plans/complete/${planId}/${taskId}`);

// Complete all tasks
export const completeAllTasks = (planId) =>
  API.put(`/plans/completeAll/${planId}`);

// Delete a single task
export const deleteTask = (planId, taskId) =>
  API.delete(`/plans/${planId}/tasks/${taskId}`);

// Regenerate plan with optional user prompt
export const regeneratePlan = (planId, prompt = "") =>
  API.post(`/plans/regenerate/${planId}`, { prompt });
