package data.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import data.entity.Otp;
import data.entity.User;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Integer> {
    Optional<Otp> findByUser(User user);
    Optional<Otp> findByOtpCodeAndUser(String otpCode, User user);
    
    @Modifying
    @Query("DELETE FROM Otp o WHERE o.user = :user")
    void deleteByUser(@Param("user") User user);
}
