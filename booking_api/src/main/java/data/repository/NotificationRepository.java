package data.repository;

import data.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    
    List<Notification> findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId")
    void markAllAsRead(@Param("userId") Integer userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :notificationId AND n.user.userId = :userId")
    void markAsRead(@Param("notificationId") Integer notificationId, @Param("userId") Integer userId);
    
    Long countByUser_UserIdAndIsReadFalse(Integer userId);
}

