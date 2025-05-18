package com.backend.app.security;

import java.io.IOException;
import java.security.Key;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private static final String AUTH_HEADER_PREFIX = "Bearer ";
    private static final String USER_ID_CLAIM = "userId";
    
    private final TokenBlacklist tokenBlacklist;

	@Value("${jwt.secret}")
	private String jwtSecretKey;
    
	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, 
			@NonNull HttpServletResponse response, 
			@NonNull FilterChain filterChain)
			throws ServletException, IOException {
		try {
			String jwt = extractJwtFromRequest(request);
			
			if(jwt != null) {
				if(tokenBlacklist.isBlacklisted(jwt)) {
					sendUnauthorizedError(response, "Token has been revoked");
					return;
				}
				
				Claims claims = validateAndParseJwt(jwt);
				 if (isRememberMeToken(claims)) {
	                    log.debug("Processing Remember Me token for user: {}", claims.getSubject());
	                }
				 
				authenticateRequest(claims);
			}
			
			filterChain.doFilter(request, response);
		} catch (SecurityException e) {
			log.warn("Invalid JWT signature: {}", e.getMessage());
			sendUnauthorizedError(response, "Invalid token signature");
		} catch (Exception e) {
            log.warn("JWT authentication failed: {}", e.getMessage());
            sendUnauthorizedError(response, "Invalid or expired token");
        }
		
	}
	
	 private String extractJwtFromRequest(HttpServletRequest request) {
	        String authHeader = request.getHeader("Authorization");
	        if (authHeader != null && authHeader.startsWith(AUTH_HEADER_PREFIX)) {
	            return authHeader.substring(AUTH_HEADER_PREFIX.length());
	        }
	        return null;
	    }

	    private Claims validateAndParseJwt(String jwt) {
	        JwtParser jwtParser = Jwts.parserBuilder()
	                .setSigningKey(getSigningKey())
	                .build();
	        return jwtParser.parseClaimsJws(jwt).getBody();
	    }

	    private void authenticateRequest(Claims claims) {
	        String username = claims.getSubject();
	        Long userId = claims.get(USER_ID_CLAIM, Long.class);

	        if (username != null) {
	            UsernamePasswordAuthenticationToken authentication = 
	                new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
	            
	            authentication.setDetails(createAuthenticationDetails(userId));
	            SecurityContextHolder.getContext().setAuthentication(authentication);
	        }
	    }

	    private Map<String, Object> createAuthenticationDetails(Long userId) {
	        Map<String, Object> details = new HashMap<>();
	        details.put(USER_ID_CLAIM, userId);
	        return details;
	    }

	    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
	        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, message);
	    }

	    private Key getSigningKey() {
	        byte[] decodedKey = Base64.getDecoder().decode(jwtSecretKey);
	        return Keys.hmacShaKeyFor(decodedKey);
	    } 
	    
	    private boolean isRememberMeToken(Claims claims) {
	    	Date expiration = claims.getExpiration();
	    	Date now = new Date();
	    	long tokenLifetime = expiration.getTime() - now.getTime();
	    	
	    	return tokenLifetime > (7 * 24 * 60 * 60 * 1000);
	    }

}
