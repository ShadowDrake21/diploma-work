package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.app.enums.Role;

public class UserTest {
	private User user;
	private final LocalDateTime now = LocalDateTime.now();
	private final LocalDate dob = LocalDate.of(1990, 1, 1);
	
	@BeforeEach
	 void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .role(Role.USER)
                .verified(true)
                .avatarUrl("http://example.com/avatar.jpg")
                .dateOfBirth(dob)
                .userType("STUDENT")
                .universityGroup("PI-211")
                .phoneNumber("+1234567890")
                .publicationCount(5)
                .patentCount(2)
                .researchCount(3)
                .affiliation("Test University")
                .createdAt(now)
                .updatedAt(now)
                .active(true)
                .lastActive(now)
                .socialLinks(new HashSet<>())
                .build();
    }
	
	@Test
	void testUserCreation() {
		assertNotNull(user);
		  assertEquals(1L, user.getId());
	        assertEquals("testuser", user.getUsername());
	        assertEquals("test@example.com", user.getEmail());
	        assertEquals("password", user.getPassword());
	        assertEquals(Role.USER, user.getRole());
	        assertTrue(user.isVerified());
	        assertEquals("http://example.com/avatar.jpg", user.getAvatarUrl());
	        assertEquals(dob, user.getDateOfBirth());
	        assertEquals("STUDENT", user.getUserType());
	        assertEquals("PI-211", user.getUniversityGroup());
	        assertEquals("+1234567890", user.getPhoneNumber());
	        assertEquals(5, user.getPublicationCount());
	        assertEquals(2, user.getPatentCount());
	        assertEquals(3, user.getResearchCount());
	        assertEquals("Test University", user.getAffiliation());
	        assertEquals(now, user.getCreatedAt());
	        assertEquals(now, user.getUpdatedAt());
	        assertTrue(user.isActive());
	        assertEquals(now, user.getLastActive());
	        assertNotNull(user.getSocialLinks());
	}
	
	@Test
	void testAddSocialLink() {
		SocialLink link = new SocialLink("GitHub", "https://github.com/testuser");
		user.getSocialLinks().add(link);
		
		assertEquals(1, user.getSocialLinks().size());
		assertTrue(user.getSocialLinks().contains(link));
	}
	
	 @Test
	    void testEqualsAndHashCode() {
	        User sameUser = User.builder()
	                .id(1L)
	                .username("testuser")
	                .email("test@example.com")
	                .build();
	                
	        User differentUser = User.builder()
	                .id(2L)
	                .username("otheruser")
	                .email("other@example.com")
	                .build();
	  
	        assertEquals(sameUser, differentUser);
	        assertNotEquals(user, differentUser);
	        assertEquals(user.hashCode(), sameUser.hashCode());
	        assertNotEquals(user.hashCode(), differentUser.hashCode());
	 }
	 
	 @Test
	 void testToString() {
		 String toString = user.toString();
		 assertTrue(toString.contains("testuser"));
		 assertTrue(toString.contains("test@example.com"));
	 }
	 
	 @Test
	 void testDefaultValues() {
		 User defaultUser = User.builder().build();
		 assertFalse(defaultUser.isVerified());
	        assertEquals(0, defaultUser.getPublicationCount());
	        assertEquals(0, defaultUser.getPatentCount());
	        assertEquals(0, defaultUser.getResearchCount());
	        assertEquals("Національний університет «Чернігівська Політехніка»", 
	            defaultUser.getAffiliation());
	        assertTrue(defaultUser.isActive());
	 }
}
