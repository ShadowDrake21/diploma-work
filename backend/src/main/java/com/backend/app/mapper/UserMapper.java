package com.backend.app.mapper;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.miscellaneous.SocialLinkDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.model.SocialLink;
import com.backend.app.model.User;

@Component
public class UserMapper {
	public UserDTO mapToDTO(User user) {
		if(user == null) {
			return null;
		}
		
		 return UserDTO.builder()
	                .id(user.getId())
	                .email(user.getEmail())
	                .role(user.getRole())
	                .username(user.getUsername())
	                .avatarUrl(user.getAvatarUrl())
	                .phoneNumber(user.getPhoneNumber())
	                .universityGroup(user.getUniversityGroup())
	                .userType(user.getUserType())
	                .dateOfBirth(user.getDateOfBirth())
	                .publicationCount(user.getPublicationCount())
	                .patentCount(user.getPatentCount())
	                .researchCount(user.getResearchCount())
	                .affiliation(user.getAffiliation())
	                .active(user.isActive())
	                .createdAt(user.getCreatedAt())
	                .socialLinks(mapSocialLinksToDTO(user.getSocialLinks()))
	                .build();
    }
	
	
	public ResponseUserDTO mapToResponseDTO(User user) {
		if (user == null) {
			return null;
		}
		
       return ResponseUserDTO.builder().id(user.getId())
               .username(user.getUsername())
               .avatarUrl(user.getAvatarUrl())
               .build();
    }
	
	 public User mapToEntity(UserDTO userDTO) {
	        if (userDTO == null) {
	            return null;
	        }

	        return User.builder()
	                .id(userDTO.getId())
	                .email(userDTO.getEmail())
	                .role(userDTO.getRole())
	                .username(userDTO.getUsername())
	                .avatarUrl(userDTO.getAvatarUrl())
	                .phoneNumber(userDTO.getPhoneNumber())
	                .universityGroup(userDTO.getUniversityGroup())
	                .userType(userDTO.getUserType())
	                .dateOfBirth(userDTO.getDateOfBirth())
	                .publicationCount(userDTO.getPublicationCount())
	                .patentCount(userDTO.getPatentCount())
	                .researchCount(userDTO.getResearchCount())
	                .affiliation(userDTO.getAffiliation())
	                .active(userDTO.isActive())
	                .socialLinks(mapSocialLinksToEntity(userDTO.getSocialLinks()))
	                .build();
	    }
	 
	 public Set<SocialLink> mapSocialLinksToEntity(Set<SocialLinkDTO> socialLinkDTOs) {
		 if(socialLinkDTOs == null) {
			 return new HashSet<SocialLink>();
		 }
		 
		 return socialLinkDTOs.stream().map(dto -> SocialLink.builder() .url(dto.getUrl())
                 .name(dto.getName())
                 .build())
         .collect(Collectors.toSet());
	 }
	 
	 public Set<SocialLinkDTO> mapSocialLinksToDTO(Set<SocialLink> socialLinks) {
		 if (socialLinks == null) {
			return new HashSet<SocialLinkDTO>();
		}
		 
		 return socialLinks.stream().map(link -> SocialLinkDTO.builder()
                 .url(link.getUrl())
                 .name(link.getName())
                 .build())
         .collect(Collectors.toSet());
	 }
}
