package data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteResponseDTO {
    private Integer favoriteId;
    private Integer roomId;
    private String roomType;
    private String roomImageUrl;
    private Double roomPrice;
    private Integer hotelId;
    private String hotelName;
    private String hotelLocation;
    private String hotelCity;
    private Double rating;
    private Integer reviewCount;
}

