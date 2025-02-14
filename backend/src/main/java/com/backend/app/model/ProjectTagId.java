package com.backend.app.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public class ProjectTagId implements Serializable{
	private static final long serialVersionUID = 1L;
	
	private UUID projectId;
	private UUID tagId;
	
	public ProjectTagId() {
	}
	
	public ProjectTagId(UUID projectId, UUID tagId) {
		super();
		this.projectId = projectId;
		this.tagId = tagId;
	}
	
	public UUID getProjectId() {
		return projectId;
	}
	public void setProjectId(UUID projectId) {
		this.projectId = projectId;
	}
	public UUID getTagId() {
		return tagId;
	}
	public void setTagId(UUID tagId) {
		this.tagId = tagId;
	}

	@Override
	public int hashCode() {
		return Objects.hash(projectId, tagId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ProjectTagId other = (ProjectTagId) obj;
		return Objects.equals(projectId, other.projectId) && Objects.equals(tagId, other.tagId);
	}
	
	
	
}
