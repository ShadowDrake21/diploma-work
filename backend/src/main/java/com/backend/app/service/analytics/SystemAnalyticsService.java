package com.backend.app.service.analytics;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.SystemOverviewDTO;
import com.backend.app.dto.analytics.SystemPerformanceDTO;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.AdminInvitationRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemAnalyticsService {
	private final UserRepository userRepository;
	 private final ProjectRepository projectRepository;
	    private final AdminInvitationRepository adminInvitationRepository;
	    private final ActiveTokenRepository activeTokenRepository;
	    
	    public SystemOverviewDTO getSystemOverview() {
	    	long totalUsers = userRepository.count();
	    	long activeUsers = userRepository.countByActiveTrue();
	    	 long totalProjects = projectRepository.count();
	         long activeSessions = activeTokenRepository.count();
	         
	    return SystemOverviewDTO.builder()
	    		.totalUsers(totalUsers)
	    		.activeUsers(activeUsers)
	    		.totalProjects(totalProjects)
	    		.activeSessions(activeSessions)
	    		.pendingAdminInvitations(adminInvitationRepository.countByCompletedFalseAndRevokedFalse())
	    		.build();
	    }
	    
	    public SystemPerformanceDTO getSystemPerformanceMetrics() {
	        // This would be enhanced with actual performance metrics collection
	        return SystemPerformanceDTO.builder()
	                .averageResponseTime(150) // ms
	                .uptimePercentage(99.98)
	                .activeConnections(activeTokenRepository.count())
	                .build();
	    }
}
