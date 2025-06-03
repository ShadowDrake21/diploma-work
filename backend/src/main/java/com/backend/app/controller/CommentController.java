package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.create.CreateCommentDTO;
import com.backend.app.dto.model.CommentDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.dto.response.PaginatedResponse;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedException;
import com.backend.app.model.Comment;
import com.backend.app.security.SecurityUtils;
import com.backend.app.service.CommentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
	
	@GetMapping("/user/{userId}")
	public ResponseEntity<PaginatedResponse<CommentDTO>> getCommentsByUserId( @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
		try {
			Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
			Page<CommentDTO> comments = commentService.getCommentsByUserId(userId, pageable);
			return ResponseEntity.ok(PaginatedResponse.success(comments));
		} catch (Exception e) {
			log.error("Error fetching paginated users", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(PaginatedResponse.error("Error fetching users"));
		}
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
		} catch (ResourceNotFoundException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(e.getMessage()));
	    } catch (BusinessRuleException e) {
	        return ResponseEntity.badRequest()
	                .body(ApiResponse.error(e.getMessage()));
	    }
	}
	
	@DeleteMapping("/{commentId}/like")
	public ResponseEntity<ApiResponse<CommentDTO>> removeLike(@PathVariable UUID commentId) {
		Long userId = getAuthenticatedUserId().orElseThrow(() -> new UnauthorizedException("Authentication required"));

		try {
			CommentDTO commentDTO = commentService.unlikeComment(commentId, userId);
			return ResponseEntity.ok(ApiResponse.success(commentDTO));
		} catch (ResourceNotFoundException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(e.getMessage()));
	    } catch (BusinessRuleException e) {
	        return ResponseEntity.badRequest()
	                .body(ApiResponse.error(e.getMessage()));
	    }
	}

	private Optional<Long> getAuthenticatedUserId() {
		return Optional.ofNullable(securityUtils.getCurrentUserId());
	}
}
