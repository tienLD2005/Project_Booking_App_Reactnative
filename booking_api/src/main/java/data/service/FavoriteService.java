package data.service;

import data.dto.response.FavoriteResponseDTO;

import java.util.List;

public interface FavoriteService {
    List<FavoriteResponseDTO> getUserFavorites(Integer userId);
    FavoriteResponseDTO addFavorite(Integer roomId);
    void removeFavorite(Integer favoriteId);
    void removeFavoriteByRoomId(Integer roomId);
    boolean isFavorite(Integer roomId);
}

