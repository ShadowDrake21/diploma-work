package com.backend.app.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatistics {
	private long totalProjects;
	private long activeProjects;
	private long completedProjects;
	private long publicationsCount;
	private long patentsCount;
	private long researchCount;
	private Map<String, Long> projectsByStatus;
	private Map<String, Long> projectsByType;
}
