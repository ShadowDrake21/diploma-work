package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.app.dto.UserDTO;
import com.backend.app.model.Role;
import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	
	public UserService(UserRepository userRepository, EmailService emailService) {
		this.userRepository = userRepository;
		this.emailService = emailService;
	}
	
	public void savePendingUser(String username, String email, String password, Role role) {
		String verificationCode = emailService.generateVerificationCode();
		
		User user = new User(username, email, password, role);
		user.setVerificationCode(verificationCode);
		user.setVerified(false);
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
	
	public Optional<UserDTO> getUserById(Long id) {
		Optional<User> user =  userRepository.findById(id);
		return user.map(this::mapToDTO);
	}
	
	public Optional<UserDTO> getUserByEmail(String email) {
		Optional<User> user = userRepository.findByEmail(email);
		return user.map(this::mapToDTO);
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
	
	private UserDTO mapToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole());
        return userDTO;
    }
}
