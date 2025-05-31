package com.backend.app.service;

import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.backend.app.dto.miscellaneous.DashboardMetricsDTO;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {
	 private static final String TOTAL_PROJECTS_KEY = "totalProjects";
	    private static final String TOTAL_PUBLICATIONS_KEY = "totalPublications";
	    private static final String TOTAL_PATENTS_KEY = "totalPatents";
	    private static final String TOTAL_RESEARCH_KEY = "totalResearch";
	
	private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public DashboardMetricsDTO getDashboardMetrics() {
    	 try {
             Map<String, Long> projectCounts = projectRepository.getProjectTypeAggregates();
             return buildDashboardMetrics(projectCounts);
         } catch (DataAccessException e) {
             log.error("Database error while fetching dashboard metrics: {}", e.getMessage());
             return buildDefaultDashboardMetrics();
         } catch (Exception e) {
             log.error("Unexpected error while fetching dashboard metrics", e);
             return buildDefaultDashboardMetrics();
         }
    }
    
    private DashboardMetricsDTO buildDashboardMetrics(Map<String, Long> projectCounts) {
    	try {
    		return DashboardMetricsDTO.builder().totalProjects(getSafeLongValue(projectCounts, TOTAL_PROJECTS_KEY))
                    .totalPublications(getSafeLongValue(projectCounts, TOTAL_PUBLICATIONS_KEY))
                    .totalPatents(getSafeLongValue(projectCounts, TOTAL_PATENTS_KEY))
                    .totalResearch(getSafeLongValue(projectCounts, TOTAL_RESEARCH_KEY))
                    .totalUsers(userRepository.count())
                    .build();
		} catch (Exception e) {
			log.error("Error while building dashboard metrics", e);
			return buildDefaultDashboardMetrics();
		}
    	
    }
    
    private DashboardMetricsDTO buildDefaultDashboardMetrics() {
    	return DashboardMetricsDTO.builder()
                .totalProjects(0L)
                .totalPublications(0L)
                .totalPatents(0L)
                .totalResearch(0L)
                .totalUsers(0L)
                .build();
    }
    
    private Long getSafeLongValue(Map<String, Long> map, String key) {
        return map != null ? map.getOrDefault(key, 0L) : 0L;
    }
}
