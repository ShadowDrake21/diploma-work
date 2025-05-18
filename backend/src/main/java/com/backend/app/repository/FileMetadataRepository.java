package com.backend.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.FileMetadata;

import jakarta.transaction.Transactional;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID>{
	List<FileMetadata> findByEntityTypeAndEntityId(ProjectType entityType, UUID entityId);
	List<FileMetadata> findByEntityId(UUID entityId);
	Optional<FileMetadata> findByChecksum(String checksum);
	boolean existsByChecksumAndEntityTypeAndEntityId(String checksum, ProjectType entityType, UUID entityId);
	void deleteByFileName(String fileName);
	
	Optional<FileMetadata> findByChecksumAndEntityTypeAndEntityId(String checksum, ProjectType entityType, UUID entityId);
	Optional<FileMetadata> findByFileUrl(String fileUrl);
	
	
	 @Modifying
	 @Transactional
	    @Query("DELETE FROM FileMetadata f WHERE f.entityType = :entityType AND f.entityId = :entityId AND f.fileName = :fileName")
	void deleteByEntityTypeAndEntityIdAndFileName(@Param("entityType") ProjectType entityType, @Param("entityId") UUID entityId, @Param("fileName") String fileName);
	 
	 @Modifying
		@Query("DELETE FROM FileMetadata f WHERE f.user.id = :userId")
	 void deleteByUserId(@Param("userId") Long userId);
}
