package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.backend.app.dto.model.UserDTO;
import com.backend.app.enums.Role;
import com.backend.app.exception.ResourceAlreadyExistsException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
	@Mock
	private UserRepository userRepository;

	@Mock
	private EmailService emailService;

	@Mock
	private S3Service s3Service;

	@Mock
	private UserMapper userMapper;

	@Mock
	private PasswordEncoder passwordEncoder;

	@InjectMocks
	private UserService userService;

	private User user;
	private UserDTO userDTO;

	@BeforeEach
	void setUp() {
		user = User.builder().id(1L).username("testuser").email("test@example.com").password("encodedPassword")
				.role(Role.USER).build();

		userDTO = UserDTO.builder().id(1L).username("testuser").email("test@example.com").role(Role.USER).build();
	}

	@Test
	void testGetCurrentUser() {
		when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
		when(userMapper.mapToDTO(user)).thenReturn(userDTO);

		UserDTO result = userService.getCurrentUser("test@example.com");

		assertNotNull(result);
		assertEquals(1L, result.getId());

		assertEquals("testuser", result.getUsername());
		verify(userRepository).findByEmail("test@example.com");
		verify(userMapper).mapToDTO(user);
	}

	@Test
	void testGetCurrentUserNotFound() {
		when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());
		assertThrows(ResourceNotFoundException.class, () -> {
			userService.getCurrentUser("nonexistent@example.com");
		});
	}

	@Test
	void testGetUserById() {
		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(userMapper.mapToDTO(user)).thenReturn(userDTO);

		UserDTO result = userService.getUserById(1L);

		assertNotNull(result);
		assertEquals(1L, result.getId());
		verify(userRepository).findById(1L);
	}

	@Test
	void testSavePendingUser() {
		when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
		when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
		when(emailService.generateVerificationCode()).thenReturn("123456");

		userService.savePendingUser("testuser", "test@example.com", "password", Role.USER);

		verify(userRepository).existsByEmail("test@example.com");
		verify(passwordEncoder).encode("password");
		verify(emailService).generateVerificationCode();
		verify(emailService).sendVerificationCode("test@example.com", "123456");
		verify(userRepository).save(any(User.class));
	}

	@Test
	void testSavePendingUserEmailExists() {
		when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

		assertThrows(ResourceAlreadyExistsException.class, () -> {
			userService.savePendingUser("testuser", "test@example.com", "password", Role.USER);
		});

		verify(userRepository).existsByEmail("test@example.com");
		verifyNoMoreInteractions(userRepository, passwordEncoder, emailService);
	}

	@Test
	void testVerifyUserSuccess() {
		User unverifiedUser = User.builder().email("test@example.com").verificationCode("123456").verified(false)
				.build();

		when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(unverifiedUser));

		boolean result = userService.verifyUser("test@example.com", "123456");

		assertTrue(result);
		assertTrue(unverifiedUser.isVerified());
		assertNull(unverifiedUser.getVerificationCode());
		verify(userRepository).save(unverifiedUser);
	}

	@Test
	void testVerifyUserFailure() {
		User unverifiedUser = User.builder().email("test@example.com").verificationCode("123456").verified(false)
				.build();

		when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(unverifiedUser));

		boolean result = userService.verifyUser("test@example.com", "wrongCode");

		assertFalse(result);
		assertFalse(unverifiedUser.isVerified());
		assertEquals("123456", unverifiedUser.getVerificationCode());
		verify(userRepository, never()).save(unverifiedUser);
	}

	@Test
	void testGetAllUsers() {
		Pageable pageable = PageRequest.of(0, 10);
		Page<User> userPage = new PageImpl<>(List.of(user), pageable, 1);

		when(userRepository.findAll(pageable)).thenReturn(userPage);
		when(userMapper.mapToDTO(user)).thenReturn(userDTO);

		Page<UserDTO> result = userService.getAllUsers(pageable);

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		verify(userRepository).findAll(pageable);
	}
	
	@Test
	void testSearchUsers() {
		Pageable pageable = PageRequest.of(0, 10);
		Page<User> userPage = new PageImpl<>(List.of(user), pageable, 1);

		when(userRepository.searchUsers("test", pageable)).thenReturn(userPage);
		when(userMapper.mapToDTO(user)).thenReturn(userDTO);

		Page<UserDTO> result = userService.searchUsers("test", pageable);

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
        verify(userRepository).searchUsers("test", pageable);
	}
	
	 @Test
	    void testUserExistsByEmail() {
	        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
	        
	        boolean exists = userService.userExistsByEmail("test@example.com");
	        
	        assertTrue(exists);
	        verify(userRepository).existsByEmail("test@example.com");
	 }
	 
	 @Test
	    void testGetUsersByRole() {
	        when(userRepository.findByRole(Role.USER)).thenReturn(List.of(user));
	        when(userMapper.mapToDTO(user)).thenReturn(userDTO);
	        
	        List<UserDTO> result = userService.getUsersByRole(Role.USER);
	        
	        assertNotNull(result);
	        assertEquals(1, result.size());
	        verify(userRepository).findByRole(Role.USER);
	    }
	 
	 @Test
	    void testSaveUser() {
	        when(userMapper.mapToEntity(userDTO)).thenReturn(user);
	        when(userRepository.save(user)).thenReturn(user);
	        when(userMapper.mapToDTO(user)).thenReturn(userDTO);
	        
	        UserDTO result = userService.saveUser(user);
	        
	        assertNotNull(result);
	        assertEquals(1L, result.getId());
	        verify(userRepository).save(user);
	    }
	 
	 @Test
	    void testDeleteUser() {
	        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
	        
	        userService.deleteUser(1L);
	        
	        verify(userRepository).delete(user);
	    }
	 
	  @Test
	    void testDeleteUserNotFound() {
	        when(userRepository.findById(1L)).thenReturn(Optional.empty());
	        
	        assertThrows(ResourceNotFoundException.class, () -> {
	            userService.deleteUser(1L);
	        });
	        
	        verify(userRepository, never()).delete(any());
	    }
	  
	  @Test
	    void testFindExpiredResetTokens() {
	        User userWithExpiredToken = User.builder()
	                .resetToken("token")
	                .tokenExpiration(LocalDateTime.now().minusHours(1))
	                .build();
	                
	        when(userRepository.findExpiredResetTokens()).thenReturn(List.of(userWithExpiredToken));
	        
	        List<User> result = userService.findExpiredResetTokens();
	        
	        assertNotNull(result);
	        assertEquals(1, result.size());
	        verify(userRepository).findExpiredResetTokens();
	    }
	    
	    @Test
	    void testClearExpiredResetTokens() {
	        User userWithExpiredToken = User.builder()
	                .resetToken("token")
	                .tokenExpiration(LocalDateTime.now().minusHours(1))
	                .build();
	                
	        when(userRepository.findExpiredResetTokens()).thenReturn(List.of(userWithExpiredToken));
	        
	        userService.clearExpiredResetTokens();
	        
	        assertNull(userWithExpiredToken.getResetToken());
	        assertNull(userWithExpiredToken.getTokenExpiration());
	        verify(userRepository).saveAll(List.of(userWithExpiredToken));
	    }
}
