package com.backend.app.exception;

public class InvalidFileException extends BusinessRuleException {
    public InvalidFileException(String message) {
        super(message);
    }
}
