package com.backend.app.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.miscellaneous.DashboardMetricsDTO;
import com.backend.app.service.DashboardService;

@ExtendWith(MockitoExtension.class)
public class DashboardControllerTest {
private MockMvc mockMvc;
    
    @Mock
    private DashboardService dashboardService;
    
    @InjectMocks
    private DashboardController dashboardController;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dashboardController).build();
    }
    
    @Test
    void getDashboardMetrics_shouldReturnMetrics() throws Exception {
        DashboardMetricsDTO metrics = new DashboardMetricsDTO();
        when(dashboardService.getDashboardMetrics()).thenReturn(metrics);
        
        mockMvc.perform(get("/api/dashboard/metrics"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data").exists());
    }
    
    @Test
    void getDashboardMetrics_shouldHandleServiceError() throws Exception {
        when(dashboardService.getDashboardMetrics()).thenThrow(new RuntimeException("Test error"));
        
        mockMvc.perform(get("/api/dashboard/metrics")).andExpect(status().isInternalServerError());
    }      
}
