package data.repository;

import data.entity.RefreshToken;
import data.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);

    List<RefreshToken> findAllByUserOrderByExpiryDateAsc(User user);

    Optional<RefreshToken> findByUser(User user);
}