package data.service;

import data.dto.response.NotificationResponseDTO;

import java.util.List;

public interface NotificationService {
    List<NotificationResponseDTO> getUserNotifications(Integer userId);
    List<NotificationResponseDTO> getUnreadNotifications(Integer userId);
    NotificationResponseDTO markAsRead(Integer notificationId);
    void markAllAsRead(Integer userId);
    Long getUnreadCount(Integer userId);
    void createNotification(Integer userId, String title, String message, String type, Integer relatedBookingId);
}

