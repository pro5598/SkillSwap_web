import axiosInstance from "./axios";

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};

export const getRecommendations = async () => {
  const response = await axiosInstance.get("/user/me/recommendations");
  return response.data;
};
