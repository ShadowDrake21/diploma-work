package com.backend.app.service.analytics;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.PatentMetricsDTO;
import com.backend.app.repository.PatentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatentAnalyticsService {
	private final PatentRepository patentRepository;
	
	public PatentMetricsDTO getPatentMetrics() {
        Map<String, Object> metrics = patentRepository.getPatentMetrics();
        
        return PatentMetricsDTO.builder()
                .totalPatents(metrics.get("total") != null ? (Long) metrics.get("total") : 0L)
                .averageInventors(metrics.get("avgInventors") != null ? (Double) metrics.get("avgInventors") : 0.0)
                .mostCommonAuthority(metrics.get("commonAuthority") != null ? (String) metrics.get("commonAuthority") : "N/A")
                .patentsThisYear(metrics.get("yearPatents") != null ? (Long) metrics.get("yearPatents") : 0L)
                .build();
    }
}
