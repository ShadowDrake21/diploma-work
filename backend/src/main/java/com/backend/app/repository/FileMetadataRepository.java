package com.backend.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.FileMetadata;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID>{
	List<FileMetadata> findByEntityTypeAndEntityId(ProjectType entityType, UUID entityId);
	List<FileMetadata> findByEntityId(UUID entityId);
	Optional<FileMetadata> findByChecksum(String checksum);
	boolean existsByChecksumAndEntityTypeAndEntityId(String checksum, ProjectType entityType, UUID entityId);
	void deleteByFileName(String fileName);
}
