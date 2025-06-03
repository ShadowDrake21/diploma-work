package com.backend.app.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemOverviewDTO {
	 private long totalUsers;
	    private long activeUsers;
	    private long totalProjects;
	    private long activeSessions;
}
