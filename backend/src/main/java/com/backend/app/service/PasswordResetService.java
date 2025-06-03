package com.backend.app.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
	private static final int TOKEN_EXPIRATION_HOURS = 1;
	
	
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final PasswordEncoder passwordEncoder;
	
	@Transactional
	public boolean sendResetLink(String email) {
		return userRepository.findByEmail(email)
				.map(user -> {
					String resetToken = generateResetToken();
					updateUserWithResetToken(user, resetToken);
					emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
					return true;
				}).orElse(false);
	}
	
	public boolean isValidResetToken(String token) {
		return userRepository.findByResetToken(token).map(user -> user.getTokenExpiration().isAfter(LocalDateTime.now())).orElse(false);
	}
	
	@Transactional
	public boolean resetPassword(String token, String newPassword) {
		Optional<User> optionalUser = userRepository.findByResetToken(token);
		
		if(optionalUser.isEmpty()) {
			return false;
		}
		
		User user = optionalUser.get();
		if(isTokenExpired(user)) {
			return false;
		}
		
		updateUserPasswordAndClearToken(user, newPassword);
		return true;
	}
	
	private String generateResetToken() {
		return UUID.randomUUID().toString();
	}
	
	private void updateUserWithResetToken(User user, String resetToken) {
		user.setResetToken(resetToken);
		user.setTokenExpiration(LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS));
		userRepository.save(user);
	}
	
	private boolean isTokenExpired(User user) {
		return user.getTokenExpiration().isBefore(LocalDateTime.now());
	}
	
	private void updateUserPasswordAndClearToken(User user, String newPassword) {
		user.setPassword(passwordEncoder.encode(newPassword));
		user.setResetToken(null);
		user.setTokenExpiration(null);
		userRepository.save(user);
	}
}

