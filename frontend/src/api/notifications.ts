import { axiosInstance } from "./axios";

export const getNotifications = async () => {
  return await axiosInstance.get("/notifications");
};

export const markNotificationAsRead = async (id: string) => {
  return await axiosInstance.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await axiosInstance.put("/notifications/read-all");
};
