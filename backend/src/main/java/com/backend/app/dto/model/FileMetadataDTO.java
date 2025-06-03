package com.backend.app.dto.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.app.enums.ProjectType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class FileMetadataDTO {
	private UUID id;
	private String fileName;
	private String fileUrl;
	private ProjectType entityType;
	private UUID entityId;
	private LocalDateTime uploadedAt;
	 private Long fileSize;
	    private String checksum;
	
	public FileMetadataDTO(UUID id, String fileName, String fileUrl, ProjectType projectType, UUID entityId,
			LocalDateTime uploadedAt,  Long fileSize, String checksum) {
		super();
		this.id = id;
		this.fileName = fileName;
		this.fileUrl = fileUrl;
		this.entityType = projectType;
		this.entityId = entityId;
		this.uploadedAt = uploadedAt;
		 this.fileSize = fileSize;
	        this.checksum = checksum;
	}
}
