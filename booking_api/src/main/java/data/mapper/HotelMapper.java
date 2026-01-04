package data.mapper;

import data.dto.response.HotelResponseDTO;
import data.entity.Hotel;
import data.entity.HotelImage;

import java.util.List;
import java.util.stream.Collectors;

public class HotelMapper {
    
    public static HotelResponseDTO toDTO(Hotel hotel) {
        if (hotel == null) {
            return null;
        }
        // ảnh hiiện chính
        String mainImageUrl = hotel.getHotelImages() != null && !hotel.getHotelImages().isEmpty()
            ? hotel.getHotelImages().stream()
                .findFirst()
                .orElse(hotel.getHotelImages().get(0))
                .getImageUrl()
            : null;
        // ảnh thông tin
        List<String> imageUrls = hotel.getHotelImages() != null
            ? hotel.getHotelImages().stream()
                .map(HotelImage::getImageUrl)
                .collect(Collectors.toList())
            : List.of();
        
        return HotelResponseDTO.builder()
            .hotelId(hotel.getHotelId())
            .hotelName(hotel.getHotelName())
            .address(hotel.getAddress())
            .city(hotel.getCity())
            .country(hotel.getCountry())
            .description(hotel.getDescription())
            .mainImageUrl(mainImageUrl)
            .imageUrls(imageUrls)
            .ownerName(hotel.getOwner() != null ? hotel.getOwner().getFullName() : null)
            .build();
    }
    
    public static List<HotelResponseDTO> toDTOList(List<Hotel> hotels) {
        if (hotels == null) {
            return List.of();
        }
        return hotels.stream()
            .map(HotelMapper::toDTO)
            .collect(Collectors.toList());
    }
}

