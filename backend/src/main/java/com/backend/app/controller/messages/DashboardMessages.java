package com.backend.app.controller.messages;

import com.backend.app.controller.codes.DashboardCodes;

public class DashboardMessages {
	 private DashboardMessages() {}
	    
	    public static String getMessage(String code) {
	        return switch(code) {
	            // Success messages
	            case DashboardCodes.METRICS_FETCHED -> "Dashboard metrics fetched successfully";
	            
	            // Error messages
	            case DashboardCodes.DATA_RETRIEVAL_ERROR -> "Error retrieving dashboard data";
	            case DashboardCodes.SERVER_ERROR -> "An unexpected error occurred while processing dashboard request";
	            
	            default -> "Unknown dashboard operation status";
	        };
	    }
}
