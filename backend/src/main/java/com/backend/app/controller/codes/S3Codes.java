package com.backend.app.controller.codes;

public class S3Codes {
private S3Codes() {}
    
    // Success codes
    public static final String FILE_UPLOADED = "FILE_UPLOADED";
    public static final String FILES_UPDATED = "FILES_UPDATED";
    public static final String FILE_DELETED = "FILE_DELETED";
    public static final String URL_GENERATED = "URL_GENERATED";
    public static final String METADATA_FETCHED = "METADATA_FETCHED";
    public static final String FILES_FETCHED = "FILES_FETCHED";
    
    // Error codes
    public static final String INVALID_ENTITY_TYPE = "INVALID_ENTITY_TYPE";
    public static final String FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR";
    public static final String FILE_UPDATE_ERROR = "FILE_UPDATE_ERROR";
    public static final String FILE_DELETE_ERROR = "FILE_DELETE_ERROR";
    public static final String FILE_NOT_FOUND = "FILE_NOT_FOUND";
    public static final String URL_GENERATION_ERROR = "URL_GENERATION_ERROR";
    public static final String METADATA_NOT_FOUND = "METADATA_NOT_FOUND";
    public static final String METADATA_FETCH_ERROR = "METADATA_FETCH_ERROR";
    public static final String FILES_FETCH_ERROR = "FILES_FETCH_ERROR";
    public static final String SERVER_ERROR = "SERVER_ERROR";
}
