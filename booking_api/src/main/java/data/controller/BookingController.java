package data.controller;

import data.dto.request.BookingRequest;
import data.dto.response.APIResponse;
import data.dto.response.BookingResponseDTO;
import data.service.BookingService;
import data.service.UserService;
import data.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class BookingController {
    
    private final BookingService bookingService;
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<APIResponse<BookingResponseDTO>> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            BookingResponseDTO booking = bookingService.createBooking(request);
            return ResponseEntity.ok(APIResponse.success(booking, "Đặt phòng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<APIResponse<List<BookingResponseDTO>>> getUpcomingBookings() {
        try {
            User user = userService.getCurrentUser();
            List<BookingResponseDTO> bookings = bookingService.getUpcomingBookings(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(bookings, "Lấy danh sách booking sắp tới thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/past")
    public ResponseEntity<APIResponse<List<BookingResponseDTO>>> getPastBookings() {
        try {
            User user = userService.getCurrentUser();
            List<BookingResponseDTO> bookings = bookingService.getPastBookings(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(bookings, "Lấy danh sách booking đã qua thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<APIResponse<BookingResponseDTO>> cancelBooking(@PathVariable Integer bookingId) {
        try {
            BookingResponseDTO booking = bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(APIResponse.success(booking, "Hủy booking thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<APIResponse<BookingResponseDTO>> confirmBooking(@PathVariable Integer bookingId) {
        try {
            BookingResponseDTO booking = bookingService.confirmBooking(bookingId);
            return ResponseEntity.ok(APIResponse.success(booking, "Xác nhận booking thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/{bookingId}")
    public ResponseEntity<APIResponse<BookingResponseDTO>> getBookingById(@PathVariable Integer bookingId) {
        try {
            BookingResponseDTO booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(APIResponse.success(booking, "Lấy thông tin booking thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping
    public ResponseEntity<APIResponse<List<BookingResponseDTO>>> getUserBookings() {
        try {
            User user = userService.getCurrentUser();
            List<BookingResponseDTO> bookings = bookingService.getUserBookings(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(bookings, "Lấy danh sách booking thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
}

