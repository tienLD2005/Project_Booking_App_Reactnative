import axiosInstance from '@/utils/axiosInstance';

export interface NotificationResponse {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedBookingId?: number;
  createdAt: string;
}

export const getNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await axiosInstance.get('notifications');
  return response.data.data;
};

export const getUnreadNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await axiosInstance.get('notifications/unread');
  return response.data.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await axiosInstance.get('notifications/unread-count');
  return response.data.data;
};

export const markAsRead = async (notificationId: number): Promise<NotificationResponse> => {
  const response = await axiosInstance.put(`notifications/${notificationId}/read`);
  return response.data.data;
};

export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.put('notifications/read-all');
};

