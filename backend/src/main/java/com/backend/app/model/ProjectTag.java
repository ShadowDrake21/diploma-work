package com.backend.app.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_tags")
public class ProjectTag {
	@EmbeddedId
	private ProjectTagId id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("projectId")
	@JoinColumn(name = "project_id", referencedColumnName = "id", nullable = false)
	private Project project;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("tagId")
	@JoinColumn(name = "tag_id", referencedColumnName = "id", nullable = false)
	private Tag tag;
	
	

	public ProjectTag() {
	}

	public ProjectTag(ProjectTagId id, Project project, Tag tag) {
		super();
		this.id = id;
		this.project = project;
		this.tag = tag;
	}

	public ProjectTagId getId() {
		return id;
	}

	public void setId(ProjectTagId id) {
		this.id = id;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public Tag getTag() {
		return tag;
	}

	public void setTag(Tag tag) {
		this.tag = tag;
	}
}
