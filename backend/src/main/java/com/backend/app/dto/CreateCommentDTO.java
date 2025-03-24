package com.backend.app.dto;

import java.util.UUID;

public class CreateCommentDTO {
	private String content;
	private UUID projectId;
	private UUID parentCommentId;
	
	public CreateCommentDTO() {}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public UUID getProjectId() {
		return projectId;
	}

	public void setProjectId(UUID projectId) {
		this.projectId = projectId;
	}

	public UUID getParentCommentId() {
		return parentCommentId;
	}

	public void setParentCommentId(UUID parentCommentId) {
		this.parentCommentId = parentCommentId;
	}
	
	
}
