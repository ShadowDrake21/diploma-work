package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.model.UserLoginDTO;
import com.backend.app.model.UserLogin;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class UserLoginMapper {
	public UserLoginDTO convertToDTO(UserLogin login) {
	    return UserLoginDTO.builder()
	            .userId(login.getUser().getId())
	            .username(login.getUser().getUsername())
	            .email(login.getUser().getEmail())
	            .loginTime(login.getLoginTime())
	            .ipAddress(login.getIpAddress())
	            .userAgent(login.getUserAgent())
	            .build();
	}
}
