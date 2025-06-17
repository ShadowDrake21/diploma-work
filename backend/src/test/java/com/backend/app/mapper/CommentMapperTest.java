package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.model.CommentDTO;
import com.backend.app.model.Comment;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.security.SecurityUtils;

@ExtendWith(MockitoExtension.class)
public class CommentMapperTest {
	@Mock
	private SecurityUtils securityUtils;
	
@InjectMocks 
private CommentMapper commentMapper;
    
    private Comment comment;
    private User user;
    private Project project;
    private Comment parentComment;
    
    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .avatarUrl("http://example.com/avatar.jpg")
                .build();
                
        project = Project.builder()
                .id(UUID.randomUUID())
                .title("Test Project")
                .build();
                
        parentComment = Comment.builder()
                .id(UUID.randomUUID())
                .build();
                
        comment = Comment.builder()
                .id(UUID.randomUUID())
                .content("Test comment")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .likes(5)
                .user(user)
                .project(project)
                .parentComment(parentComment)
                .likedByUsers(Set.of(1L, 2L))
                .build();
    }
    
    @Test
    void testToDTO() {
        when(securityUtils.getCurrentUserId()).thenReturn(1L); 
        // Current user liked the comment
        
        CommentDTO dto = commentMapper.toDTO(comment);
        
        assertEquals(comment.getId(), dto.getId());
        assertEquals(comment.getContent(), dto.getContent());
        assertEquals(comment.getCreatedAt(), dto.getCreatedAt());
        assertEquals(comment.getUpdatedAt(), dto.getUpdatedAt());
        assertEquals(comment.getLikes(), dto.getLikes());
        assertEquals(user.getId(), dto.getUserId());
        assertEquals(user.getUsername(), dto.getUserName());
        assertEquals(user.getAvatarUrl(), dto.getUserAvatarUrl());
        assertEquals(project.getId(), dto.getProjectId());
        assertEquals(project.getTitle(), dto.getProjectTitle());
        assertEquals(parentComment.getId(), dto.getParentCommentId());
        assertTrue(dto.isLikedByCurrentUser());
    }
    
    @Test
    void testToDTONotLiked() {
        when(securityUtils.getCurrentUserId()).thenReturn(3L); 
        // Current user didn't like the comment
        
        CommentDTO dto = commentMapper.toDTO(comment);
        assertFalse(dto.isLikedByCurrentUser());
    }
    
    @Test
    void testToDTONoCurrentUser() {
        when(securityUtils.getCurrentUserId()).thenReturn(null);
        
        CommentDTO dto = commentMapper.toDTO(comment);
        assertFalse(dto.isLikedByCurrentUser());
    }
    
    @Test
    void testToDTONoParentComment() {
        comment.setParentComment(null);
        when(securityUtils.getCurrentUserId()).thenReturn(1L);
        
        CommentDTO dto = commentMapper.toDTO(comment);
        assertNull(dto.getParentCommentId());
    }
}
