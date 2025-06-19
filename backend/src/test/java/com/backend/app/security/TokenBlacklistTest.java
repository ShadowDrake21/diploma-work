package com.backend.app.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

public class TokenBlacklistTest {
	@Test
	void testTokenBlacklistOperations() {
		 TokenBlacklist blacklist = new TokenBlacklist();
	        String token = "test.token.123";
	        
	        assertFalse(blacklist.isBlacklisted(token));
	        
	        blacklist.addToBlacklist(token);
	        assertTrue(blacklist.isBlacklisted(token));
	        
	        blacklist.removeFromBlacklist(token);
	        assertFalse(blacklist.isBlacklisted(token));
	}
}
