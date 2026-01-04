package data.service.impl;

import data.dto.response.HotelResponseDTO;
import data.entity.Hotel;
import data.exception.NotFoundException;
import data.mapper.HotelMapper;
import data.repository.HotelRepository;
import data.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {
    
    private final HotelRepository hotelRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return HotelMapper.toDTOList(hotels);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getHotelsByCity(String city) {
        List<Hotel> hotels = hotelRepository.findByCity(city);
        return HotelMapper.toDTOList(hotels);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> searchHotels(String keyword) {
        List<Hotel> hotels = hotelRepository.searchHotels(keyword);
        return HotelMapper.toDTOList(hotels);
    }
    
    @Override
    @Transactional(readOnly = true)
    public HotelResponseDTO getHotelById(Integer hotelId) {
        Hotel hotel = hotelRepository.findByIdWithImages(hotelId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy khách sạn với ID: " + hotelId));
        return HotelMapper.toDTO(hotel);
    }
}

