package data.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    
    @NotNull(message = "Room ID is required")
    private Integer roomId;
    
    @NotNull(message = "Check-in date is required")
    private LocalDate checkIn;
    
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOut;
    
    @Min(value = 0, message = "Adults count must be non-negative")
    private Integer adultsCount = 1;
    
    @Min(value = 0, message = "Children count must be non-negative")
    private Integer childrenCount = 0;
    
    @Min(value = 0, message = "Infants count must be non-negative")
    private Integer infantsCount = 0;
}

