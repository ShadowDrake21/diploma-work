package com.backend.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.ProjectAuditLog;

public interface ProjectAuditRepository extends JpaRepository<ProjectAuditLog, Long>{
	List<ProjectAuditLog> findByProjectId(UUID projectId);
	List<ProjectAuditLog> findByOriginalOwnerId(Long userId);
}
