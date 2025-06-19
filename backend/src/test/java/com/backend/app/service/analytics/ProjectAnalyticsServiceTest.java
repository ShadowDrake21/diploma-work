package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.ProjectDistributionDTO;
import com.backend.app.dto.analytics.ProjectProgressDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.repository.ProjectRepository;

@ExtendWith(MockitoExtension.class)
public class ProjectAnalyticsServiceTest {
	@Mock
	private ProjectRepository projectRepository;
	
	@InjectMocks
	private ProjectAnalyticsService projectAnalyticsService;
	
	@Test
    void getProjectTypeDistribution_ShouldReturnCorrectCounts() {
        Object[] pubResult = {ProjectType.PUBLICATION, 30L};
        Object[] patentResult = {ProjectType.PATENT, 20L};
        
        when(projectRepository.getProjectCountsByType())
            .thenReturn(List.of(pubResult, patentResult));
        
        ProjectDistributionDTO result = projectAnalyticsService.getProjectTypeDistribution();
        
        assertEquals(30L, result.getPublicationCount());
        assertEquals(20L, result.getPatentCount());
        assertEquals(0L, result.getResearchCount()); // not in results
    }

    @Test
    void getProjectProgressAnalytics_ShouldReturnCorrectProgressData() {
        Object[] progress1 = {50, 10L}; // 50% progress, 10 projects
        Object[] progress2 = {100, 5L}; // 100% progress, 5 projects
        
        when(projectRepository.getProjectProgressDistribution())
            .thenReturn(List.of(progress1, progress2));
        
        List<ProjectProgressDTO> result = projectAnalyticsService.getProjectProgressAnalytics();
        
        assertEquals(2, result.size());
        assertEquals(50, result.get(0).getProgress());
        assertEquals(10L, result.get(0).getCount());
        assertEquals(100, result.get(1).getProgress());
        assertEquals(5L, result.get(1).getCount());
    }
}
