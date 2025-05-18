package com.backend.app.security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class TokenBlacklist {
	private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
	
	public void addToBlacklist(String token) {
		blacklistedTokens.add(token);
	}
	
	public boolean isBlacklisted(String token) {
		return blacklistedTokens.contains(token);
	}
	
	public void removeFromBlacklist(String token) {
		blacklistedTokens.remove(token);
	}
}
