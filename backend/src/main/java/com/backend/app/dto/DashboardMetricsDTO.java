package com.backend.app.dto;

import lombok.Data;

@Data
public class DashboardMetricsDTO {
	private long totalProjects;
	private long totalPublications;
	private long totalPatents;
	private long totalResearch;
	private long totalUsers;
}
