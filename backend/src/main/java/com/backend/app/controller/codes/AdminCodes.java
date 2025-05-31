package com.backend.app.controller.codes;

public class AdminCodes {
private AdminCodes() {}
    
    // Success codes
    public static final String USERS_FETCHED = "USERS_FETCHED";
    public static final String USER_PROMOTED = "USER_PROMOTED";
    public static final String USER_DEMOTED = "USER_DEMOTED";
    public static final String USER_DEACTIVATED = "USER_DEACTIVATED";
    public static final String USER_DELETED = "USER_DELETED";
    public static final String USER_REACTIVATED = "USER_REACTIVATED";
    public static final String PROJECTS_FETCHED = "PROJECTS_FETCHED";
    public static final String COMMENTS_FETCHED = "COMMENTS_FETCHED";
    public static final String COMMENT_DELETED = "COMMENT_DELETED";
    public static final String LOGINS_FETCHED = "LOGINS_FETCHED";
    public static final String LOGIN_STATS_FETCHED = "LOGIN_STATS_FETCHED";
    
    // Error codes
    public static final String ACCESS_DENIED = "ACCESS_DENIED";
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
    public static final String COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND";
    public static final String ALREADY_ADMIN = "ALREADY_ADMIN";
    public static final String DEMOTE_SELF_OR_NON_ADMIN = "DEMOTE_SELF_OR_NON_ADMIN";
    public static final String SERVER_ERROR = "SERVER_ERROR";
}
