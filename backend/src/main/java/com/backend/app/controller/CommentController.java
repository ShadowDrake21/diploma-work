package com.backend.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.CommentDTO;
import com.backend.app.dto.CreateCommentDTO;
import com.backend.app.security.SecurityUtils;
import com.backend.app.service.CommentService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

	@Autowired
	private CommentService commentService;
	
	@Autowired
    private SecurityUtils securityUtils;

	
	@GetMapping("/project/{projectId}")
	public ResponseEntity<List<CommentDTO>> getCommentsByProjectId(@PathVariable UUID projectId) {
		List<CommentDTO> comments = commentService.getCommentsByProjectId(projectId);
		return ResponseEntity.ok(comments);
	}
	
	@PostMapping
	public ResponseEntity<CommentDTO> createComment(@RequestBody CreateCommentDTO createCommentDTO) {
		 Long userId = securityUtils.getCurrentUserId();
	        if (userId == null) {
	            return ResponseEntity.status(401).build();
	        }
		CommentDTO commentDTO = commentService.createComment(createCommentDTO, userId);
		return  ResponseEntity.ok(commentDTO);
	}
	
	@PutMapping("/{commentId}") 
	public ResponseEntity<CommentDTO> updateComment(
			@PathVariable UUID commentId, @RequestBody String content) {
		 Long userId = securityUtils.getCurrentUserId();
	        if (userId == null) {
	            return ResponseEntity.status(401).build();
	        }
		CommentDTO commentDTO = commentService.updateComment(commentId, content, userId);
		return ResponseEntity.ok(commentDTO);
	}
	
	@DeleteMapping("/{commentId}") 
	public ResponseEntity<Void> deleteComment(
			@PathVariable UUID commentId) {
		 Long userId = securityUtils.getCurrentUserId();
	        if (userId == null) {
	            return ResponseEntity.status(401).build();
	        }
		commentService.deleteComment(commentId, userId);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/{commentId}/like") 
	public ResponseEntity<CommentDTO> likeComment(
			@PathVariable UUID commentId) {
		CommentDTO commentDTO = commentService.likeComment(commentId);
		return ResponseEntity.ok(commentDTO);
	}
}
