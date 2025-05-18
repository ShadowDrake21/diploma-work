package com.backend.app.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.dto.AdminInviteRequest;
import com.backend.app.dto.AuthResponse;
import com.backend.app.dto.RegisterRequest;
import com.backend.app.dto.UserDTO;
import com.backend.app.enums.Role;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.InvalidTokenException;
import com.backend.app.exception.ResourceAlreadyExistsException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.User;
import com.backend.app.repository.UserRepository;
import com.backend.app.util.CreationUtils;
import com.backend.app.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final UserMapper userMapper;
	
	public String inviteAdmin(AdminInviteRequest request, String currentAdminEmail) {
		log.info("Admin invitation requested by {} for {}", currentAdminEmail, request.getEmail());
		
		User currentUser = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
		if(currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedAccessException("Only admins can invite other admins");
        }
		
       if(userRepository.existsByEmail(request.getEmail())) {
    	   throw new ResourceAlreadyExistsException("Email already registered");
       }
        
        String adminToken = jwtUtil.generateAdminInviteToken(request.getEmail());
        emailService.sendAdminInvite(request.getEmail(), adminToken);
        
        return String.format("Admin invitation sent to %s", request.getEmail());
	}
	
	@Transactional
	public AuthResponse completeAdminRegistration(String token, RegisterRequest request) {
		if(!jwtUtil.validateAdminInviteToken(token, request.getEmail())) {
            throw new InvalidTokenException("Invalid or expired invitation token");
        }
        
		User user = User.builder().username(request.getUsername()).email(request.getEmail()).password(passwordEncoder.encode(request.getPassword()))
				.role(Role.ADMIN).verified(true).avatarUrl(CreationUtils.getDefaultAvatarUrl()).build();
        
		User savedUser = userRepository.save(user);
        String authToken = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId());
        
        return new AuthResponse("Admin registration successful!", authToken);
	}
	
	public Page<UserDTO> getAllUsers(Pageable pageable) {
		return userRepository.findAll(pageable).map(userMapper::mapToDTO);
	}
	
	@Transactional
    public UserDTO promoteToAdmin(Long userId, String currentAdminEmail) {
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        if(currentAdmin.getRole() != Role.ADMIN) {
			throw new UnauthorizedAccessException("Only admins can promote users");
		}
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getRole() == Role.ADMIN) {
            throw new BusinessRuleException("User is already an admin");
        }
        
        user.setRole(Role.ADMIN);
        User savedUser = userRepository.save(user);
        
        log.info("User {} promoted to admin by {}", userId, currentAdminEmail);
        return userMapper.mapToDTO(savedUser);
    }
	
	@Transactional
    public UserDTO demoteToUser(Long userId, String currentAdminEmail) {
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        if(currentAdmin.getRole() != Role.ADMIN) {
			throw new UnauthorizedAccessException("Only admins can demote users");
		}
        
        if(currentAdmin.getId().equals(userId)) {
        	throw new BusinessRuleException("Admins cannot demote themselves");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getRole() != Role.ADMIN) {
            throw new BusinessRuleException("User is not an admin");
        }
        
        user.setRole(Role.USER);
        User savedUser = userRepository.save(user);
        
        log.info("Admin {} demoted to user by {}", userId, currentAdminEmail);
        return userMapper.mapToDTO(savedUser);
    }
}
