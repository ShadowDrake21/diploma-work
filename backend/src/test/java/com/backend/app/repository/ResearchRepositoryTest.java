package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;

public class ResearchRepositoryTest {
	@Autowired
	private ResearchRepository researchRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	 @Test
	    void testFindByProjectId() {
	        Project project = projectRepository.save(Project.builder().build());
	        Research research = researchRepository.save(
	            Research.builder()
	                .project(project)
	                .budget(new BigDecimal("100000.00"))
	                .startDate(LocalDate.now())
	                .endDate(LocalDate.now().plusYears(1))
	                .status("Active")
	                .fundingSource("NSF")
	                .build()
	        );
	        
	        List<Research> result = researchRepository.findByProjectId(project.getId());
	        
	        assertEquals(1, result.size());
	        assertEquals(research.getId(), result.get(0).getId());
	    }
	 
	 @Test
	    void testFindByIdWithParticipants() {
	        Project project = projectRepository.save(Project.builder().build());
	        User user = userRepository.save(User.builder().build());
	        Research research = Research.builder()
	                .project(project)
	                .budget(new BigDecimal("100000.00"))
	                .startDate(LocalDate.now())
	                .endDate(LocalDate.now().plusYears(1))
	                .status("Active")
	                .fundingSource("NSF")
	                .build();
	        research.addParticipant(new ResearchParticipant(research, user));
	        research = researchRepository.save(research);
	        
	        Optional<Research> result = researchRepository.findByIdWithParticipants(research.getId());
	        
	        assertTrue(result.isPresent());
	        assertEquals(1, result.get().getResearchParticipants().size());
	    }
	 
	 @Test
	    void testGetResearchFundingMetrics() {
	        projectRepository.saveAll(List.of(
	            Project.builder().build(),
	            Project.builder().build()
	        )).forEach(project -> {
	            researchRepository.save(
	                Research.builder()
	                    .project(project)
	                    .budget(new BigDecimal("50000.00"))
	                    .startDate(LocalDate.now())
	                    .endDate(LocalDate.now().plusYears(1))
	                    .status("Active")
	                    .fundingSource("NSF")
	                    .build()
	            );
	        });
	        
	        Map<String, Object> metrics = researchRepository.getResearchFundingMetrics();
	        
	        assertNotNull(metrics);
	        assertEquals(new BigDecimal("100000.00"), metrics.get("totalBudget"));
	        assertEquals("NSF", metrics.get("commonSource"));
	    }
}
