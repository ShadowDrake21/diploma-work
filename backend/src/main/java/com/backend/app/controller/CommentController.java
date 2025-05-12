package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.ApiResponse;
import com.backend.app.dto.CommentDTO;
import com.backend.app.dto.CreateCommentDTO;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedException;
import com.backend.app.security.SecurityUtils;
import com.backend.app.service.CommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
	private final CommentService commentService;
	private final SecurityUtils securityUtils;

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<CommentDTO>>> getCommentsByProjectId(@PathVariable UUID projectId) {
		List<CommentDTO> comments = commentService.getCommentsByProjectId(projectId);
		return ResponseEntity.ok(ApiResponse.success(comments));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<CommentDTO>> createComment(@RequestBody CreateCommentDTO createCommentDTO) {
		Long userId = getAuthenticatedUserId().orElseThrow(() -> new UnauthorizedException("Authentication required"));

		try {
			CommentDTO commentDTO = commentService.createComment(createCommentDTO, userId);
			return ResponseEntity.ok(ApiResponse.success(commentDTO));
		} catch (ResourceNotFoundException e) {
			throw new ResourceNotFoundException(e.getMessage());
		} catch (BusinessRuleException e) {
			throw new BusinessRuleException(e.getMessage());
		}
	}

	@PutMapping("/{commentId}")
	public ResponseEntity<ApiResponse<CommentDTO>> updateComment(@PathVariable UUID commentId,
			@RequestBody String content) {
		Long userId = getAuthenticatedUserId().orElseThrow(() -> new UnauthorizedException("Authentication required"));

		CommentDTO commentDTO = commentService.updateComment(commentId, content, userId);
		return ResponseEntity.ok(ApiResponse.success(commentDTO));
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable UUID commentId) {
		Long userId = getAuthenticatedUserId().orElseThrow(() -> new UnauthorizedException("Authentication required"));

		commentService.deleteComment(commentId, userId);
		return ResponseEntity.ok(ApiResponse.success(null));
	}

	@PostMapping("/{commentId}/like")
	public ResponseEntity<ApiResponse<CommentDTO>> likeComment(@PathVariable UUID commentId) {
		Long userId = getAuthenticatedUserId().orElseThrow(() -> new UnauthorizedException("Authentication required"));

		try {
			CommentDTO commentDTO = commentService.likeComment(commentId, userId);
			return ResponseEntity.ok(ApiResponse.success(commentDTO));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
		}

	}

	private Optional<Long> getAuthenticatedUserId() {
		return Optional.ofNullable(securityUtils.getCurrentUserId());
	}
}
