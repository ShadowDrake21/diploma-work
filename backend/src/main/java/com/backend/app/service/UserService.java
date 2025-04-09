package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UserDTO;
import com.backend.app.dto.UserProfileUpdateDTO;
import com.backend.app.enums.Role;
import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final S3Service s3Service;
	
	public UserService(UserRepository userRepository, EmailService emailService, S3Service s3Service) {
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.s3Service = s3Service;
	}
	
	public void savePendingUser(String username, String email, String password, Role role) {
		String verificationCode = emailService.generateVerificationCode();
		
		User user = new User(username, email, password, role);
		user.setVerificationCode(verificationCode);
		user.setVerified(false);
		user.setAvatarUrl(getDefaultAvatarUrl(email));
		userRepository.save(user);
		
		emailService.sendVerificationCode(email, verificationCode);
		
	}
	
	public boolean verifyUser(String email, String code) {
		User user = userRepository.findByEmail(email).orElse(null);
		
		if(user != null && user.getVerificationCode().equals(code) ) {
			user.setVerified(true);
			user.setVerificationCode(null);
			userRepository.save(user);
			return true;
		}
		return false;
	}
	
	public UserDTO saveUser(User user) {
		User savedUser = userRepository.save(user);
		return mapToDTO(savedUser);
	}
	
	public ResponseUserDTO getUserById(Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found with ID " + id));
		return mapToResponseDTO(user);
	}
	
	public Optional<User> getUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}
	
	public List<UserDTO> getUsersByRole(Role role) {
		List<User> users =  userRepository.findByRole(role);
		return users.stream().map(this::mapToDTO).collect(Collectors.toList());
	}
	
	public boolean userExistsByEmail(String email) {
		return userRepository.existsByEmail(email);
	}
	
	public void deleteUser(Long id) {
		Optional<User>  user = userRepository.findById(id);
		if(user.isPresent()) {
			userRepository.deleteById(id);
		}
		else {
			throw new EntityNotFoundException("User not found with ID " + id);
		}
	}
	
	public List<UserDTO> getAllUsers(){
		List<User> users = userRepository.findAll();
		return users.stream().map(this::mapToDTO).collect(Collectors.toList());
	}
	
	public UserDTO updateAvatar(Long userId, MultipartFile file) {
		User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with ID " + userId));
		
		if(user.getAvatarUrl() != null && !user.getAvatarUrl().equals(getDefaultAvatarUrl(user.getEmail()))) {
			String oldFileName = extractFileNameFromUrl(user.getAvatarUrl());
			s3Service.deleteFile(oldFileName);
		}
		
		String fileName = "avatars/" + userId + "/" + file.getOriginalFilename();
		String fileUrl = s3Service.uploadIndependentFile(file, fileName);
		
		user.setAvatarUrl(fileUrl);
		User savedUser = userRepository.save(user);
		return mapToDTO(savedUser);
	}
	
	public UserDTO updateUserProfile(Long id, UserProfileUpdateDTO updateDTO) {
		User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found with ID " + id));
		
		if(updateDTO.getDateOfBirth() != null) {
			user.setDateOfBirth(updateDTO.getDateOfBirth());
	    }
	    if (updateDTO.getUserType() != null) {
	        user.setUserType(updateDTO.getUserType());
	    }
	    if (updateDTO.getUniversityGroup() != null) {
	        user.setUniversityGroup(updateDTO.getUniversityGroup());
	    }
	    if(updateDTO.getPhoneNumber() != null) {
	    	user.setPhoneNumber(updateDTO.getPhoneNumber());
	    }
	    
	    User updatedUser = userRepository.save(user);
	    return mapToDTO(updatedUser);
	}
	
	private String extractFileNameFromUrl(String url) {
		return url.substring(url.lastIndexOf("/") + 1);
	}
	public UserDTO mapToDTO(User user) {
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
        return userDTO;
    }
	
	private ResponseUserDTO mapToResponseDTO(User user) {
        ResponseUserDTO responseUserDTO = new ResponseUserDTO();
        responseUserDTO.setId(user.getId());
        responseUserDTO.setUsername(user.getUsername());
        responseUserDTO.setAvatarUrl(user.getAvatarUrl());
        return responseUserDTO;
    }
	
	private String getDefaultAvatarUrl(String email) {
		return "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
	}
}
