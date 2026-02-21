import API from "../services/api";

export const createEntry = (content) => API.post("/journals", { content });
export const getEntries = () => API.get("/journals");
export const getLatestEntry = () => API.get("/journals/latest");
