package data.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import data.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    List<Review> findByRoom_RoomId(Integer roomId);
    
    List<Review> findByUser_UserId(Integer userId);
    
    List<Review> findByRoom_RoomIdOrderByCreatedAtDesc(Integer roomId);

    boolean existsByUser_UserIdAndRoom_RoomId(Integer userId, Integer roomId);

    Review findByUser_UserIdAndRoom_RoomId(Integer userId, Integer roomId);
}

