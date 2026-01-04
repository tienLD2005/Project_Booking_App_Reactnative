package data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponseDTO {
    private Integer hotelId;
    private String hotelName;
    private String address;
    private String city;
    private String country;
    private String description;
    private Double pricePerNight;
    private String mainImageUrl;
    private List<String> imageUrls;
    private String ownerName;
}

