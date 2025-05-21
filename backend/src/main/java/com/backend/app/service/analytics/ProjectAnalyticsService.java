package com.backend.app.service.analytics;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.ProjectDistributionDTO;
import com.backend.app.dto.analytics.ProjectProgressDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectAnalyticsService {
	private final ProjectRepository projectRepository;
	
	 public ProjectDistributionDTO getProjectTypeDistribution() {
	        Map<ProjectType, Long> counts = projectRepository.getProjectCountsByType()
	                .stream()
	                .collect(Collectors.toMap(
	                        result -> (ProjectType) result[0],
	                        result -> ((Number) result[1]).longValue()
	                ));
	        
	        return new ProjectDistributionDTO(
	                counts.getOrDefault(ProjectType.PUBLICATION, 0L),
	                counts.getOrDefault(ProjectType.PATENT, 0L),
	                counts.getOrDefault(ProjectType.RESEARCH, 0L)
	        );
	    }

	    public List<ProjectProgressDTO> getProjectProgressAnalytics() {
	        return projectRepository.getProjectProgressDistribution()
	                .stream()
	                .map(result -> new ProjectProgressDTO(
	                        ((Number) result[0]).intValue(),
	                        ((Number) result[1]).longValue()
	                ))
	                .collect(Collectors.toList());
	    }
}
