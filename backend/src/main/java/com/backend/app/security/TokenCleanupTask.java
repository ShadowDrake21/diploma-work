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
		try {
			Instant now = Instant.now();
			log.debug("Starting token cleanup at {}", now);
			
			List<ActiveToken> expiredTokens = activeTokenRepository.findByExpiryBefore(now);
			
			if(!expiredTokens.isEmpty()) {
				log.info("Found {} expired tokens to clean up", expiredTokens.size());
				
				expiredTokens.forEach(token -> {
					try {
						tokenBlacklist.removeFromBlacklist(token.getToken());
						activeTokenRepository.delete(token);
						log.debug("Removed expired token for user {}", token.getUserId());
                    } catch (Exception e) {
                        log.error("Failed to remove token {}: {}", token.getToken(), e.getMessage());
                    }
				});
				 
                log.info("Successfully cleaned up {} expired tokens", expiredTokens.size());
            } else {
                log.debug("No expired tokens found to clean up");
            }
        } catch (Exception e) {
            log.error("Error during token cleanup: ", e);
        }
	}
}
