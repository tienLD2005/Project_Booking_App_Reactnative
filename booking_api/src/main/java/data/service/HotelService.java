package data.service;

import data.dto.response.HotelResponseDTO;
import data.entity.Hotel;

import java.util.List;

public interface HotelService {
    List<HotelResponseDTO> getAllHotels();
    List<HotelResponseDTO> getHotelsByCity(String city);
    List<HotelResponseDTO> searchHotels(String keyword);
    HotelResponseDTO getHotelById(Integer hotelId);
}

