package com.backend.app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested resource is not found.
 * Automatically returns a 404 Not Found status when thrown from a controller.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
	private static final long serialVersionUID = -7883135257563110908L;

	/**
     * Constructs a new ResourceNotFoundException with the specified detail message.
     * @param message the detail message
     */
	public ResourceNotFoundException(String message) {
		super(message);
	}
	
	/**
     * Constructs a new ResourceNotFoundException with the specified detail message and cause.
     * @param message the detail message
     * @param cause the cause of the exception
     */
	public ResourceNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}
	
	 /**
     * Constructs a new ResourceNotFoundException with a formatted message.
     * @param resourceName the name of the resource type 
     * @param fieldName the name of the field being searched
     * @param fieldValue the value that was not found
     */
	public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
	}
}
