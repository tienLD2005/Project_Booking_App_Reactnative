package data.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import data.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
  
    @Deprecated
    default Optional<User> findByUsername(String email) {
        return findByEmail(email);
    }

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phone);

    @Deprecated
    default boolean existsByUsername(String email) {
        return existsByEmail(email);
    }
}


