package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.SystemOverviewDTO;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class SystemAnalyticsServiceTest {
	@Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private ActiveTokenRepository activeTokenRepository;
    
    @InjectMocks private SystemAnalyticsService analyticsService;
    
    @Test
    void getSystemOverview_ShouldReturnCorrectCounts() {
    	when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByActiveTrue()).thenReturn(75L);
        when(projectRepository.count()).thenReturn(50L);
        when(activeTokenRepository.count()).thenReturn(25L);
        
        SystemOverviewDTO result = analyticsService.getSystemOverview();
        
        assertEquals(100L, result.getTotalUsers());
        assertEquals(75L, result.getActiveUsers());
        assertEquals(50L, result.getTotalProjects());
        assertEquals(25L, result.getActiveSessions());
    }
}
