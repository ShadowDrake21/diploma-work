package com.backend.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.DashboardMetricsDTO;
import com.backend.app.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
	private final DashboardService dashboardService;
	
	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}
	
	@GetMapping("/metrics")
	public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics(){
		DashboardMetricsDTO metrics = dashboardService.getDashboardMetrics();
		return ResponseEntity.ok(metrics);
	}
}
