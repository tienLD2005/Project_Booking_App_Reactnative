package data.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import data.dto.request.BookingRequest;
import data.dto.response.BookingResponseDTO;
import data.entity.Bookings;
import data.entity.Room;
import data.entity.User;
import data.exception.NotFoundException;
import data.mapper.BookingMapper;
import data.repository.BookingRepository;
import data.repository.RoomRepository;
import data.service.BookingService;
import data.service.NotificationService;
import data.service.UserService;
import data.utils.BookingStatus;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final data.repository.ReviewRepository reviewRepository;

    private void enrichWithRatings(java.util.List<BookingResponseDTO> bookingDTOs) {
        for (BookingResponseDTO dto : bookingDTOs) {
            if (dto.getRoomId() != null) {
                var reviews = reviewRepository.findByRoom_RoomId(dto.getRoomId());
                if (!reviews.isEmpty()) {
                    dto.setReviewCount(reviews.size());
                    dto.setRating(reviews.stream()
                            .mapToInt(r -> r.getRating())
                            .average()
                            .orElse(0.0));
                } else {
                    dto.setReviewCount(0);
                    dto.setRating(0.0);
                }
            }
        }
    }

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequest request) {
        User user = userService.getCurrentUser();
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với ID: " + request.getRoomId()));

        // Calculate number of nights
        long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) {
            throw new RuntimeException("Số đêm phải lớn hơn 0");
        }

        // Calculate total price: room price * number of guests * number of nights
        int totalGuests = (request.getAdultsCount() != null ? request.getAdultsCount() : 0) +
                (request.getChildrenCount() != null ? request.getChildrenCount() : 0);
        double totalPrice = room.getPrice() * totalGuests * nights;

        Bookings booking = Bookings.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .adultsCount(request.getAdultsCount())
                .childrenCount(request.getChildrenCount())
                .infantsCount(request.getInfantsCount())
                .build();

        booking = bookingRepository.save(booking);

        // Create notification for successful booking
        Room savedRoom = booking.getRoom();
        String hotelName = savedRoom.getHotel().getHotelName();
        notificationService.createNotification(
                user.getUserId(),
                "Đặt phòng thành công",
                String.format("Bạn đã đặt phòng tại %s thành công. Mã đặt phòng: #%d", hotelName,
                        booking.getBookingId()),
                "BOOKING_SUCCESS",
                booking.getBookingId());

        BookingResponseDTO dto = BookingMapper.toDTO(booking);
        enrichWithRatings(java.util.List.of(dto));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUpcomingBookings(Integer userId) {
        LocalDate today = LocalDate.now();
        List<Bookings> bookings = bookingRepository.findUpcomingBookings(userId, today);
        List<BookingResponseDTO> dtos = BookingMapper.toDTOList(bookings);
        enrichWithRatings(dtos);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getPastBookings(Integer userId) {
        // Return all bookings where checkOut date has passed (regardless of status)
        LocalDate today = LocalDate.now();
        List<Bookings> bookings = bookingRepository.findPastBookings(userId, today);
        List<BookingResponseDTO> dtos = BookingMapper.toDTOList(bookings);
        enrichWithRatings(dtos);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
        BookingResponseDTO dto = BookingMapper.toDTO(booking);
        enrichWithRatings(java.util.List.of(dto));
        return dto;
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));

        User currentUser = userService.getCurrentUser();
        if (!booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền hủy booking này");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        // Create notification for cancelled booking
        Room room = booking.getRoom();
        String hotelName = room.getHotel().getHotelName();
        notificationService.createNotification(
                currentUser.getUserId(),
                "Đặt phòng đã bị hủy",
                String.format("Đặt phòng tại %s (Mã: #%d) đã được hủy thành công.", hotelName, booking.getBookingId()),
                "BOOKING_CANCELLED",
                booking.getBookingId());

        BookingResponseDTO dto = BookingMapper.toDTO(booking);
        enrichWithRatings(java.util.List.of(dto));
        return dto;
    }

    @Override
    @Transactional
    public BookingResponseDTO confirmBooking(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));

        User currentUser = userService.getCurrentUser();
        if (!booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền xác nhận booking này");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);

        // Create notification for confirmed booking
        Room room = booking.getRoom();
        String hotelName = room.getHotel().getHotelName();
        notificationService.createNotification(
                currentUser.getUserId(),
                "Đặt phòng đã được xác nhận",
                String.format("Đặt phòng tại %s (Mã: #%d) đã được xác nhận. Chúc bạn có chuyến đi vui vẻ!", hotelName,
                        booking.getBookingId()),
                "BOOKING_CONFIRMED",
                booking.getBookingId());

        BookingResponseDTO dto = BookingMapper.toDTO(booking);
        enrichWithRatings(java.util.List.of(dto));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUserBookings(Integer userId) {
        List<Bookings> bookings = bookingRepository.findByUser_UserId(userId);
        List<BookingResponseDTO> dtos = BookingMapper.toDTOList(bookings);
        enrichWithRatings(dtos);
        return dtos;
    }
}
