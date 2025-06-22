package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.create.CreatePublicationRequest;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.dto.request.UpdatePublicationRequest;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.mapper.UpdatePublicationRequestMapper;
import com.backend.app.model.Publication;
import com.backend.app.service.PublicationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

public class PublicationControllerTest {
	private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Mock private PublicationService publicationService;
    @Mock private PublicationMapper publicationMapper;
    @Mock private UpdatePublicationRequestMapper requestMapper;
    
    @InjectMocks private PublicationController publicationController;
    
    private UUID publicationId;
    private PublicationDTO publicationDTO;
    private CreatePublicationRequest createRequest;
    private UpdatePublicationRequest updateRequest;
    
    @BeforeEach
    void setUp() {
   	 MockitoAnnotations.openMocks(this);
   	 objectMapper = new ObjectMapper();
     objectMapper.registerModule(new JavaTimeModule());
     objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
     
     mockMvc = MockMvcBuilders.standaloneSetup(publicationController)
             .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
             .build();
        
        publicationId = UUID.randomUUID();
        
        publicationDTO = PublicationDTO.builder()
                .id(publicationId)
                .publicationDate(LocalDate.now())
                .publicationSource("Test Journal")
                .build();
                
        createRequest = CreatePublicationRequest.builder()
                .projectId(UUID.randomUUID())
                .publicationDate(LocalDate.now())
                .publicationSource("Test Journal")
                .build();
                
        updateRequest = UpdatePublicationRequest.builder()
                .publicationSource("Updated Journal")
                .build();
                
        when(requestMapper.toPublicationDTO(any(), any())).thenReturn(publicationDTO);
    }
    
    @Test
    void testGetAllPublications() throws Exception {
        when(publicationService.findAllPublications()).thenReturn(List.of(new Publication()));
        when(publicationMapper.toDTO(any())).thenReturn(publicationDTO);
        
        mockMvc.perform(get("/api/publications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].publicationSource").value("Test Journal"));
    }
    
    @Test
    void testGetPublicationById() throws Exception {
        when(publicationService.findPublicationById(publicationId)).thenReturn(publicationDTO);
        
        mockMvc.perform(get("/api/publications/" + publicationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.publicationSource").value("Test Journal"));
    }
    
//    @Test
//    void testCreatePublication() throws Exception {
//        CreatePublicationRequest request = CreatePublicationRequest.builder()
//                .projectId(UUID.randomUUID())
//                .publicationDate(LocalDate.of(2025, 6, 22))
//                .publicationSource("Test Journal")
//                .doiIsbn("DOI-123")
//                .startPage(1)
//                .endPage(10)
//                .journalVolume(5)
//                .issueNumber(3)
//                .build();
//
//        Publication createdPublication = new Publication();
//        createdPublication.setId(publicationId);
//        createdPublication.setPublicationSource(request.getPublicationSource());
//        createdPublication.setPublicationDate(request.getPublicationDate());
//        
//        when(publicationService.createPublication(any(CreatePublicationRequest.class)))
//            .thenReturn(createdPublication);
//        when(publicationMapper.toDTO(createdPublication))
//            .thenReturn(publicationDTO);
//
//        mockMvc.perform(post("/api/publications")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.success").value(true))
//                .andExpect(jsonPath("$.data.publicationSource").value("Test Journal"));
//    }

    
    @Test
    void testUpdatePublication() throws Exception {
        when(publicationService.updatePublication(eq(publicationId), any())).thenReturn(publicationDTO);
        
        mockMvc.perform(put("/api/publications/" + publicationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void testDeletePublication() throws Exception {
        mockMvc.perform(delete("/api/publications/" + publicationId))
                .andExpect(status().isNoContent());
    }
    
    @Test
    void testGetPublicationNotFound() throws Exception {
        when(publicationService.findPublicationById(publicationId))
            .thenThrow(new ResourceNotFoundException("Not found"));
            
        mockMvc.perform(get("/api/publications/" + publicationId))
                .andExpect(status().isNotFound());
    }
}
