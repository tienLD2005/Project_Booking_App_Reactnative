package data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {
    private Integer reviewId;
    private Integer roomId;
    private String roomType;
    private Integer hotelId;
    private String hotelName;
    private Integer userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

