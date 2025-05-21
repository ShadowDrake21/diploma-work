package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.model.UserDTO;
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
	                .build();
	    }
}
