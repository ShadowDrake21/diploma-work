package com.backend.app.controller.messages;

import com.backend.app.controller.codes.UserCodes;

public class UserMessages {
	 private UserMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case UserCodes.USER_CREATED -> "User created successfully";
	            case UserCodes.USER_FETCHED -> "User retrieved successfully";
	            case UserCodes.USERS_FETCHED -> "Users retrieved successfully";
	            case UserCodes.USER_EXISTENCE_CHECKED -> "User existence checked successfully";
	            case UserCodes.AVATAR_UPDATED -> "Avatar updated successfully";
	            case UserCodes.PROFILE_UPDATED -> "Profile updated successfully";
	            case UserCodes.PROJECTS_FETCHED -> "Projects retrieved successfully";
	            case UserCodes.USERS_SEARCHED -> "Users search completed successfully";
	            case UserCodes.COLLABORATORS_FETCHED -> "Collaborators retrieved successfully";
	            case UserCodes.ACTIVE_USERS_FETCHED -> "Active users retrieved successfully";
	            
	            // Error messages
	            case UserCodes.ACCESS_DENIED -> "Access denied";
	            case UserCodes.USER_NOT_FOUND -> "User not found";
	            case UserCodes.USER_EXISTS -> "User already exists";
	            case UserCodes.INVALID_INPUT -> "Invalid input provided";
	            case UserCodes.INVALID_FILE -> "Invalid file provided";
	            case UserCodes.DELETION_NOT_ALLOWED -> "User deletion not allowed";
	            case UserCodes.SERVER_ERROR -> "An unexpected error occurred";
	            
	            default -> "Unknown operation status";
	        };
	    }
}
