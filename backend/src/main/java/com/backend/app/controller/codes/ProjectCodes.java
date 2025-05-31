package com.backend.app.controller.codes;

public class ProjectCodes {
	 private ProjectCodes() {}
	    
	    // Success codes
	    public static final String PROJECTS_FETCHED = "PROJECTS_FETCHED";
	    public static final String PROJECT_FETCHED = "PROJECT_FETCHED";
	    public static final String PROJECT_CREATED = "PROJECT_CREATED";
	    public static final String PROJECT_UPDATED = "PROJECT_UPDATED";
	    public static final String PROJECT_DELETED = "PROJECT_DELETED";
	    public static final String CREATOR_PROJECTS_FETCHED = "CREATOR_PROJECTS_FETCHED";
	    public static final String PROJECTS_SEARCHED = "PROJECTS_SEARCHED";
	    public static final String NEWEST_PROJECTS_FETCHED = "NEWEST_PROJECTS_FETCHED";
	    public static final String USER_PROJECTS_FETCHED = "USER_PROJECTS_FETCHED";
	    public static final String PROJECTS_WITH_DETAILS_FETCHED = "PROJECTS_WITH_DETAILS_FETCHED";
	    public static final String PUBLICATION_FETCHED = "PUBLICATION_FETCHED";
	    public static final String PATENT_FETCHED = "PATENT_FETCHED";
	    public static final String RESEARCH_FETCHED = "RESEARCH_FETCHED";
	    
	    // Error codes
	    public static final String PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
	    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
	    public static final String PUBLICATION_NOT_FOUND = "PUBLICATION_NOT_FOUND";
	    public static final String PATENT_NOT_FOUND = "PATENT_NOT_FOUND";
	    public static final String RESEARCH_NOT_FOUND = "RESEARCH_NOT_FOUND";
	    public static final String AUTH_REQUIRED = "AUTH_REQUIRED";
	    public static final String ACCESS_DENIED = "ACCESS_DENIED";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
	    public static final String INVALID_SEARCH_CRITERIA = "INVALID_SEARCH_CRITERIA";
}
