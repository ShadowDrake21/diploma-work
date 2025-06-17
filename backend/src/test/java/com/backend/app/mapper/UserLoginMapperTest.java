package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.backend.app.dto.model.UserLoginDTO;
import com.backend.app.model.User;
import com.backend.app.model.UserLogin;

public class UserLoginMapperTest {
	private UserLoginMapper mapper = new UserLoginMapper();
	
	 @Test
	    void convertToDTO_ShouldMapAllFieldsCorrectly() {
	        User user = new User();
	        user.setId(1L);
	        user.setUsername("testuser");
	        user.setEmail("test@example.com");

	        UserLogin login = new UserLogin();
	        login.setUser(user);
	        login.setLoginTime(Instant.now());
	        login.setIpAddress("192.168.1.1");
	        login.setUserAgent("Test Browser");

	        UserLoginDTO dto = mapper.convertToDTO(login);

	        assertEquals(user.getId(), dto.getUserId());
	        assertEquals(user.getUsername(), dto.getUsername());
	        assertEquals(user.getEmail(), dto.getEmail());
	        assertEquals(login.getLoginTime(), dto.getLoginTime());
	        assertEquals(login.getIpAddress(), dto.getIpAddress());
	        assertEquals(login.getUserAgent(), dto.getUserAgent());
	    }
}
