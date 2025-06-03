package com.backend.app.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.app.enums.ProjectAuditAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "project_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectAuditLog {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
	    
	    @Column(nullable = false)
	    private UUID projectId;
	    
	    @Column(nullable = false)
	    private String projectTitle;
	    
	    @Column(nullable = false)
	    private Long originalOwnerId;
	    
	    @Column
	    private String originalOwnerName;
	    
	    @Column(nullable = false)
	    private Long actionByAdminId;
	    
	    @Column(nullable = false)
	    private String actionByAdminName;
	    
	    @Column(nullable = false)
	    @Enumerated(EnumType.STRING)
	    private ProjectAuditAction action;
	    
	    @Column(nullable = false)
	    private LocalDateTime actionTimestamp;
	    
	    @Column(columnDefinition = "TEXT")
	    private String additionalInfo;
}
