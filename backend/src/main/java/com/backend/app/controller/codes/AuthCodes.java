package com.backend.app.controller.codes;

public final class AuthCodes {
	 private AuthCodes() {} 

	    // Common validation errors
	    public static final String EMAIL_REQUIRED = "EMAIL_REQUIRED";
	    public static final String PASSWORD_REQUIRED = "PASSWORD_REQUIRED";
	    public static final String USERNAME_REQUIRED = "USERNAME_REQUIRED";
	    public static final String VERIFICATION_CODE_REQUIRED = "VERIFICATION_CODE_REQUIRED";
	    public static final String RESET_TOKEN_REQUIRED = "RESET_TOKEN_REQUIRED";
	    public static final String NEW_PASSWORD_REQUIRED = "NEW_PASSWORD_REQUIRED";
	    
	    // Authentication errors
	    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
	    public static final String ACCOUNT_NOT_VERIFIED = "ACCOUNT_NOT_VERIFIED";
	    public static final String INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE";
	    public static final String INVALID_RESET_TOKEN = "INVALID_RESET_TOKEN";
	    public static final String TOKEN_REQUIRED = "TOKEN_REQUIRED";
	    public static final String TOKEN_REVOKED = "TOKEN_REVOKED";
	    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
	    public static final String INVALID_TOKEN = "INVALID_TOKEN";
	    
	    // Resource errors
	    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
	    public static final String EMAIL_IN_USE = "EMAIL_IN_USE";
	    
	    // Validation errors
	    public static final String INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT";
	    public static final String WEAK_PASSWORD = "WEAK_PASSWORD";
	    
	    // Rate limiting
	    public static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
	    
	    // System errors
	    public static final String SERVER_ERROR = "SERVER_ERROR";
	    public static final String VERIFICATION_ERROR = "VERIFICATION_ERROR";
	    public static final String PASSWORD_RESET_ERROR = "PASSWORD_RESET_ERROR";
	    public static final String TOKEN_REFRESH_ERROR = "TOKEN_REFRESH_ERROR";
	    public static final String LOGOUT_ERROR = "LOGOUT_ERROR";
	    
	    // Success codes (optional - can be in separate SuccessCodes class)
	    public static final String LOGIN_SUCCESS = "LOGIN_SUCCESS";
	    public static final String VERIFICATION_SENT = "VERIFICATION_SENT";
	    public static final String VERIFICATION_SUCCESS = "VERIFICATION_SUCCESS";
	    public static final String PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED";
	    public static final String PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS";
	    public static final String LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
	    public static final String TOKEN_REFRESHED = "TOKEN_REFRESHED";
}
