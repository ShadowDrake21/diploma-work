package com.backend.app.controller.messages;

import com.backend.app.controller.codes.AnalyticsCodes;

public class AnalyticsMessages {
	 private AnalyticsMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case AnalyticsCodes.SYSTEM_OVERVIEW_FETCHED -> "System overview fetched successfully";
	            case AnalyticsCodes.USER_GROWTH_FETCHED -> "User growth data fetched successfully";
	            case AnalyticsCodes.PROJECT_DISTRIBUTION_FETCHED -> "Project distribution fetched successfully";
	            case AnalyticsCodes.PROJECT_PROGRESS_FETCHED -> "Project progress data fetched successfully";
	            case AnalyticsCodes.PUBLICATION_METRICS_FETCHED -> "Publication metrics fetched successfully";
	            case AnalyticsCodes.PATENT_METRICS_FETCHED -> "Patent metrics fetched successfully";
	            case AnalyticsCodes.RESEARCH_FUNDING_FETCHED -> "Research funding data fetched successfully";
	            case AnalyticsCodes.COMMENT_ACTIVITY_FETCHED -> "Comment activity data fetched successfully";
	            case AnalyticsCodes.SYSTEM_PERFORMANCE_FETCHED -> "System performance metrics fetched successfully";
	            
	            // Error messages
	            case AnalyticsCodes.ACCESS_DENIED -> "Access denied. Admin privileges required";
	            case AnalyticsCodes.INVALID_DATE_RANGE -> "Invalid date range. Start date must be before end date";
	            case AnalyticsCodes.INVALID_DAYS_PARAMETER -> "Invalid days parameter. Must be between 1 and 365";
	            case AnalyticsCodes.NO_PUBLICATION_DATA -> "No publication data available";
	            case AnalyticsCodes.NO_PATENT_DATA -> "No patent data available";
	            case AnalyticsCodes.NO_RESEARCH_DATA -> "No research funding data available";
	            case AnalyticsCodes.SERVER_ERROR -> "An unexpected error occurred";
	            
	            default -> "Unknown status";
	        };
	    }
}
