package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
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

import com.backend.app.dto.model.TagDTO;
import com.backend.app.service.TagService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class TagControllerTest {
	private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private TagService tagService;
    
    @InjectMocks private TagController tagController;
    
    private TagDTO tagDTO;
    private UUID tagId;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tagController).build();
        
        tagId = UUID.randomUUID();
        tagDTO = TagDTO.builder()
                .id(tagId)
                .name("Test Tag")
                .build();
    }
    
    @Test
    void testGetAllTags() throws Exception {
        when(tagService.findAllTags()).thenReturn(List.of(tagDTO));
        
        mockMvc.perform(get("/api/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Test Tag"));
    }
    
    @Test
    void testGetTagById() throws Exception {
        when(tagService.findTagById(tagId)).thenReturn(Optional.of(tagDTO));
        
        mockMvc.perform(get("/api/tags/" + tagId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Tag"));
    }
    
    @Test
    void testCreateTag() throws Exception {
        when(tagService.createTag(any())).thenReturn(tagDTO);
        
        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testUpdateTag() throws Exception {
        when(tagService.updateTag(eq(tagId), any())).thenReturn(Optional.of(tagDTO));
        
        mockMvc.perform(post("/api/tags/" + tagId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tagDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeleteTag() throws Exception {
        mockMvc.perform(delete("/api/tags/" + tagId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
