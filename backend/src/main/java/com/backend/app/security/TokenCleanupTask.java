package com.backend.app.security;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.model.ActiveToken;
import com.backend.app.repository.ActiveTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupTask {
	private final ActiveTokenRepository activeTokenRepository;
	private final TokenBlacklist tokenBlacklist;
	
	@Scheduled(fixedRate = 3600000)
	@Transactional
	public void cleanupExpiredTokens() {
		Instant now = Instant.now();
		
		List<ActiveToken> expiredTokens = activeTokenRepository.findByExpiryBefore(now);
		expiredTokens.forEach(token -> {
			tokenBlacklist.removeFromBlacklist(token.getToken());
			activeTokenRepository.delete(token);
		});
		
		log.info("Cleaned up {} expired tokens", expiredTokens.size());
	}
}
