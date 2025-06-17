package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.model.UserDTO;
import com.backend.app.dto.model.UserLoginDTO;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.Project;
import com.backend.app.service.AdminService;
import com.backend.app.service.CommentService;
import com.backend.app.service.ProjectService;
import com.backend.app.service.UserLoginService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class AdminControllerTest {
	private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private AdminService adminService;
    @Mock private ProjectService projectService;
    @Mock private ProjectMapper projectMapper;
    @Mock private CommentService commentService;
    @Mock private CommentMapper commentMapper;
    @Mock private UserLoginService userLoginService;
    @Mock private Authentication authentication;
    
    @InjectMocks private AdminController controller;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }
    
    @Test
    void getAllUsers_shouldReturnPaginatedUsers() throws Exception {
        Page<UserDTO> userPage = new PageImpl<>(List.of(new UserDTO()), PageRequest.of(0, 10), 1);
        when(adminService.getAllUsers(any())).thenReturn(userPage);
        
        mockMvc.perform(get("/api/admin/users"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true))
               .andExpect(jsonPath("$.data.content.length()").value(1));
    }
    
    @Test
    void promoteToAdmin_shouldSuccessfullyPromote() throws Exception {
        UserDTO promotedUser = new UserDTO();
        when(adminService.promoteToAdmin(anyLong(), anyString())).thenReturn(promotedUser);
        when(authentication.getName()).thenReturn("admin@example.com");
        
        mockMvc.perform(post("/api/admin/users/1/promote")
               .principal(authentication))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void promoteToAdmin_shouldHandleAlreadyAdmin() throws Exception {
        when(adminService.promoteToAdmin(anyLong(), anyString()))
            .thenThrow(new BusinessRuleException("User is already admin"));
        when(authentication.getName()).thenReturn("admin@example.com");
        
        mockMvc.perform(post("/api/admin/users/1/promote")
               .principal(authentication))
               .andExpect(status().isBadRequest());
    }
    
    @Test
    void deleteUser_shouldReturnNoContent() throws Exception {
        doNothing().when(adminService).deleteUser(anyLong(), anyString());
        when(authentication.getName()).thenReturn("admin@example.com");
        
        mockMvc.perform(delete("/api/admin/users/1")
               .principal(authentication))
               .andExpect(status().isNoContent());
    }
    
    @Test
    void getAllProjects_shouldReturnPaginatedProjects() throws Exception {
        Page<Project> projectPage = new PageImpl<>(List.of(new Project()), PageRequest.of(0, 10), 1);
        when(projectService.findAllProjects(any())).thenReturn(projectPage);
        when(projectMapper.toResponse(any())).thenReturn(new ProjectResponse());
        
        mockMvc.perform(get("/api/admin/projects"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void deleteComment_shouldReturnNoContent() throws Exception {
        doNothing().when(adminService).deleteComment(any(), anyString());
        when(authentication.getName()).thenReturn("admin@example.com");
        
        mockMvc.perform(delete("/api/admin/comments/" + UUID.randomUUID())
               .principal(authentication))
               .andExpect(status().isNoContent());
    }
    
    @Test
    void getRecentLogins_shouldReturnLoginData() throws Exception {
        List<UserLoginDTO> logins = List.of(new UserLoginDTO());
        when(userLoginService.getRecentLogins(anyInt())).thenReturn(logins);
        
        mockMvc.perform(get("/api/admin/recent-logins"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.length()").value(1));
    }
}
