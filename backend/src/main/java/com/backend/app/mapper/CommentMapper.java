package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.CommentDTO;
import com.backend.app.model.Comment;

@Component
public class CommentMapper {
	public CommentDTO toDTO(Comment comment) {
		CommentDTO dto = new CommentDTO();
		
		dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setLikes(comment.getLikes());
        dto.setUserId(comment.getUser().getId());
        dto.setUserName(comment.getUser().getUsername());
        dto.setUserAvatarUrl(comment.getUser().getAvatarUrl());
        dto.setProjectId(comment.getProject().getId());
        
		return dto;
        
	}
}
