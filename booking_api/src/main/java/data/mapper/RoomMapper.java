package data.mapper;

import data.dto.response.RoomResponseDTO;
import data.entity.Room;
import data.entity.RoomImage;

import java.util.List;

public class RoomMapper {

    public static RoomResponseDTO toDTO(Room room) {
        if (room == null) return null;

        return RoomResponseDTO.builder()
                .roomId(room.getRoomId())
                .roomType(room.getRoomType())
                .price(room.getPrice())
                .capacity(room.getCapacity())
                .description(room.getDescription())
                .imageUrls(
                        room.getImages() != null
                                ? room.getImages().stream()
                                .map(RoomImage::getImageUrl)
                                .toList()
                                : List.of()
                )
                .hotelId(
                        room.getHotel() != null
                                ? room.getHotel().getHotelId()
                                : null
                )
                .hotelName(
                        room.getHotel() != null
                                ? room.getHotel().getHotelName()
                                : null
                )
                .rating(null) // Will be set by service layer
                .reviewCount(null) // Will be set by service layer
                .build();
    }

    public static List<RoomResponseDTO> toDTOList(List<Room> rooms) {
        return rooms == null ? List.of() :
                rooms.stream().map(RoomMapper::toDTO).toList();
    }
}
