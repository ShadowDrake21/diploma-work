package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.app.enums.ProjectType;

import lombok.Data;


public class ProjectDTO {
	private UUID id;
	private ProjectType type;
	private String title;
	private String description;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	public ProjectDTO() {
	
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public ProjectType getType() {
		return type;
	}

	public void setType(ProjectType type) {
		this.type = type;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
