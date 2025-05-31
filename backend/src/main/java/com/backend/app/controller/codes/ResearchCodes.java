package com.backend.app.controller.codes;

public class ResearchCodes {
	 private ResearchCodes() {}
	    
	    // Success codes
	    public static final String RESEARCHES_FETCHED = "RESEARCHES_FETCHED";
	    public static final String RESEARCH_FETCHED = "RESEARCH_FETCHED";
	    public static final String RESEARCH_CREATED = "RESEARCH_CREATED";
	    public static final String RESEARCH_UPDATED = "RESEARCH_UPDATED";
	    public static final String RESEARCH_DELETED = "RESEARCH_DELETED";
	    
	    // Error codes
	    public static final String RESEARCH_NOT_FOUND = "RESEARCH_NOT_FOUND";
	    public static final String INVALID_RESEARCH_DATA = "INVALID_RESEARCH_DATA";
	    public static final String ACCESS_DENIED = "ACCESS_DENIED";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
}
