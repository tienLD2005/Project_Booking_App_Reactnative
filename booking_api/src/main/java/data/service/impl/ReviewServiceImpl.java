package data.service.impl;

import data.dto.request.ReviewRequest;
import data.dto.response.ReviewResponseDTO;
import data.entity.Room;
import data.entity.Review;
import data.entity.User;
import data.exception.NotFoundException;
import data.mapper.ReviewMapper;
import data.repository.RoomRepository;
import data.repository.ReviewRepository;
import data.service.ReviewService;
import data.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;
    private final UserService userService;
    
    @Override
    @Transactional
    public ReviewResponseDTO createReview(ReviewRequest request) {
        User user = userService.getCurrentUser();
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với ID: " + request.getRoomId()));
        
        if (reviewRepository.existsByUser_UserIdAndRoom_RoomId(user.getUserId(), room.getRoomId())) {
            throw new RuntimeException("Bạn đã đánh giá phòng này rồi. Vui lòng sử dụng chức năng cập nhật.");
        }
        
        Review review = Review.builder()
            .user(user)
            .room(room)
            .rating(request.getRating())
            .comment(request.getComment())
            .build();
        
        review = reviewRepository.save(review);
        return ReviewMapper.toDTO(review);
    }
    
    @Override
    @Transactional
    public ReviewResponseDTO updateReview(Integer reviewId, ReviewRequest request) {
        User user = userService.getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy review với ID: " + reviewId));
        
        // Check if the review belongs to the current user
        if (!review.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật đánh giá này");
        }
        
        // Update review
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        review = reviewRepository.save(review);
        return ReviewMapper.toDTO(review);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDTO getMyReviewByRoomId(Integer roomId) {
        User user = userService.getCurrentUser();
        Review review = reviewRepository.findByUser_UserIdAndRoom_RoomId(user.getUserId(), roomId);
        if (review == null) {
            return null;
        }
        return ReviewMapper.toDTO(review);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByRoomId(Integer roomId) {
        List<Review> reviews = reviewRepository.findByRoom_RoomIdOrderByCreatedAtDesc(roomId);
        return ReviewMapper.toDTOList(reviews);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByUserId(Integer userId) {
        List<Review> reviews = reviewRepository.findByUser_UserId(userId);
        return ReviewMapper.toDTOList(reviews);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDTO getReviewById(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy review với ID: " + reviewId));
        return ReviewMapper.toDTO(review);
    }
}

