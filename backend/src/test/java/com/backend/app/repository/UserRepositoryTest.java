package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.backend.app.enums.Role;
import com.backend.app.model.User;

public class UserRepositoryTest {
	 @Autowired
	    private TestEntityManager entityManager;

	    @Autowired
	    private UserRepository userRepository;

	    private User createTestUser(String email, String username, Role role, boolean active) {
	        User user = User.builder()
	                .email(email)
	                .username(username)
	                .password("password")
	                .role(role)
	                .active(active)
	                .build();
	        return entityManager.persist(user);
	    }
	    
	    @Test
	    void testSaveUser() {
	        User user = User.builder()
	                .email("test@example.com")
	                .username("testuser")
	                .password("password")
	                .role(Role.USER)
	                .build();
	        
	        User savedUser = userRepository.save(user);
	        
	        assertNotNull(savedUser.getId());
	        assertEquals("test@example.com", savedUser.getEmail());
	        assertEquals("testuser", savedUser.getUsername());
	    }

	    @Test
	    void testFindById() {
	        User user = createTestUser("test@example.com", "testuser", Role.USER, true);
	        
	        Optional<User> foundUser = userRepository.findById(user.getId());
	        
	        assertTrue(foundUser.isPresent());
	        assertEquals(user.getEmail(), foundUser.get().getEmail());
	    }

	    @Test
	    void testDeleteUser() {
	        User user = createTestUser("test@example.com", "testuser", Role.USER, true);
	        
	        userRepository.delete(user);
	        
	        Optional<User> deletedUser = userRepository.findById(user.getId());
	        assertFalse(deletedUser.isPresent());
	    }
	    
	    @Test
	    void testFindByEmail() {
	        createTestUser("test@example.com", "testuser", Role.USER, true);
	        
	        Optional<User> user = userRepository.findByEmail("test@example.com");
	        
	        assertTrue(user.isPresent());
	        assertEquals("testuser", user.get().getUsername());
	    }

	    @Test
	    void testFindByRole() {
	        createTestUser("user1@example.com", "user1", Role.USER, true);
	        createTestUser("admin@example.com", "admin", Role.ADMIN, true);
	        
	        List<User> users = userRepository.findByRole(Role.USER);
	        
	        assertEquals(1, users.size());
	        assertEquals("user1", users.get(0).getUsername());
	    }

	    @Test
	    void testExistsByEmail() {
	        createTestUser("test@example.com", "testuser", Role.USER, true);
	        
	        boolean exists = userRepository.existsByEmail("test@example.com");
	        boolean notExists = userRepository.existsByEmail("nonexistent@example.com");
	        
	        assertTrue(exists);
	        assertFalse(notExists);
	    }
	    
	    @Test
	    void testFindByEmailAndRole() {
	        createTestUser("user@example.com", "user", Role.USER, true);
	        createTestUser("admin@example.com", "admin", Role.ADMIN, true);
	        
	        Optional<User> user = userRepository.findByEmailAndRole("user@example.com", Role.USER);
	        Optional<User> admin = userRepository.findByEmailAndRole("admin@example.com", Role.ADMIN);
	        Optional<User> wrongRole = userRepository.findByEmailAndRole("user@example.com", Role.ADMIN);
	        
	        assertTrue(user.isPresent());
	        assertTrue(admin.isPresent());
	        assertFalse(wrongRole.isPresent());
	    }

	    @Test
	    void testFindExpiredResetTokens() {
	        User user1 = createTestUser("user1@example.com", "user1", Role.USER, true);
	        user1.setResetToken("token1");
	        user1.setTokenExpiration(LocalDateTime.now().minusDays(1));
	        entityManager.persist(user1);
	        
	        User user2 = createTestUser("user2@example.com", "user2", Role.USER, true);
	        user2.setResetToken("token2");
	        user2.setTokenExpiration(LocalDateTime.now().plusDays(1));
	        entityManager.persist(user2);
	        
	        List<User> expiredTokens = userRepository.findExpiredResetTokens();
	        
	        assertEquals(1, expiredTokens.size());
	        assertEquals("user1@example.com", expiredTokens.get(0).getEmail());
	    }

	    @Test
	    void testSearchUsers() {
	        createTestUser("john.doe@example.com", "johndoe", Role.USER, true);
	        createTestUser("jane.smith@example.com", "janesmith", Role.USER, true);
	        createTestUser("admin@example.com", "admin", Role.ADMIN, true);
	        
	        Page<User> usernameResults = userRepository.searchUsers("john", PageRequest.of(0, 10));
	        assertEquals(1, usernameResults.getTotalElements());
	        
	        Page<User> emailResults = userRepository.searchUsers("smith", PageRequest.of(0, 10));
	        assertEquals(1, emailResults.getTotalElements());
	        
	        Page<User> caseInsensitiveResults = userRepository.searchUsers("JOHN", PageRequest.of(0, 10));
	        assertEquals(1, caseInsensitiveResults.getTotalElements());
	    }
	    
	    @Test
	    void testGetRegistrationCountsByDate() {
	        LocalDateTime now = LocalDateTime.now();
	        LocalDateTime yesterday = now.minusDays(1);
	        
	        User user1 = User.builder()
	                .email("user1@example.com")
	                .username("user1")
	                .password("password")
	                .role(Role.USER)
	                .createdAt(yesterday)
	                .build();
	        entityManager.persist(user1);
	        
	        User user2 = User.builder()
	                .email("user2@example.com")
	                .username("user2")
	                .password("password")
	                .role(Role.USER)
	                .createdAt(now)
	                .build();
	        entityManager.persist(user2);
	        
	        User user3 = User.builder()
	                .email("user3@example.com")
	                .username("user3")
	                .password("password")
	                .role(Role.USER)
	                .createdAt(now)
	                .build();
	        entityManager.persist(user3);
	        
	        List<Object[]> counts = userRepository.getRegistrationCountsByDate(
	                yesterday.minusDays(1), 
	                now.plusDays(1));
	        
	        assertEquals(2, counts.size()); 
	    }

	    @Test
	    void testCountActiveUsersOnDate() {
	        LocalDate today = LocalDate.now();
	        
	        User activeUser1 = User.builder()
	                .email("active1@example.com")
	                .username("active1")
	                .password("password")
	                .role(Role.USER)
	                .active(true)
	                .build();
	        entityManager.persist(activeUser1);
	        
	        User activeUser2 = User.builder()
	                .email("active2@example.com")
	                .username("active2")
	                .password("password")
	                .role(Role.USER)
	                .active(true)
	                .build();
	        entityManager.persist(activeUser2);
	        
	        User inactiveUser = User.builder()
	                .email("inactive@example.com")
	                .username("inactive")
	                .password("password")
	                .role(Role.USER)
	                .active(false)
	                .build();
	        entityManager.persist(inactiveUser);
	        
	        Long activeCount = userRepository.countByActiveTrue();
	        assertEquals(2, activeCount);
	    }

	    @Test
	    void testCountUsersByRole() {
	        createTestUser("user1@example.com", "user1", Role.USER, true);
	        createTestUser("user2@example.com", "user2", Role.USER, true);
	        createTestUser("admin@example.com", "admin", Role.ADMIN, true);
	        
	        List<Object[]> roleCounts = userRepository.countUsersByRole();
	        
	        assertEquals(2, roleCounts.size()); 
	        
	        for (Object[] count : roleCounts) {
	            Role role = (Role) count[0];
	            Long countValue = (Long) count[1];
	            
	            if (role == Role.USER) {
	                assertEquals(2, countValue);
	            } else if (role == Role.ADMIN) {
	                assertEquals(1, countValue);
	            }
	        }
	    }
	    
	    
	    @Test
	    void testFindByEmail_NotFound() {
	        Optional<User> user = userRepository.findByEmail("nonexistent@example.com");
	        assertFalse(user.isPresent());
	    }

	    @Test
	    void testFindByResetToken_NotFound() {
	        Optional<User> user = userRepository.findByResetToken("nonexistenttoken");
	        assertFalse(user.isPresent());
	    }

	    @Test
	    void testSearchUsers_EmptyQuery() {
	        createTestUser("user@example.com", "username", Role.USER, true);
	        
	        Page<User> results = userRepository.searchUsers("", PageRequest.of(0, 10));
	        assertEquals(1, results.getTotalElements());
	    }

	    @Test
	    void testGetRegistrationCountsByDate_EmptyRange() {
	        List<Object[]> counts = userRepository.getRegistrationCountsByDate(
	                LocalDateTime.now().plusDays(1), 
	                LocalDateTime.now().plusDays(2));
	        
	        assertTrue(counts.isEmpty());
	    }

}
