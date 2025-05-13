package com.backend.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.app.enums.Role;
import com.backend.app.model.User;

public interface UserRepository extends JpaRepository<User, Long>{	
	Optional<User> findByEmail(String email);
	List<User> findByRole(Role role);
	boolean existsByEmail(String email);
	Optional<User> findByResetToken(String resetToken);
	
	@Query("SELECT u FROM User u WHERE u.email = :email AND u.role = :role")
	Optional<User> findByEmailAndRole(@Param("email") String email, @Param("role") Role role);
	
	@Query("SELECT u FROM User u WHERE u.resetToken IS NOT NULL AND u.tokenExpiration < CURRENT_TIMESTAMP")
	List<User> findExpiredResetTokens();
	
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(concat('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(concat('%', :query, '%'))")
    Page<User> searchUsers(String query, Pageable pageable);
	}
