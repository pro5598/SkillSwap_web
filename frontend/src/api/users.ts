import axiosInstance from "./axios";

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};
