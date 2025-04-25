package com.backend.app.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.backend.app.dto.DashboardMetricsDTO;
import com.backend.app.repository.PatentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationRepository;
import com.backend.app.repository.ResearchRepository;
import com.backend.app.repository.UserRepository;

@Service
public class DashboardService {
	private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public DashboardService(ProjectRepository projectRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public DashboardMetricsDTO getDashboardMetrics() {
    	DashboardMetricsDTO metrics = new DashboardMetricsDTO();
    	Map<String, Long> projectCounts = projectRepository.countProjectsByType();
    	
    	metrics.setTotalProjects(projectCounts.get("totalProjects"));
    	metrics.setTotalPublications(projectCounts.get("totalPublications"));
    	metrics.setTotalPatents(projectCounts.get("totalPatents"));
    	metrics.setTotalResearch(projectCounts.get("totalResearch"));
    	metrics.setTotalUsers(userRepository.count());
    	    
    	return metrics;
    }
}
