package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.model.UserDTO;
import com.backend.app.enums.Role;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.User;
import com.backend.app.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {
	private MockMvc mockMvc;
	private ObjectMapper objectMapper = new ObjectMapper();
	
	@Mock
    private UserService userService;
	
	@Mock
    private UserMapper userMapper;
    
    @InjectMocks
    private UserController userController;
    
    private UserDTO userDTO;
    private Authentication authentication;
    
    @BeforeEach
    void setUp() {
    	mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    	 userDTO = UserDTO.builder()
                 .id(1L)
                 .username("testuser")
                 .email("test@example.com")
                 .role(Role.USER)
                 .build();
    	 
    	 authentication = new UsernamePasswordAuthenticationToken("test@example.com", "password");
    	 SecurityContextHolder.getContext().setAuthentication(authentication);
    	 }
    
    @Test
    void testGetAllUsers() throws Exception {
        Page<UserDTO> page = new PageImpl<>(List.of(userDTO), PageRequest.of(0, 10), 1);
        when(userService.getAllUsers(any())).thenReturn(page);
        
        mockMvc.perform(get("/api/users")).andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.content[0].username").value("testuser"));
        
verify(userService).getAllUsers(any());
        }
    
    @Test
    void testGetUserById() throws Exception {
        when(userService.getUserById(1L)).thenReturn(userDTO);
        
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testuser"));
        
        verify(userService).getBasicUserInfo(1L);
    }
    
    @Test
    void testGetUserByIdNotFound() throws Exception {
        when(userService.getUserById(1L)).thenThrow(new ResourceNotFoundException("User not found"));
        
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
        
        verify(userService).getBasicUserInfo(1L);
    }
    
    @Test
    void testGetCurrentUser() throws Exception {
        when(userService.getCurrentUser("test@example.com")).thenReturn(userDTO);
        
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testuser"));
        
        verify(userService).getCurrentUser("test@example.com");
    }
    
    @Test
    void testCreateUser() throws Exception {
        when(userService.saveUser(any())).thenReturn(userDTO);
        
        mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.username").value("testuser"));
        
        verify(userService).saveUser(any());
    }
    
    @Test
    void testGetUsersByRole() throws Exception {
        when(userService.getUsersByRole(Role.USER)).thenReturn(List.of(userDTO));
        
        mockMvc.perform(get("/api/users/role/USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].username").value("testuser"));
        
        verify(userService).getUsersByRole(Role.USER);
    }
    
    @Test
    void testSearchUsers() throws Exception {
        Page<UserDTO> page = new PageImpl<>(List.of(userDTO), PageRequest.of(0, 10), 1);
        when(userService.searchUsers(anyString(), any())).thenReturn(page);
        
        mockMvc.perform(get("/api/users/search?query=test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].username").value("testuser"));
        
        verify(userService).searchUsers("test", any());
    }
    
    @Test
    void testDeleteUser() throws Exception {
    	doNothing().when(userService).deleteUser(1L);
		
		mockMvc.perform(delete("/api/users/1"))
				.andExpect(status().isNoContent());
		
		verify(userService).deleteUser(1L);
    }
    
    @Test
    void testUpdateUserProfile() throws Exception {
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(new User()));
        when(userService.updateUserProfile(anyLong(), any())).thenReturn(userDTO);
        
        mockMvc.perform(patch("/api/users/me/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userType\":\"STUDENT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        
        verify(userService).updateUserProfile(anyLong(), any());
    }
    
    @Test
    void testGetRecentlyActiveUsers() throws Exception {
        when(userService.findRecentlyActiveUsers(any(), anyInt())).thenReturn(Collections.singletonList(new User()));
        when(userMapper.mapToDTO(any())).thenReturn(userDTO);
        
        mockMvc.perform(get("/api/users/recent-active-users"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].username").value("testuser"));
        
        verify(userService).findRecentlyActiveUsers(any(), anyInt());
    }
}
