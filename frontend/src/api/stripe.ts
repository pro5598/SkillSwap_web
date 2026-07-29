import axiosInstance from "./axios";

export const createCheckoutSession = async () => {
  const response = await axiosInstance.post("/stripe/checkout");
  return response.data;
};

export const verifyCheckoutSession = async (sessionId: string) => {
  const response = await axiosInstance.post("/stripe/verify", { sessionId });
  return response.data;
};
