package com.backend.app.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.controller.codes.AnalyticsCodes;
import com.backend.app.controller.messages.AnalyticsMessages;
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
import com.backend.app.exception.UnauthorizedAccessException;
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
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved system overview")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<SystemOverviewDTO>> getSystemOverview(){
    	try {
    		SystemOverviewDTO overview = systemAnalyticsService.getSystemOverview();
    		return ResponseEntity.ok(ApiResponse.success(overview,
    				AnalyticsMessages.getMessage(AnalyticsCodes.SYSTEM_OVERVIEW_FETCHED), AnalyticsCodes.SYSTEM_OVERVIEW_FETCHED
    		 ));
		} catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to system overview");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching system overview: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }
    
    @Operation(summary = "Get user growth analytics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved user growth data")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date range")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/users/growth")
    public ResponseEntity<ApiResponse<List<UserGrowthDTO>>> getUserGrowthAnalytics(
    		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    	try {
            if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                        AnalyticsMessages.getMessage(AnalyticsCodes.INVALID_DATE_RANGE),
                        AnalyticsCodes.INVALID_DATE_RANGE));
            }
            
            List<UserGrowthDTO> growthData = userAnalyticsService.getUserGrowthAnalytics(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(
                growthData,
                AnalyticsMessages.getMessage(AnalyticsCodes.USER_GROWTH_FETCHED),AnalyticsCodes.USER_GROWTH_FETCHED));
        } catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to user growth analytics");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching user growth analytics: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }
    
    @Operation(summary = "Get project type distribution")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved project distribution")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/projects/distribution")
    public ResponseEntity<ApiResponse<ProjectDistributionDTO>> getProjectTypeDistribution() {
    	try {
    		ProjectDistributionDTO distribution = projectAnalyticsService.getProjectTypeDistribution();
    		return ResponseEntity.ok(ApiResponse.success(
                    distribution,
                    AnalyticsMessages.getMessage(AnalyticsCodes.PROJECT_DISTRIBUTION_FETCHED),AnalyticsCodes.PROJECT_DISTRIBUTION_FETCHED));
		} catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to project distribution");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching project distribution: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }

    @Operation(summary = "Get project progress analytics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved project progress")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/projects/progress")
    public ResponseEntity<ApiResponse<List<ProjectProgressDTO>>> getProjectProgressAnalytics() {
    	try {
			List<ProjectProgressDTO> progressData = projectAnalyticsService.getProjectProgressAnalytics();
			return ResponseEntity.ok(ApiResponse.success(
	                progressData,
	                AnalyticsMessages.getMessage(AnalyticsCodes.PROJECT_PROGRESS_FETCHED),AnalyticsCodes.PROJECT_PROGRESS_FETCHED));
		}  catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to project progress");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching project progress: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }

    @Operation(summary = "Get publication metrics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved publication metrics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No publication data found")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/publications")
    public ResponseEntity<ApiResponse<PublicationMetricsDTO>> getPublicationMetrics() {
    	try {
			PublicationMetricsDTO metrics = publicationAnalyticsService.getPublicationMetrics();
			if(metrics.getTotalPublications() == 0) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(
                        AnalyticsMessages.getMessage(AnalyticsCodes.NO_PUBLICATION_DATA),
                        AnalyticsCodes.NO_PUBLICATION_DATA));
			}
			 return ResponseEntity.ok(ApiResponse.success(
		                metrics,
		                AnalyticsMessages.getMessage(AnalyticsCodes.PUBLICATION_METRICS_FETCHED),AnalyticsCodes.PUBLICATION_METRICS_FETCHED));
		} catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to publication metrics");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching publication metrics: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
       
    }

    @Operation(summary = "Get patent metrics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved patent metrics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No patent data found")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/patents")
    public ResponseEntity<ApiResponse<PatentMetricsDTO>> getPatentMetrics() {
    	try {
    		PatentMetricsDTO metrics = patentAnalyticsService.getPatentMetrics();
            if (metrics.getTotalPatents() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                        AnalyticsMessages.getMessage(AnalyticsCodes.NO_PATENT_DATA),
                        AnalyticsCodes.NO_PATENT_DATA));
            }
            return ResponseEntity.ok(ApiResponse.success(
                metrics,
                AnalyticsMessages.getMessage(AnalyticsCodes.PATENT_METRICS_FETCHED),AnalyticsCodes.PATENT_METRICS_FETCHED));
		} catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to patent metrics");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching patent metrics: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }

    @Operation(summary = "Get research funding analytics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved research funding data")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No research funding data found")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/research/funding")
    public ResponseEntity<ApiResponse<ResearchFundingDTO>> getResearchFundingAnalytics() {
    		try {
                ResearchFundingDTO fundingData = researchAnalyticsService.getResearchFundingAnalytics();
                if (fundingData.getActiveProjects() == 0) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(
                            AnalyticsMessages.getMessage(AnalyticsCodes.NO_RESEARCH_DATA),
                            AnalyticsCodes.NO_RESEARCH_DATA));
                }
                return ResponseEntity.ok(ApiResponse.success(
                    fundingData,
                    AnalyticsMessages.getMessage(AnalyticsCodes.RESEARCH_FUNDING_FETCHED)));
		}catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to research funding data");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching research funding data: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }

    @Operation(summary = "Get comment activity analytics")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved comment activity")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid days parameter")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
     @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/comments/activity")
    public ResponseEntity<ApiResponse<List<CommentActivityDTO>>> getCommentActivityAnalytics(
            @RequestParam(defaultValue = "7") int days) {
    	try {
			if(days <= 0 || days > 365) {
				return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(
	                        AnalyticsMessages.getMessage(AnalyticsCodes.INVALID_DAYS_PARAMETER),
	                        AnalyticsCodes.INVALID_DAYS_PARAMETER));
			}
			 List<CommentActivityDTO> activityData = commentAnalyticsService.getCommentActivityAnalytics(days);
	            return ResponseEntity.ok(ApiResponse.success(
	                activityData,
	                AnalyticsMessages.getMessage(AnalyticsCodes.COMMENT_ACTIVITY_FETCHED)));
		} catch (UnauthorizedAccessException e) {
            log.warn("Unauthorized access attempt to comment activity");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                    AnalyticsCodes.ACCESS_DENIED));
        } catch (Exception e) {
            log.error("Error fetching comment activity: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                    AnalyticsCodes.SERVER_ERROR));
        }
    }

    @Operation(summary = "Get system performance metrics")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved system performance")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/system/performance")
    public ResponseEntity<ApiResponse<SystemPerformanceDTO>> getSystemPerformanceMetrics() {
    	 try {
             SystemPerformanceDTO performanceData = systemAnalyticsService.getSystemPerformanceMetrics();
             return ResponseEntity.ok(ApiResponse.success(
                 performanceData,
                 AnalyticsMessages.getMessage(AnalyticsCodes.SYSTEM_PERFORMANCE_FETCHED)));
         } catch (UnauthorizedAccessException e) {
             log.warn("Unauthorized access attempt to system performance");
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error(
                     AnalyticsMessages.getMessage(AnalyticsCodes.ACCESS_DENIED),
                     AnalyticsCodes.ACCESS_DENIED));
         } catch (Exception e) {
             log.error("Error fetching system performance: ", e);
             return ResponseEntity.internalServerError()
                 .body(ApiResponse.error(
                     AnalyticsMessages.getMessage(AnalyticsCodes.SERVER_ERROR),
                     AnalyticsCodes.SERVER_ERROR));
         }
     }
}
