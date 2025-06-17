package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.create.CreateCommentDTO;
import com.backend.app.dto.model.CommentDTO;
import com.backend.app.exception.AuthorizationException;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.model.Comment;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.CommentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {
	@Mock
	private CommentRepository commentRepository;
	@Mock
	private ProjectRepository projectRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private CommentMapper commentMapper;

	@InjectMocks
	private CommentService commentService;

	private User user;
	private Project project;
	private Comment comment;
	private Comment parentComment;
	private CreateCommentDTO createCommentDTO;
	
	@BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("testuser").build();
        project = Project.builder().id(UUID.randomUUID()).title("Test Project").build();
        comment = Comment.builder()
                .id(UUID.randomUUID())
                .content("Test comment")
                .user(user)
                .project(project)
                .build();
        
        parentComment = Comment.builder()
                .id(UUID.randomUUID())
                .content("Parent comment")
                .user(User.builder().id(2L).build()) // Different user
                .project(project)
                .build();
                
        createCommentDTO = CreateCommentDTO.builder()
                .content("Test comment")
                .projectId(project.getId())
                .build();
    }
	
	@Test
    void testGetCommentsByProjectId() {
        when(commentRepository.findByProjectIdAndParentCommentIsNull(project.getId()))
            .thenReturn(List.of(comment));
        when(commentMapper.toDTO(comment)).thenReturn(new CommentDTO());
        
        List<CommentDTO> result = commentService.getCommentsByProjectId(project.getId());
        
        assertEquals(1, result.size());
        verify(commentRepository).findByProjectIdAndParentCommentIsNull(project.getId());
    }
    
    @Test
    void testCreateComment() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(commentRepository.save(any())).thenReturn(comment);
        when(commentMapper.toDTO(comment)).thenReturn(new CommentDTO());
        
        CommentDTO result = commentService.createComment(createCommentDTO, user.getId());
        
        assertNotNull(result);
        verify(commentRepository).save(any());
    }
    
    @Test
    void testCreateReplyComment() {
        createCommentDTO.setParentCommentId(parentComment.getId());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(commentRepository.findById(parentComment.getId())).thenReturn(Optional.of(parentComment));
        when(commentRepository.save(any())).thenReturn(comment);
        when(commentMapper.toDTO(comment)).thenReturn(new CommentDTO());
        
        CommentDTO result = commentService.createComment(createCommentDTO, user.getId());
        
        assertNotNull(result);
        assertEquals(parentComment.getId(), comment.getParentComment().getId());
    }
    
    @Test
    void testCreateReplyCommentSelfReply() {
        createCommentDTO.setParentCommentId(parentComment.getId());
        parentComment.setUser(user); // Same user
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(commentRepository.findById(parentComment.getId())).thenReturn(Optional.of(parentComment));
        
        assertThrows(BusinessRuleException.class, () -> {
            commentService.createComment(createCommentDTO, user.getId());
        });
    }
    
    @Test
    void testUpdateComment() {
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        when(commentRepository.save(comment)).thenReturn(comment);
        when(commentMapper.toDTO(comment)).thenReturn(new CommentDTO());
        
        CommentDTO result = commentService.updateComment(comment.getId(), "Updated content", user.getId());
        
        assertNotNull(result);
        assertEquals("Updated content", comment.getContent());
    }
    
    @Test
    void testUpdateCommentUnauthorized() {
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        
        assertThrows(AuthorizationException.class, () -> {
            commentService.updateComment(comment.getId(), "Updated content", 999L); // Different user
        });
    }
    
    @Test
    void testDeleteComment() {
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        
        commentService.deleteComment(comment.getId(), user.getId());
        
        verify(commentRepository).delete(comment);
    }
    
    @Test
    void testLikeComment() {
        Comment commentToLike = Comment.builder()
                .id(UUID.randomUUID())
                .user(User.builder().id(2L).build()) // Different user
                .build();
                
        when(commentRepository.findById(commentToLike.getId())).thenReturn(Optional.of(commentToLike));
        when(commentRepository.save(commentToLike)).thenReturn(commentToLike);
        when(commentMapper.toDTO(commentToLike)).thenReturn(new CommentDTO());
        
        CommentDTO result = commentService.likeComment(commentToLike.getId(), user.getId());
        
        assertNotNull(result);
        assertEquals(1, commentToLike.getLikes());
        assertTrue(commentToLike.getLikedByUsers().contains(user.getId()));
    }
    
    @Test
    void testLikeOwnComment() {
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        
        assertThrows(BusinessRuleException.class, () -> {
            commentService.likeComment(comment.getId(), user.getId());
        });
    }
    
    @Test
    void testDuplicateLike() {
        Comment commentToLike = Comment.builder()
                .id(UUID.randomUUID())
                .user(User.builder().id(2L).build()) // Different user
                .likedByUsers(new HashSet<>(Set.of(user.getId()))) // Already liked
                .build();
                
        when(commentRepository.findById(commentToLike.getId())).thenReturn(Optional.of(commentToLike));
        
        assertThrows(BusinessRuleException.class, () -> {
            commentService.likeComment(commentToLike.getId(), user.getId());
        });
    }
    
    @Test
    void testUnlikeComment() {
        Comment commentToUnlike = Comment.builder()
                .id(UUID.randomUUID())
                .user(User.builder().id(2L).build()) // Different user
                .likes(1)
                .likedByUsers(new HashSet<>(Set.of(user.getId()))) // Already liked
                .build();
                
        when(commentRepository.findById(commentToUnlike.getId())).thenReturn(Optional.of(commentToUnlike));
        when(commentRepository.save(commentToUnlike)).thenReturn(commentToUnlike);
        when(commentMapper.toDTO(commentToUnlike)).thenReturn(new CommentDTO());
        
        CommentDTO result = commentService.unlikeComment(commentToUnlike.getId(), user.getId());
        
        assertNotNull(result);
        assertEquals(0, commentToUnlike.getLikes());
        assertFalse(commentToUnlike.getLikedByUsers().contains(user.getId()));
    }
    
    @Test
    void testUnlikeNotLikedComment() {
        Comment commentToUnlike = Comment.builder()
                .id(UUID.randomUUID())
                .user(User.builder().id(2L).build()) // Different user
                .likes(1)
                .likedByUsers(new HashSet<>()) // Not liked
                .build();
                
        when(commentRepository.findById(commentToUnlike.getId())).thenReturn(Optional.of(commentToUnlike));
        
        assertThrows(BusinessRuleException.class, () -> {
            commentService.unlikeComment(commentToUnlike.getId(), user.getId());
        });
    }
}
