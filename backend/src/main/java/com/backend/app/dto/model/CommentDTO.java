package com.backend.app.dto.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
	 private String projectTitle;
	 private UUID parentCommentId;
	 private List<CommentDTO> replies;	 
	 private boolean isLikedByCurrentUser;
}
