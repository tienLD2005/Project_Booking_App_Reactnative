package data.service;

import data.dto.response.RoomResponseDTO;

import java.util.List;

public interface RoomService {
    List<RoomResponseDTO> getAllRooms();
    List<RoomResponseDTO> getRoomsByHotelId(Integer hotelId);
    RoomResponseDTO getRoomById(Integer roomId);
    List<RoomResponseDTO> searchRooms(String keyword);
}
