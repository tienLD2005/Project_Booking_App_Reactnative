package data.repository;

import data.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.images")
    @Override
    List<Room> findAll();

    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.images WHERE r.hotel.hotelId = :hotelId")
    List<Room> findByHotel_HotelId(@Param("hotelId") Integer hotelId);

    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.images WHERE r.roomType LIKE %:keyword%")
    List<Room> findByRoomTypeContainingIgnoreCase(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.images WHERE r.roomId = :roomId")
    Optional<Room> findByRoomId(@Param("roomId") Integer roomId);
}