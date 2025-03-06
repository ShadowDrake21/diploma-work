package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.Tag;

import lombok.Data;


public class ProjectDTO {
	private UUID id;
	private ProjectType type;
	private String title;
	private String description;
	private int progress;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Set<UUID> tagIds =  new HashSet<UUID>();
	
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

	public Set<UUID> getTagIds() {
		return tagIds;
	}

	public void setTagIds(Set<UUID> tagIds) {
		this.tagIds = tagIds;
	}
}
