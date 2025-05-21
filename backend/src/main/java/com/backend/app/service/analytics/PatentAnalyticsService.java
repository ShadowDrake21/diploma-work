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
                .totalPatents((Long) metrics.get("total"))
                .averageInventors((Double) metrics.get("avgInventors"))
                .mostCommonAuthority((String) metrics.get("commonAuthority"))
                .patentsThisYear((Long) metrics.get("yearPatents"))
                .build();
    }
}
