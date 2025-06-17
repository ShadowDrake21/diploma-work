package com.backend.app.dto.miscellaneous;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsDTO {
	private long totalProjects;
	private long totalPublications;
	private long totalPatents;
	private long totalResearch;
	private long totalUsers;
}
