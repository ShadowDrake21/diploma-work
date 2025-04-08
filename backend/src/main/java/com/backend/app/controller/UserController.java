package com.backend.app.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UserDTO;
import com.backend.app.dto.UserProfileUpdateDTO;
import com.backend.app.enums.Role;
import com.backend.app.model.User;
import com.backend.app.service.UserService;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/users")
public class UserController {
	private final UserService userService;
	
	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	@GetMapping
	public ResponseEntity<List<UserDTO>> getAllEntity() {
		List<UserDTO> users = userService.getAllUsers();
		return ResponseEntity.ok(users);
	}
	
	@PostMapping
	public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
		UserDTO savedUser = userService.saveUser(user);
		return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
	}
	
	@GetMapping("/{id}")
	public ResponseUserDTO getUserById(@PathVariable Long id) {
		return userService.getUserById(id);
	}
	
	@GetMapping("/email/{email}")
	public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
		Optional<User> user = userService.getUserByEmail(email);
		return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
	}
	
	@GetMapping("/role/{role}")
	public ResponseEntity<List<UserDTO>> getUserByRole(@PathVariable Role role) {
		List<UserDTO> users = userService.getUsersByRole(role);
		return ResponseEntity.ok(users);
	}
	
	@GetMapping("/exists/{email}")
	public ResponseEntity<Boolean> userExistsByEmail(@PathVariable String email) {
		boolean exists = userService.userExistsByEmail(email);
		return ResponseEntity.ok(exists);
	}
	
	@GetMapping("/me")
	public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication){
		String email = authentication.getName();
		User user = userService.getUserByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found with email " + email));
		return ResponseEntity.ok(userService.mapToDTO(user));
	}
	
	 @PatchMapping("/me/avatar")
	    public ResponseEntity<UserDTO> updateAvatar(@RequestBody String avatarUrl, Authentication authentication) {
	        String email = authentication.getName();
	        User user = userService.getUserByEmail(email)
	                .orElseThrow(() -> new EntityNotFoundException("User not found with email " + email));
	        
	        User updatedUser = userService.updateAvatar(user.getId(), avatarUrl);
	        return ResponseEntity.ok(userService.mapToDTO(updatedUser));
	    }
	
	@PatchMapping("/me/profile")
	public ResponseEntity<UserDTO> updateUserProfile(@RequestBody UserProfileUpdateDTO updateDTO, Authentication authentication) {
		System.out.println("update profile: " + updateDTO.getDateOfBirth());
		String email = authentication.getName();
		User user = userService.getUserByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found with email " + email));
		
		UserDTO updatedUser = userService.updateUserProfile(user.getId(), updateDTO);
		return ResponseEntity.ok(updatedUser);
 	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
//		Respo user = userService.getUserById(id);
//		
//		if(user.isPresent()) {
//			userService.deleteUser(id);
//			return ResponseEntity.noContent().build();
//		}
		return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	}
}
