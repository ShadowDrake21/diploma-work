package com.backend.app.controller;



import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.backend.app.dto.LoginRequest;
import com.backend.app.dto.RegisterRequest;
import com.backend.app.dto.RequestPasswordResetRequest;
import com.backend.app.dto.ResetPasswordRequest;
import com.backend.app.dto.VerifyRequest;
import com.backend.app.enums.Role;
import com.backend.app.model.User;
import com.backend.app.service.PasswordResetService;
import com.backend.app.service.UserService;
import com.backend.app.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final PasswordResetService passwordResetService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

	
	public AuthController(JwtUtil jwtUtil, UserService userService, PasswordEncoder passwordEncoder, PasswordResetService passwordResetService) {
		this.jwtUtil = jwtUtil;
		this.userService = userService;
		this.passwordEncoder = passwordEncoder;
		this.passwordResetService = passwordResetService;
	}
	
	@PostMapping("/login")
	public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
		String email = request.getEmail();
		String password = request.getPassword();
		
		Map<String, String> response = new HashMap<>();
		    
		    if (request.getEmail() == null || request.getEmail().isEmpty()) {
		        response.put("error", "Email is required.");
		        return ResponseEntity.badRequest().body(response);
		    }
		    if (request.getPassword() == null || request.getPassword().isEmpty()) {
		        response.put("error", "Password is required.");
		        return ResponseEntity.badRequest().body(response);
		    }

		    try {
		    	Optional<User> optionalUser = userService.getUserByEmail(email);
		    	
		    	if(optionalUser.isEmpty()) {
		    		response.put("error", "Invalid email or password!");
			    	return ResponseEntity.badRequest().body(response);
		    	}
		    	
		    	User user = optionalUser.get();
		    	
		    	if(!passwordEncoder.matches(password, user.getPassword())) {
		    		response.put("error", "Invalid email or password!");
		    		return ResponseEntity.badRequest().body(response);
		    	}
		    	
		    	String token = jwtUtil.generateToken(email, user.getId());
		    	response.put("message", "Login successful!");
		    	response.put("authToken", token);
		    	return ResponseEntity.ok(response);
		    }
		    catch (Exception e) {
		    	logger.error("Login error: ", e);
		        response.put("error", "An error occurred while logging in.");
		        return ResponseEntity.internalServerError().body(response);
			}
	}
	
	@PostMapping("/register")
	public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request){
		String username = request.getUsername();
		String email = request.getEmail();
		String password = request.getPassword();
		Role role = request.getRole();
        logger.info("Received registration request with username: {} and email: {} and role: {}", username, email, role);

		if(userService.userExistsByEmail(email)) {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error", "Email is already in use!");
			
			return ResponseEntity.badRequest().body(errorResponse);
		}
		
		String encodedPassword = passwordEncoder.encode(password);
		
		userService.savePendingUser(username, email, encodedPassword, role);
		
		Map<String, String> response = new HashMap<>();
		response.put("message", "Verification code sent! Please check your email.");
		return ResponseEntity.ok(response);
	}
	
	@PostMapping("/verify")
	public ResponseEntity<Map<String, String>> verify(@RequestBody VerifyRequest request) {
		String email = request.getEmail();
		String code = request.getCode();
		
		boolean verified = userService.verifyUser(email, code);
		
		if(verified) {
			User user = userService.getUserByEmail(email).orElseThrow(() -> new RuntimeException("User not found after verification"));
			
			String token = jwtUtil.generateToken(email, user.getId());
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "User verified successfully!");
			response.put("authToken", token);
			return ResponseEntity.ok(response);
		} else {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error", "Invalid verification code.");
			return ResponseEntity.badRequest().body(errorResponse);
		}
	}
	
	@PostMapping("/request-password-reset")
	public ResponseEntity<Map<String, String>> requestPasswordReset(@RequestBody RequestPasswordResetRequest request) {
		String email = request.getEmail();
		
		Map<String, String> response = new HashMap<>();
		if(email == null || email.isEmpty()) {
			response.put("error", "Email is required.");
			return ResponseEntity.badRequest().body(response);
		}
		
	    boolean emailSent = passwordResetService.sendResetLink(email);
	    if (emailSent) {
	        response.put("message", "Password reset link has been sent to your email.");
	        return ResponseEntity.ok(response);
	    } else {
	        response.put("error", "Email not found.");
	        return ResponseEntity.badRequest().body(response);
	    }
	}
	
	@PostMapping("/reset-password")
	public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
		String token = request.getToken();
		String newPassword = request.getNewPassword();
		
		Map<String, String> response = new HashMap<>();
		if (token == null || newPassword == null || newPassword.isEmpty()) {
		    response.put("error", "Invalid request.");
		    return ResponseEntity.badRequest().body(response);
		}

		boolean passwordUpdated = passwordResetService.resetPassword(token, newPassword);
		if (passwordUpdated) {
		   response.put("message", "Password updated successfully!");
		   return ResponseEntity.ok(response);
		} else {
		   response.put("error", "Invalid or expired token.");
		   return ResponseEntity.badRequest().body(response);
		}
	}
}
