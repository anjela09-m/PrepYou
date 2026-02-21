import API from "../services/api";

export const createOrder = (planData) => API.post("/subscription/create-order", planData);

export const verifyPayment = (paymentData) =>
    API.post("/subscription/verify-payment", paymentData);

export const getSubscriptionStatus = () => API.get("/subscription/status");
