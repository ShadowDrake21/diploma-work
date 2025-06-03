package com.backend.app.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.analytics.CommentActivityDTO;
import com.backend.app.dto.analytics.PatentMetricsDTO;
import com.backend.app.dto.analytics.ProjectDistributionDTO;
import com.backend.app.dto.analytics.ProjectProgressDTO;
import com.backend.app.dto.analytics.PublicationMetricsDTO;
import com.backend.app.dto.analytics.ResearchFundingDTO;
import com.backend.app.dto.analytics.SystemOverviewDTO;
import com.backend.app.dto.analytics.SystemPerformanceDTO;
import com.backend.app.dto.analytics.UserGrowthDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.service.analytics.CommentAnalyticsService;
import com.backend.app.service.analytics.PatentAnalyticsService;
import com.backend.app.service.analytics.ProjectAnalyticsService;
import com.backend.app.service.analytics.PublicationAnalyticsService;
import com.backend.app.service.analytics.ResearchAnalyticsService;
import com.backend.app.service.analytics.SystemAnalyticsService;
import com.backend.app.service.analytics.UserAnalyticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Admin Analytics", description = "Endpoints for admin dashboard analytics")
@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {
	private final UserAnalyticsService userAnalyticsService;
    private final ProjectAnalyticsService projectAnalyticsService;
    private final PublicationAnalyticsService publicationAnalyticsService;
    private final PatentAnalyticsService patentAnalyticsService;
    private final ResearchAnalyticsService researchAnalyticsService;
    private final CommentAnalyticsService commentAnalyticsService;
    private final SystemAnalyticsService systemAnalyticsService;
    
    @Operation(summary = "Get system overview metrics")
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<SystemOverviewDTO>> getSystemOverview(){
    	return ResponseEntity.ok(ApiResponse.success(systemAnalyticsService.getSystemOverview()));
    }
    
    @Operation(summary = "Get user growth analytics")
    @GetMapping("/users/growth")
    public ResponseEntity<ApiResponse<List<UserGrowthDTO>>> getUserGrowthAnalytics(
    		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    	return ResponseEntity.ok(ApiResponse.success(userAnalyticsService.getUserGrowthAnalytics(startDate, endDate))); 
    }
    
    @Operation(summary = "Get project type distribution")
    @GetMapping("/projects/distribution")
    public ResponseEntity<ApiResponse<ProjectDistributionDTO>> getProjectTypeDistribution() {
        return ResponseEntity.ok(ApiResponse.success(projectAnalyticsService.getProjectTypeDistribution()));
    }

    @Operation(summary = "Get project progress analytics")
    @GetMapping("/projects/progress")
    public ResponseEntity<ApiResponse<List<ProjectProgressDTO>>> getProjectProgressAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(projectAnalyticsService.getProjectProgressAnalytics()));
    }

    @Operation(summary = "Get publication metrics")
    @GetMapping("/publications")
    public ResponseEntity<ApiResponse<PublicationMetricsDTO>> getPublicationMetrics() {
        return ResponseEntity.ok(ApiResponse.success(publicationAnalyticsService.getPublicationMetrics()));
    }

    @Operation(summary = "Get patent metrics")
    @GetMapping("/patents")
    public ResponseEntity<ApiResponse<PatentMetricsDTO>> getPatentMetrics() {
        return ResponseEntity.ok(ApiResponse.success(patentAnalyticsService.getPatentMetrics()));
    }

    @Operation(summary = "Get research funding analytics")
    @GetMapping("/research/funding")
    public ResponseEntity<ApiResponse<ResearchFundingDTO>> getResearchFundingAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(researchAnalyticsService.getResearchFundingAnalytics()));
    }

    @Operation(summary = "Get comment activity analytics")
    @GetMapping("/comments/activity")
    public ResponseEntity<ApiResponse<List<CommentActivityDTO>>> getCommentActivityAnalytics(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(commentAnalyticsService.getCommentActivityAnalytics(days)));
    }

    @Operation(summary = "Get system performance metrics")
    @GetMapping("/system/performance")
    public ResponseEntity<ApiResponse<SystemPerformanceDTO>> getSystemPerformanceMetrics() {
        return ResponseEntity.ok(ApiResponse.success(systemAnalyticsService.getSystemPerformanceMetrics()));
    }
}
