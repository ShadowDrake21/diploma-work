package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
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

import com.backend.app.dto.create.CreateResearchRequest;
import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Research;
import com.backend.app.service.ResearchService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class ResearchController {
	private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private ResearchService researchService;
    @Mock private ResearchMapper researchMapper;
    
    @InjectMocks private ResearchController researchController;
    
    private Research research;
    private ResearchDTO researchDTO;
    private CreateResearchRequest createRequest;
    private UUID researchId;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(researchController).build();
        
        researchId = UUID.randomUUID();
        research = Research.builder()
                .id(researchId)
                .budget(new BigDecimal("100000.00"))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .status("Active")
                .fundingSource("NSF")
                .build();
                
        researchDTO = ResearchDTO.builder()
                .id(researchId)
                .budget(research.getBudget())
                .startDate(research.getStartDate())
                .endDate(research.getEndDate())
                .status(research.getStatus())
                .fundingSource(research.getFundingSource())
                .build();
                
        createRequest = CreateResearchRequest.builder()
                .budget(research.getBudget())
                .startDate(research.getStartDate())
                .endDate(research.getEndDate())
                .status(research.getStatus())
                .fundingSource(research.getFundingSource())
                .build();
    }
    
    @Test
    void testGetAllResearches() throws Exception {
        when(researchService.findAllResearches()).thenReturn(List.of(research));
        when(researchMapper.toDTO(research)).thenReturn(researchDTO);
        
        mockMvc.perform(get("/api/researches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(researchId.toString()));
    }
    
    @Test
    void testGetResearchById() throws Exception {
        when(researchService.findResearchById(researchId)).thenReturn(Optional.of(research));
        when(researchMapper.toDTO(research)).thenReturn(researchDTO);
        
        mockMvc.perform(get("/api/researches/" + researchId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(researchId.toString()));
    }
    
    @Test
    void testGetResearchByIdNotFound() throws Exception {
        when(researchService.findResearchById(researchId)).thenReturn(Optional.empty());
        
        mockMvc.perform(get("/api/researches/" + researchId))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void testCreateResearch() throws Exception {
        when(researchService.createResearch(any())).thenReturn(research);
        when(researchMapper.toDTO(research)).thenReturn(researchDTO);
        
        mockMvc.perform(post("/api/researches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testUpdateResearch() throws Exception {
        when(researchService.updateResearch(eq(researchId), any())).thenReturn(researchDTO);
        
        mockMvc.perform(put("/api/researches/" + researchId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(researchDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeleteResearch() throws Exception {
        mockMvc.perform(delete("/api/researches/" + researchId))
                .andExpect(status().isNoContent());
    }
}
