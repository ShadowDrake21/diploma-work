package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UserDTO;
import com.backend.app.model.User;

@Component
public class UserMapper {
	public UserDTO mapToDTO(User user) {
		if(user == null) {
			return null;
		}
		
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole());
        userDTO.setUsername(user.getUsername());
        userDTO.setAvatarUrl(user.getAvatarUrl());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setUniversityGroup(user.getUniversityGroup());
        userDTO.setUserType(user.getUserType());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setPublicationCount(user.getPublicationCount());
        userDTO.setPatentCount(user.getPatentCount());
        userDTO.setResearchCount(user.getResearchCount());
        userDTO.setAffiliation(user.getAffiliation());
        return userDTO;
    }
	
	
	public ResponseUserDTO mapToResponseDTO(User user) {
		if (user == null) {
			return null;
		}
		
        ResponseUserDTO responseUserDTO = new ResponseUserDTO();
        responseUserDTO.setId(user.getId());
        responseUserDTO.setUsername(user.getUsername());
        responseUserDTO.setAvatarUrl(user.getAvatarUrl());
        return responseUserDTO;
    }
}
