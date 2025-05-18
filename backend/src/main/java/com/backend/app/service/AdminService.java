package com.backend.app.service;

import java.time.LocalDateTime;
import java.util.List;

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
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.CommentRepository;
import com.backend.app.repository.FileMetadataRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;
import com.backend.app.security.TokenBlacklist;
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
	private final ProjectService projectService;
	private final AuditService auditService;
	private final CommentRepository commentRepository;
	private final FileMetadataRepository fileMetadataRepository;
	private final ProjectRepository projectRepository;
	private final TokenBlacklist tokenBlacklist;
	private final ActiveTokenRepository activeTokenRepository;
	private final UserMapper userMapper;
	
	public String inviteAdmin(AdminInviteRequest request, String currentAdminEmail) {
		log.info("Admin invitation requested by {} for {}", currentAdminEmail, request.getEmail());
		
		User currentUser = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
		if(!isSuperAdmin(currentUser)) {
            throw new UnauthorizedAccessException("Only super admins admins can invite other admins");
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
        
        if(!isSuperAdmin(currentAdmin)) {
            throw new UnauthorizedAccessException("Only super admins can promote users");
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
        
        if(!isSuperAdmin(currentAdmin)) {
            throw new UnauthorizedAccessException("Only super admins can demote admins");
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
	
	@Transactional
	public void deactivateUser(Long userId, String currentAdminEmail) {
		User currentAdmin = validateAdminAction(currentAdminEmail, userId);
		
		User targetUser = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		if(targetUser.getRole() == Role.ADMIN && !isSuperAdmin(currentAdmin)) {
			throw new UnauthorizedAccessException("Only super admins can deactivate other admins");
		}
		
		targetUser.setActive(false);
		targetUser.setDeletedAt(LocalDateTime.now());
		userRepository.save(targetUser);	
		
		revokeUserSessions(userId);
	    log.info("User {} deactivated by admin {}", userId, currentAdminEmail);
	}
	
	@Transactional
	public void deleteUser(Long userId, String currentAdminEmail) {
		User currentAdmin = validateAdminAction(currentAdminEmail, userId);
		
		User targetUser = userRepository.findById(userId)
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
	    
	    if (targetUser.getRole() == Role.ADMIN && !isSuperAdmin(currentAdmin)) {
	        throw new UnauthorizedAccessException("Only super admins can delete other admins");
	    }
		
	    revokeUserSessions(userId);
		handleUserProjects(userId);
		commentRepository.deleteByUserId(userId);
		fileMetadataRepository.deleteByUserId(userId);
		
		userRepository.delete(targetUser);
	    log.info("User {} permanently deleted by admin {}", userId, currentAdminEmail);
	}
	
	@Transactional
	public void reactivateUser(Long userId, String currentAdminEmail) {
		User admin = userRepository.findByEmail(currentAdminEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		
		User targetUser = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		if(admin.getRole() == Role.ADMIN && !isSuperAdmin(admin)) {
			throw new UnauthorizedAccessException("Only super admins can reactivate admins");
		}
		
		targetUser.setActive(true);
		targetUser.setDeletedAt(null);
		userRepository.save(targetUser);
		
	    log.info("User {} reactivated by admin {}", userId, currentAdminEmail);
		}
	
	private User validateAdminAction(String adminEmail, Long targetUserId) {
		 User admin = userRepository.findByEmail(adminEmail)
		            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
		    
		    if (admin.getRole() != Role.ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
		        throw new UnauthorizedAccessException("Only admins can perform this action");
		    }
		    
		    if (admin.getId().equals(targetUserId)) {
		        throw new BusinessRuleException("Cannot perform this action on yourself");
		    }
		    
		    return admin;
	}
	
	private void handleUserProjects(Long userId) {
		List<Project> projects = projectService.findProjectsByUserId(userId);
		
		projects.forEach(project -> {
			auditService.logDeletedUserProject(project, userId);
			
			project.setCreator(null);
			project.setDeletedUserId(userId);
			
			projectRepository.save(project);
		});
				}
	
	private void revokeUserSessions(Long userId) {
		activeTokenRepository.findByUserId(userId).forEach(token -> {
			tokenBlacklist.addToBlacklist(token.getToken());
			activeTokenRepository.delete(token);
		});
		
		log.info("Revoked all sessions for user ID: {}", userId);
	}
	
	private boolean isSuperAdmin(User admin) {
		return admin.getRole() == Role.SUPER_ADMIN;
	}
}
