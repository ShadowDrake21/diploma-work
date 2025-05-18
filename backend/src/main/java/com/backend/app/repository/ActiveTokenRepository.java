package com.backend.app.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.ActiveToken;

public interface ActiveTokenRepository extends JpaRepository<ActiveToken, String>{
	List<ActiveToken> findByUserId(Long userId);
	void deleteByToken(String token);
	void deleteByUser(Long userId);
	List<ActiveToken> findByExpiryBefore(Instant expiry);
}
