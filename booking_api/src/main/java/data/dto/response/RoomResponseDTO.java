package data.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponseDTO {
    private Integer roomId;
    private String roomType;
    private Double price;
    private Integer capacity;
    private String description;
    private List<String> imageUrls;
    private Integer hotelId;
    private String hotelName;
    private Double rating;
    private Integer reviewCount;
}
