package data.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import data.utils.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private Integer bookingId;
    private Integer roomId;
    private String roomType;
    private String roomImageUrl;
    private Integer hotelId;
    private String hotelName;
    private String hotelLocation;
    private String hotelCity;
    private String hotelAddress;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkIn;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOut;
    
    private Double totalPrice;
    private BookingStatus status;
    private Integer adultsCount;
    private Integer childrenCount;
    private Integer infantsCount;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    private Double rating;
    private Integer reviewCount;
}

