package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.backend.app.model.Comment;
import com.backend.app.model.Project;
import com.backend.app.model.User;

@DataJpaTest
public class CommentRepositoryTest {
	@Autowired
	private CommentRepository commentRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Test
    void testFindByProjectIdAndParentCommentIsNull() {
        User user = userRepository.save(User.builder().username("testuser").build());
        Project project = projectRepository.save(Project.builder().title("Test Project").build());
        
        Comment parentComment = commentRepository.save(
            Comment.builder()
                .content("Parent comment")
                .user(user)
                .project(project)
                .build()
        );
        
        commentRepository.save(
            Comment.builder()
                .content("Reply comment")
                .user(user)
                .project(project)
                .parentComment(parentComment)
                .build()
        );
        
        List<Comment> result = commentRepository.findByProjectIdAndParentCommentIsNull(project.getId());
        
        assertEquals(1, result.size());
        assertEquals("Parent comment", result.get(0).getContent());
    }
	
	@Test
    void testFindRepliesByParentId() {
        User user = userRepository.save(User.builder().username("testuser").build());
        Project project = projectRepository.save(Project.builder().title("Test Project").build());
        
        Comment parentComment = commentRepository.save(
            Comment.builder()
                .content("Parent comment")
                .user(user)
                .project(project)
                .build()
        );
        
        Comment reply = commentRepository.save(
            Comment.builder()
                .content("Reply comment")
                .user(user)
                .project(project)
                .parentComment(parentComment)
                .build()
        );
        
        List<Comment> result = commentRepository.findRepliesByParentId(parentComment.getId());
        
        assertEquals(1, result.size());
        assertEquals("Reply comment", result.get(0).getContent());
    }
	
	 @Test
	    void testCountByProjectId() {
	        User user = userRepository.save(User.builder().username("testuser").build());
	        Project project = projectRepository.save(Project.builder().title("Test Project").build());
	        
	        commentRepository.save(
	            Comment.builder()
	                .content("Comment 1")
	                .user(user)
	                .project(project)
	                .build()
	        );
	        
	        commentRepository.save(
	            Comment.builder()
	                .content("Comment 2")
	                .user(user)
	                .project(project)
	                .build()
	        );
	        
	        long count = commentRepository.countByProjectId(project.getId());
	        assertEquals(2, count);
	    }
}
