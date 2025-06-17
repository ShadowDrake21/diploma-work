package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import com.backend.app.dto.create.CreateResearchRequest;
import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.ResearchRepository;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityManager;

@ExtendWith(MockitoExtension.class)
public class ResearchServiceTest {
	@Mock private ResearchRepository researchRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private ResearchMapper researchMapper;
    @Mock private EntityManager entityManager;
    
    @InjectMocks private ResearchService researchService;
    
    private Research research;
    private ResearchDTO researchDTO;
    private CreateResearchRequest createRequest;
    private Project project;
    private User user;
    
    @BeforeEach
    void setUp() {
        project = Project.builder().id(UUID.randomUUID()).build();
        user = User.builder().id(1L).build();
        
        research = Research.builder()
                .id(UUID.randomUUID())
                .project(project)
                .budget(new BigDecimal("100000.00"))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .status("Active")
                .fundingSource("NSF")
                .build();
                
        researchDTO = ResearchDTO.builder()
                .id(research.getId())
                .projectId(project.getId())
                .budget(research.getBudget())
                .startDate(research.getStartDate())
                .endDate(research.getEndDate())
                .status(research.getStatus())
                .fundingSource(research.getFundingSource())
                .participantIds(List.of(user.getId()))
                .build();
                
        createRequest = CreateResearchRequest.builder()
                .projectId(project.getId())
                .budget(research.getBudget())
                .startDate(research.getStartDate())
                .endDate(research.getEndDate())
                .status(research.getStatus())
                .fundingSource(research.getFundingSource())
                .participantIds(List.of(user.getId()))
                .build();
    }
    
    @Test
    void testFindAllResearches() {
        when(researchRepository.findAll()).thenReturn(List.of(research));
        
        List<Research> result = researchService.findAllResearches();
        
        assertEquals(1, result.size());
        assertEquals(research.getId(), result.get(0).getId());
    }
    
    @Test
    void testFindResearchById() {
        when(researchRepository.findById(research.getId())).thenReturn(Optional.of(research));
        
        Optional<Research> result = researchService.findResearchById(research.getId());
        
        assertTrue(result.isPresent());
        assertEquals(research.getId(), result.get().getId());
    }
    
    @Test
    void testCreateResearch() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(researchRepository.save(any())).thenReturn(research);
        
        Research result = researchService.createResearch(createRequest);
        
        assertNotNull(result);
        assertEquals(project, result.getProject());
        verify(researchRepository).save(any());
    }
    
    @Test
    void testCreateResearchProjectNotFound() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            researchService.createResearch(createRequest);
        });
    }
    
    @Test
    void testUpdateResearch() {
        when(researchRepository.findById(research.getId())).thenReturn(Optional.of(research));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(researchMapper.toDTO(any())).thenReturn(researchDTO);
        when(researchRepository.save(any())).thenReturn(research);
        
        ResearchDTO result = researchService.updateResearch(research.getId(), researchDTO);
        
        assertNotNull(result);
        assertEquals(research.getId(), result.getId());
    }
    
    @Test
    void testDeleteResearch() {
        when(researchRepository.existsById(research.getId())).thenReturn(true);
        
        researchService.deleteResearch(research.getId());
        
        verify(researchRepository).deleteById(research.getId());
    }
    
    @Test
    void testFindProjectsByFilters() {
    	 @SuppressWarnings("unchecked")
    	    Specification<Research> spec = any(Specification.class);
    	    when(researchRepository.findAll(spec)).thenReturn(List.of(research));
        
        List<UUID> result = researchService.findProjectsByFilters(
            new BigDecimal("50000.00"), 
            new BigDecimal("150000.00"), 
            "NSF"
        );
        
        assertEquals(1, result.size());
        assertEquals(project.getId(), result.get(0));
    }
    
    @Test
    void testUpdateResearchParticipantsByIds() {
        Research existingResearch = Research.builder()
                .researchParticipants(new ArrayList<>())
                .build();
        User existingUser = User.builder().id(2L).build();
        existingResearch.addParticipant(new ResearchParticipant(existingResearch, existingUser));
        
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        
        researchService.updateResearchParticipantsByIds(existingResearch, List.of(user.getId()));
        
        assertEquals(1, existingResearch.getResearchParticipants().size());
        assertEquals(user.getId(), 
            existingResearch.getResearchParticipants().get(0).getUser().getId());
    }
}
