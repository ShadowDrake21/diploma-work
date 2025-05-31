package com.backend.app.controller.codes;

public class CommentCodes {
	 private CommentCodes() {}
	    
	    // Success codes
	    public static final String COMMENTS_FETCHED = "COMMENTS_FETCHED";
	    public static final String USER_COMMENTS_FETCHED = "USER_COMMENTS_FETCHED";
	    public static final String COMMENT_CREATED = "COMMENT_CREATED";
	    public static final String COMMENT_UPDATED = "COMMENT_UPDATED";
	    public static final String COMMENT_DELETED = "COMMENT_DELETED";
	    public static final String COMMENT_LIKED = "COMMENT_LIKED";
	    public static final String COMMENT_UNLIKED = "COMMENT_UNLIKED";
	    
	    // Error codes
	    public static final String AUTH_REQUIRED = "AUTH_REQUIRED";
	    public static final String ACCESS_DENIED = "ACCESS_DENIED";
	    public static final String PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
	    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
	    public static final String COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND";
	    public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
	    public static final String BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
}
