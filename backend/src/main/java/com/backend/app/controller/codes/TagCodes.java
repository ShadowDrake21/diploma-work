package com.backend.app.controller.codes;

public class TagCodes {
	 private TagCodes() {}
	    
	    // Success codes
	    public static final String TAGS_FETCHED = "TAGS_FETCHED";
	    public static final String TAG_FETCHED = "TAG_FETCHED";
	    public static final String TAG_CREATED = "TAG_CREATED";
	    public static final String TAG_UPDATED = "TAG_UPDATED";
	    public static final String TAG_DELETED = "TAG_DELETED";
	    
	    // Error codes
	    public static final String TAG_NOT_FOUND = "TAG_NOT_FOUND";
	    public static final String TAG_VALIDATION_ERROR = "TAG_VALIDATION_ERROR";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
	}