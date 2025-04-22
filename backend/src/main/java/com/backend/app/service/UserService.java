package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UserDTO;
import com.backend.app.dto.UserProfileUpdateDTO;
import com.backend.app.enums.Role;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final S3Service s3Service;
	private final UserMapper userMapper;
	
	public UserService(UserRepository userRepository, EmailService emailService, S3Service s3Service, UserMapper userMapper) {
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.s3Service = s3Service;
		this.userMapper = userMapper;
	}
	
	public List<UserDTO> getAllUsersList() {
		List<User> users = userRepository.findAll();
		return users.stream().map(userMapper::mapToDTO).collect(Collectors.toList());
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
		return userMapper.mapToDTO(savedUser);
	}
	
	public ResponseUserDTO getUserById(Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found with ID " + id));
		return userMapper.mapToResponseDTO(user);
	}
	
	public Optional<User> getUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}
	
	public List<UserDTO> getUsersByRole(Role role) {
		List<User> users =  userRepository.findByRole(role);
		return users.stream().map(userMapper::mapToDTO).collect(Collectors.toList());
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
	
	public Page<UserDTO> getAllUsers(Pageable pageable){
		Page<User> usersPage = userRepository.findAll(pageable);
		return usersPage.map(userMapper::mapToDTO);
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
		return userMapper.mapToDTO(savedUser);
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
	    return userMapper.mapToDTO(updatedUser);
	}
	
	private String extractFileNameFromUrl(String url) {
		return url.substring(url.lastIndexOf("/") + 1);
	}
	
	public Page<UserDTO> searchUsers(String query, Pageable pageable) {
		Page<User> usersPage =userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
		
		return usersPage.map(userMapper::mapToDTO);
	}
	
	private String getDefaultAvatarUrl(String email) {
		return "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
	}
}
