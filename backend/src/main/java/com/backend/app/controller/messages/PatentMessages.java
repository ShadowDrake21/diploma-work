package com.backend.app.controller.messages;

import com.backend.app.controller.codes.PatentCodes;

public class PatentMessages {
	  private PatentMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case PatentCodes.PATENTS_FETCHED -> "Patents fetched successfully";
	            case PatentCodes.PATENT_FETCHED -> "Patent fetched successfully";
	            case PatentCodes.PATENT_CREATED -> "Patent created successfully";
	            case PatentCodes.PATENT_UPDATED -> "Patent updated successfully";
	            case PatentCodes.PATENT_DELETED -> "Patent deleted successfully";
	            
	            // Error messages
	            case PatentCodes.PATENT_NOT_FOUND -> "Patent not found";
	            case PatentCodes.RESOURCE_NOT_FOUND -> "Required resource not found";
	            case PatentCodes.VALIDATION_ERROR -> "Validation error occurred";
	            case PatentCodes.BUSINESS_RULE_VIOLATION -> "Business rule violation";
	            case PatentCodes.ID_MISMATCH -> "ID in path does not match ID in body";
	            case PatentCodes.SERVER_ERROR -> "An unexpected error occurred";
	            
	            default -> "Unknown patent operation status";
	        };
	    }
}
