package com.backend.app.dto.miscellaneous;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetricsDTO {
	private long totalProjects;
	private long totalPublications;
	private long totalPatents;
	private long totalResearch;
	private long totalUsers;
}
