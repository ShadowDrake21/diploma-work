package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.app.enums.ProjectType;

import lombok.Data;

@Data
public class ProjectDTO {
	private UUID id;
	private ProjectType type;
	private String title;
	private String description;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
