package com.backend.app.util;


import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
	@Value("${jwt.secret}")
	private String secretKey;
	
	@Value("${jwt.expiration}")
	private long expirationTime;
	
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

	
	private Key getSigningKey() {
		 byte[] decodedKey = Base64.getDecoder().decode(secretKey); 
		 return Keys.hmacShaKeyFor(decodedKey); 
	}
	
	public String generateToken(String email, Long userId) {
		 Map<String, Object> claims = new HashMap<>();
	        claims.put("sub", email);
	        claims.put("userId", userId);  
	        
	        return Jwts.builder()
	                .setClaims(claims)
	                .setIssuedAt(new Date(System.currentTimeMillis()))
	                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
	                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
	                .compact();
	}
	
	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
			return true;
			} catch (JwtException | IllegalArgumentException e) {
			logger.error("Invalid JWT token: {}", e.getMessage());
			return false;
		}
	}
	
	public String extractUsername(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody().getSubject();
	}
}
