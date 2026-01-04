package data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import data.entity.Hotel;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {
    
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.hotelImages")
    @Override
    List<Hotel> findAll();
    
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.hotelImages WHERE h.city = :city")
    List<Hotel> findByCity(String city);
    
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.hotelImages WHERE h.country = :country")
    List<Hotel> findByCountry(String country);
    
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.hotelImages WHERE h.hotelName LIKE %:keyword% OR h.address LIKE %:keyword% OR h.city LIKE %:keyword%")
    List<Hotel> searchHotels(String keyword);
    
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.hotelImages WHERE h.hotelId = :hotelId")
    Optional<Hotel> findByIdWithImages(Integer hotelId);
}

