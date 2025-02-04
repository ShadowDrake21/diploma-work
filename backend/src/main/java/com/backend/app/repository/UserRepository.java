package com.backend.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.app.model.Role;
import com.backend.app.model.User;

public interface UserRepository extends JpaRepository<User, Long>{
	
	Optional<User> findByEmail(String email);
	Optional<User> findByUsername(String username);
	List<User> findByRole(Role role);
	
	@Query("SELECT u FROM User u WHERE u.email = :email AND u.role = :role")
	Optional<User> findByEmailAndRole(@Param("email") String email, @Param("role") Role role);
	
	boolean existsByEmail(String email);
	
	@Query("SELECT u FROM User u WHERE u.role = :role")
	List<User> findByRole(@Param("role") Role role, Pageable pageable);
}
