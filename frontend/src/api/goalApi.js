import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Create goal → Backend AI generates skills + plan
export const createGoal = (goalData) =>
  API.post("/goal", goalData);

// (Optional for later)
export const getMyGoals = () =>
  API.get("/goal/my");
