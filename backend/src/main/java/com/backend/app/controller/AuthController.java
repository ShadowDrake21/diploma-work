package com.backend.app.controller;



import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.backend.app.dto.RegisterRequest;
import com.backend.app.model.Role;
import com.backend.app.model.User;
import com.backend.app.service.UserService;
import com.backend.app.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

	
	public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserService userService, PasswordEncoder passwordEncoder) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		this.userService = userService;
		this.passwordEncoder = passwordEncoder;
	}
	
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
		String token = jwtUtil.generateToken(email);
		return ResponseEntity.ok(token);
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
//		
//		User newUser = new User();
//		newUser.setEmail(email);
//		newUser.setPassword(passwordEncoder.encode(password));
//		newUser.setRole(role);
//		
//		userService.saveUser(newUser);
		
		String encodedPassword = passwordEncoder.encode(password);
		
		userService.savePendingUser(username, email, encodedPassword, role);
		
		Map<String, String> response = new HashMap<>();
		response.put("message", "Verification code sent! Please check your email.");
		return ResponseEntity.ok(response);
	}
	
	@PostMapping("/verify")
	public ResponseEntity<String> verify(@RequestParam String email, @RequestParam String code) {
		boolean verified = userService.verifyUser(email, code);
		return verified ? ResponseEntity.ok("User verified successfully!") : ResponseEntity.badRequest().body("Invalid verification code.");
	}
}
