package com.backend.app.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.analytics.ProjectDistributionDTO;
import com.backend.app.dto.analytics.PublicationMetricsDTO;
import com.backend.app.dto.analytics.SystemOverviewDTO;
import com.backend.app.dto.analytics.SystemPerformanceDTO;
import com.backend.app.dto.analytics.UserGrowthDTO;
import com.backend.app.exception.GlobalExceptionHandler;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.service.analytics.CommentAnalyticsService;
import com.backend.app.service.analytics.PatentAnalyticsService;
import com.backend.app.service.analytics.ProjectAnalyticsService;
import com.backend.app.service.analytics.PublicationAnalyticsService;
import com.backend.app.service.analytics.ResearchAnalyticsService;
import com.backend.app.service.analytics.SystemAnalyticsService;
import com.backend.app.service.analytics.UserAnalyticsService;

@ExtendWith(MockitoExtension.class)
public class AdminAnalyticsControllerTest {
	 private MockMvc mockMvc;
	    
	    @Mock private UserAnalyticsService userAnalyticsService;
	    @Mock private ProjectAnalyticsService projectAnalyticsService;
	    @Mock private PublicationAnalyticsService publicationAnalyticsService;
	    @Mock private PatentAnalyticsService patentAnalyticsService;
	    @Mock private ResearchAnalyticsService researchAnalyticsService;
	    @Mock private CommentAnalyticsService commentAnalyticsService;
	    @Mock private SystemAnalyticsService systemAnalyticsService;
	    
	    @InjectMocks private AdminAnalyticsController controller;
	    
	    @BeforeEach
	    void setUp() {
	        mockMvc = MockMvcBuilders.standaloneSetup(controller)
	        		.setControllerAdvice(new GlobalExceptionHandler())
	        		.build();
	    }
	    
	    @Test
	    void getSystemOverview_shouldReturnSystemOverview() throws Exception {
	        SystemOverviewDTO overview = new SystemOverviewDTO();
	        when(systemAnalyticsService.getSystemOverview()).thenReturn(overview);
	        
	        mockMvc.perform(get("/api/admin/analytics/systemOverview"))
	               .andExpect(status().isOk())
	               .andExpect(jsonPath("$.success").value(true))
	               .andExpect(jsonPath("$.data").exists());
	    }
	    
	    @Test
	    void getSystemOverview_shouldHandleUnauthorizedAccess() throws Exception {
	        when(systemAnalyticsService.getSystemOverview()).thenThrow(new UnauthorizedAccessException("Access denied"));
	        
	        mockMvc.perform(get("/api/admin/analytics/systemOverview"))
	               .andExpect(status().isForbidden());
	    }
	    
	    @Test
	    void getUserGrowthAnalytics_shouldReturnDataWithValidDates() throws Exception {
	        LocalDate startDate = LocalDate.now().minusDays(30);
	        LocalDate endDate = LocalDate.now();
	        List<UserGrowthDTO> growthData = List.of(new UserGrowthDTO());
	        
	        when(userAnalyticsService.getUserGrowthAnalytics(startDate, endDate)).thenReturn(growthData);
	        
	        mockMvc.perform(get("/api/admin/analytics/userGrowth")
	               .param("startDate", startDate.toString())
	               .param("endDate", endDate.toString()))
	               .andExpect(status().isOk())
	               .andExpect(jsonPath("$.data.length()").value(1));
	    }
	    
	    @Test
	    void getUserGrowthAnalytics_shouldRejectInvalidDateRange() throws Exception {
	        LocalDate startDate = LocalDate.now();
	        LocalDate endDate = LocalDate.now().minusDays(1);
	        
	        mockMvc.perform(get("/api/admin/analytics/userGrowth")
	               .param("startDate", startDate.toString())
	               .param("endDate", endDate.toString()))
	               .andExpect(status().isBadRequest());
	    }
	    
	    @Test
	    void getProjectTypeDistribution_shouldReturnDistributionData() throws Exception {
	        ProjectDistributionDTO distribution = new ProjectDistributionDTO();
	        when(projectAnalyticsService.getProjectTypeDistribution()).thenReturn(distribution);
	        
	        mockMvc.perform(get("/api/admin/analytics/projectDistribution"))
	               .andExpect(status().isOk())
	               .andExpect(jsonPath("$.data").exists());
	    }
	    
	    @Test
	    void getPublicationMetrics_shouldReturn404WhenNoData() throws Exception {
	        PublicationMetricsDTO metrics = new PublicationMetricsDTO(0, 0, "", 0);
	        when(publicationAnalyticsService.getPublicationMetrics()).thenReturn(metrics);
	        
	        mockMvc.perform(get("/api/admin/analytics/publicationMetrics"))
	               .andExpect(status().isNotFound());
	    }
	    
	    @Test
	    void getCommentActivityAnalytics_shouldValidateDaysParameter() throws Exception {
	        mockMvc.perform(get("/api/admin/analytics/commentActivity")
	               .param("days", "0"))
	               .andExpect(status().isBadRequest());
	        
	        mockMvc.perform(get("/api/admin/analytics/commentActivity")
	               .param("days", "366"))
	               .andExpect(status().isBadRequest());
	    }
	    
	    @Test
	    void getSystemPerformanceMetrics_shouldReturnPerformanceData() throws Exception {
	        SystemPerformanceDTO performance = new SystemPerformanceDTO();
	        when(systemAnalyticsService.getSystemPerformanceMetrics()).thenReturn(performance);
	        
	        mockMvc.perform(get("/api/admin/analytics/systemPerformance"))
	               .andExpect(status().isOk())
	               .andExpect(jsonPath("$.data").exists());
	    }
}
