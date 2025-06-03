package com.backend.app.exception;

public class InvalidInputException extends BusinessRuleException {
    public InvalidInputException(String message) {
        super(message);
    }
}
