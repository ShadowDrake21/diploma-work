package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class CommentTest {
	private Comment comment;
	private User user;
	private Project project;
	private final LocalDateTime now = LocalDateTime.now();
	
	 @BeforeEach
	    void setUp() {
	        user = User.builder().id(1L).username("testuser").build();
	        project = Project.builder().id(UUID.randomUUID()).title("Test Project").build();
	        
	        comment = Comment.builder()
	                .id(UUID.randomUUID())
	                .content("Test comment")
	                .createdAt(now)
	                .updatedAt(now)
	                .user(user)
	                .project(project)
	                .build();
	    }
	 
	 @Test
	    void testCommentCreation() {
	        assertNotNull(comment);
	        assertEquals("Test comment", comment.getContent());
	        assertEquals(now, comment.getCreatedAt());
	        assertEquals(now, comment.getUpdatedAt());
	        assertEquals(0, comment.getLikes());
	        assertEquals(user, comment.getUser());
	        assertEquals(project, comment.getProject());
	        assertNull(comment.getParentComment());
	        assertTrue(comment.getReplies().isEmpty());
	        assertTrue(comment.getLikedByUsers().isEmpty());
	    }
	    
	    @Test
	    void testAddReply() {
	        Comment reply = Comment.builder().content("Reply").build();
	        comment.addReply(reply);
	        
	        assertEquals(1, comment.getReplies().size());
	        assertEquals(comment, reply.getParentComment());
	    }
	    
	    @Test
	    void testRemoveReply() {
	        Comment reply = Comment.builder().content("Reply").build();
	        comment.addReply(reply);
	        comment.removeReply(reply);
	        
	        assertEquals(0, comment.getReplies().size());
	        assertNull(reply.getParentComment());
	    }
	    
	    
	    @Test
	    void testLikeIncrementDecrement() {
	        comment.incrementLikes();
	        assertEquals(1, comment.getLikes());
	        
	        comment.decrementLikes();
	        assertEquals(0, comment.getLikes());
	        
	        comment.decrementLikes();
	        assertEquals(0, comment.getLikes());
	    }
	    
	    @Test
	    void testUserLikeTracking() {
	        Long userId = 2L;
	        comment.getLikedByUsers().add(userId);
	        assertTrue(comment.getLikedByUsers().contains(userId));
	        
	        comment.getLikedByUsers().remove(userId);
	        assertFalse(comment.getLikedByUsers().contains(userId));
	    }
}
