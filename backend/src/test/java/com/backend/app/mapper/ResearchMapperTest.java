package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class ResearchMapperTest {
	 @Mock private ProjectRepository projectRepository;
	    @Mock private UserRepository userRepository;
	    
	    @InjectMocks private ResearchMapper researchMapper;
	    
	    private Research research;
	    private ResearchDTO researchDTO;
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
	                .researchParticipants(List.of(
	                    new ResearchParticipant(research, user)
	                ))
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
	    }
	    
	    
	    @Test
	    void testToEntity() {
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
	        
	        Research result = researchMapper.toEntity(researchDTO);
	        
	        assertEquals(researchDTO.getId(), result.getId());
	        assertEquals(project, result.getProject());
	        assertEquals(researchDTO.getBudget(), result.getBudget());
	    }
	    
	    @Test
	    void testUpdateResearchFromDto() {
	        Research existingResearch = Research.builder().build();
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
	        
	        researchMapper.updateResearchFromDto(researchDTO, existingResearch);
	        
	        assertEquals(project, existingResearch.getProject());
	        assertEquals(researchDTO.getBudget(), existingResearch.getBudget());
	        assertEquals(researchDTO.getStatus(), existingResearch.getStatus());
	    }
	    
	    @Test
	    void testNullHandling() {
	        assertNull(researchMapper.toDTO(null));
	        assertNull(researchMapper.toEntity(null));
	        
	        Research existingResearch = new Research();
	        researchMapper.updateResearchFromDto(null, existingResearch);
	    }
	    
	    @Test
	    void testGetParticipantIdsWithEmptyList() {
	        research.setResearchParticipants(Collections.emptyList());
	        ResearchDTO result = researchMapper.toDTO(research);
	        
	        assertTrue(result.getParticipantIds().isEmpty());
	    }
}
