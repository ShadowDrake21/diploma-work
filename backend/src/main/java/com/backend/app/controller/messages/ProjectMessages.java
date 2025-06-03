package com.backend.app.controller.messages;

import com.backend.app.controller.codes.ProjectCodes;

public class ProjectMessages {
private ProjectMessages() {}
    
    public static String getMessage(String code) {
        return switch(code) {
            // Success messages
            case ProjectCodes.PROJECTS_FETCHED -> "Projects fetched successfully";
            case ProjectCodes.PROJECT_FETCHED -> "Project fetched successfully";
            case ProjectCodes.PROJECT_CREATED -> "Project created successfully";
            case ProjectCodes.PROJECT_UPDATED -> "Project updated successfully";
            case ProjectCodes.PROJECT_DELETED -> "Project deleted successfully";
            case ProjectCodes.CREATOR_PROJECTS_FETCHED -> "Creator's projects fetched successfully";
            case ProjectCodes.PROJECTS_SEARCHED -> "Projects searched successfully";
            case ProjectCodes.NEWEST_PROJECTS_FETCHED -> "Newest projects fetched successfully";
            case ProjectCodes.USER_PROJECTS_FETCHED -> "User projects fetched successfully";
            case ProjectCodes.PROJECTS_WITH_DETAILS_FETCHED -> "Projects with details fetched successfully";
            case ProjectCodes.PUBLICATION_FETCHED -> "Publication fetched successfully";
            case ProjectCodes.PATENT_FETCHED -> "Patent fetched successfully";
            case ProjectCodes.RESEARCH_FETCHED -> "Research fetched successfully";
            
            // Error messages
            case ProjectCodes.PROJECT_NOT_FOUND -> "Project not found";
            case ProjectCodes.USER_NOT_FOUND -> "User not found";
            case ProjectCodes.PUBLICATION_NOT_FOUND -> "Publication not found";
            case ProjectCodes.PATENT_NOT_FOUND -> "Patent not found";
            case ProjectCodes.RESEARCH_NOT_FOUND -> "Research not found";
            case ProjectCodes.AUTH_REQUIRED -> "Authentication required";
            case ProjectCodes.ACCESS_DENIED -> "Access denied";
            case ProjectCodes.SERVER_ERROR -> "An unexpected error occurred";
            case ProjectCodes.INVALID_SEARCH_CRITERIA -> "Invalid search criteria";
            
            default -> "Unknown status";
        };
    }
}
