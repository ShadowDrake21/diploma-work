package com.backend.app.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.security.Key;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.backend.app.exception.JwtConfigurationException;
import com.backend.app.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@ExtendWith(MockitoExtension.class)
public class JwtUtilTest {
@Mock private UserRepository userRepository;
    
    private JwtUtil jwtUtil;
    private final String secretKey = "testSecretKey123456789012345678901234567890";
    private Key signingKey;
    
    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(userRepository);
        ReflectionTestUtils.setField(jwtUtil, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtUtil, "expirationTime", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtUtil, "rememberMeExpirationTime", 2592000000L); // 30 days
        
        signingKey = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        String token = jwtUtil.generateToken("test@example.com", 1L);
        assertNotNull(token);
        
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        assertEquals("test@example.com", claims.getSubject());
        assertEquals(1L, claims.get("userId", Long.class));
    }
    
    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() {
        String token = Jwts.builder()
                .setSubject("test@example.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
        
        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    void validateToken_WithExpiredToken_ShouldReturnFalse() {
        String token = Jwts.builder()
                .setSubject("test@example.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 7200000))
                .setExpiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
        
        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    void extractUsername_ShouldReturnSubject() {
        String token = Jwts.builder()
                .setSubject("test@example.com")
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
        
        assertEquals("test@example.com", jwtUtil.extractUsername(token));
    }

    @Test
    void getSigningKey_WithInvalidBase64_ShouldThrowException() {
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "invalid-base64");
        assertThrows(JwtConfigurationException.class, () -> jwtUtil.getSigningKey());
    }
}
