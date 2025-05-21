package com.backend.app.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemPerformanceDTO {
	private int averageResponseTime; 
    private double uptimePercentage;
    private long activeConnections;
}
