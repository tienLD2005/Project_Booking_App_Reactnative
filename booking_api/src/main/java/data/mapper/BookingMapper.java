package data.mapper;

import data.dto.response.BookingResponseDTO;
import data.entity.Bookings;
import data.entity.Room;

import java.util.List;
import java.util.stream.Collectors;

public class BookingMapper {

    public static BookingResponseDTO toDTO(Bookings booking) {
        if (booking == null) {
            return null;
        }

        Room room = booking.getRoom();
        String roomImageUrl = null;
        if (room != null && room.getImages() != null && !room.getImages().isEmpty()) {
            roomImageUrl = room.getImages().get(0).getImageUrl();
        }

        // Calculate average rating and review count for hotel
        // Note: Rating and review count should be fetched from database if needed
        // For now, we'll use default values
        Double rating = null;
        Integer reviewCount = null;

        return BookingResponseDTO.builder()
                .bookingId(booking.getBookingId())
                .roomId(room != null ? room.getRoomId() : null)
                .roomType(room != null ? room.getRoomType() : null)
                .roomImageUrl(roomImageUrl)
                .hotelId(room != null && room.getHotel() != null ? room.getHotel().getHotelId() : null)
                .hotelName(room != null && room.getHotel() != null ? room.getHotel().getHotelName() : null)
                .hotelLocation(
                        room != null && room.getHotel() != null
                                ? (room.getHotel().getCity() != null ? room.getHotel().getCity() : "") +
                                        (room.getHotel().getCountry() != null ? ", " + room.getHotel().getCountry()
                                                : "")
                                : null)
                .hotelCity(room != null && room.getHotel() != null ? room.getHotel().getCity() : null)
                .hotelAddress(room != null && room.getHotel() != null ? room.getHotel().getAddress() : null)
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .adultsCount(booking.getAdultsCount())
                .childrenCount(booking.getChildrenCount())
                .infantsCount(booking.getInfantsCount())
                .createdAt(booking.getCreatedAt())
                .rating(rating)
                .reviewCount(reviewCount)
                .build();
    }

    public static List<BookingResponseDTO> toDTOList(List<Bookings> bookings) {
        if (bookings == null) {
            return List.of();
        }
        return bookings.stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }
}
