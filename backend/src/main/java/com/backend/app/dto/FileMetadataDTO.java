package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class FileMetadataDTO {
	private UUID id;
	private String fileName;
	private String fileUrl;
	private String entityType;
	private UUID entityId;
	private LocalDateTime uploadedAt;
	
	public FileMetadataDTO(UUID id, String fileName, String fileUrl, String entityType, UUID entityId,
			LocalDateTime uploadedAt) {
		super();
		this.id = id;
		this.fileName = fileName;
		this.fileUrl = fileUrl;
		this.entityType = entityType;
		this.entityId = entityId;
		this.uploadedAt = uploadedAt;
	}
}
