package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.PatentMetricsDTO;
import com.backend.app.repository.PatentRepository;

@ExtendWith(MockitoExtension.class)
public class PatentAnalyticsServiceTest {
	@Mock
	private PatentRepository patentRepository;
	@InjectMocks
	private PatentAnalyticsService patentAnalyticsService;

	@Test
	void getPatentMetrics_WithCompleteData_ShouldReturnAllValues() {
		Map<String, Object> metrics = Map.of("total", 42L, "avgInventors", 3.5, "commonAuthority", "USPTO",
				"yearPatents", 10L);
		when(patentRepository.getPatentMetrics()).thenReturn(metrics);

		PatentMetricsDTO result = patentAnalyticsService.getPatentMetrics();

		assertEquals(42L, result.getTotalPatents());
		assertEquals(3.5, result.getAverageInventors());
		assertEquals("USPTO", result.getMostCommonAuthority());
		assertEquals(10L, result.getPatentsThisYear());
	}

	@Test
	void getPatentMetrics_WithNullValues_ShouldUseDefaults() {
		Map<String, Object> metrics = Map.of("total", null, "avgInventors", null, "commonAuthority", null,
				"yearPatents", null);
		when(patentRepository.getPatentMetrics()).thenReturn(metrics);

		PatentMetricsDTO result = patentAnalyticsService.getPatentMetrics();

		assertEquals(0L, result.getTotalPatents());
		assertEquals(0.0, result.getAverageInventors());
		assertEquals("N/A", result.getMostCommonAuthority());
		assertEquals(0L, result.getPatentsThisYear());
	}
}
