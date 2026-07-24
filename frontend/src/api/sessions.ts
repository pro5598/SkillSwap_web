import axiosInstance from "./axios";

export const createSession = async (data: {
  providerId: string;
  scheduledAt: string;
  meetingDetails?: string;
  notes?: string;
}) => {
  const response = await axiosInstance.post("/sessions", data);
  return response.data;
};

export const getMySessions = async () => {
  const response = await axiosInstance.get("/sessions");
  return response.data;
};

export const updateSessionStatus = async (sessionId: string, status: string) => {
  const response = await axiosInstance.patch(`/sessions/${sessionId}/status`, { status });
  return response.data;
};
