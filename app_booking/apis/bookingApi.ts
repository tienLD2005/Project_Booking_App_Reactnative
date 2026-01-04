import axiosInstance from '@/utils/axiosInstance';
import { Alert } from 'react-native';

export interface BookingRequest {
  roomId: number;
  checkIn: string;
  checkOut: string;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
}

export interface BookingResponse {
  bookingId: number;
  roomId: number;
  roomType: string;
  roomImageUrl: string | null;
  hotelId: number;
  hotelName: string;
  hotelLocation: string;
  hotelCity: string;
  hotelAddress: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export const createBooking = async (data: BookingRequest): Promise<BookingResponse> => {
  const response = await axiosInstance.post('bookings', data);
  return response.data.data;
};

export const getUpcomingBookings = async (): Promise<BookingResponse[]> => {
  const response = await axiosInstance.get('bookings/upcoming');
  return response.data.data;
};

export const getPastBookings = async (): Promise<BookingResponse[]> => {
  try {
    const response = await axiosInstance.get('bookings/past');
    return response.data.data;
  } catch (error: any) {
    console.error('Get past bookings error:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId: number): Promise<BookingResponse> => {
  const response = await axiosInstance.get(`bookings/${bookingId}`);
  return response.data.data;
};

export const cancelBooking = async (bookingId: number): Promise<BookingResponse> => {
  const response = await axiosInstance.put(`bookings/${bookingId}/cancel`);
  return response.data.data;
};

export const confirmBooking = async (bookingId: number): Promise<BookingResponse> => {
  const response = await axiosInstance.put(`bookings/${bookingId}/confirm`);
  return response.data.data;
};

export const getUserBookings = async (): Promise<BookingResponse[]> => {
  const response = await axiosInstance.get('bookings');
  return response.data.data;
};
