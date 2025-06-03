package com.backend.app.exception;

public class InvalidEntityTypeException extends RuntimeException {
    private static final long serialVersionUID = 1L;

	public InvalidEntityTypeException(String message) {
        super(message);
    }
}
