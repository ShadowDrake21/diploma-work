package com.backend.app.controller.messages;

import com.backend.app.controller.codes.AuthCodes;

public class AuthMessages {
	 // Common messages
	private AuthMessages() {} 

    public static String getMessage(String errorCode) {
        return switch(errorCode) {
            // Validation messages
            case AuthCodes.EMAIL_REQUIRED -> "Email is required";
            case AuthCodes.PASSWORD_REQUIRED -> "Password is required";
            case AuthCodes.USERNAME_REQUIRED -> "Username is required";
            case AuthCodes.VERIFICATION_CODE_REQUIRED -> "Verification code is required";
            case AuthCodes.RESET_TOKEN_REQUIRED -> "Reset token is required";
            case AuthCodes.NEW_PASSWORD_REQUIRED -> "New password is required";
            
            // Authentication messages
            case AuthCodes.INVALID_CREDENTIALS -> "Invalid email or password";
            case AuthCodes.ACCOUNT_NOT_VERIFIED -> "Account not verified. Please check your email";
            case AuthCodes.INVALID_VERIFICATION_CODE -> "Invalid verification code";
            case AuthCodes.INVALID_RESET_TOKEN -> "Invalid or expired password reset token";
            case AuthCodes.TOKEN_REQUIRED -> "Authorization token is required";
            case AuthCodes.TOKEN_REVOKED -> "This token is no longer valid";
            case AuthCodes.TOKEN_EXPIRED -> "Session expired. Please login again";
            case AuthCodes.INVALID_TOKEN -> "Invalid token";
            
            // Resource messages
            case AuthCodes.USER_NOT_FOUND -> "User not found";
            case AuthCodes.EMAIL_IN_USE -> "Email is already in use";
            
            // Validation messages
            case AuthCodes.INVALID_EMAIL_FORMAT -> "Invalid email format";
            case AuthCodes.WEAK_PASSWORD -> "Password must be at least 6 characters with uppercase, lowercase, and numbers";
            
            // Rate limiting
            case AuthCodes.RATE_LIMIT_EXCEEDED -> "Too many requests. Please try again later";
            
            // System messages
            case AuthCodes.SERVER_ERROR -> "An unexpected error occurred";
            case AuthCodes.VERIFICATION_ERROR -> "An error occurred during verification";
            case AuthCodes.PASSWORD_RESET_ERROR -> "An error occurred while resetting password";
            case AuthCodes.TOKEN_REFRESH_ERROR -> "An error occurred while refreshing token";
            case AuthCodes.LOGOUT_ERROR -> "An error occurred during logout";
            
            // Success messages (optional)
            case AuthCodes.LOGIN_SUCCESS -> "Login successful!";
            case AuthCodes.VERIFICATION_SENT -> "Verification code sent! Please check your email";
            case AuthCodes.VERIFICATION_SUCCESS -> "User verified successfully";
            case AuthCodes.PASSWORD_RESET_REQUESTED -> "Password reset link has been sent to your email";
            case AuthCodes.PASSWORD_RESET_SUCCESS -> "Password updated successfully";
            case AuthCodes.LOGOUT_SUCCESS -> "Logged out successfully!";
            case AuthCodes.TOKEN_REFRESHED -> "Token refreshed successfully";
            
            default -> "An unknown error occurred";
        };
    }
}
