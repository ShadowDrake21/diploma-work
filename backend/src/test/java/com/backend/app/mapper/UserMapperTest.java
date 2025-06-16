package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.miscellaneous.SocialLinkDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.enums.Role;
import com.backend.app.model.SocialLink;
import com.backend.app.model.User;

public class UserMapperTest {
	 private UserMapper userMapper = new UserMapper();
	    private final LocalDateTime now = LocalDateTime.now();
	    private final LocalDate dob = LocalDate.of(1990, 1, 1);
	    
	    @Test
	    void testMapToDTO() {
	    	Set<SocialLink> socialLinks = new HashSet<SocialLink>();
	    	socialLinks.add(new SocialLink("GitHub", "https://github.com/testuser"));
	    		        
	    	User user = User.builder()
	                .id(1L)
	                .username("testuser")
	                .email("test@example.com")
	                .role(Role.USER)
	                .avatarUrl("http://example.com/avatar.jpg")
	                .dateOfBirth(dob)
	                .userType("STUDENT")
	                .universityGroup("PI-211")
	                .phoneNumber("+1234567890")
	                .publicationCount(5)
	                .patentCount(2)
	                .researchCount(3)
	                .affiliation("Test University")
	                .active(true)
	                .createdAt(now)
	                .lastActive(now)
	                .socialLinks(socialLinks)
	                .build();
	    	
	    	UserDTO dto = userMapper.mapToDTO(user);
	    	
	    	assertNotNull(dto);
	        assertEquals(1L, dto.getId());
	        assertEquals("testuser", dto.getUsername());
	        assertEquals("test@example.com", dto.getEmail());
	        assertEquals(Role.USER, dto.getRole());
	        assertEquals("http://example.com/avatar.jpg", dto.getAvatarUrl());
	        assertEquals(dob, dto.getDateOfBirth());
	        assertEquals("STUDENT", dto.getUserType());
	        assertEquals("PI-211", dto.getUniversityGroup());
	        assertEquals("+1234567890", dto.getPhoneNumber());
	        assertEquals(5, dto.getPublicationCount());
	        assertEquals(2, dto.getPatentCount());
	        assertEquals(3, dto.getResearchCount());
	        assertEquals("Test University", dto.getAffiliation());
	        assertTrue(dto.isActive());
	        assertEquals(now, dto.getCreatedAt());
	        assertEquals(now, dto.getLastActive());
	        assertEquals(1, dto.getSocialLinks().size());
	    }
	    
	    @Test
	    void testMapToEntity() {
	        Set<SocialLinkDTO> socialLinkDTOs = new HashSet<>();
	        socialLinkDTOs.add(new SocialLinkDTO("GitHub", "https://github.com/testuser"));
	        
	        UserDTO dto = UserDTO.builder()
	                .id(1L)
	                .username("testuser")
	                .email("test@example.com")
	                .role(Role.USER)
	                .avatarUrl("http://example.com/avatar.jpg")
	                .dateOfBirth(dob)
	                .userType("STUDENT")
	                .universityGroup("PI-211")
	                .phoneNumber("+1234567890")
	                .publicationCount(5)
	                .patentCount(2)
	                .researchCount(3)
	                .affiliation("Test University")
	                .active(true)
	                .lastActive(now)
	                .socialLinks(socialLinkDTOs)
	                .build();
	                
	        User user = userMapper.mapToEntity(dto);
	        
	        assertNotNull(user);
	        assertEquals(1L, user.getId());
	        assertEquals("testuser", user.getUsername());
	        assertEquals("test@example.com", user.getEmail());
	        assertEquals(Role.USER, user.getRole());
	        assertEquals("http://example.com/avatar.jpg", user.getAvatarUrl());
	        assertEquals(dob, user.getDateOfBirth());
	        assertEquals("STUDENT", user.getUserType());
	        assertEquals("PI-211", user.getUniversityGroup());
	        assertEquals("+1234567890", user.getPhoneNumber());
	        assertEquals(5, user.getPublicationCount());
	        assertEquals(2, user.getPatentCount());
	        assertEquals(3, user.getResearchCount());
	        assertEquals("Test University", user.getAffiliation());
	        assertTrue(user.isActive());
	        assertEquals(now, user.getLastActive());
	        assertEquals(1, user.getSocialLinks().size());
	    }
	    
	    @Test
	    void testMapToResponseDTO() {
	    	User user = User.builder()
	                .id(1L)
	                .username("testuser")
	                .avatarUrl("http://example.com/avatar.jpg")
	                .build();
	                
	        ResponseUserDTO responseDTO = userMapper.mapToResponseDTO(user);
	        
	        assertNotNull(responseDTO);
	        assertEquals(1L, responseDTO.getId());
	        assertEquals("testuser", responseDTO.getUsername());
	        assertEquals("http://example.com/avatar.jpg", responseDTO.getAvatarUrl());
	    }
	    
	    @Test
	    void testMapSocialLinks() {
	        Set<SocialLinkDTO> socialLinkDTOs = new HashSet<>();
	        socialLinkDTOs.add(new SocialLinkDTO("GitHub", "https://github.com/testuser"));
	        socialLinkDTOs.add(new SocialLinkDTO("X", "https://x.com/testuser"));
	        
	        Set<SocialLink> socialLinks = userMapper.mapSocialLinksToEntity(socialLinkDTOs);
	        assertEquals(2, socialLinks.size());
	        
	        Set<SocialLinkDTO> convertedBack = userMapper.mapSocialLinksToDTO(socialLinks);
	        assertEquals(2, convertedBack.size());
	    }
	    
	    @Test
	    void testNullHandling() {
	        assertNull(userMapper.mapToDTO(null));
	        assertNull(userMapper.mapToEntity(null));
	        assertNull(userMapper.mapToResponseDTO(null));
	        assertNotNull(userMapper.mapSocialLinksToEntity(null));
	        assertTrue(userMapper.mapSocialLinksToEntity(null).isEmpty());
	        assertNotNull(userMapper.mapSocialLinksToDTO(null));
	        assertTrue(userMapper.mapSocialLinksToDTO(null).isEmpty());
	    }
}
