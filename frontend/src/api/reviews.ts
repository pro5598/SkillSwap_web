import axiosInstance from "./axios";

export const submitReview = async (data: { swapRequestId: string; rating: number; comment?: string }) => {
  const response = await axiosInstance.post("/reviews", data);
  return response.data;
};

export const getReviewsForUser = async (userId: string) => {
  const response = await axiosInstance.get(`/reviews/user/${userId}`);
  return response.data;
};

export const hasReviewed = async (swapRequestId: string) => {
  const response = await axiosInstance.get(`/reviews/swap-request/${swapRequestId}/me`);
  return response.data;
};
