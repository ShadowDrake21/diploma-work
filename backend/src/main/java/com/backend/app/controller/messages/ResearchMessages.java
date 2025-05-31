package com.backend.app.controller.messages;

import com.backend.app.controller.codes.ResearchCodes;

public class ResearchMessages {
private ResearchMessages() {}
    
    public static String getMessage(String code) {
        return switch(code) {
            // Success messages
            case ResearchCodes.RESEARCHES_FETCHED -> "Research projects fetched successfully";
            case ResearchCodes.RESEARCH_FETCHED -> "Research project fetched successfully";
            case ResearchCodes.RESEARCH_CREATED -> "Research project created successfully";
            case ResearchCodes.RESEARCH_UPDATED -> "Research project updated successfully";
            case ResearchCodes.RESEARCH_DELETED -> "Research project deleted successfully";
            
            // Error messages
            case ResearchCodes.RESEARCH_NOT_FOUND -> "Research project not found";
            case ResearchCodes.INVALID_RESEARCH_DATA -> "Invalid research project data";
            case ResearchCodes.ACCESS_DENIED -> "Access denied. You don't have permission for this operation";
            case ResearchCodes.SERVER_ERROR -> "An unexpected error occurred while processing research request";
            
            default -> "Unknown research operation status";
        };
    }
}
