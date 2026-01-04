package data.service;

import data.dto.request.BookingRequest;
import data.dto.response.BookingResponseDTO;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequest request);
    List<BookingResponseDTO> getUpcomingBookings(Integer userId);
    List<BookingResponseDTO> getPastBookings(Integer userId);
    BookingResponseDTO getBookingById(Integer bookingId);
    BookingResponseDTO cancelBooking(Integer bookingId);
    BookingResponseDTO confirmBooking(Integer bookingId);
    List<BookingResponseDTO> getUserBookings(Integer userId);
}

