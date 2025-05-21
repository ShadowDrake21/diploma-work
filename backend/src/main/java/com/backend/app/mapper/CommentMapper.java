package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.model.CommentDTO;
import com.backend.app.model.Comment;
import com.backend.app.security.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CommentMapper {
    private final SecurityUtils securityUtils;

	public CommentDTO toDTO(Comment comment) {
		Long currentLongId = securityUtils.getCurrentUserId();
		boolean isLiked = currentLongId != null && comment.getLikedByUsers().contains(currentLongId);
		return CommentDTO.builder().id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .likes(comment.getLikes())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getUsername())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .projectId(comment.getProject().getId())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .isLikedByCurrentUser(isLiked)
                .build();
	}
}
