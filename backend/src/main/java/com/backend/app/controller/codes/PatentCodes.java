package com.backend.app.controller.codes;

public class PatentCodes {
	 private PatentCodes() {}
	    
	    // Success codes
	    public static final String PATENTS_FETCHED = "PATENTS_FETCHED";
	    public static final String PATENT_FETCHED = "PATENT_FETCHED";
	    public static final String PATENT_CREATED = "PATENT_CREATED";
	    public static final String PATENT_UPDATED = "PATENT_UPDATED";
	    public static final String PATENT_DELETED = "PATENT_DELETED";
	    
	    // Error codes
	    public static final String PATENT_NOT_FOUND = "PATENT_NOT_FOUND";
	    public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
	    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
	    public static final String BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION";
	    public static final String ID_MISMATCH = "ID_MISMATCH";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
}
