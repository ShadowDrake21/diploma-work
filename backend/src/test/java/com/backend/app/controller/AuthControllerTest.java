package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.request.LoginRequest;
import com.backend.app.dto.request.RegisterRequest;
import com.backend.app.dto.request.RequestPasswordResetRequest;
import com.backend.app.dto.request.VerifyRequest;
import com.backend.app.enums.Role;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.security.TokenBlacklist;
import com.backend.app.service.AuthService;
import com.backend.app.service.PasswordResetService;
import com.backend.app.service.RateLimitingService;
import com.backend.app.service.UserLoginService;
import com.backend.app.service.UserService;
import com.backend.app.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;

public class AuthControllerTest {
    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private JwtUtil jwtUtil;
    @Mock private UserService userService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private PasswordResetService passwordResetService;
    @Mock private TokenBlacklist tokenBlacklist;
    @Mock private ActiveTokenRepository activeTokenRepository;
    @Mock private AuthService authService;
    @Mock private UserLoginService userLoginService;
    @Mock private RateLimitingService rateLimitingService;
    
    @InjectMocks private AuthController controller;
    
 private User testUser;
    
    @BeforeEach
    void setUp() {
    	 MockitoAnnotations.openMocks(this);
    	 
        mockMvc = MockMvcBuilders.standaloneSetup(controller).setMessageConverters(new MappingJackson2HttpMessageConverter()).build();
        
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .verified(true)
                .build();
    }
    
    @Test
    void login_shouldReturnTokenOnSuccess() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password", false);
        
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyBoolean())).thenReturn("testToken");
        
        mockMvc.perform(post("/api/auth/login")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.message").exists())
               .andExpect(jsonPath("$.data.authToken").value("testToken"));
    }
    
    @Test
    void login_shouldHandleInvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword", false);
        
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);
        
        mockMvc.perform(post("/api/auth/login")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isUnauthorized());
    }
    
    @Test
    void register_shouldCreatePendingUser() throws Exception {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "ValidPass123");
        
        when(userService.userExistsByEmail("new@example.com")).thenReturn(false);
        
        mockMvc.perform(post("/api/auth/register")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk());
        
        verify(userService).savePendingUser(anyString(), anyString(), anyString(), any());
    }
    
    @Test
    void verify_shouldActivateUser() throws Exception {
        VerifyRequest request = new VerifyRequest("test@example.com", "123456");
        
        when(userService.verifyUser("test@example.com", "123456")).thenReturn(true);
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(anyString(), anyLong())).thenReturn("testToken");
        
        mockMvc.perform(post("/api/auth/verify")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.message").exists())
               .andExpect(jsonPath("$.data.message").value("User verified successfully"));
    }
    
    @Test
    void requestPasswordReset_shouldSendResetLink() throws Exception {
        RequestPasswordResetRequest request = new RequestPasswordResetRequest("test@example.com");
        
        when(passwordResetService.sendResetLink("test@example.com")).thenReturn(true);
        
        mockMvc.perform(post("/api/auth/request-password-reset")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk());
    }
    
    @Test
    void refreshToken_shouldReturnNewToken() throws Exception {
        Claims claims = Jwts.claims().setSubject("test@example.com");
        claims.put("userId", 1L);
        
        @SuppressWarnings("unchecked")
		Jws<Claims> jws = mock(Jws.class);
        when(jws.getBody()).thenReturn(claims);
        
        when(jwtUtil.extractJwtFromRequest(any())).thenReturn("oldToken");
        when(jwtUtil.parseToken("oldToken")).thenReturn(jws);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyBoolean())).thenReturn("newToken");
        
        mockMvc.perform(post("/api/auth/refresh-token")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(Map.of("rememberMe", false))))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.message").exists())
               .andExpect(jsonPath("$.data.authToken").value("newToken"));
    }
    
    @Test
    void logout_shouldBlacklistToken() throws Exception {
        when(jwtUtil.extractJwtFromRequest(any())).thenReturn("testToken");
        
        mockMvc.perform(post("/api/auth/logout"))
               .andExpect(status().isOk());
        
        verify(tokenBlacklist).addToBlacklist("testToken");
    }
}
