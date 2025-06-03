package com.backend.app.service;

import org.springframework.stereotype.Service;

import com.backend.app.repository.ActiveTokenRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
	private final ActiveTokenRepository activeTokenRepository;
	
	@Transactional
	public void revokeToken(String token) {
		activeTokenRepository.deleteByToken(token);
	}
}
