package com.backend.app.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.dto.CommentDTO;
import com.backend.app.dto.CreateCommentDTO;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.model.Comment;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.CommentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;


@Service
public class CommentService {
	@Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentMapper commentMapper;
    
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByProjectId(UUID projectId) {
    	List<Comment> comments = commentRepository.findByProjectIdAndParentCommentIsNull(projectId);
    	return comments.stream().map(comment -> {
    			CommentDTO dto = commentMapper.toDTO(comment);
    			dto.setReplies(getRepliesForComment(comment.getId()));
    			return dto;
    	}).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CommentDTO> getRepliesForComment(UUID parentCommentId) {
    	List<Comment> replies = commentRepository.findRepliesByParentId(parentCommentId);
    	
    	return replies.stream().map(comment -> {
    		CommentDTO dto = commentMapper.toDTO(comment);
    		dto.setReplies(getRepliesForComment(comment.getId()));
    		return dto;
    	}).collect(Collectors.toList());
    }
    
    @Transactional
    public CommentDTO createComment(CreateCommentDTO createCommentDTO, Long userId) {
    	Project project = projectRepository.findById(createCommentDTO.getProjectId()).orElseThrow(() -> new EntityNotFoundException("Project not found"));
    	
    	User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
    	
    	Comment comment = new Comment();
    	comment.setContent(createCommentDTO.getContent());
    	comment.setProject(project);
    	comment.setUser(user);
    	
    	if(createCommentDTO.getParentCommentId() != null) {
    		Comment parentCommntComment = commentRepository.findById(createCommentDTO.getParentCommentId())
    				.orElseThrow(() -> new EntityNotFoundException("Parent comment not found"));
    		
    		comment.setParentComment(parentCommntComment);
    	}
    	
    	Comment savedComment = commentRepository.save(comment);
    	return commentMapper.toDTO(savedComment);
    }
    
    @Transactional
    public CommentDTO updateComment(UUID commentId, String content, Long userId) {
    	Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment not found"));
    	
    	if(!comment.getUser().getId().equals(userId)) {
    		throw new SecurityException("You can only update your own comments");
    	}
    	
    	comment.setContent(content);
    	Comment updatedComment = commentRepository.save(comment);
    	return commentMapper.toDTO(updatedComment);
    }
    
    @Transactional
    public void deleteComment(UUID commentId, Long userId) {
    	Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment not found"));
    	
    	if(!comment.getUser().getId().equals(userId)) {
    		throw new SecurityException("You can only delete your own comments");
    	}
    	
    	if(!comment.getReplies().isEmpty()) {
    		commentRepository.deleteAll(comment.getReplies());
    	}
    	
    	commentRepository.delete(comment);
    }
    
    @Transactional
    public CommentDTO likeComment(UUID commentId) {
    	Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment not found"));
    	
    	comment.setLikes(comment.getLikes() + 1);
    	Comment updatedComment = commentRepository.save(comment);
    	return commentMapper.toDTO(updatedComment);
    }
}
