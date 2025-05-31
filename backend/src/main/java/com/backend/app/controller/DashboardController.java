package com.backend.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.controller.codes.DashboardCodes;
import com.backend.app.controller.messages.DashboardMessages;
import com.backend.app.dto.miscellaneous.DashboardMetricsDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.service.DashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
	private final DashboardService dashboardService;
	
	@GetMapping("/metrics")
	public ResponseEntity<ApiResponse<DashboardMetricsDTO>> getDashboardMetrics(){
		 try {
	            DashboardMetricsDTO metrics = dashboardService.getDashboardMetrics();
	            return ResponseEntity.ok(ApiResponse.success(
	                metrics,
	                DashboardMessages.getMessage(DashboardCodes.METRICS_FETCHED)
	            ));
	        } catch (Exception e) {
	            log.error("Error fetching dashboard metrics: ", e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    DashboardMessages.getMessage(DashboardCodes.SERVER_ERROR),
	                    DashboardCodes.SERVER_ERROR
	                ));
	        }
	}
}
