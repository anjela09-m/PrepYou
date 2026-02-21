import API from "../services/api";

// Create goal
export const createGoal = (goalData) => API.post("/goals", goalData);

// Get active goal
export const getActiveGoal = async () => {
    try {
        return await API.get("/goals/active");
    } catch (error) {
        if (error.response?.status === 404) return { data: null };
        throw error;
    }
};

// Accept goal summary
export const acceptGoal = (id) => API.post(`/goals/${id}/accept`);

// Regenerate goal summary
export const regenerateGoalPlan = (id, prompt) => API.post(`/goals/${id}/regenerate`, { prompt });

// Update goal
export const updateGoal = (id, goalData) => API.put(`/goals/${id}`, goalData);

// Delete goal
export const deleteGoal = (id) => API.delete(`/goals/${id}`);

