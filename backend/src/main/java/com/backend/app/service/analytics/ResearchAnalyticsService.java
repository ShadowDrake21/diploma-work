package com.backend.app.service.analytics;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.ResearchFundingDTO;
import com.backend.app.repository.ResearchRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResearchAnalyticsService {
	 private final ResearchRepository researchRepository;

	    public ResearchFundingDTO getResearchFundingAnalytics() {
	        Map<String, Object> metrics = researchRepository.getResearchFundingMetrics();
	        
	        return ResearchFundingDTO.builder()
	                .totalBudget(((BigDecimal) metrics.get("totalBudget")).doubleValue())
	                .averageBudget(((BigDecimal) metrics.get("avgBudget")).doubleValue())
	                .mostCommonFundingSource((String) metrics.get("commonSource"))
	                .activeProjects((Long) metrics.get("activeProjects"))
	                .build();
	    }
}
