package com.backend.app.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.app.model.UserLogin;

@Repository
public interface UserLoginRepository extends JpaRepository<UserLogin, Long>{
	Page<UserLogin> findByUserIdOrderByLoginTimeDesc(Long userId,Pageable pageable);	
	List<UserLogin> findTop10ByOrderByLoginTimeDesc();
	long countByLoginTimeAfter(Instant time);
}
