package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
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
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.enums.ProjectType;
import com.backend.app.enums.Role;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.service.ProjectService;
import com.backend.app.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.core.Authentication;

public class ProjectControllerTest {
	private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private ProjectService projectService;
    @Mock private ProjectMapper projectMapper;
    @Mock private UserService userService; 
    @InjectMocks private ProjectController projectController;
    
    private Project project;
    private ProjectDTO projectDTO;
    private ProjectResponse projectResponse;
    
    @BeforeEach
    void setUp() {
    	 MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(projectController) .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter()).build();
        
        User creator = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("creator")
                .password("password")
                .role(Role.USER)
                .build();
        
        project = Project.builder()
                .id(UUID.randomUUID())
                .type(ProjectType.PUBLICATION)
                .title("Test Project")
                .description("Test Description")
                .progress(50)
                .creator(creator)
                .build();
                
        projectDTO = ProjectDTO.builder()
                .id(project.getId())
                .type(project.getType())
                .title(project.getTitle())
                .description(project.getDescription())
                .progress(project.getProgress())
                .createdBy(creator.getId())
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
                .andExpect(jsonPath("$.data[0].title").value("Test Project"));
    }
    
    @Test
    void testGetProjectById() throws Exception {
        when(projectService.findProjectById(project.getId())).thenReturn(Optional.of(project));
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(get("/api/projects/" + project.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.id").value(project.getId().toString()))
        .andExpect(jsonPath("$.data.title").value("Test Project"));
    }
    
    @Test
    void testCreateProject() throws Exception {
    	Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@example.com");
        
        User mockUser = new User();
        mockUser.setId(1L);
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        
        when(projectService.createProject(any(), anyLong())).thenReturn(project);
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(post("/api/projects") .with(request -> {
            request.setUserPrincipal(auth);
            return request;
        })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testUpdateProject() throws Exception {
    	Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@example.com");
        
        User mockUser = new User();
        mockUser.setId(1L);
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(projectService.findProjectById(project.getId())).thenReturn(Optional.of(project));

        projectDTO.setCreatedBy(mockUser.getId());
        projectDTO.setType(ProjectType.PUBLICATION);
        
        when(projectService.updateProject(eq(project.getId()), any())).thenReturn(Optional.of(project));
        when(projectMapper.toDTO(project)).thenReturn(projectDTO);
        
        mockMvc.perform(put("/api/projects/" + project.getId())
        		.with(request -> {
                    request.setUserPrincipal(auth);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeleteProject() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@example.com");

        User mockUser = new User();
        mockUser.setId(1L);
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(projectService.findProjectById(project.getId())).thenReturn(Optional.of(project));
        doNothing().when(projectService).deleteProject(project.getId());
        
        mockMvc.perform(delete("/api/projects/" + project.getId())
        .with(request -> {
            request.setUserPrincipal(auth);
            return request;
        }))
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
                .andExpect(jsonPath("$.data[0].title").value("Test Project"));
    }
}
