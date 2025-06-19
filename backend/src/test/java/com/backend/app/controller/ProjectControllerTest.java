package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.enums.ProjectType;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.Project;
import com.backend.app.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ProjectControllerTest {
	private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private ProjectService projectService;
    @Mock private ProjectMapper projectMapper;
    
    @InjectMocks private ProjectController projectController;
    
    private Project project;
    private ProjectDTO projectDTO;
    private ProjectResponse projectResponse;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(projectController).build();
        
        project = Project.builder()
                .id(UUID.randomUUID())
                .type(ProjectType.PUBLICATION)
                .title("Test Project")
                .description("Test Description")
                .progress(50)
                .build();
                
        projectDTO = ProjectDTO.builder()
                .id(project.getId())
                .type(project.getType())
                .title(project.getTitle())
                .description(project.getDescription())
                .progress(project.getProgress())
                .build();
                
        projectResponse = ProjectResponse.builder()
                .id(project.getId())
                .type(project.getType())
                .title(project.getTitle())
                .description(project.getDescription())
                .progress(project.getProgress())
                .build();
    }
    
    @Test
    void testGetAllProjects() throws Exception {
        Page<Project> projectPage = new PageImpl<>(List.of(project), PageRequest.of(0, 10), 1);
        when(projectService.findAllProjects(any())).thenReturn(projectPage);
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Test Project"));
    }
    
    @Test
    void testGetProjectById() throws Exception {
        when(projectService.findProjectById(project.getId())).thenReturn(Optional.of(project));
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(get("/api/projects/" + project.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Project"));
    }
    
    @Test
    void testCreateProject() throws Exception {
        when(projectService.createProject(any(), anyLong())).thenReturn(project);
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testUpdateProject() throws Exception {
        when(projectService.updateProject(eq(project.getId()), any())).thenReturn(Optional.of(project));
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(put("/api/projects/" + project.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeleteProject() throws Exception {
        doNothing().when(projectService).deleteProject(project.getId());
        
        mockMvc.perform(delete("/api/projects/" + project.getId()))
                .andExpect(status().isNoContent());
    }
    
    @Test
    void testSearchProjects() throws Exception {
        Page<Project> projectPage = new PageImpl<>(List.of(project), PageRequest.of(0, 10), 1);
        when(projectService.searchProjects(any(), any())).thenReturn(projectPage);
        when(projectMapper.toResponse(project)).thenReturn(projectResponse);
        
        mockMvc.perform(get("/api/projects/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Test Project"));
    }
}
