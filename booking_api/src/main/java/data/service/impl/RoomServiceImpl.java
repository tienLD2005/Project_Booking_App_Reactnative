package data.service.impl;

import data.dto.response.RoomResponseDTO;
import data.entity.Room;
import data.entity.Hotel;
import data.mapper.RoomMapper;
import data.repository.RoomRepository;
import data.repository.ReviewRepository;
import data.repository.HotelRepository;
import data.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private HotelRepository hotelRepository;

    private void enrichWithRatings(List<RoomResponseDTO> roomDTOs) {
        for (RoomResponseDTO roomDTO : roomDTOs) {
            if (roomDTO.getRoomId() != null) {
                var reviews = reviewRepository.findByRoom_RoomId(roomDTO.getRoomId());
                
                if (!reviews.isEmpty()) {
                    int reviewCount = reviews.size();
                    double rating = reviews.stream()
                        .mapToInt(r -> r.getRating())
                        .average()
                        .orElse(0.0);
                    
                    roomDTO.setRating(rating);
                    roomDTO.setReviewCount(reviewCount);
                }
            }
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RoomResponseDTO> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        List<RoomResponseDTO> roomDTOs = RoomMapper.toDTOList(rooms);
        
        Set<Integer> hotelIds = roomDTOs.stream()
            .filter(r -> r.getHotelId() != null)
            .map(RoomResponseDTO::getHotelId)
            .collect(Collectors.toSet());
        
        Map<Integer, Hotel> hotelsMap = hotelIds.stream()
            .collect(Collectors.toMap(
                id -> id,
                id -> hotelRepository.findById(id).orElse(null)
            ));
        
        roomDTOs.forEach(roomDTO -> {
            if (roomDTO.getHotelId() != null) {
                Hotel hotel = hotelsMap.get(roomDTO.getHotelId());
                if (hotel != null) {
                    roomDTO.setHotelName(hotel.getHotelName());
                }
            }
        });
        
        enrichWithRatings(roomDTOs);
        return roomDTOs;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RoomResponseDTO> getRoomsByHotelId(Integer hotelId) {
        List<Room> rooms = roomRepository.findByHotel_HotelId(hotelId);
        List<RoomResponseDTO> roomDTOs = RoomMapper.toDTOList(rooms);
        
        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
        if (hotel != null) {
            roomDTOs.forEach(roomDTO -> {
                roomDTO.setHotelName(hotel.getHotelName());
            });
        }
        
        enrichWithRatings(roomDTOs);
        return roomDTOs;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public RoomResponseDTO getRoomById(Integer roomId) {
        Room room = roomRepository.findByRoomId(roomId).orElse(null);
        if (room == null) return null;
        
        RoomResponseDTO roomDTO = RoomMapper.toDTO(room);
        
        if (roomDTO.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(roomDTO.getHotelId()).orElse(null);
            if (hotel != null) {
                roomDTO.setHotelName(hotel.getHotelName());
            }
        }
        
        // Calculate rating and review count for this room
        var reviews = reviewRepository.findByRoom_RoomId(roomDTO.getRoomId());
        if (!reviews.isEmpty()) {
            roomDTO.setReviewCount(reviews.size());
            roomDTO.setRating(reviews.stream()
                .mapToInt(r -> r.getRating())
                .average()
                .orElse(0.0));
        }
        
        return roomDTO;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RoomResponseDTO> searchRooms(String keyword) {
        List<Room> rooms = roomRepository.findByRoomTypeContainingIgnoreCase(keyword);
        List<RoomResponseDTO> roomDTOs = RoomMapper.toDTOList(rooms);
        
        Set<Integer> hotelIds = roomDTOs.stream()
            .filter(r -> r.getHotelId() != null)
            .map(RoomResponseDTO::getHotelId)
            .collect(Collectors.toSet());
        
        Map<Integer, Hotel> hotelsMap = hotelIds.stream()
            .collect(Collectors.toMap(
                id -> id,
                id -> hotelRepository.findById(id).orElse(null)
            ));
        
        roomDTOs.forEach(roomDTO -> {
            if (roomDTO.getHotelId() != null) {
                Hotel hotel = hotelsMap.get(roomDTO.getHotelId());
                if (hotel != null) {
                    roomDTO.setHotelName(hotel.getHotelName());
                }
            }
        });
        
        enrichWithRatings(roomDTOs);
        return roomDTOs;
    }
}
