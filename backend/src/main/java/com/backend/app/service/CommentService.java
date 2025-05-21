package com.backend.app.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.dto.create.CreateCommentDTO;
import com.backend.app.dto.model.CommentDTO;
import com.backend.app.exception.AuthorizationException;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.model.Comment;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.User;
import com.backend.app.repository.CommentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
    
    public Page<Comment> findAllComments(Pageable pageable) {
		return commentRepository.findAll(pageable);
	}
    
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByProjectId(UUID projectId) {
    	return commentRepository.findByProjectIdAndParentCommentIsNull(projectId).stream().map(
    			this::mapCommentWithReplies).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CommentDTO> getRepliesForComment(UUID parentCommentId) {    	
    	return commentRepository.findRepliesByParentId(parentCommentId).stream().map(this::mapCommentWithReplies).collect(Collectors.toList());
    }
    
    @Transactional
    public CommentDTO createComment(CreateCommentDTO createCommentDTO, Long userId) {
    	Project project = projectRepository.findById(createCommentDTO.getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    	
    	User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    	
    	Comment comment = Comment.builder().content(createCommentDTO.getContent())
                .project(project)
                .user(user)
                .build();
    	
    	if(createCommentDTO.getParentCommentId() != null) {
    		Comment parentComment = commentRepository.findById(createCommentDTO.getParentCommentId())
    				.orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
    		
    		if (parentComment.getUser().getId().equals(userId)) {
                throw new BusinessRuleException("Self-replies are not allowed. Edit your comment instead.");}
    		
    		comment.setParentComment(parentComment);
    	}
    	return commentMapper.toDTO(commentRepository.save(comment));
    }
    
    @Transactional
    public CommentDTO updateComment(UUID commentId, String content, Long userId) {
    	Comment comment = getCommentAndValidateOwnership(commentId, userId);
    	comment.setContent(content);
    	return commentMapper.toDTO(commentRepository.save(comment));
    }
    
    @Transactional
    public void deleteComment(UUID commentId, Long userId) {
    	Comment comment = getCommentAndValidateOwnership(commentId, userId);

    	if(!comment.getReplies().isEmpty()) {
    		commentRepository.deleteAll(comment.getReplies());
    	}
    	
    	commentRepository.delete(comment);
    }
    
    @Transactional
    public CommentDTO likeComment(UUID commentId, Long userId) {
    	Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    	
    	if(comment.getUser().getId().equals(userId)) {
    		throw new BusinessRuleException("You cannot like your own comment");
    	}
    	
    	 if(comment.getLikedByUsers().contains(userId)) {
    	        throw new BusinessRuleException("You already liked this comment");
    	    }
    	
    	 comment.getLikedByUsers().add(userId);
    	comment.setLikes(comment.getLikes() + 1);
    	return commentMapper.toDTO(commentRepository.save(comment));
    }
    
    @Transactional
    public CommentDTO unlikeComment(UUID commentId, Long userId) {
    	Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    	
    	if(!comment.getLikedByUsers().contains(userId)) {
            throw new BusinessRuleException("You haven't liked this comment");
        }
    	

   	 comment.getLikedByUsers().remove(userId);
   	comment.setLikes(Math.max(0, comment.getLikes() - 1) );
    	return commentMapper.toDTO(commentRepository.save(comment));
    }
    
    private Comment getCommentAndValidateOwnership(UUID commentId, Long userId) {
    	Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    	
    	if(!comment.getUser().getId().equals(userId)) {
            throw new AuthorizationException("You can only modify your own comments");
    	}
    	
    	return comment;
    }
    
    private CommentDTO mapCommentWithReplies(Comment comment) {
    	CommentDTO dto = commentMapper.toDTO(comment);
    	dto.setReplies(getRepliesForComment(comment.getId()));
    	return dto;
    }
}
