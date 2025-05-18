package com.backend.app.controller;

import java.time.Instant;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.ApiResponse;
import com.backend.app.dto.AuthResponse;
import com.backend.app.dto.LoginRequest;
import com.backend.app.dto.RegisterRequest;
import com.backend.app.dto.RequestPasswordResetRequest;
import com.backend.app.dto.ResetPasswordRequest;
import com.backend.app.dto.VerifyRequest;
import com.backend.app.enums.Role;
import com.backend.app.model.ActiveToken;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.security.TokenBlacklist;
import com.backend.app.service.PasswordResetService;
import com.backend.app.service.UserService;
import com.backend.app.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final PasswordResetService passwordResetService;
	private final TokenBlacklist tokenBlacklist;
	private final ActiveTokenRepository activeTokenRepository;

	@PostMapping("/login")
	public ResponseEntity<com.backend.app.dto.ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
		if (request.getEmail() == null || request.getEmail().isEmpty()) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Email is required."));
		}
		if (request.getPassword() == null || request.getPassword().isEmpty()) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Password is required."));
		}

		try {
			Optional<User> optionalUser = userService.getUserByEmail(request.getEmail());

			if (optionalUser.isEmpty()
					|| !passwordEncoder.matches(request.getPassword(), optionalUser.get().getPassword())) {
				return ResponseEntity.badRequest().body(ApiResponse.error("Invalid email or password!"));
			}

			User user = optionalUser.get();
			String token = jwtUtil.generateToken(user.getEmail(), user.getId());
			
			ActiveToken activeToken = ActiveToken.builder().token(token).userId(user.getId())
					.expiry(Instant.now().plusMillis(jwtUtil.getExpirationTime())).build();
			activeTokenRepository.save(activeToken);
			
			AuthResponse authResponse = new AuthResponse("Login successful!", token);
			return ResponseEntity.ok(ApiResponse.success(authResponse));
		} catch (Exception e) {
			log.error("Login error: ", e);
			return ResponseEntity.internalServerError().body(ApiResponse.error("An error occurred while logging in."));
		}
	}

	@PostMapping("/register")
	public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request) {
		log.info("Received registration request with username: {} and email: {}", request.getUsername(),
				request.getEmail());

		if (userService.userExistsByEmail(request.getEmail())) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Email is already in use!"));
		}

		String encodedPassword = passwordEncoder.encode(request.getPassword());
		userService.savePendingUser(request.getUsername(), request.getEmail(), encodedPassword, Role.USER);

		return ResponseEntity.ok(ApiResponse.success("Verification code sent! Please check your email."));
	}

	@PostMapping("/verify")
	public ResponseEntity<ApiResponse<AuthResponse>> verify(@RequestBody VerifyRequest request) {
		if (!userService.verifyUser(request.getEmail(), request.getCode())) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Invalid verification code."));
		}

		User user = userService.getUserByEmail(request.getEmail())
				.orElseThrow(() -> new RuntimeException("User not found after verification"));

		String token = jwtUtil.generateToken(user.getEmail(), user.getId());
		AuthResponse authResponse = new AuthResponse("User verified successfully!", token);

		return ResponseEntity.ok(ApiResponse.success(authResponse));
	}

	@PostMapping("/request-password-reset")
	public ResponseEntity<ApiResponse<String>> requestPasswordReset(@RequestBody RequestPasswordResetRequest request) {
		if (request.getEmail() == null || request.getEmail().isEmpty()) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Email is required."));
		}

		if (!passwordResetService.sendResetLink(request.getEmail())) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Email not found."));
		}

		return ResponseEntity.ok(ApiResponse.success("Password reset link has been sent to your email."));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody ResetPasswordRequest request) {
		if (request.getToken() == null || request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request."));
		}

		if (!passwordResetService.resetPassword(request.getToken(), request.getNewPassword())) {
			return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired token."));
		}

		return ResponseEntity.ok(ApiResponse.success("Password updated successfully!"));
	}
	
	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
		try {
			String token = jwtUtil.extractJwtFromRequest(request);
			
			if(token != null) {
				tokenBlacklist.addToBlacklist(token);
				activeTokenRepository.deleteByToken(token);
			}
			return ResponseEntity.ok(ApiResponse.success("Logged out successfully!"));
		} catch (Exception e) {
			 log.error("Logout error: ", e);
	            return ResponseEntity.internalServerError().body(ApiResponse.error("An error occurred while logging out."));
		}
	}
}
