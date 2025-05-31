package com.backend.app.controller.codes;

public class AnalyticsCodes {
	    private AnalyticsCodes() {}
	    
	    // Success codes
	    public static final String SYSTEM_OVERVIEW_FETCHED = "SYSTEM_OVERVIEW_FETCHED";
	    public static final String USER_GROWTH_FETCHED = "USER_GROWTH_FETCHED";
	    public static final String PROJECT_DISTRIBUTION_FETCHED = "PROJECT_DISTRIBUTION_FETCHED";
	    public static final String PROJECT_PROGRESS_FETCHED = "PROJECT_PROGRESS_FETCHED";
	    public static final String PUBLICATION_METRICS_FETCHED = "PUBLICATION_METRICS_FETCHED";
	    public static final String PATENT_METRICS_FETCHED = "PATENT_METRICS_FETCHED";
	    public static final String RESEARCH_FUNDING_FETCHED = "RESEARCH_FUNDING_FETCHED";
	    public static final String COMMENT_ACTIVITY_FETCHED = "COMMENT_ACTIVITY_FETCHED";
	    public static final String SYSTEM_PERFORMANCE_FETCHED = "SYSTEM_PERFORMANCE_FETCHED";
	    
	    // Error codes
	    public static final String ACCESS_DENIED = "ACCESS_DENIED";
	    public static final String INVALID_DATE_RANGE = "INVALID_DATE_RANGE";
	    public static final String INVALID_DAYS_PARAMETER = "INVALID_DAYS_PARAMETER";
	    public static final String NO_PUBLICATION_DATA = "NO_PUBLICATION_DATA";
	    public static final String NO_PATENT_DATA = "NO_PATENT_DATA";
	    public static final String NO_RESEARCH_DATA = "NO_RESEARCH_DATA";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
	
}
