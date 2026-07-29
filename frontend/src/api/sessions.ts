import axiosInstance from "./axios";

export const scheduleSession = async (sessionId: string, data: {
  scheduledAt: string;
  meetingDetails?: string;
}) => {
  const response = await axiosInstance.patch(`/sessions/${sessionId}/schedule`, data);
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

export const createFollowUpSession = async (sessionId: string, data?: { scheduledAt: string, meetingDetails: string }) => {
  const response = await axiosInstance.post(`/sessions/${sessionId}/follow-up`, data || {});
  return response.data;
};
