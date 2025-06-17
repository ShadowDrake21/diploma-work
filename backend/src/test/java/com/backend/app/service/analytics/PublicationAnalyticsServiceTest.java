package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.PublicationMetricsDTO;
import com.backend.app.repository.PublicationRepository;

@ExtendWith(MockitoExtension.class)
public class PublicationAnalyticsServiceTest {
	@Mock
	private PublicationRepository publicationRepository;

	@InjectMocks
	private PublicationAnalyticsService publicationAnalyticsService;

	@Test
	void getPublicationMetrics_ShouldReturnCorrectValues() {
		Map<String, Object> metrics = Map.of("total", 150L, "avgPages", 12.5, "commonSource", "Springer",
				"yearPublications", 25L);

		when(publicationRepository.getPublicationMetrics()).thenReturn(metrics);

		PublicationMetricsDTO result = publicationAnalyticsService.getPublicationMetrics();

		assertEquals(150L, result.getTotalPublications());
		assertEquals(12.5, result.getAveragePages());
		assertEquals("Springer", result.getMostCommonSource());
		assertEquals(25L, result.getPublicationsThisYear());
	}
}
