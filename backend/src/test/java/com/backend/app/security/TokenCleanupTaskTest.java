package com.backend.app.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.model.ActiveToken;
import com.backend.app.repository.ActiveTokenRepository;

@ExtendWith(MockitoExtension.class)
public class TokenCleanupTaskTest {
	 @Mock
	    private ActiveTokenRepository activeTokenRepository;

	    @Mock
	    private TokenBlacklist tokenBlacklist;

	    @InjectMocks
	    private TokenCleanupTask tokenCleanupTask;
	    
	    @Test
	    void cleanupExpiredTokens_WhenNoExpiredTokens_ShouldDoNothing() {
	        when(activeTokenRepository.findByExpiryBefore(any(Instant.class)))
	            .thenReturn(List.of());

	        tokenCleanupTask.cleanupExpiredTokens();

	        verify(activeTokenRepository).findByExpiryBefore(any(Instant.class));
	        verifyNoMoreInteractions(activeTokenRepository);
	        verifyNoInteractions(tokenBlacklist);
	    }

	    @Test
	    void cleanupExpiredTokens_WithExpiredTokens_ShouldCleanThemUp() {
	        ActiveToken token1 = new ActiveToken("token1", 1L, Instant.now().minusSeconds(10));
	        ActiveToken token2 = new ActiveToken("token2", 2L, Instant.now().minusSeconds(5));
	        
	        when(activeTokenRepository.findByExpiryBefore(any(Instant.class)))
	            .thenReturn(List.of(token1, token2));

	        tokenCleanupTask.cleanupExpiredTokens();

	        verify(activeTokenRepository).findByExpiryBefore(any(Instant.class));
	        verify(tokenBlacklist).removeFromBlacklist("token1");
	        verify(activeTokenRepository).delete(token1);
	        verify(tokenBlacklist).removeFromBlacklist("token2");
	        verify(activeTokenRepository).delete(token2);
	    }

	    @Test
	    void cleanupExpiredTokens_WhenTokenRemovalFails_ShouldContinueWithOthers() {
	        ActiveToken token1 = new ActiveToken("token1", 1L, Instant.now().minusSeconds(10));
	        ActiveToken token2 = new ActiveToken("token2", 2L, Instant.now().minusSeconds(5));
	        
	        when(activeTokenRepository.findByExpiryBefore(any(Instant.class)))
	            .thenReturn(List.of(token1, token2));
	        
	        doThrow(new RuntimeException("DB error")).when(activeTokenRepository).delete(token1);

	        tokenCleanupTask.cleanupExpiredTokens();

	        verify(activeTokenRepository).findByExpiryBefore(any(Instant.class));
	        verify(tokenBlacklist).removeFromBlacklist("token1");
	        verify(activeTokenRepository).delete(token1);
	        verify(tokenBlacklist).removeFromBlacklist("token2");
	        verify(activeTokenRepository).delete(token2);
	    }

	    @Test
	    void cleanupExpiredTokens_WhenBlacklistRemovalFails_ShouldContinueWithOthers() {
	        ActiveToken token1 = new ActiveToken("token1", 1L, Instant.now().minusSeconds(10));
	        ActiveToken token2 = new ActiveToken("token2", 2L, Instant.now().minusSeconds(5));
	        
	        when(activeTokenRepository.findByExpiryBefore(any(Instant.class)))
	            .thenReturn(List.of(token1, token2));
	        
	        doThrow(new RuntimeException("Blacklist error")).when(tokenBlacklist).removeFromBlacklist("token1");

	        tokenCleanupTask.cleanupExpiredTokens();

	        verify(activeTokenRepository).findByExpiryBefore(any(Instant.class));
	        verify(tokenBlacklist).removeFromBlacklist("token1");
	        verify(activeTokenRepository).delete(token1);
	        verify(tokenBlacklist).removeFromBlacklist("token2");
	        verify(activeTokenRepository).delete(token2);
	    }
}
