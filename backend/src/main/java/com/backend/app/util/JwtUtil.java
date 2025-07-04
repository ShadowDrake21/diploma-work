package com.backend.app.util;


import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.mapstruct.ap.shaded.freemarker.core.ReturnInstruction.Return;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.backend.app.exception.JwtConfigurationException;
import com.backend.app.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {
	private final UserRepository userRepository;
    private static final String AUTH_HEADER_PREFIX = "Bearer ";
	private static final String USER_ID_CLAIM = "userId";
	private static final String SUBJECT_CLAIM = "sub";
		
	@Value("${jwt.secret}")
	private String secretKey;
	
	@Value("${jwt.expiration}")
	private long expirationTime;
	
	@Value("${jwt.remember-me-expiration}")
	private long rememberMeExpirationTime;
	
	public String extractJwtFromRequest(HttpServletRequest request) {
		String authHeader = request.getHeader("Authorization");
		if(authHeader != null && authHeader.startsWith(AUTH_HEADER_PREFIX)) {
			return authHeader.substring(AUTH_HEADER_PREFIX.length());
		}
		return null;
	}
	

	public Long getExpirationTime() {
		return expirationTime;
	}
	
	public Long getRememberMeExpirationTime() {
		return rememberMeExpirationTime;
	}
	
	public Key getSigningKey() {
		try {
			byte[] decodedKey = Base64.getDecoder().decode(secretKey); 
			 return Keys.hmacShaKeyFor(decodedKey); 
		}catch (IllegalArgumentException e) {
            log.error("Invalid base64 secret key", e);
            throw new JwtConfigurationException("Invalid base64 secret key", e);
        }
		 
	}
	
	public String generateToken(String email, Long userId) {
		return generateToken(email, userId, false);
	}
	
	public String generateToken(String email, Long userId, boolean rememberMe) {
		 Map<String, Object> claims = new HashMap<>();
	        claims.put(SUBJECT_CLAIM, email);
	        claims.put(USER_ID_CLAIM, userId);  
	        claims.put("role", userRepository.findById(userId).get().getRole().name());
	        
	        Date now = new Date();
	        Date expiration = new Date(now.getTime() + (rememberMe ? rememberMeExpirationTime : expirationTime));
	        
	        return Jwts.builder()
	                .setClaims(claims)
	                .setIssuedAt(now)
	                .setExpiration(expiration)
	                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
	                .compact();
	}
	
	public boolean validateToken(String token) {
		try {
            parseToken(token);
            return true;
        } catch (SecurityException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
	}
	
	public String extractUsername(String token) {
		return parseToken(token).getBody().getSubject();
	}
	
	public Long extractUserId(String token) {
		return parseToken(token).getBody().get(USER_ID_CLAIM, Long.class);
	}
	
	public Jws<Claims> parseToken(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);

	}
	public boolean isRememberMeToken(Claims claims) {
	    Date expiration = claims.getExpiration();
	    Date now = new Date();
	    long tokenLifetime = expiration.getTime() - now.getTime();
	    
	    return tokenLifetime > (7 * 24 * 60 * 60 * 1000); 
	}
}
