import axiosInstance from '@/utils/axiosInstance';

export interface ReviewRequest {
  roomId: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  reviewId: number;
  roomId: number;
  roomType: string;
  hotelId: number;
  hotelName: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const createReview = async (data: ReviewRequest): Promise<ReviewResponse> => {
  const response = await axiosInstance.post('reviews', data);
  return response.data.data;
};

export const getReviewsByRoomId = async (roomId: number): Promise<ReviewResponse[]> => {
  const response = await axiosInstance.get(`reviews/room/${roomId}`);
  return response.data.data;
};

export const getReviewById = async (reviewId: number): Promise<ReviewResponse> => {
  const response = await axiosInstance.get(`reviews/${reviewId}`);
  return response.data.data;
};

export const getMyReviewByRoomId = async (roomId: number): Promise<ReviewResponse | null> => {
  const response = await axiosInstance.get(`reviews/room/${roomId}/my-review`);
  return response.data.data || null;
};

export const updateReview = async (reviewId: number, data: ReviewRequest): Promise<ReviewResponse> => {
  const response = await axiosInstance.put(`reviews/${reviewId}`, data);
  return response.data.data;
};

