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
	        try {
	            Map<String, Object> metrics = researchRepository.getResearchFundingMetrics();
	            
	            // Handle totalBudget conversion
	            Double totalBudget = 0.0;
	            if (metrics.get("totalBudget") != null) {
	                if (metrics.get("totalBudget") instanceof BigDecimal) {
	                    totalBudget = ((BigDecimal) metrics.get("totalBudget")).doubleValue();
	                } else if (metrics.get("totalBudget") instanceof Double) {
	                    totalBudget = (Double) metrics.get("totalBudget");
	                } else if (metrics.get("totalBudget") instanceof Number) {
	                    totalBudget = ((Number) metrics.get("totalBudget")).doubleValue();
	                }
	            }

	            // Handle avgBudget conversion
	            Double avgBudget = 0.0;
	            if (metrics.get("avgBudget") != null) {
	                if (metrics.get("avgBudget") instanceof BigDecimal) {
	                    avgBudget = ((BigDecimal) metrics.get("avgBudget")).doubleValue();
	                } else if (metrics.get("avgBudget") instanceof Double) {
	                    avgBudget = (Double) metrics.get("avgBudget");
	                } else if (metrics.get("avgBudget") instanceof Number) {
	                    avgBudget = ((Number) metrics.get("avgBudget")).doubleValue();
	                }
	            }

	            return ResearchFundingDTO.builder()
	                    .totalBudget(totalBudget)
	                    .averageBudget(avgBudget)
	                    .mostCommonFundingSource(metrics.get("commonSource") != null ? 
	                        (String) metrics.get("commonSource") : "N/A")
	                    .activeProjects(metrics.get("activeProjects") != null ? 
	                        (Long) metrics.get("activeProjects") : 0L)
	                    .build();
	                    
	        } catch (Exception e) {
	            // Log error and return default values
	            return ResearchFundingDTO.builder()
	                    .totalBudget(0.0)
	                    .averageBudget(0.0)
	                    .mostCommonFundingSource("N/A")
	                    .activeProjects(0L)
	                    .build();
	        }
	    }
}
