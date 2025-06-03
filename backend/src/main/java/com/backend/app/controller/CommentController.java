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

import com.backend.app.controller.codes.CommentCodes;
import com.backend.app.controller.messages.CommentMessages;
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
		 try {
	            List<CommentDTO> comments = commentService.getCommentsByProjectId(projectId);
	            return ResponseEntity.ok(ApiResponse.success(
	                comments,
	                CommentMessages.getMessage(CommentCodes.COMMENTS_FETCHED),CommentCodes.COMMENTS_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Project not found: {}", projectId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.PROJECT_NOT_FOUND),
	                    CommentCodes.PROJECT_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching comments for project: {}", projectId, e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
	                    CommentCodes.SERVER_ERROR));
	        }
	}
	
	@GetMapping("/user/{userId}")
	public ResponseEntity<PaginatedResponse<CommentDTO>> getCommentsByUserId( @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
		 try {
	            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
	            Page<CommentDTO> comments = commentService.getCommentsByUserId(userId, pageable);
	            return ResponseEntity.ok(PaginatedResponse.success(
	                comments,
	                CommentMessages.getMessage(CommentCodes.USER_COMMENTS_FETCHED),CommentCodes.USER_COMMENTS_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("User not found: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(PaginatedResponse.error(
	                    CommentMessages.getMessage(CommentCodes.USER_NOT_FOUND),
	                    CommentCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching comments for user: {}", userId, e);
	            return ResponseEntity.internalServerError()
	                .body(PaginatedResponse.error(
	                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
	                    CommentCodes.SERVER_ERROR));
	        }
	}

	@PostMapping
	public ResponseEntity<ApiResponse<CommentDTO>> createComment(@RequestBody CreateCommentDTO createCommentDTO) {
	        try {
	        	Long userId = getAuthenticatedUserId()
	    	            .orElseThrow(() -> new UnauthorizedException(CommentMessages.getMessage(CommentCodes.AUTH_REQUIRED)));
	            CommentDTO commentDTO = commentService.createComment(createCommentDTO, userId);
	            return ResponseEntity.ok(ApiResponse.success(
	                commentDTO,
	                CommentMessages.getMessage(CommentCodes.COMMENT_CREATED),CommentCodes.COMMENT_CREATED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Resource not found while creating comment: {}", e.getMessage());
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(
	                    e.getMessage(),
	                    CommentCodes.RESOURCE_NOT_FOUND));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation while creating comment: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                .body(ApiResponse.error(
	                    e.getMessage(),
	                    CommentCodes.BUSINESS_RULE_VIOLATION));
	        } catch (Exception e) {
	            log.error("Error creating comment: ", e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
	                    CommentCodes.SERVER_ERROR));
	        }
	}

	@PutMapping("/{commentId}")
	public ResponseEntity<ApiResponse<CommentDTO>> updateComment(@PathVariable UUID commentId,
			@RequestBody String content) {

	        try {
	        	Long userId = getAuthenticatedUserId()
	        			.orElseThrow(() -> new UnauthorizedException(CommentMessages.getMessage(CommentCodes.AUTH_REQUIRED)));
	            CommentDTO commentDTO = commentService.updateComment(commentId, content, userId);
	            return ResponseEntity.ok(ApiResponse.success(
	                commentDTO,
	                CommentMessages.getMessage(CommentCodes.COMMENT_UPDATED),CommentCodes.COMMENT_UPDATED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Comment not found for update: {}", commentId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.COMMENT_NOT_FOUND),
	                    CommentCodes.COMMENT_NOT_FOUND));
	        } catch (UnauthorizedException e) {
	            log.warn("Unauthorized update attempt on comment: {}", commentId);
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.ACCESS_DENIED),
	                    CommentCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error updating comment: {}", commentId, e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
	                    CommentCodes.SERVER_ERROR));
	        }
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable UUID commentId) {

		        try {
		        	Long userId = getAuthenticatedUserId()
		        			.orElseThrow(() -> new UnauthorizedException(CommentMessages.getMessage(CommentCodes.AUTH_REQUIRED)));
		            commentService.deleteComment(commentId, userId);
		            return ResponseEntity.ok(ApiResponse.success(
		                null,
		                CommentMessages.getMessage(CommentCodes.COMMENT_DELETED),CommentCodes.COMMENT_DELETED));
		        } catch (ResourceNotFoundException e) {
		            log.warn("Comment not found for deletion: {}", commentId);
		            return ResponseEntity.status(HttpStatus.NOT_FOUND)
		                .body(ApiResponse.error(
		                    CommentMessages.getMessage(CommentCodes.COMMENT_NOT_FOUND),
		                    CommentCodes.COMMENT_NOT_FOUND));
		        } catch (UnauthorizedException e) {
		            log.warn("Unauthorized deletion attempt on comment: {}", commentId);
		            return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                .body(ApiResponse.error(
		                    CommentMessages.getMessage(CommentCodes.ACCESS_DENIED),
		                    CommentCodes.ACCESS_DENIED));
		        } catch (Exception e) {
		            log.error("Error deleting comment: {}", commentId, e);
		            return ResponseEntity.internalServerError()
		                .body(ApiResponse.error(
		                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
		                    CommentCodes.SERVER_ERROR));
		        }
	}

	@PostMapping("/{commentId}/like")
	public ResponseEntity<ApiResponse<CommentDTO>> likeComment(@PathVariable UUID commentId) {

		        try {
		        	Long userId = getAuthenticatedUserId()
		        			.orElseThrow(() -> new UnauthorizedException(CommentMessages.getMessage(CommentCodes.AUTH_REQUIRED)));
		            CommentDTO commentDTO = commentService.likeComment(commentId, userId);
		            return ResponseEntity.ok(ApiResponse.success(
		                commentDTO,
		                CommentMessages.getMessage(CommentCodes.COMMENT_LIKED),CommentCodes.COMMENT_LIKED));
		        } catch (ResourceNotFoundException e) {
		            log.warn("Comment not found for like: {}", commentId);
		            return ResponseEntity.status(HttpStatus.NOT_FOUND)
		                .body(ApiResponse.error(
		                    CommentMessages.getMessage(CommentCodes.COMMENT_NOT_FOUND),
		                    CommentCodes.COMMENT_NOT_FOUND));
		        } catch (BusinessRuleException e) {
		            log.warn("Business rule violation while liking comment: {}", e.getMessage());
		            return ResponseEntity.badRequest()
		                .body(ApiResponse.error(
		                    e.getMessage(),
		                    CommentCodes.BUSINESS_RULE_VIOLATION));
		        } catch (Exception e) {
		            log.error("Error liking comment: {}", commentId, e);
		            return ResponseEntity.internalServerError()
		                .body(ApiResponse.error(
		                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
		                    CommentCodes.SERVER_ERROR));
		        }
	}
	
	@DeleteMapping("/{commentId}/like")
	public ResponseEntity<ApiResponse<CommentDTO>> removeLike(@PathVariable UUID commentId) {

	        try {
	        	Long userId = getAuthenticatedUserId()
	        			.orElseThrow(() -> new UnauthorizedException(CommentMessages.getMessage(CommentCodes.AUTH_REQUIRED)));
	            CommentDTO commentDTO = commentService.unlikeComment(commentId, userId);
	            return ResponseEntity.ok(ApiResponse.success(
	                commentDTO,
	                CommentMessages.getMessage(CommentCodes.COMMENT_UNLIKED),CommentCodes.COMMENT_UNLIKED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Comment not found for unlike: {}", commentId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.COMMENT_NOT_FOUND),
	                    CommentCodes.COMMENT_NOT_FOUND));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation while unliking comment: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                .body(ApiResponse.error(
	                    e.getMessage(),
	                    CommentCodes.BUSINESS_RULE_VIOLATION));
	        } catch (Exception e) {
	            log.error("Error unliking comment: {}", commentId, e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    CommentMessages.getMessage(CommentCodes.SERVER_ERROR),
	                    CommentCodes.SERVER_ERROR));
	        }
	}

	private Optional<Long> getAuthenticatedUserId() {
		return Optional.ofNullable(securityUtils.getCurrentUserId());
	}
}
