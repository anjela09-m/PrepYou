import API from "../services/api";

// Get/Generate today's plan
export const getTodayPlan = async () => {
  try {
    return await API.post("/plans/today");
  } catch (error) {
    if (error.response?.status === 404) return { data: null };
    throw error;
  }
};

// Regenerate plan
export const regeneratePlan = (prompt = "") => API.post("/plans/today/regenerate", { prompt });

// Accept today's plan
export const acceptPlan = () => API.post("/plans/today/accept");

// Complete a single task
export const completeTask = (planId, taskId) =>
  API.patch(`/plans/${planId}/task/${taskId}`);

// Complete all tasks
export const completeAllTasks = (planId) =>
  API.patch(`/plans/${planId}/complete`);

// Submit today's day (LOCK & FINALIZE)
export const submitDay = () => API.post("/plans/today/submit");

// Delete today's plan
export const deleteTodayPlan = () => API.delete("/plans/today");
