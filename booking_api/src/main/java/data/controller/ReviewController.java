package data.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import data.dto.request.ReviewRequest;
import data.dto.response.APIResponse;
import data.dto.response.ReviewResponseDTO;
import data.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<APIResponse<ReviewResponseDTO>> createReview(@Valid @RequestBody ReviewRequest request) {
        try {
            ReviewResponseDTO review = reviewService.createReview(request);
            return ResponseEntity.ok(APIResponse.success(review, "Đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<APIResponse<List<ReviewResponseDTO>>> getReviewsByRoomId(@PathVariable Integer roomId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByRoomId(roomId);
            return ResponseEntity.ok(APIResponse.success(reviews, "Lấy danh sách đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/{reviewId}")
    public ResponseEntity<APIResponse<ReviewResponseDTO>> getReviewById(@PathVariable Integer reviewId) {
        try {
            ReviewResponseDTO review = reviewService.getReviewById(reviewId);
            return ResponseEntity.ok(APIResponse.success(review, "Lấy thông tin đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/room/{roomId}/my-review")
    public ResponseEntity<APIResponse<ReviewResponseDTO>> getMyReviewByRoomId(@PathVariable Integer roomId) {
        try {
            ReviewResponseDTO review = reviewService.getMyReviewByRoomId(roomId);
            if (review == null) {
                return ResponseEntity.ok(APIResponse.success(null, "Bạn chưa đánh giá phòng này"));
            }
            return ResponseEntity.ok(APIResponse.success(review, "Lấy đánh giá của bạn thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/{reviewId}")
    public ResponseEntity<APIResponse<ReviewResponseDTO>> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReviewRequest request) {
        try {
            ReviewResponseDTO review = reviewService.updateReview(reviewId, request);
            return ResponseEntity.ok(APIResponse.success(review, "Cập nhật đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
}

