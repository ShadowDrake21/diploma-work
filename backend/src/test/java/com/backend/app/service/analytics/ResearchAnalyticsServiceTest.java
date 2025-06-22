package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.ResearchFundingDTO;
import com.backend.app.repository.ResearchRepository;

@ExtendWith(MockitoExtension.class)
public class ResearchAnalyticsServiceTest {
	@Mock
	private ResearchRepository researchRepository;

	@InjectMocks
	private ResearchAnalyticsService researchAnalyticsService;

	@Test
	void getResearchFundingAnalytics_WithValidData_ShouldReturnMetrics() {
		Map<String, Object> metrics = Map.of("totalBudget", new BigDecimal("100000.50"), "avgBudget", 50000.25,
				"commonSource", "NIH", "activeProjects", 10L);

		when(researchRepository.getResearchFundingMetrics()).thenReturn(metrics);

		ResearchFundingDTO result = researchAnalyticsService.getResearchFundingAnalytics();

		assertEquals(100000.50, result.getTotalBudget(), 0.001);
		assertEquals(50000.25, result.getAverageBudget(), 0.001);
		assertEquals("NIH", result.getMostCommonFundingSource());
		assertEquals(10L, result.getActiveProjects());
	}
	
	

    @Test
    void getResearchFundingAnalytics_WithRepositoryException_ShouldReturnDefaults() {
        when(researchRepository.getResearchFundingMetrics()).thenThrow(new RuntimeException("DB error"));
        
        ResearchFundingDTO result = researchAnalyticsService.getResearchFundingAnalytics();
        
        assertEquals(0.0, result.getTotalBudget());
        assertEquals(0.0, result.getAverageBudget());
        assertEquals("N/A", result.getMostCommonFundingSource());
        assertEquals(0L, result.getActiveProjects());
    }
}
