package data.service.impl;

import data.dto.response.NotificationResponseDTO;
import data.entity.Notification;
import data.entity.User;
import data.exception.NotFoundException;
import data.repository.NotificationRepository;
import data.service.NotificationService;
import data.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserService userService;
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUserNotifications(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotifications(Integer userId) {
        List<Notification> notifications = notificationRepository.findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Integer notificationId) {
        User currentUser = userService.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy thông báo với ID: " + notificationId));
        
        if (!notification.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền đánh dấu thông báo này");
        }
        
        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }
    
    @Override
    @Transactional
    public void markAllAsRead(Integer userId) {
        notificationRepository.markAllAsRead(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Integer userId) {
        return notificationRepository.countByUser_UserIdAndIsReadFalse(userId);
    }
    
    @Override
    @Transactional
    public void createNotification(Integer userId, String title, String message, String type, Integer relatedBookingId) {
        User user = userService.getUserById(userId);
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .isRead(false)
            .relatedBookingId(relatedBookingId)
            .build();
        notificationRepository.save(notification);
    }
    
    private NotificationResponseDTO toDTO(Notification notification) {
        return NotificationResponseDTO.builder()
            .notificationId(notification.getNotificationId())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .type(notification.getType())
            .isRead(notification.getIsRead())
            .relatedBookingId(notification.getRelatedBookingId())
            .createdAt(notification.getCreatedAt())
            .build();
    }
}

