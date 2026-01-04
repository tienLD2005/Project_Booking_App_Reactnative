package data.controller;

import data.dto.response.APIResponse;
import data.dto.response.RoomResponseDTO;
import data.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<APIResponse<List<RoomResponseDTO>>> getAllRooms() {
        List<RoomResponseDTO> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(APIResponse.success(rooms, "Lấy danh sách phòng thành công"));
    }
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<APIResponse<List<RoomResponseDTO>>> getRoomsByHotelId(@PathVariable Integer hotelId) {
        List<RoomResponseDTO> rooms = roomService.getRoomsByHotelId(hotelId);
        return ResponseEntity.ok(APIResponse.success(rooms, "Lấy danh sách phòng theo khách sạn thành công"));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<APIResponse<RoomResponseDTO>> getRoomById(@PathVariable Integer roomId) {
        RoomResponseDTO room = roomService.getRoomById(roomId);
        return ResponseEntity.ok(APIResponse.success(room, "Lấy thông tin phòng thành công"));
    }

    @GetMapping("/search")
    public ResponseEntity<APIResponse<List<RoomResponseDTO>>> searchRooms(@RequestParam String keyword) {
        List<RoomResponseDTO> rooms = roomService.searchRooms(keyword);
        return ResponseEntity.ok(APIResponse.success(rooms, "Tìm kiếm phòng thành công"));
    }
}
