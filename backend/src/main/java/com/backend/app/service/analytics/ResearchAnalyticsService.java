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
	               totalBudget = convertToDouble(metrics.get("totalBudget"));
	               }

	            // Handle avgBudget conversion
	            Double avgBudget = 0.0;
	            if (metrics.get("avgBudget") != null) {
	                avgBudget = convertToDouble(metrics.get("avgBudget"));
	            }
	            
	            String mostCommotFundingSource = metrics.get("commonSource") != null ? 
                        (String) metrics.get("commonSource") : "N/A";
	            
	            Long activeProjects = metrics.get("activeProjects") != null ? (Long) metrics.get("activeProjects") : 0L;

	            return ResearchFundingDTO.builder()
	                    .totalBudget(totalBudget)
	                    .averageBudget(avgBudget)
	                    .mostCommonFundingSource(mostCommotFundingSource)
	                    .activeProjects(activeProjects)
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
	 
	 private Double convertToDouble(Object value) {
		    if (value instanceof BigDecimal) {
		        return ((BigDecimal) value).doubleValue();
		    } else if (value instanceof Double) {
		        return (Double) value;
		    } else if (value instanceof Number) {
		        return ((Number) value).doubleValue();
		    }
		    return 0.0;
		}
}
