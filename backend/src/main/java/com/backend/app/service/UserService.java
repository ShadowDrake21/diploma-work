package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.app.dto.UserDTO;
import com.backend.app.model.Role;
import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;

@Service
public class UserService {
	private final UserRepository userRepository;
	
	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
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
	
	public void deleteUser(User user) {
		userRepository.delete(user);
	}
	
	private UserDTO mapToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole());
        return userDTO;
    }
}
