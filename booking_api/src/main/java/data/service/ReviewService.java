package data.service;

import java.util.List;

import data.dto.request.ReviewRequest;
import data.dto.response.ReviewResponseDTO;

public interface ReviewService {
    ReviewResponseDTO createReview(ReviewRequest request);
    ReviewResponseDTO updateReview(Integer reviewId, ReviewRequest request);
    ReviewResponseDTO getMyReviewByRoomId(Integer roomId);
    List<ReviewResponseDTO> getReviewsByRoomId(Integer roomId);
    List<ReviewResponseDTO> getReviewsByUserId(Integer userId);
    ReviewResponseDTO getReviewById(Integer reviewId);
}

