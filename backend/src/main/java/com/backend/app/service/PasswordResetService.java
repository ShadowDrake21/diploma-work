package com.backend.app.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;

@Service
public class PasswordResetService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final PasswordEncoder passwordEncoder;
	
	public PasswordResetService(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.passwordEncoder = passwordEncoder;
	}
	
	public boolean sendResetLink(String email) {
		Optional<User> optionalUser = userRepository.findByEmail(email);
		if(optionalUser.isPresent()) {
			User user = optionalUser.get();
			String resetToken = UUID.randomUUID().toString();
			user.setResetToken(resetToken);
			user.setTokenExpiration(LocalDateTime.now().plusHours(1));
			userRepository.save(user);
			emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
			return true;
		}
		
		return false;
	}
	
	public boolean isValidResetToken(String token) {
		Optional<User> optionalUser = userRepository.findByResetToken(token);
		return optionalUser.isPresent() && optionalUser.get().getTokenExpiration().isAfter(LocalDateTime.now());
	}
	
	public boolean resetPassword(String token, String newPassword) {
		Optional<User> optionalUser = userRepository.findByResetToken(token);
		if(optionalUser.isPresent()) {
			User user = optionalUser.get();
			if(user.getTokenExpiration().isBefore(LocalDateTime.now())) {
				return false;
			}
			user.setPassword(passwordEncoder.encode(newPassword));
			user.setResetToken(null);
			user.setTokenExpiration(null);
			userRepository.save(user);
			return true;
		}
		return false;
	}
}

