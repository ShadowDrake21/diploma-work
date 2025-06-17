package com.backend.app.filter;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import com.backend.app.security.TokenBlacklist;
import com.backend.app.util.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {
	@Mock
	private TokenBlacklist tokenBlacklist;
	@Mock
	private JwtUtil jwtUtil;
	@Mock
	private HttpServletRequest request;
	@Mock
	private HttpServletResponse response;
	@Mock
	private FilterChain filterChain;

	@InjectMocks
	private JwtAuthenticationFilter filter;

	private final String validToken = "valid.token.here";
	private final String invalidToken = "invalid.token.here";
	private final String secretKey = "testSecretKey123456789012345678901234567890";
	
	@BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(tokenBlacklist, jwtUtil);
        when(jwtUtil.getSigningKey()).thenReturn(Keys.hmacShaKeyFor(secretKey.getBytes()));
    }

    @Test
    void doFilterInternal_WithValidToken_ShouldAuthenticate() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(tokenBlacklist.isBlacklisted(validToken)).thenReturn(false);
        
        Claims claims = Jwts.claims().setSubject("test@example.com");
        claims.put("userId", 1L);
        
        @SuppressWarnings("unchecked")
		Jws<Claims> jws = mock(Jws.class);
        when(jws.getBody()).thenReturn(claims);
        
        when(jwtUtil.parseToken(validToken)).thenReturn(jws);
        
        filter.doFilterInternal(request, response, filterChain);
        
        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_WithBlacklistedToken_ShouldReturnUnauthorized() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
        when(tokenBlacklist.isBlacklisted(validToken)).thenReturn(true);
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);
        
        filter.doFilterInternal(request, response, filterChain);
        
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(stringWriter.toString().contains("Token has been revoked"));
    }

    @Test
    void doFilterInternal_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer " + invalidToken);
        when(tokenBlacklist.isBlacklisted(invalidToken)).thenReturn(false);
        when(jwtUtil.parseToken(invalidToken))
            .thenThrow(new SecurityException("Invalid token"));
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);
        
        filter.doFilterInternal(request, response, filterChain);
        
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(stringWriter.toString().contains("Invalid token signature"));
    }

    @Test
    void doFilterInternal_WithoutToken_ShouldContinueChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        
        filter.doFilterInternal(request, response, filterChain);
        
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
