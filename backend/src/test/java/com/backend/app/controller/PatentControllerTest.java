package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.create.CreatePatentRequest;
import com.backend.app.dto.model.PatentDTO;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.model.Patent;
import com.backend.app.service.PatentService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class PatentControllerTest {
	private MockMvc mockMvc;
	private ObjectMapper objectMapper = new ObjectMapper();

	@Mock
	private PatentService patentService;
	@Mock
	private PatentMapper patentMapper;

	@InjectMocks
	private PatentController patentController;

	private Patent patent;
	private PatentDTO patentDTO;
	private CreatePatentRequest request;
	private final UUID patentId = UUID.randomUUID();
	
	@BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patentController).build();
        
        patent = Patent.builder().id(patentId).build();
        patentDTO = PatentDTO.builder().id(patentId).build();
        
        request = CreatePatentRequest.builder()
                .projectId(UUID.randomUUID())
                .primaryAuthorId(1L)
                .registrationNumber("US123456")
                .build();
    }
    
    @Test
    void testGetAllPatents() throws Exception {
        when(patentService.findAllPatents()).thenReturn(List.of(patent));
        when(patentMapper.toDTO(patent)).thenReturn(patentDTO);
        
        mockMvc.perform(get("/api/patents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(patentId.toString()));
    }
    
    @Test
    void testGetPatentById() throws Exception {
        when(patentService.findPatentById(patentId)).thenReturn(Optional.of(patent));
        when(patentMapper.toDTO(patent)).thenReturn(patentDTO);
        
        mockMvc.perform(get("/api/patents/" + patentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(patentId.toString()));
    }
    
    @Test
    void testGetPatentByIdNotFound() throws Exception {
        when(patentService.findPatentById(patentId)).thenReturn(Optional.empty());
        
        mockMvc.perform(get("/api/patents/" + patentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
    
    @Test
    void testCreatePatent() throws Exception {
        when(patentService.createPatent(any())).thenReturn(patent);
        when(patentMapper.toDTO(patent)).thenReturn(patentDTO);
        
        mockMvc.perform(post("/api/patents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testUpdatePatent() throws Exception {
        when(patentService.updatePatent(eq(patentId), any())).thenReturn(Optional.of(patent));
        when(patentMapper.toDTO(patent)).thenReturn(patentDTO);
        when(patentMapper.toEntity(any())).thenReturn(patent);
        
        mockMvc.perform(put("/api/patents/" + patentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patentDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeletePatent() throws Exception {
        doNothing().when(patentService).deletePatent(patentId);
        
        mockMvc.perform(delete("/api/patents/" + patentId))
                .andExpect(status().isNoContent());
    }
}
