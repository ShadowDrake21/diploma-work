package com.backend.app.controller.codes;

public class UserCodes {
private UserCodes() {}
    
    // Success codes
    public static final String USER_CREATED = "USER_CREATED";
    public static final String USER_FETCHED = "USER_FETCHED";
    public static final String USERS_FETCHED = "USERS_FETCHED";
    public static final String USER_EXISTENCE_CHECKED = "USER_EXISTENCE_CHECKED";
    public static final String AVATAR_UPDATED = "AVATAR_UPDATED";
    public static final String PROFILE_UPDATED = "PROFILE_UPDATED";
    public static final String PROJECTS_FETCHED = "PROJECTS_FETCHED";
    public static final String USERS_SEARCHED = "USERS_SEARCHED";
    public static final String COLLABORATORS_FETCHED = "COLLABORATORS_FETCHED";
    public static final String ACTIVE_USERS_FETCHED = "ACTIVE_USERS_FETCHED";
    
    // Error codes
    public static final String ACCESS_DENIED = "ACCESS_DENIED";
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
    public static final String USER_EXISTS = "USER_EXISTS";
    public static final String INVALID_INPUT = "INVALID_INPUT";
    public static final String INVALID_FILE = "INVALID_FILE";
    public static final String DELETION_NOT_ALLOWED = "DELETION_NOT_ALLOWED";
    public static final String SERVER_ERROR = "SERVER_ERROR";
}
