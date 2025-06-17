package com.backend.app.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.backend.app.security.TokenBlacklist;
import com.backend.app.util.JwtUtil;

public class SecurityConfigTest {
	@Test
	void securityFilterChain_ShouldConfigureSecurityProperly() throws Exception {
		TokenBlacklist tokenBlacklist = mock(TokenBlacklist.class);
		JwtUtil jwtUtil = mock(JwtUtil.class);
		SecurityConfig securityConfig = new SecurityConfig(tokenBlacklist, jwtUtil);

		HttpSecurity http = mock(HttpSecurity.class);

		when(http.csrf(any())).thenReturn(http);
		when(http.authorizeHttpRequests(any())).thenReturn(http);
		when(http.cors(any())).thenReturn(http);
		when(http.addFilterBefore(any(), eq(UsernamePasswordAuthenticationFilter.class))).thenReturn(http);

		SecurityFilterChain filterChain = securityConfig.securityFilterChain(http);

		verify(http).csrf(csrf -> csrf.disable());
		verify(http).authorizeHttpRequests(auth -> {
			auth.requestMatchers("/api/auth/**").permitAll();
			auth.requestMatchers("/api/comments/**", "/api/dashboard/**").authenticated();
			auth.anyRequest().authenticated();
		});
		verify(http).addFilterBefore(any(), eq(UsernamePasswordAuthenticationFilter.class));
		verify(http).cors(any());
	}

	@Test
	void passwordEncoder_ShouldReturnBCryptEncoder() {
		SecurityConfig securityConfig = new SecurityConfig(mock(TokenBlacklist.class), mock(JwtUtil.class));

		var encoder = securityConfig.passwordEncoder();

		assertNotNull(encoder);
		assertTrue(encoder instanceof BCryptPasswordEncoder);
	}
}
