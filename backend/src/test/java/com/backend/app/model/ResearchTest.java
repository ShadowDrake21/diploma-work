package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ResearchTest {
	private Research research;
	private Project project;
	private  final UUID researchId = UUID.randomUUID();
    private final LocalDate today = LocalDate.now();
    
    @BeforeEach
    void setUp() {
        project = Project.builder().id(UUID.randomUUID()).build();
        research = Research.builder()
                .id(researchId)
                .project(project)
                .budget(new BigDecimal("100000.00"))
                .startDate(today)
                .endDate(today.plusYears(1))
                .status("Active")
                .fundingSource("National Science Foundation")
                .build();
    }
    
    @Test
    void testResearchCreation() {
        assertNotNull(research);
        assertEquals(researchId, research.getId());
        assertEquals(project, research.getProject());
        assertEquals(new BigDecimal("100000.00"), research.getBudget());
        assertEquals(today, research.getStartDate());
        assertEquals(today.plusYears(1), research.getEndDate());
        assertEquals("Active", research.getStatus());
        assertEquals("National Science Foundation", research.getFundingSource());
        assertTrue(research.getResearchParticipants().isEmpty());
    }
    
    @Test
    void testAddParticipant() {
        User user = User.builder().id(1L).build();
        ResearchParticipant participant = new ResearchParticipant(research, user);
        
        research.addParticipant(participant);
        
        assertEquals(1, research.getResearchParticipants().size());
        assertTrue(research.getResearchParticipants().contains(participant));
        assertEquals(research, participant.getResearch());
    }
    
    @Test
    void testRemoveParticipant() {
        User user = User.builder().id(1L).build();
        ResearchParticipant participant = new ResearchParticipant(research, user);
        research.addParticipant(participant);
        
        research.removeParticipant(participant);
        
        assertEquals(0, research.getResearchParticipants().size());
        assertNull(participant.getResearch());
    }
    
    @Test
    void testBuilderMethods() {
        Research builtResearch = Research.builder()
                .project(project)
                .budget(new BigDecimal("50000.00"))
                .startDate(today.minusMonths(1))
                .endDate(today.plusMonths(11))
                .status("Planning")
                .fundingSource("University grant")
                .build();
        
        assertEquals(project, builtResearch.getProject());
        assertEquals(new BigDecimal("50000.00"), builtResearch.getBudget());
        assertEquals("Planning", builtResearch.getStatus());
    }
}
