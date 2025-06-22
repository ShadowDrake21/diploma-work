package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.create.CreateCommentDTO;
import com.backend.app.dto.model.CommentDTO;
import com.backend.app.security.SecurityUtils;
import com.backend.app.service.CommentService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class CommentControllerTest {
	private MockMvc mockMvc;
	private ObjectMapper objectMapper = new ObjectMapper();

	@Mock
	private CommentService commentService;
	@Mock
	private SecurityUtils securityUtils;

	@InjectMocks
	private CommentController commentController;

	private CommentDTO commentDTO;
	private CreateCommentDTO createCommentDTO;
	private final Long userId = 1L;
	private final UUID commentId = UUID.randomUUID();
	private final UUID projectId = UUID.randomUUID();
	
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(commentController).build();
        
        commentDTO = CommentDTO.builder()
                .id(commentId)
                .content("Test comment")
                .userId(userId)
                .build();
                
        createCommentDTO = CreateCommentDTO.builder()
                .content("Test comment")
                .projectId(projectId)
                .build();
    }
    
    @Test
    void testGetCommentsByProjectId() throws Exception {
        when(commentService.getCommentsByProjectId(projectId)).thenReturn(List.of(commentDTO));
        
        mockMvc.perform(get("/api/comments/project/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(commentId.toString()));
    }
    
    @Test
    void testCreateComment() throws Exception {
        when(securityUtils.getCurrentUserId()).thenReturn(userId);
        when(commentService.createComment(any(), eq(userId))).thenReturn(commentDTO);
        
        mockMvc.perform(post("/api/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createCommentDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(commentId.toString()));
    }
    
    @Test
    void testCreateCommentUnauthorized() throws Exception {
        when(securityUtils.getCurrentUserId()).thenReturn(null);
        
        mockMvc.perform(post("/api/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createCommentDTO)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));    }
    
    @Test
    void testUpdateComment() throws Exception {
        when(securityUtils.getCurrentUserId()).thenReturn(userId);
        when(commentService.updateComment(eq(commentId), anyString(), eq(userId)))
            .thenReturn(commentDTO);
        
        mockMvc.perform(put("/api/comments/" + commentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"Updated content\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeleteComment() throws Exception {
        when(securityUtils.getCurrentUserId()).thenReturn(userId);
        
        mockMvc.perform(delete("/api/comments/" + commentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testLikeComment() throws Exception {
        when(securityUtils.getCurrentUserId()).thenReturn(userId);
        when(commentService.likeComment(commentId, userId)).thenReturn(commentDTO);
        
        mockMvc.perform(post("/api/comments/" + commentId + "/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testUnlikeComment() throws Exception {
        when(securityUtils.getCurrentUserId()).thenReturn(userId);
        when(commentService.unlikeComment(commentId, userId)).thenReturn(commentDTO);
        
        mockMvc.perform(delete("/api/comments/" + commentId + "/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
