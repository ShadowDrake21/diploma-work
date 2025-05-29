package com.backend.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.dto.model.UserDTO;
import com.backend.app.enums.Role;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.Comment;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.CommentRepository;
import com.backend.app.repository.FileMetadataRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;
import com.backend.app.security.TokenBlacklist;
import com.backend.app.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
	private final AuditService auditService;
	private final EmailService emailService;
	private final ProjectService projectService;
	
	private final JwtUtil jwtUtil;
	private final PasswordEncoder passwordEncoder;
	private final TokenBlacklist tokenBlacklist;
	private final UserMapper userMapper;
	
	private final UserRepository userRepository;
	private final CommentRepository commentRepository;
	private final FileMetadataRepository fileMetadataRepository;
	private final ProjectRepository projectRepository;
	private final ActiveTokenRepository activeTokenRepository;
	
	
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
		if(targetUser.getRole() == Role.SUPER_ADMIN) {
			throw new UnauthorizedAccessException("No one can deactivate super admin");
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
	    if(targetUser.getRole() == Role.SUPER_ADMIN) {
			throw new UnauthorizedAccessException("No one can delete super admin");
		}
	    
	    revokeUserSessions(userId);
		handleUserProjects(userId);
		commentRepository.deleteByUserId(userId);

//		List<FileMetadata> userFiles = fileMetadataRepository.findByEntityId(userId);
//		after the user deletion files should be moved somewhere to be still available
		
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
	
	
	
	@Transactional
	public void deleteComment(UUID commentId, String adminEmail) {
		User admin = userRepository.findByEmail(adminEmail).orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
		
		if(admin.getRole() != Role.ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
			throw new UnauthorizedAccessException("Only admins can perform this action");
		}
		
		Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
		
		if(!comment.getReplies().isEmpty()) {
			commentRepository.deleteAll(comment.getReplies());
			
		}
		
		commentRepository.delete(comment);
		log.info("Comment {} deleted by admin {}", commentId, adminEmail);
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
