package data.repository;

import data.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    
    List<Favorite> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    
    Optional<Favorite> findByUser_UserIdAndRoom_RoomId(Integer userId, Integer roomId);
    
    @Query("SELECT f FROM Favorite f WHERE f.user.userId = :userId AND f.room.roomId = :roomId")
    Optional<Favorite> findFavoriteByUserAndRoom(@Param("userId") Integer userId, @Param("roomId") Integer roomId);
    
    boolean existsByUser_UserIdAndRoom_RoomId(Integer userId, Integer roomId);
}

