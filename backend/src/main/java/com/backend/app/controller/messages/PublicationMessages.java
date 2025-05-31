package com.backend.app.controller.messages;

import com.backend.app.controller.codes.PublicationCodes;

public class PublicationMessages {
	 private PublicationMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case PublicationCodes.PUBLICATIONS_FETCHED -> "Publications fetched successfully";
	            case PublicationCodes.PUBLICATION_FETCHED -> "Publication fetched successfully";
	            case PublicationCodes.PUBLICATION_CREATED -> "Publication created successfully";
	            case PublicationCodes.PUBLICATION_UPDATED -> "Publication updated successfully";
	            case PublicationCodes.PUBLICATION_DELETED -> "Publication deleted successfully";
	            
	            // Error messages
	            case PublicationCodes.PUBLICATION_NOT_FOUND -> "Publication not found with ID: %s";
	            case PublicationCodes.PROJECT_NOT_FOUND -> "Project not found with ID: %s";
	            case PublicationCodes.USER_NOT_FOUND -> "User not found with ID: %s";
	            case PublicationCodes.INVALID_REQUEST -> "Invalid request: %s";
	            case PublicationCodes.CONCURRENT_MODIFICATION -> "Publication was modified by another transaction. Please refresh and try again";
	            case PublicationCodes.PUBLICATION_CREATION_ERROR -> "Failed to create publication";
	            case PublicationCodes.PUBLICATION_UPDATE_ERROR -> "Failed to update publication";
	            case PublicationCodes.PUBLICATION_DELETION_ERROR -> "Failed to delete publication";
	            case PublicationCodes.AUTHOR_ADDITION_ERROR -> "Failed to add authors to publication";
	            case PublicationCodes.AUTHOR_UPDATE_ERROR -> "Failed to update publication authors";
	            case PublicationCodes.SERVER_ERROR -> "An unexpected error occurred";
	            
	            default -> "Unknown publication operation status";
	        };
	    }
}
