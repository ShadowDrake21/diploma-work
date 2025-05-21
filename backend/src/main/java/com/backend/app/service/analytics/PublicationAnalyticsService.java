package com.backend.app.service.analytics;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.PublicationMetricsDTO;
import com.backend.app.repository.PublicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublicationAnalyticsService {
	private final PublicationRepository publicationRepository;
	
	public PublicationMetricsDTO getPublicationMetrics() {
		Map<String, Object> metrics = publicationRepository.getPublicationMetrics();
		
		return PublicationMetricsDTO.builder()
                .totalPublications((Long) metrics.get("total"))
                .averagePages((Double) metrics.get("avgPages"))
                .mostCommonSource((String) metrics.get("commonSource"))
                .publicationsThisYear((Long) metrics.get("yearPublications"))
                .build();
	}
}
