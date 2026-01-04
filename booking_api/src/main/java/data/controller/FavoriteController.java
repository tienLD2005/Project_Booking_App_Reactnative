package data.controller;

import data.dto.response.APIResponse;
import data.dto.response.FavoriteResponseDTO;
import data.service.FavoriteService;
import data.service.UserService;
import data.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<APIResponse<List<FavoriteResponseDTO>>> getUserFavorites() {
        try {
            User user = userService.getCurrentUser();
            List<FavoriteResponseDTO> favorites = favoriteService.getUserFavorites(user.getUserId());
            return ResponseEntity.ok(APIResponse.success(favorites, "Lấy danh sách yêu thích thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @PostMapping("/room/{roomId}")
    public ResponseEntity<APIResponse<FavoriteResponseDTO>> addFavorite(@PathVariable Integer roomId) {
        try {
            FavoriteResponseDTO favorite = favoriteService.addFavorite(roomId);
            return ResponseEntity.ok(APIResponse.success(favorite, "Thêm vào yêu thích thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<APIResponse<String>> removeFavorite(@PathVariable Integer favoriteId) {
        try {
            favoriteService.removeFavorite(favoriteId);
            return ResponseEntity.ok(APIResponse.success("OK", "Xóa khỏi yêu thích thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<APIResponse<String>> removeFavoriteByRoomId(@PathVariable Integer roomId) {
        try {
            favoriteService.removeFavoriteByRoomId(roomId);
            return ResponseEntity.ok(APIResponse.success("OK", "Xóa khỏi yêu thích thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/room/{roomId}/check")
    public ResponseEntity<APIResponse<Boolean>> isFavorite(@PathVariable Integer roomId) {
        try {
            Boolean isFavorite = favoriteService.isFavorite(roomId);
            return ResponseEntity.ok(APIResponse.success(isFavorite, "Kiểm tra yêu thích thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
}

