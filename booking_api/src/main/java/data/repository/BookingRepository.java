package data.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import data.entity.Bookings;
import data.utils.BookingStatus;

public interface BookingRepository extends JpaRepository<Bookings, Integer> {
    
    List<Bookings> findByUser_UserId(Integer userId);
    
    List<Bookings> findByUser_UserIdAndStatus(Integer userId, BookingStatus status);
    
    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.checkOut >= :today AND b.status IN ('PENDING', 'CONFIRMED')")
    List<Bookings> findUpcomingBookings(@Param("userId") Integer userId, @Param("today") LocalDate today);
    
    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.checkOut < :today AND b.status IN ('PENDING', 'CONFIRMED')")
    List<Bookings> findPastBookings(@Param("userId") Integer userId, @Param("today") LocalDate today);
    
    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.status = 'CONFIRMED'")
    List<Bookings> findConfirmedBookings(@Param("userId") Integer userId);
    
    @Query("SELECT b FROM Bookings b WHERE b.user.userId = :userId AND b.checkOut < :today AND b.status = :status")
    List<Bookings> findPastBookingsByStatus(@Param("userId") Integer userId, @Param("today") LocalDate today, @Param("status") BookingStatus status);
    
    Bookings findByBookingId(Integer bookingId);
}

