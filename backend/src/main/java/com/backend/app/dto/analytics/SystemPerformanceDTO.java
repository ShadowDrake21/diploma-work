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
	 private double averageResponseTime;
	    private double uptimePercentage;
	    private long activeConnections;
	    private double memoryUsage; 
	    private double cpuUsage; 
	    private int activeDbConnections;
	    private int idleDbConnections;
	    private int maxDbConnections;
	    private int threadCount;
}
