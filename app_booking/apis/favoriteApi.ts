import axiosInstance from '@/utils/axiosInstance';

export interface FavoriteResponse {
  favoriteId: number;
  roomId: number;
  roomType: string;
  roomImageUrl?: string;
  roomPrice: number;
  hotelId: number;
  hotelName: string;
  hotelLocation: string;
  hotelCity: string;
  rating?: number;
  reviewCount?: number;
}

export const getFavorites = async (): Promise<FavoriteResponse[]> => {
  const response = await axiosInstance.get('favorites');
  return response.data.data;
};

export const addFavorite = async (roomId: number): Promise<FavoriteResponse> => {
  const response = await axiosInstance.post(`favorites/room/${roomId}`);
  return response.data.data;
};

export const removeFavorite = async (favoriteId: number): Promise<void> => {
  await axiosInstance.delete(`favorites/${favoriteId}`);
};

export const removeFavoriteByRoomId = async (roomId: number): Promise<void> => {
  await axiosInstance.delete(`favorites/room/${roomId}`);
};

export const checkIsFavorite = async (roomId: number): Promise<boolean> => {
  const response = await axiosInstance.get(`favorites/room/${roomId}/check`);
  return response.data.data;
};

