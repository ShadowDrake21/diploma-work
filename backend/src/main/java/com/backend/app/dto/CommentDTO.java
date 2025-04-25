package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Data;

public class CommentDTO {
	 private UUID id;
	 private String content;
	 private LocalDateTime createdAt;
	 private LocalDateTime updatedAt;
	 private int likes;
	 private Long userId;
	 private String userName;
	 private String userAvatarUrl;
	 private UUID projectId;
	 private UUID parentCommentId;
	 private List<CommentDTO> replies;
	 
	 public CommentDTO() {}
	 
	 public CommentDTO(UUID id, String content, LocalDateTime createdAt, LocalDateTime updatedAt, int likes, Long userId,
			String userName, String userAvatarUrl, UUID projectId, UUID parentCommentId, List<CommentDTO> replies) {
		super();
		this.id = id;
		this.content = content;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.likes = likes;
		this.userId = userId;
		this.userName = userName;
		this.userAvatarUrl = userAvatarUrl;
		this.projectId = projectId;
		this.parentCommentId = parentCommentId;
		this.replies = replies;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
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

	public int getLikes() {
		return likes;
	}

	public void setLikes(int likes) {
		this.likes = likes;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserAvatarUrl() {
		return userAvatarUrl;
	}

	public void setUserAvatarUrl(String userAvatarUrl) {
		this.userAvatarUrl = userAvatarUrl;
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

	public List<CommentDTO> getReplies() {
		return replies;
	}

	public void setReplies(List<CommentDTO> replies) {
		this.replies = replies;
	}
	 
	 
}
