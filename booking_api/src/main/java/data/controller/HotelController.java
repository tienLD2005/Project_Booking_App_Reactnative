package data.controller;

import data.dto.response.APIResponse;
import data.dto.response.HotelResponseDTO;
import data.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class HotelController {
    
    private final HotelService hotelService;
    
    @GetMapping
    public ResponseEntity<APIResponse<List<HotelResponseDTO>>> getAllHotels() {
        List<HotelResponseDTO> hotels = hotelService.getAllHotels();
        return ResponseEntity.ok(APIResponse.success(hotels, "Lấy danh sách khách sạn thành công"));
    }
    
    @GetMapping("/search")
    public ResponseEntity<APIResponse<List<HotelResponseDTO>>> searchHotels(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String city
    ) {
        List<HotelResponseDTO> hotels;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            hotels = hotelService.searchHotels(keyword.trim());
        } else if (city != null && !city.trim().isEmpty()) {
            hotels = hotelService.getHotelsByCity(city.trim());
        } else {
            hotels = hotelService.getAllHotels();
        }
        
        return ResponseEntity.ok(APIResponse.success(hotels, "Tìm kiếm khách sạn thành công"));
    }
    
    @GetMapping("/{hotelId}")
    public ResponseEntity<APIResponse<HotelResponseDTO>> getHotelById(@PathVariable Integer hotelId) {
        HotelResponseDTO hotel = hotelService.getHotelById(hotelId);
        return ResponseEntity.ok(APIResponse.success(hotel, "Lấy thông tin khách sạn thành công"));
    }
}

