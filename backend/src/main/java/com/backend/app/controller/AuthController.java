package com.backend.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
	public ResponseEntity<String> register(@RequestParam String email, @RequestParam String password, @RequestParam Role role){
		if(userService.userExistsByEmail(email)) {
			return ResponseEntity.badRequest().body("Email is already in use!");
		}
		
		User newUser = new User();
		newUser.setEmail(email);
		newUser.setPassword(passwordEncoder.encode(password));
		newUser.setRole(role);
		
		userService.saveUser(newUser);
		
		return ResponseEntity.ok("User registered successfully!");
	}
}
