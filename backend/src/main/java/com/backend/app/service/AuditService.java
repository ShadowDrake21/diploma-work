package com.backend.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.enums.ProjectAuditAction;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectAuditLog;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectAuditRepository;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {
	private final ProjectAuditRepository projectAuditRepository;
	private final UserRepository userRepository;
	
	@Transactional
	public void logDeletedUserProject(Project project, Long deletedUserId) {
		User deletedUser = userRepository.findById(deletedUserId)
				.orElseGet(() -> User.builder().id(deletedUserId).username("[deleted_user]").build());
		
		ProjectAuditLog logEntry = ProjectAuditLog.builder().projectId(project.getId())
				.projectTitle(project.getTitle())
                .originalOwnerId(deletedUser.getId())
                .originalOwnerName(deletedUser.getUsername())
                .action(ProjectAuditAction.OWNER_REMOVED)
                .actionTimestamp(LocalDateTime.now())
                .additionalInfo(String.format(
                    "Project marked as from deleted user. Original owner: %s (%d)",
                    deletedUser.getUsername(),
                    deletedUser.getId()
                )).build();
		
		projectAuditRepository.save(logEntry);
	}
	
	 @Transactional
	    public void logProjectTransfer(Project project, User originalOwner, User newOwner, User admin) {
	        ProjectAuditLog logEntry = ProjectAuditLog.builder()
	                .projectId(project.getId())
	                .projectTitle(project.getTitle())
	                .originalOwnerId(originalOwner.getId())
	                .originalOwnerName(originalOwner.getUsername())
	                .actionByAdminId(admin.getId())
	                .actionByAdminName(admin.getUsername())
	                .action(ProjectAuditAction.PROJECT_TRANSFERRED)
	                .actionTimestamp(LocalDateTime.now())
	                .additionalInfo(String.format(
	                    "Project transferred from %s (%d) to %s (%d) by admin %s",
	                    originalOwner.getUsername(),
	                    originalOwner.getId(),
	                    newOwner.getUsername(),
	                    newOwner.getId(),
	                    admin.getUsername()
	                ))
	                .build();
	        
	        projectAuditRepository.save(logEntry);
	    }
	 
	 public List<ProjectAuditLog> getProjectAuditHistory(UUID projectId) {
		 return projectAuditRepository.findByProjectId(projectId);
	 }
	 
	 public List<ProjectAuditLog> getUserProjectHistory(Long userId) {
		 return projectAuditRepository.findByOriginalOwnerId(userId);
	 }
}
