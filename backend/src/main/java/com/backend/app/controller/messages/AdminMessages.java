package com.backend.app.controller.messages;

import com.backend.app.controller.codes.AdminCodes;

public class AdminMessages {
private AdminMessages() {}
    
    public static String getMessage(String code) {
        return switch(code) {
            // Success messages
            case AdminCodes.USERS_FETCHED -> "Users fetched successfully";
            case AdminCodes.USER_PROMOTED -> "User promoted to admin successfully";
            case AdminCodes.USER_DEMOTED -> "User demoted successfully";
            case AdminCodes.USER_DEACTIVATED -> "User deactivated successfully";
            case AdminCodes.USER_DELETED -> "User deleted successfully";
            case AdminCodes.USER_REACTIVATED -> "User reactivated successfully";
            case AdminCodes.PROJECTS_FETCHED -> "Projects fetched successfully";
            case AdminCodes.COMMENTS_FETCHED -> "Comments fetched successfully";
            case AdminCodes.COMMENT_DELETED -> "Comment deleted successfully";
            case AdminCodes.LOGINS_FETCHED -> "Recent logins fetched successfully";
            case AdminCodes.LOGIN_STATS_FETCHED -> "Login statistics fetched successfully";
            
            // Error messages
            case AdminCodes.ACCESS_DENIED -> "Access denied. Admin privileges required";
            case AdminCodes.USER_NOT_FOUND -> "User not found";
            case AdminCodes.COMMENT_NOT_FOUND -> "Comment not found";
            case AdminCodes.ALREADY_ADMIN -> "User is already an admin";
            case AdminCodes.DEMOTE_SELF_OR_NON_ADMIN -> "Cannot demote yourself or a non-admin user";
            case AdminCodes.SERVER_ERROR -> "An unexpected error occurred";
            
            default -> "Unknown status";
        };
    }
}
