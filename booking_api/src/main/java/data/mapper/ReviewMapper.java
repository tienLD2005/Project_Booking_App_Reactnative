package data.mapper;

import data.dto.response.ReviewResponseDTO;
import data.entity.Review;

import java.util.List;
import java.util.stream.Collectors;

public class ReviewMapper {
    
    public static ReviewResponseDTO toDTO(Review review) {
        if (review == null) {
            return null;
        }
        
        return ReviewResponseDTO.builder()
            .reviewId(review.getReviewId())
            .roomId(review.getRoom() != null ? review.getRoom().getRoomId() : null)
            .roomType(review.getRoom() != null ? review.getRoom().getRoomType() : null)
            .hotelId(review.getRoom() != null && review.getRoom().getHotel() != null ? review.getRoom().getHotel().getHotelId() : null)
            .hotelName(review.getRoom() != null && review.getRoom().getHotel() != null ? review.getRoom().getHotel().getHotelName() : null)
            .userId(review.getUser() != null ? review.getUser().getUserId() : null)
            .userName(review.getUser() != null ? review.getUser().getFullName() : null)
            .rating(review.getRating())
            .comment(review.getComment())
            .createdAt(review.getCreatedAt())
            .build();
    }
    
    public static List<ReviewResponseDTO> toDTOList(List<Review> reviews) {
        if (reviews == null) {
            return List.of();
        }
        return reviews.stream()
            .map(ReviewMapper::toDTO)
            .collect(Collectors.toList());
    }
}

