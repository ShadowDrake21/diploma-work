package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.CommentDTO;
import com.backend.app.model.Comment;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CommentMapper {
	public CommentDTO toDTO(Comment comment) {
		return CommentDTO.builder().id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .likes(comment.getLikes())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getUsername())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .projectId(comment.getProject().getId())
                .build();
	}
}
