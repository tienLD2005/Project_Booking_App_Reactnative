import axiosInstance from "@/utils/axiosInstance";

export interface RoomResponse {
    roomId: number;
    roomType: string;              // Đổi từ roomName → roomType
    description: string;
    price: number | null;          // Đổi từ pricePerNight → price
    capacity: number;
    hotelId: number;
    hotelName: string;
    imageUrls: string[];
    rating: number | null;
    reviewCount: number | null;
}

export const getAllRooms = async (): Promise<RoomResponse[]> => {
    try {
        const response = await axiosInstance.get("rooms");
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data || [];
    } catch (error: any) {
        console.error("Get all rooms error:", error);
        throw error;
    }
};

export const getRoomsByHotelId = async (hotelId: number): Promise<RoomResponse[]> => {
    try {
        const response = await axiosInstance.get(`rooms/hotel/${hotelId}`);
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data || [];
    } catch (error: any) {
        console.error("Get rooms by hotelId error:", error);
        throw error;
    }
};

export const searchRooms = async (keyword?: string): Promise<RoomResponse[]> => {
    try {
        const params: any = {};
        if (keyword) params.keyword = keyword;

        const response = await axiosInstance.get("rooms/search", { params });
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data || [];
    } catch (error: any) {
        console.error("Search rooms error:", error);
        throw error;
    }
};

export const getRoomById = async (roomId: number): Promise<RoomResponse> => {
    try {
        const response = await axiosInstance.get(`rooms/${roomId}`);
        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }
        return response.data?.data;
    } catch (error: any) {
        console.error("Get room by id error:", error);
        throw error;
    }
};
