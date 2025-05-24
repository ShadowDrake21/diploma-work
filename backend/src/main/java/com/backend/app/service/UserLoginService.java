package com.backend.app.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.dto.model.UserLoginDTO;
import com.backend.app.mapper.UserLoginMapper;
import com.backend.app.model.User;
import com.backend.app.model.UserLogin;
import com.backend.app.repository.UserLoginRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserLoginService {
	private final UserLoginRepository userLoginRepository;
	private final UserLoginMapper userLoginMapper;
	
	@Transactional
	public void recordUserLogin(User user, HttpServletRequest request) {
		UserLogin login = UserLogin.builder().user(user).loginTime(Instant.now())
                .ipAddress(request.getRemoteAddr())
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .build();
		userLoginRepository.save(login);
	}
	
	public long getRecentLoginCount(int hours) { 
		Instant cutoff = Instant.now().minusSeconds(hours * 3600);
		return userLoginRepository.countByLoginTimeAfter(cutoff);
		}
	
	public List<UserLoginDTO> getRecentLogins(int count) {
		return userLoginRepository.findTop10ByOrderByLoginTimeDesc().stream().limit(count).map(
			userLoginMapper::convertToDTO).collect(Collectors.toList());
}
}
