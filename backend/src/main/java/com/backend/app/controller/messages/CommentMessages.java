package com.backend.app.controller.messages;

import com.backend.app.controller.codes.CommentCodes;

public class CommentMessages {
	 private CommentMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case CommentCodes.COMMENTS_FETCHED -> "Comments fetched successfully";
	            case CommentCodes.USER_COMMENTS_FETCHED -> "User comments fetched successfully";
	            case CommentCodes.COMMENT_CREATED -> "Comment created successfully";
	            case CommentCodes.COMMENT_UPDATED -> "Comment updated successfully";
	            case CommentCodes.COMMENT_DELETED -> "Comment deleted successfully";
	            case CommentCodes.COMMENT_LIKED -> "Comment liked successfully";
	            case CommentCodes.COMMENT_UNLIKED -> "Comment unliked successfully";
	            
	            // Error messages
	            case CommentCodes.AUTH_REQUIRED -> "Authentication required";
	            case CommentCodes.ACCESS_DENIED -> "Access denied. You can only modify your own comments";
	            case CommentCodes.PROJECT_NOT_FOUND -> "Project not found";
	            case CommentCodes.USER_NOT_FOUND -> "User not found";
	            case CommentCodes.COMMENT_NOT_FOUND -> "Comment not found";
	            case CommentCodes.RESOURCE_NOT_FOUND -> "Resource not found";
	            case CommentCodes.BUSINESS_RULE_VIOLATION -> "Business rule violation";
	            case CommentCodes.SERVER_ERROR -> "An unexpected error occurred";
	            
	            default -> "Unknown status";
	        };
	    }
}
