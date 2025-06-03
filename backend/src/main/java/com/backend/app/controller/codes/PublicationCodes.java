package com.backend.app.controller.codes;

public class PublicationCodes {
	 private PublicationCodes() {}
	    
	    // Success codes
	    public static final String PUBLICATIONS_FETCHED = "PUBLICATIONS_FETCHED";
	    public static final String PUBLICATION_FETCHED = "PUBLICATION_FETCHED";
	    public static final String PUBLICATION_CREATED = "PUBLICATION_CREATED";
	    public static final String PUBLICATION_UPDATED = "PUBLICATION_UPDATED";
	    public static final String PUBLICATION_DELETED = "PUBLICATION_DELETED";
	    
	    // Error codes
	    public static final String PUBLICATION_NOT_FOUND = "PUBLICATION_NOT_FOUND";
	    public static final String PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
	    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
	    public static final String INVALID_REQUEST = "INVALID_REQUEST";
	    public static final String CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION";
	    public static final String PUBLICATION_CREATION_ERROR = "PUBLICATION_CREATION_ERROR";
	    public static final String PUBLICATION_UPDATE_ERROR = "PUBLICATION_UPDATE_ERROR";
	    public static final String PUBLICATION_DELETION_ERROR = "PUBLICATION_DELETION_ERROR";
	    public static final String AUTHOR_ADDITION_ERROR = "AUTHOR_ADDITION_ERROR";
	    public static final String AUTHOR_UPDATE_ERROR = "AUTHOR_UPDATE_ERROR";
	    public static final String SERVER_ERROR = "SERVER_ERROR";
}
