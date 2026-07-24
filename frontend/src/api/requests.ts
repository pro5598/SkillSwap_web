import axiosInstance from "./axios";

export const getReceivedRequests = async () => {
  const response = await axiosInstance.get("/swap-requests/received");
  return response.data;
};

export const getSentRequests = async () => {
  const response = await axiosInstance.get("/swap-requests/sent");
  return response.data;
};

export const sendSwapRequest = async (data: { receiverId: string; skillOffered: string; skillWanted: string; message?: string }) => {
  const response = await axiosInstance.post("/swap-requests", data);
  return response.data;
};

export const respondToSwapRequest = async (id: string, status: "accepted" | "declined" | "cancelled") => {
  const response = await axiosInstance.patch(`/swap-requests/${id}/status`, { status });
  return response.data;
};
