package com.backend.app.model;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.backend.app.enums.ProjectType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "projects")
public class Project {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProjectType type;

	@Column(nullable = false, length = 256)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String description;
	
	@Column(name="created_at", updatable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
	
	public Project(UUID id, ProjectType type, String title, String description) {
		super();
		this.id = id;
		this.type = type;
		this.title = title;
		this.description = description;
	}
	
	public Project(ProjectType type, String title, String description) {
		super();
		this.type = type;
		this.title = title;
		this.description = description;
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
