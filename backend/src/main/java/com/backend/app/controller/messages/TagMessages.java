package com.backend.app.controller.messages;

import com.backend.app.controller.codes.TagCodes;

public class TagMessages {
	 private TagMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case TagCodes.TAGS_FETCHED -> "All tags fetched successfully";
	            case TagCodes.TAG_FETCHED -> "Tag fetched successfully";
	            case TagCodes.TAG_CREATED -> "Tag created successfully";
	            case TagCodes.TAG_UPDATED -> "Tag updated successfully";
	            case TagCodes.TAG_DELETED -> "Tag deleted successfully";
	            
	            // Error messages
	            case TagCodes.TAG_NOT_FOUND -> "Tag not found";
	            case TagCodes.TAG_VALIDATION_ERROR -> "Tag validation failed";
	            case TagCodes.SERVER_ERROR -> "An error occurred while processing tag request";
	            
	            default -> "Unknown tag operation status";
	        };
	    }
}
