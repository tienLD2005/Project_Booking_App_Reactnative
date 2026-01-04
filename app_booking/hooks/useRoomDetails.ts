import { getRoomById, RoomResponse } from "@/apis/roomApi";
import { useEffect, useState } from "react";

export const useRoomDetails = (id?: string) => {
    const [room, setRoom] = useState<RoomResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const numId = Number(id);
        if (isNaN(numId) || numId <= 0) {
            console.warn("⚠️ ID phòng không hợp lệ:", id);
            setLoading(false);
            return;
        }

        const fetchRoom = async () => {
            try {
                const data = await getRoomById(numId);
                setRoom(data);
            } catch (err) {
                console.error("❌ Lỗi khi lấy chi tiết phòng:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [id]);

    return { room, loading };
};
