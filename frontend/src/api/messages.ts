import axiosInstance from "./axios";

export const getConversation = async (userId: string) => {
  const response = await axiosInstance.get(`/messages/conversation/${userId}`);
  return response.data;
};

export const markMessagesAsRead = async (senderId: string) => {
  const response = await axiosInstance.patch(`/messages/read`, { senderId });
  return response.data;
};

export const uploadMessageFile = async (formData: FormData) => {
  const response = await axiosInstance.post(`/messages/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getUnreadMessagesCount = async () => {
  const response = await axiosInstance.get(`/messages/unread-count`);
  return response.data;
};
