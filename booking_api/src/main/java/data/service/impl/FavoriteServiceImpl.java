package data.service.impl;

import data.dto.response.FavoriteResponseDTO;
import data.entity.Favorite;
import data.entity.Room;
import data.entity.User;
import data.exception.NotFoundException;
import data.repository.FavoriteRepository;
import data.repository.RoomRepository;
import data.service.FavoriteService;
import data.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {
    
    private final FavoriteRepository favoriteRepository;
    private final RoomRepository roomRepository;
    private final UserService userService;
    
    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResponseDTO> getUserFavorites(Integer userId) {
        List<Favorite> favorites = favoriteRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return favorites.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public FavoriteResponseDTO addFavorite(Integer roomId) {
        User user = userService.getCurrentUser();
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với ID: " + roomId));
        
        // Check if already favorited
        if (favoriteRepository.existsByUser_UserIdAndRoom_RoomId(user.getUserId(), roomId)) {
            throw new RuntimeException("Phòng này đã được thêm vào yêu thích");
        }
        
        Favorite favorite = Favorite.builder()
            .user(user)
            .room(room)
            .build();
        
        favorite = favoriteRepository.save(favorite);
        return toDTO(favorite);
    }
    
    @Override
    @Transactional
    public void removeFavorite(Integer favoriteId) {
        User currentUser = userService.getCurrentUser();
        Favorite favorite = favoriteRepository.findById(favoriteId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu thích với ID: " + favoriteId));
        
        if (!favorite.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền xóa yêu thích này");
        }
        
        favoriteRepository.delete(favorite);
    }
    
    @Override
    @Transactional
    public void removeFavoriteByRoomId(Integer roomId) {
        User currentUser = userService.getCurrentUser();
        Favorite favorite = favoriteRepository.findFavoriteByUserAndRoom(currentUser.getUserId(), roomId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu thích cho phòng này"));
        
        favoriteRepository.delete(favorite);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Integer roomId) {
        User currentUser = userService.getCurrentUser();
        return favoriteRepository.existsByUser_UserIdAndRoom_RoomId(currentUser.getUserId(), roomId);
    }
    
    private FavoriteResponseDTO toDTO(Favorite favorite) {
        Room room = favorite.getRoom();
        String roomImageUrl = null;
        if (room.getImages() != null && !room.getImages().isEmpty()) {
            roomImageUrl = room.getImages().get(0).getImageUrl();
        }

        Double rating = 4.0; // Default rating
        Integer reviewCount = 115; // Default review count
        
        return FavoriteResponseDTO.builder()
            .favoriteId(favorite.getFavoriteId())
            .roomId(room.getRoomId())
            .roomType(room.getRoomType())
            .roomImageUrl(roomImageUrl)
            .roomPrice(room.getPrice())
            .hotelId(room.getHotel().getHotelId())
            .hotelName(room.getHotel().getHotelName())
            .hotelLocation(room.getHotel().getAddress())
            .hotelCity(room.getHotel().getCity())
            .rating(rating)
            .reviewCount(reviewCount)
            .build();
    }
}

