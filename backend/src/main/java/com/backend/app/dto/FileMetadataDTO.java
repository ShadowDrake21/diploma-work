package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class FileMetadataDTO {
	private UUID id;
	private String fileName;
	private String fileUrl;
	private String entityType;
	private UUID entityId;
	private LocalDateTime uploadedAt;
}
