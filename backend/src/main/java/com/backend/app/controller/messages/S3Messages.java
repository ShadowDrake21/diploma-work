package com.backend.app.controller.messages;

import com.backend.app.controller.codes.S3Codes;

public class S3Messages {
private S3Messages() {}
    
    public static String getMessage(String code) {
        return switch(code) {
            // Success messages
            case S3Codes.FILE_UPLOADED -> "File uploaded successfully";
            case S3Codes.FILES_UPDATED -> "Files updated successfully";
            case S3Codes.FILE_DELETED -> "File deleted successfully";
            case S3Codes.URL_GENERATED -> "Public URL generated successfully";
            case S3Codes.METADATA_FETCHED -> "File metadata fetched successfully";
            case S3Codes.FILES_FETCHED -> "Files fetched successfully";
            
            // Error messages
            case S3Codes.INVALID_ENTITY_TYPE -> "Invalid entity type provided";
            case S3Codes.FILE_UPLOAD_ERROR -> "Failed to upload file";
            case S3Codes.FILE_UPDATE_ERROR -> "Failed to update files";
            case S3Codes.FILE_DELETE_ERROR -> "Failed to delete file";
            case S3Codes.FILE_NOT_FOUND -> "File not found";
            case S3Codes.URL_GENERATION_ERROR -> "Failed to generate public URL";
            case S3Codes.METADATA_NOT_FOUND -> "File metadata not found";
            case S3Codes.METADATA_FETCH_ERROR -> "Failed to fetch file metadata";
            case S3Codes.FILES_FETCH_ERROR -> "Failed to fetch files";
            case S3Codes.SERVER_ERROR -> "An unexpected error occurred";
            
            default -> "Unknown S3 operation status";
        };
    }
}
