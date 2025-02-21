package com.backend.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.FileMetadata;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID>{
	List<FileMetadata> findByEntityTypeAndEntityId(String entityType, UUID entityId);
	void deleteByFileName(String fileName);
}
