package com.backend.app.model;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.backend.app.dto.TagDTO;
import com.backend.app.enums.ProjectType;

public class ProjectResponse {
	private UUID id;
	private ProjectType type;
	private String title;
	private String description;
	private int progress;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Set<TagDTO> tags;
    private Long createdBy;

	public ProjectResponse() {
		
	}

	public ProjectResponse(UUID id, ProjectType type, String title, String description, int progress,
			LocalDateTime createdAt, LocalDateTime updatedAt, Set<TagDTO> tags, Long createdBy) {
		super();
		this.id = id;
		this.type = type;
		this.title = title;
		this.description = description;
		this.progress = progress;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.tags = tags;
		this.createdBy = createdBy;
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

	public int getProgress() {
		return progress;
	}

	public void setProgress(int progress) {
		this.progress = progress;
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

	public Set<TagDTO> getTags() {
		return tags;
	}

	public void setTags(Set<TagDTO> tags) {
		this.tags = tags;
	}

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long createdBy) {
		this.createdBy = createdBy;
	}
	
	
}
