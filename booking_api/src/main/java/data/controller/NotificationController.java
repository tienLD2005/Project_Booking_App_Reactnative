package data.controller;

import data.dto.response.APIResponse;
import data.dto.response.NotificationResponseDTO;
import data.service.NotificationService;
import data.service.UserService;
import data.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class NotificationController {
    
    private final NotificationService notificationService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<APIResponse<List<NotificationResponseDTO>>> getUserNotifications() {
        try {
            User user = userService.getCurrentUser();
            List<NotificationResponseDTO> notifications = notificationService.getUserNotifications(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(notifications, "Lấy danh sách thông báo thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/unread")
    public ResponseEntity<APIResponse<List<NotificationResponseDTO>>> getUnreadNotifications() {
        try {
            User user = userService.getCurrentUser();
            List<NotificationResponseDTO> notifications = notificationService.getUnreadNotifications(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(notifications, "Lấy danh sách thông báo chưa đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<APIResponse<Long>> getUnreadCount() {
        try {
            User user = userService.getCurrentUser();
            Long count = notificationService.getUnreadCount(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(count, "Lấy số lượng thông báo chưa đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<APIResponse<NotificationResponseDTO>> markAsRead(@PathVariable Integer notificationId) {
        try {
            NotificationResponseDTO notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(APIResponse.success(notification, "Đánh dấu đã đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<APIResponse<String>> markAllAsRead() {
        try {
            User user = userService.getCurrentUser();
            notificationService.markAllAsRead(user.getUserId());
            return ResponseEntity.ok(APIResponse.success("OK", "Đánh dấu tất cả đã đọc thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
}

